const { SlashCommandBuilder } = require('discord.js');
const { deployInteraction } = require('./deploy.interaction');
const { COMPANY_DOC } = require('./docs/company');

const NAME = 'task1';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('업체(Company) 요구사항을 출력합니다.'),

  async execute(interaction) {
    await deployInteraction(interaction, COMPANY_DOC, { ephemeral: true });
  },
};
