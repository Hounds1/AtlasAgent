const { Events } = require('discord.js');
const ping = require('../commands/ping');
const versions = require('../commands/versions');

const commandMap = new Map([
  [ping.name, ping], [versions.name, versions]
]);

function registerInteractionRouter(client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commandMap.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error('Command execute error:', err);
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '명령 처리 중 오류가 발생했습니다.', ephemeral: true });
      }
    }
  });
}

module.exports = { registerInteractionRouter };