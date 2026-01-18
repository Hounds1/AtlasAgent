const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { addAlert } = require('../lib/alert.store');
const { scheduleAlert } = require('../lib/alert.scheduler');

const NAME = 'alert';
const KST_OFFSET = 9 * 60 * 60 * 1000;

module.exports = {
  name: NAME,
  data: new SlashCommandBuilder()
    .setName(NAME)
    .setDescription('지정한 일시에 알림을 보냅니다.')
    .addIntegerOption(option =>
      option
        .setName('year')
        .setDescription('연도 (예: 2026)')
        .setRequired(true)
        .setMinValue(2024)
        .setMaxValue(2100)
    )
    .addIntegerOption(option =>
      option
        .setName('month')
        .setDescription('월 (1-12)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(12)
    )
    .addIntegerOption(option =>
      option
        .setName('day')
        .setDescription('일 (1-31)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(31)
    )
    .addIntegerOption(option =>
      option
        .setName('hour')
        .setDescription('시 (0-23, 24시간제)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(23)
    )
    .addIntegerOption(option =>
      option
        .setName('minute')
        .setDescription('분 (0-59)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(59)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('알림 메시지 내용')
        .setRequired(true)
        .setMaxLength(2000)
    )
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('알림을 보낼 채널')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    ),

  async execute(interaction, ctx) {
    const selectedChannel = interaction.options.getChannel('channel');
    const targetChannelId = selectedChannel.id;

    const year = interaction.options.getInteger('year');
    const month = interaction.options.getInteger('month');
    const day = interaction.options.getInteger('day');
    const hour = interaction.options.getInteger('hour');
    const minute = interaction.options.getInteger('minute');
    const message = interaction.options.getString('message');

    const kstDate = new Date(year, month - 1, day, hour, minute, 0, 0);
    const utcDate = new Date(kstDate.getTime() - KST_OFFSET);

    if (isNaN(utcDate.getTime())) {
      return interaction.reply({
        content: '❌ 유효하지 않은 날짜입니다.',
        ephemeral: true,
      });
    }

    if (utcDate <= new Date()) {
      return interaction.reply({
        content: '❌ 과거 시간으로는 알림을 예약할 수 없습니다.',
        ephemeral: true,
      });
    }

    const permissions = selectedChannel.permissionsFor(interaction.client.user);
    if (!permissions?.has('SendMessages')) {
      return interaction.reply({
        content: `❌ 봇이 ${selectedChannel} 채널에 메시지를 보낼 권한이 없습니다.`,
        ephemeral: true,
      });
    }

    try {
      const alert = addAlert({
        channelId: targetChannelId,
        guildId: interaction.guildId,
        userId: interaction.user.id,
        userName: interaction.user.username,
        message,
        scheduledAt: utcDate.toISOString(),
      });

      scheduleAlert(alert, interaction.client);

      const kstString = `${year}년 ${month}월 ${day}일 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      await interaction.reply({
        content: [
          '✅ 알림이 예약되었습니다.',
          '',
          `📅 **예약 시간**: ${kstString} (KST)`,
          `📢 **채널**: <#${targetChannelId}>`,
          `💬 **메시지**: ${message.length > 100 ? message.substring(0, 100) + '...' : message}`,
          `🆔 **알림 ID**: \`${alert.id}\``,
        ].join('\n'),
        ephemeral: false,
      });
    } catch (err) {
      console.error('[Alert] Failed to create alert:', err);
      await interaction.reply({
        content: '❌ 알림 예약 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};
