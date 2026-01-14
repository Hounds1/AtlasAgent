const { Events } = require('discord.js');
const { applyQuietPolicy } = require('../lib/silence.policy');

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = commandMap.get(interaction.commandName);
  if (!cmd) return;

  const ctx = { commandMap };

  const restore = applyQuietPolicy(interaction, { quietHours: true });

  try {
    if (cmd.execute.length >= 2) {
      await cmd.execute(interaction, ctx);
    } else {
      await cmd.execute(interaction);
    }
  } finally {
    
    restore();
  }
});