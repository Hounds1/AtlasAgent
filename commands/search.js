const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'search',
  async execute(interaction, ctx) {
    const { docs, searchDocs } = ctx;

    const query = interaction.options.getString('query', true);
    const results = searchDocs(docs, query, 5);

    const embed = new EmbedBuilder()
      .setTitle('Atlas Agent · 검색 결과')
      .setDescription(`query="${query}"`)
      .setColor(0x2B2F36);

    if (!results.length) {
      embed.addFields({ name: '결과', value: '일치 항목이 없습니다.' });
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    for (const r of results) {
      embed.addFields({
        name: r.doc.title,
        value: (r.snippet || '').slice(0, 500),
        inline: false,
      });
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
