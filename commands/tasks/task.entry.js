const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
  .setTitle('Atlas Agent · Nest CLI')
  .setDescription('자주 쓰는 Nest CLI 명령어/옵션 모음입니다. (상세: `nest <command> --help`)')
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