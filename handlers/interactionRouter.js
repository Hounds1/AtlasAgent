const { Events } = require('discord.js');

function registerInteractionRouter(client, ctx) {
  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (!interaction.isChatInputCommand()) return;

      const command = ctx.commandMap.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction, ctx);
    } catch (err) {
      console.error('Command execute error:', err);

      const payload = { content: '명령 처리 중 오류가 발생했습니다.', ephemeral: true };

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(payload).catch(() => {});
      } else {
        await interaction.reply(payload).catch(() => {});
      }
    }
  });
}

module.exports = { registerInteractionRouter };
