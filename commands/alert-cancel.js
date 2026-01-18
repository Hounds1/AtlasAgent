const { SlashCommandBuilder } = require('discord.js');
const { getAlertById, removeAlert } = require('../lib/alert.store');
const { cancelScheduledAlert } = require('../lib/alert.scheduler');

const NAME = 'alert-cancel';

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('예약된 알림을 취소합니다.')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('취소할 알림의 ID (/alert-list에서 확인)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const alertId = interaction.options.getString('id');
    const guildId = interaction.guildId;

    const alert = getAlertById(alertId);

    if (!alert) {
      return interaction.reply({
        content: `❌ ID \`${alertId}\`에 해당하는 알림을 찾을 수 없습니다.`,
        ephemeral: true,
      });
    }

    if (alert.guildId !== guildId) {
      return interaction.reply({
        content: '❌ 이 서버의 알림이 아닙니다.',
        ephemeral: true,
      });
    }

    try {
      cancelScheduledAlert(alertId);
      removeAlert(alertId);

      await interaction.reply({
        content: [
          '✅ 알림이 취소되었습니다.',
          '',
          `🆔 **알림 ID**: \`${alertId}\``,
          `📢 **채널**: <#${alert.channelId}>`,
          `💬 **메시지**: ${alert.message.length > 100 ? alert.message.substring(0, 100) + '...' : alert.message}`,
        ].join('\n'),
        ephemeral: false,
      });
    } catch (err) {
      console.error('[AlertCancel] Failed to cancel alert:', err);
      await interaction.reply({
        content: '❌ 알림 취소 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
