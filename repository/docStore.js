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

function isHeadingLine(line) {
    return /^\s*#{1,6}\s+/.test(line);
  }
  
  function getHeadingText(line) {
    return line.replace(/^\s*#{1,6}\s+/, '').trim();
  }
  
  function isTableDividerLine(line) {
    const t = line.trim();
    if (!t.includes('-')) return false;
    return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(t);
  }
  
  function isTableRowLine(line) {
    const t = line.trim();
    return t.startsWith('|') && t.includes('|');
  }
  
  function splitTableRow(line) {
    const raw = line.trim();
    const trimmed = raw.replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split('|').map((c) => c.trim());
  }
  
  function extractMarkdownTables(md) {
    const lines = (md ?? '').toString().replace(/\r\n/g, '\n').split('\n');
  
    const tables = [];
    const kept = [];
  
    let lastHeading = null;
    let i = 0;
    let tableIndex = 0;
  
    while (i < lines.length) {
      const line = lines[i];
  
      if (isHeadingLine(line)) lastHeading = getHeadingText(line);
  
      if (isTableRowLine(line) && i + 1 < lines.length && isTableDividerLine(lines[i + 1])) {
        tableIndex += 1;
  
        const headerCells = splitTableRow(lines[i]);
        i += 2;
  
        const rows = [];
        while (i < lines.length && isTableRowLine(lines[i])) {
          const cells = splitTableRow(lines[i]);
          
          if (cells.some((c) => c.length > 0)) rows.push(cells);
          i += 1;
        }
  
        const title = lastHeading ? `${lastHeading} · 표 ${tableIndex}` : `표 ${tableIndex}`;
  
        tables.push({
          title,
          headers: headerCells,
          rows,
        });
  
        continue;
      }
  
      kept.push(line);
      i += 1;
    }
  
    return {
      text: kept.join('\n'),
      tables,
    };
  }
  
  function normalizeCellText(s) {
    return (s ?? '').toString()
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tableToFieldValue(table, maxChars = 950, maxRows = 20) {
    const headers = (table.headers ?? []).map(normalizeCellText);
    const rows = table.rows ?? [];
  
    const colCount = Math.max(headers.length, ...(rows.map((r) => r.length)), 0);
  
    const safeHeaders = headers.length ? headers : Array.from({ length: colCount }, (_, i) => `col${i + 1}`);
  
    const lines = [];
  
    const limitedRows = rows.slice(0, maxRows);
    for (const r of limitedRows) {
      const cells = Array.from({ length: colCount }, (_, idx) => normalizeCellText(r[idx] ?? ''));
  
      if (colCount === 2) {
        const k = cells[0] || '(빈값)';
        const v = cells[1] || '(빈값)';
        lines.push(`- **${k}**: ${v}`);
      } else {
        const parts = [];
        for (let c = 0; c < colCount; c++) {
          const h = safeHeaders[c] || `col${c + 1}`;
          const v = cells[c] || '(빈값)';
          parts.push(`${h}: ${v}`);
        }
        lines.push(`- ${parts.join(' | ')}`);
      }
  
      if (lines.join('\n').length > maxChars) {
        lines.pop();
        lines.push(`- (이하 생략)`);
        break;
      }
    }
  
    const omitted = rows.length - limitedRows.length;
    if (omitted > 0 && lines.join('\n').length < maxChars) {
      lines.push(`- (추가 ${omitted}행 생략)`);
    }
  
    const value = lines.join('\n').trim();
    return value.length ? value : '(표 내용이 비어 있습니다)';
  }
  
  function tablesToEmbedFields(tables, maxFields = 10) {
    const out = [];
    const limited = (tables ?? []).slice(0, maxFields);
  
    for (const t of limited) {
      out.push({
        name: t.title.slice(0, 256),
        value: tableToFieldValue(t),
        inline: false,
      });
    }
  
    const omitted = (tables?.length ?? 0) - limited.length;
    if (omitted > 0) {
      out.push({
        name: '표',
        value: `(추가 표 ${omitted}개 생략)`,
        inline: false,
      });
    }
  
    return out;
  }
  
  function buildTableEmbeds(EmbedBuilder, baseTitle, tables) {
    const embeds = [];
  
    const allFields = (tables ?? []).map((t) => ({
      name: t.title.slice(0, 256),
      value: tableToFieldValue(t),
      inline: false,
    }));
  
    for (let i = 0; i < allFields.length; i += 25) {
      const slice = allFields.slice(i, i + 25);
  
      const e = new EmbedBuilder()
        .setTitle(`${baseTitle} · 표`)
        .setColor(0x2B2F36)
        .addFields(slice);
  
      embeds.push(e);
    }
  
    return embeds;
  }  

module.exports = {
    loadDocs,
    findDocBest,
    searchDocs,
    splitForDiscord,
    extractMarkdownTables,
    tablesToEmbedFields,
    buildTableEmbeds,
};
