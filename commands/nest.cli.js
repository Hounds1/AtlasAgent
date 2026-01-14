const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
  .setTitle('Atlas Agent · Nest CLI')
  .setDescription('자주 쓰는 Nest CLI 명령어/옵션 모음입니다. (상세: `nest <command> --help`)')
  .setColor(0x2B2F36)
  .addFields(
    {
      name: '설치 / 버전',
      value: [
        '**npm i -g @nestjs/cli**',
        '**nest --version**',
      ].join('\n'),
      inline: false,
    },
    {
      name: '도움말 / 가이드',
      value: [
        '**nest --help**',
        '**nest <command> --help**',
        '**nest g --help**',
      ].join('\n'),
      inline: false,
    },
    {
      name: '프로젝트 생성 (new)',
      value: [
        '**nest new <project-name>**',
        '**nest new <project-name> --package-manager pnpm**',
        '**nest new <project-name> --strict**',
        '**nest new <project-name> --skip-git**',
        '**nest new <project-name> --skip-install**',
        '**nest new <project-name> --directory <dir>**',
      ].join('\n'),
      inline: false,
    },
    {
      name: '코드 생성 (generate / g)',
      value: [
        '**nest g module <name>**',
        '**nest g controller <name>**',
        '**nest g service <name>**',
        '**nest g gateway <name>**',
        '**nest g interceptor <name>**',
        '**nest g guard <name>**',
        '**nest g pipe <name>**',
        '**nest g filter <name>**',
        '**nest g middleware <name>**',
        '**nest g decorator <name>**',
        '**nest g resource <name>**  (CRUD 스캐폴딩)',
        '',
        '_자주 쓰는 옵션_',
        '**nest g <schematic> <name> --dry-run**',
        '**nest g <schematic> <name> --no-spec**',
        '**nest g <schematic> <name> --flat**',
        '**nest g <schematic> <name> --project <projectName>** (모노레포/워크스페이스)',
      ].join('\n'),
      inline: false,
    },
    {
      name: '빌드 / 실행',
      value: [
        '**nest build**',
        '**nest build --watch**',
        '**nest start**',
        '**nest start --watch**',
        '**nest start --debug --watch**',
      ].join('\n'),
      inline: false,
    },
    {
      name: '테스트 / 품질',
      value: [
        '**nest test**',
        '**nest test --watch**',
        '**nest test --coverage**',
        '**nest lint**',
        '**nest format**',
      ].join('\n'),
      inline: false,
    },
    {
      name: '패키지 추가 / 정보',
      value: [
        '**nest add <package>**',
        '**nest info**',
        '**nest deps**',
        '**nest deps --graph**',
      ].join('\n'),
      inline: false,
    }
  )
  .setFooter({ text: 'Atlas Agent · Nest CLI cheat sheet' })
  .setTimestamp();

const NAME = 'nest-cli';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('Nest CLI 명령어 모음을 표시합니다.'),
  async execute(interaction) {
    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};