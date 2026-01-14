const { SlashCommandBuilder } = require('discord.js');
const { deployInteraction } = require('./interaction/deploy.interaction');
const { ACCOUNT_DOC } = require('./docs/account');

const NAME = 'task2';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('계정(Account) 요구사항을 출력합니다.'),

  async execute(interaction) {
    await deployInteraction(interaction, ACCOUNT_DOC, {
        ephemeral: true,
        quietHours: true,
        suppressEmbeds: false,
      });
  },
};
