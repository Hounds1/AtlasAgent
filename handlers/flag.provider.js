const { MessageFlags } = require('discord.js');

function getKstHour(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
}

function isQuietHoursKST() {
  const h = getKstHour();
  return h >= 19 || h < 8;
}

function provideFlags(quietHours = true, suppressEmbeds = false) {
  const silent = quietHours && isQuietHoursKST();
  const flags =
    silent
      ? (suppressEmbeds
          ? (MessageFlags.SuppressNotifications | MessageFlags.SuppressEmbeds)
          : MessageFlags.SuppressNotifications)
      : (suppressEmbeds ? MessageFlags.SuppressEmbeds : undefined);

  return flags;
}

module.exports = { provideFlags, isQuietHoursKST };