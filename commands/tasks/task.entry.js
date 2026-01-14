const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
  .setTitle('Atlas Agent · Study Missions')
  .setDescription('주어진 조건에 따라 당신만의 시스템을 구현해주세요.')
  .setColor(0x2B2F36)
  .addFields(
    {
        name: '구현',
        value: [
          '**자유롭게 구현 해야합니다.**',
          '최소 조건을 지키면서 여러분의 시스템을 자유롭게 구현해보세요.',
        ].join('\n'),
        inline: false,
    },
    {
        name: '업체 / 계정',
        value: [
          '**/task1**',
          '업체 / 계정 도메인의 요구 사항을 출력합니다.',
        ].join('\n'),
        inline: false,
    },
  );

const NAME = 'tasks';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('스터디 엔트리를 출력합니다.'),
  async execute(interaction) {
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};