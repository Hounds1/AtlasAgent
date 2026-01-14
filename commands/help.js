const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function buildCommandListField(ctx) {
  const items = [];
  for (const [name, cmd] of ctx.commandMap.entries()) {
    const desc = cmd?.data?.toJSON?.()?.description;
    items.push(`- \`/${name}\`${desc ? `: ${desc}` : ''}`);
  }
  items.sort((a, b) => a.localeCompare(b));
  return items.join('\n').slice(0, 1024) || '(명령 목록이 비어 있습니다)';
}

const NAME = 'help';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('지원 명령과 사용 방법을 표시합니다.'),

  async execute(interaction, ctx) {
    const embed = new EmbedBuilder()
      .setTitle('Atlas Agent · 도움말')
      .setDescription(preview)
      .setColor(0x2B2F36)
      .addFields(
        {
          name: '지원 명령',
          value: buildCommandListField(ctx),
          inline: false,
        }
      )
      .setFooter({ text: 'Atlas Agent · Intelligence Support Bot' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
