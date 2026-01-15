const { SlashCommandBuilder } = require('discord.js');
const { deployInteraction } = require('./interaction/deploy.interaction');
const { AUTH_DOC } = require('./docs/auth');

const NAME = 'task3';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('인증/인가(Auth) 요구사항을 출력합니다.'),

  async execute(interaction) {
    await deployInteraction(interaction, AUTH_DOC, {
        ephemeral: true,
        quietHours: true,
        suppressEmbeds: false,
      });
  },
};
