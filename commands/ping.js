const { SlashCommandBuilder } = require('discord.js');

const NAME = 'ping';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('pong으로 응답합니다.'),

  async execute(interaction) {
    await interaction.reply('pong');
  },
};