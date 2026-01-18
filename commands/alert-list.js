const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getAlertsByGuild } = require('../lib/alert.store');

const NAME = 'alert-list';
const KST_OFFSET = 9 * 60 * 60 * 1000;

function formatKST(isoString) {
  const utcDate = new Date(isoString);
  const kstDate = new Date(utcDate.getTime() + KST_OFFSET);
  
  const year = kstDate.getUTCFullYear();
  const month = kstDate.getUTCMonth() + 1;
  const day = kstDate.getUTCDate();
  const hour = kstDate.getUTCHours().toString().padStart(2, '0');
  const minute = kstDate.getUTCMinutes().toString().padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
}

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('이 서버에 예약된 알림 목록을 조회합니다.'),

  async execute(interaction) {
    const guildId = interaction.guildId;
    const alerts = getAlertsByGuild(guildId);

    if (alerts.length === 0) {
      return interaction.reply({
        content: '📭 예약된 알림이 없습니다.',
        ephemeral: true,
      });
    }

    alerts.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));

    const embed = new EmbedBuilder()
      .setTitle('📋 예약된 알림 목록')
      .setColor(0x5865F2)
      .setDescription(`총 ${alerts.length}개의 알림이 예약되어 있습니다.`)
      .setTimestamp();

    const displayAlerts = alerts.slice(0, 10);

    for (const alert of displayAlerts) {
      const truncatedMessage = alert.message.length > 50 
        ? alert.message.substring(0, 50) + '...' 
        : alert.message;

      embed.addFields({
        name: `🆔 ${alert.id}`,
        value: [
          `📅 ${formatKST(alert.scheduledAt)} (KST)`,
          `📢 <#${alert.channelId}>`,
          `👤 ${alert.userName || '알 수 없음'}`,
          `💬 ${truncatedMessage}`,
        ].join('\n'),
        inline: false,
      });
    }

    if (alerts.length > 10) {
      embed.setFooter({ text: `외 ${alerts.length - 10}개의 알림이 더 있습니다.` });
    }

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
