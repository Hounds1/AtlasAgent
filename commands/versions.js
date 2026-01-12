const { EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
.setTitle('Atlas Agent · 기술 스택')
.setDescription('현재 프로젝트에서 사용 중인 런타임 및 도구 버전입니다.')
.setColor(0x2B2F36)
.addFields(
  {
    name: '런타임 및 패키지 매니저',
    value:
      '**Node.js** `24.12.0 LTS`\n' +
      '**pnpm** `10.27.0`',
    inline: false,
  },
  {
    name: '프론트엔드',
    value:
      '**TypeScript** `5.9.3`\n' +
      '**React** `19.2.3`\n' +
      '**Vite** `7.3.1`',
    inline: true,
  },
  {
    name: '백엔드',
    value:
      '**NestJS Core** `11.1.11`',
    inline: true,
  },
  {
    name: '테스팅',
    value:
      '**Jest** `30.2.0`\n' +
      '**supertest** `7.2.2`\n' +
      '**Playwright** `1.57.0`',
    inline: true,
  },
  {
    name: '데이터베이스 / 인프라',
    value:
      '**PostgreSQL** `18.1`\n' +
      '**Prisma** `7.2.0`\n' +
      '**Docker Engine** `29.x`',
    inline: false,
  }
)
.setFooter({ text: 'Atlas Agent · Information Assistant' })
.setTimestamp();

module.exports = {
  name: 'versions',
  async execute(interaction) {
    await interaction.reply({ embeds: [embed] });
  },
};