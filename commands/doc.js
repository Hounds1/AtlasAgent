const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'doc',
  async execute(interaction, ctx) {
    const { docs, findDocBest, splitForDiscord } = ctx;

    const query = interaction.options.getString('query', true);
    const mode = interaction.options.getString('mode') || 'preview';

    const doc = findDocBest(docs, query);

    if (!doc) {
      return interaction.reply({
        content: `문서를 찾지 못했습니다. query="${query}"\n/dcos 로 목록을 확인하십시오.`,
        ephemeral: true,
      });
    }

    if (mode === 'preview') {
      const preview = doc.body
        .replace(/^#\s+.*\n/, '')
        .trim()
        .slice(0, 900);

      const embed = new EmbedBuilder()
        .setTitle(doc.title)
        .setDescription(preview ? preview : '(본문이 비어 있습니다)')
        .setColor(0x2B2F36)
        .setFooter({ text: 'mode=full 로 전체 출력 가능' });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    const chunks = splitForDiscord(doc.body, 1800);
    if (!chunks.length) {
      return interaction.editReply({ content: '본문이 비어 있습니다.' });
    }

    await interaction.editReply({ content: chunks[0] });

    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp({ content: chunks[i], ephemeral: true });
    }
  },
};
