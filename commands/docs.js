const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'docs',
  async execute(interaction, ctx) {
    const { docs } = ctx;
    const embed = new EmbedBuilder()
      .setTitle('Atlas Agent · 문서 목록')
      .setColor(0x2B2F36);

    if (!docs.length) {
      embed.setDescription('docs/ 폴더에 문서가 없습니다.');
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const lines = docs.map((d, i) => `${i + 1}. ${d.title}`);
    embed.setDescription(lines.join('\n'));

    return interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
