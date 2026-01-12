const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'doc',
  async execute(interaction, ctx) {
    const {
      docs,
      findDocBest,
      splitForDiscord,
      extractMarkdownTables,
      tablesToEmbedFields,
      buildTableEmbeds,
    } = ctx;

    const query = interaction.options.getString('query', true);
    const mode = interaction.options.getString('mode') || 'preview';

    const doc = findDocBest(docs, query);

    if (!doc) {
      return interaction.reply({
        content: `문서를 찾지 못했습니다. query="${query}"\n/docs 로 목록을 확인하십시오.`,
        ephemeral: true,
      });
    }

    const { text, tables } = extractMarkdownTables(doc.body);

    const cleaned = text.replace(/^#\s+.*\n/, '').trim();

    if (mode === 'preview') {
      const previewText = cleaned.slice(0, 900) || '(본문이 비어 있습니다)';

      const embed = new EmbedBuilder()
        .setTitle(doc.title)
        .setDescription(previewText)
        .setColor(0x2B2F36)
        .setFooter({ text: '표는 fields로 표시됩니다. mode=full 로 전체 출력 가능' })
        .setTimestamp();

      const tableFields = tablesToEmbedFields(tables, 10);
      if (tableFields.length) embed.addFields(tableFields);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const chunks = splitForDiscord(cleaned, 1800);
    if (!chunks.length) {
      await interaction.editReply({ content: '(본문이 비어 있습니다)' });
    } else {
      await interaction.editReply({ content: chunks[0] });
      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({ content: chunks[i], ephemeral: true });
      }
    }

    if (tables.length) {
      const embeds = buildTableEmbeds(EmbedBuilder, doc.title, tables);
      const limited = embeds.slice(0, 3);
      for (const e of limited) {
        await interaction.followUp({ embeds: [e], ephemeral: true });
      }

      const omitted = embeds.length - limited.length;
      if (omitted > 0) {
        await interaction.followUp({
          content: `(표 임베드 ${omitted}개는 출력 제한으로 생략되었습니다.)`,
          ephemeral: true,
        });
      }
    }
  },
};
