module.exports = {
    name: 'ping',
    async execute(interaction) {
      await interaction.reply('pong');
    },
  };