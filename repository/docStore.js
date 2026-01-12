const fs = require('fs');
const path = require('path');

function safeText(s) {
  return (s ?? '').toString();
}

function normalizeMarkdown(md) {
  let t = safeText(md);

  t = t.replace(/!\[[^\]]*]\(([^)]+)\)/g, (_, p1) => `[image: ${p1}]`);

  t = t.replace(/<[^>]+>/g, '');

  t = t.replace(/\r\n/g, '\n');
  return t;
}

function extractTitle(md, fallbackTitle) {
  const m = safeText(md).match(/^#\s+(.+)\s*$/m);
  return m ? m[1].trim() : fallbackTitle;
}

function makeIdFromFilename(filename) {
  return Buffer.from(filename).toString('base64url').slice(0, 16);
}

function loadDocs(docsDirAbs) {
  if (!fs.existsSync(docsDirAbs)) return [];

  const files = fs.readdirSync(docsDirAbs)
    .filter((f) => f.toLowerCase().endsWith('.md'));

  return files.map((filename) => {
    const fullPath = path.join(docsDirAbs, filename);
    const raw = fs.readFileSync(fullPath, 'utf8');

    const normalized = normalizeMarkdown(raw);
    const titleFallback = path.parse(filename).name;
    const title = extractTitle(normalized, titleFallback);

    return {
      id: makeIdFromFilename(filename),
      filename,
      title,
      body: normalized,
    };
  });
}

function scoreMatch(text, query) {
  const t = safeText(text).toLowerCase();
  const q = safeText(query).toLowerCase().trim();
  if (!q) return 0;

  if (t === q) return 100;
  if (t.includes(q)) return 60;

  const tokens = q.split(/\s+/).filter(Boolean);
  let hit = 0;
  for (const tok of tokens) if (t.includes(tok)) hit += 10;
  return hit;
}

function findDocBest(docs, query) {
  const q = safeText(query).trim();
  if (!q) return null;

  let best = null;
  let bestScore = -1;

  for (const d of docs) {
    const sTitle = scoreMatch(d.title, q) * 2;
    const sBody = scoreMatch(d.body.slice(0, 5000), q);
    const score = sTitle + sBody;

    if (score > bestScore) {
      bestScore = score;
      best = d;
    }
  }

  return bestScore > 0 ? best : null;
}

function searchDocs(docs, query, limit = 5) {
  const q = safeText(query).trim();
  if (!q) return [];

  const results = docs.map((d) => {
    const sTitle = scoreMatch(d.title, q) * 2;
    const sBody = scoreMatch(d.body, q);
    return { doc: d, score: sTitle + sBody };
  })
  .filter((r) => r.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit);

  return results.map(({ doc, score }) => {
    const idx = doc.body.toLowerCase().indexOf(q.toLowerCase());
    const start = Math.max(0, idx - 80);
    const end = Math.min(doc.body.length, idx + 160);
    const snippet = idx >= 0 ? doc.body.slice(start, end).replace(/\n+/g, ' ') : doc.body.slice(0, 200);
    return { doc, score, snippet };
  });
}

function splitForDiscord(text, maxLen = 1900) {
  const t = safeText(text);
  const chunks = [];

  let cur = '';
  for (const line of t.split('\n')) {
    if (line.length > maxLen) {
      if (cur) { chunks.push(cur); cur = ''; }
      for (let i = 0; i < line.length; i += maxLen) {
        chunks.push(line.slice(i, i + maxLen));
      }
      continue;
    }

    if ((cur.length + line.length + 1) > maxLen) {
      chunks.push(cur);
      cur = line;
    } else {
      cur = cur ? (cur + '\n' + line) : line;
    }
  }

  if (cur) chunks.push(cur);
  return chunks;
}

module.exports = {
  loadDocs,
  findDocBest,
  searchDocs,
  splitForDiscord,
};
