const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function pickHelpDoc(ctx) {
  const { docs, findDocBest } = ctx;

  if (!docs?.length) return null;

  const q = process.env.HELP_DOC_QUERY?.trim();
  if (q) {
    const found = findDocBest(docs, q);
    if (found) return found;
  }

  const preferred = docs.find((d) =>
    /help|가이드|명령|atlas/i.test(d.title || '')
  );
  return preferred || docs[0];
}

function buildCommandListField(ctx) {
  const items = [];
  for (const [name, cmd] of ctx.commandMap.entries()) {
    const desc = cmd?.data?.toJSON?.()?.description;
    items.push(`- \`/${name}\`${desc ? `: ${desc}` : ''}`);
  }
  items.sort((a, b) => a.localeCompare(b));
  return items.join('\n').slice(0, 1024) || '(명령 목록이 비어 있습니다)';
}

const NAME = 'atlas';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('지원 명령과 사용 방법을 표시합니다.'),

  async execute(interaction, ctx) {
    const doc = pickHelpDoc(ctx);

    if (!doc) {
      return interaction.reply({
        content: 'docs/ 폴더에 문서가 없습니다. Notion Export(.md)을 docs/에 넣어주십시오.',
        ephemeral: true,
      });
    }

    const extracted = ctx.extractMarkdownTables
      ? ctx.extractMarkdownTables(doc.body)
      : { text: doc.body, tables: [] };

    const cleaned = (extracted.text || '')
      .replace(/^#\s+.*\n/, '')
      .trim();

    const preview = (cleaned.slice(0, 1200) || '(본문이 비어 있습니다)');

    const embed = new EmbedBuilder()
      .setTitle('Atlas Agent · 도움말')
      .setDescription(preview)
      .setColor(0x2B2F36)
      .addFields(
        {
          name: '지원 명령',
          value: buildCommandListField(ctx),
          inline: false,
        },
        {
          name: '원문 보기',
          value: [
            `\`/doc query:${doc.title} mode:full\``,
            `\`/doc query:atlas mode:full\``
          ].join('\n'),
          inline: false,
        }
      )
      .setFooter({ text: '도움말 문서는 docs/의 Notion Export에서 자동 선택됩니다.' })
      .setTimestamp();

    if (ctx.tablesToEmbedFields && extracted.tables?.length) {
      const tableFields = ctx.tablesToEmbedFields(extracted.tables, 5);
      if (tableFields.length) embed.addFields(tableFields);
    }

    return interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
