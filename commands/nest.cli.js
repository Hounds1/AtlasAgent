const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const embed = new EmbedBuilder()
  .setTitle('Atlas Agent · Nest CLI')
  .setDescription('자주 쓰는 Nest CLI 명령어/옵션 모음입니다. (상세: `nest <command> --help`)')
  .setColor(0x2B2F36)
  .addFields(
    {
      name: '설치 / 버전',
      value: [
        '**npm i -g @nestjs/cli** - Nest CLI 전역 설치',
        '**nest --version** - 설치된 Nest CLI 버전 확인',
      ].join('\n'),
      inline: false,
    },
    {
      name: '도움말',
      value: [
        '**nest --help** - 전체 명령 목록/요약',
        '**nest <command> --help** - 특정 명령 상세 도움말',
      ].join('\n'),
      inline: false,
    },
    {
      name: '프로젝트 생성 (new)',
      value: [
        '**nest new <name>** - 새 Nest 프로젝트 생성',
        '**nest new <name> --strict** - 엄격한 TypeScript 설정으로 생성',
        '**nest new <name> --package-manager pnpm** - pnpm을 기본 패키지 매니저로 사용',
      ].join('\n'),
      inline: false,
    },
    {
      name: '코드 생성 (generate / g)',
      value: [
        '**nest g module <name>** - 모듈 생성',
        '**nest g controller <name>** - 컨트롤러 생성',
        '**nest g service <name>** - 서비스 생성',
        '**nest g resource <name>** - CRUD 리소스 스캐폴딩',
        '',
        '**nest g <schematic> <name> --dry-run** - 실제 생성 없이 어떤 파일이 생기는지 미리보기',
        '**nest g <schematic> <name> --no-spec** - *.spec.ts 테스트 파일은 생성하지 않음',
      ].join('\n'),
      inline: false,
    },
    {
      name: '빌드 / 실행',
      value: [
        '**nest start** - 앱 실행 (개발용)',
        '**nest start --watch** - 파일 변경 시 자동 재시작',
        '**nest build** - 프로덕션 빌드 생성',
      ].join('\n'),
      inline: false,
    },
    {
      name: '테스트 / 품질',
      value: [
        '**nest test** - 유닛 테스트 실행',
        '**nest test --watch** - 변경 시 테스트 자동 재실행',
        '**nest test --coverage** - 커버리지 리포트 생성',
        '**nest lint** - 린트 검사',
        '**nest format** - 코드 포맷 정리',
      ].join('\n'),
      inline: false,
    },
    {
      name: '패키지 추가 / 정보',
      value: [
        '**nest add <package>** - Nest 스키매틱으로 패키지/설정 추가',
        '**nest info** - Nest/Node/NPM 등 환경 정보 출력',
        '**nest deps** - 의존성 트리 출력',
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