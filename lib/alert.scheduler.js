const schedule = require('node-schedule');
const { getAllAlerts, removeAlert } = require('./alert.store');

const activeJobs = new Map();

function scheduleAlert(alert, client) {
  const { id, channelId, message, scheduledAt } = alert;
  const scheduledDate = new Date(scheduledAt);

  if (scheduledDate <= new Date()) {
    sendAlertImmediately(alert, client, true);
    return;
  }

  if (activeJobs.has(id)) {
    return;
  }

  const job = schedule.scheduleJob(scheduledDate, async () => {
    await sendAlert(alert, client);
  });

  if (job) {
    activeJobs.set(id, job);
    console.log(`[Scheduler] Alert ${id} scheduled for ${scheduledDate.toISOString()}`);
  }
}

async function sendAlert(alert, client) {
  const { id, channelId, message } = alert;

  try {
    const channel = await client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      const announcementMessage = [
        '**[Announcement]** Scheduled announcement from Atlas Agent.',
        '',
        message,
      ].join('\n');

      await channel.send({
        content: announcementMessage,
        allowedMentions: { parse: ['users', 'roles'] },
      });
      console.log(`[Scheduler] Alert ${id} sent successfully`);
    } else {
      console.error(`[Scheduler] Channel ${channelId} not found or not text-based`);
    }
  } catch (err) {
    console.error(`[Scheduler] Failed to send alert ${id}:`, err.message);
  } finally {
    removeAlert(id);
    activeJobs.delete(id);
  }
}

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

async function sendAlertImmediately(alert, client, isDelayed = false) {
  const { id, channelId, message, scheduledAt } = alert;

  try {
    const channel = await client.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      let prefix;
      if (isDelayed) {
        const originalTime = formatKST(scheduledAt);
        prefix = `**[Delayed Announcement]** This announcement was originally scheduled for ${originalTime} (KST) but was delayed due to system restart.`;
      } else {
        prefix = '**[Announcement]** Scheduled announcement from Atlas Agent.';
      }

      const announcementMessage = [prefix, '', message].join('\n');

      await channel.send({
        content: announcementMessage,
        allowedMentions: { parse: ['users', 'roles'] },
      });
      console.log(`[Scheduler] Delayed alert ${id} sent successfully`);
    } else {
      console.error(`[Scheduler] Channel ${channelId} not found or not text-based`);
    }
  } catch (err) {
    console.error(`[Scheduler] Failed to send delayed alert ${id}:`, err.message);
  } finally {
    removeAlert(id);
  }
}

function cancelScheduledAlert(id) {
  const job = activeJobs.get(id);
  if (job) {
    job.cancel();
    activeJobs.delete(id);
    return true;
  }
  return false;
}

async function initializeScheduler(client) {
  const alerts = getAllAlerts();
  const now = new Date();
  let scheduled = 0;
  let delayed = 0;

  for (const alert of alerts) {
    const scheduledDate = new Date(alert.scheduledAt);
    if (scheduledDate <= now) {
      await sendAlertImmediately(alert, client, true);
      delayed++;
    } else {
      scheduleAlert(alert, client);
      scheduled++;
    }
  }

  console.log(`[Scheduler] Initialized: ${scheduled} scheduled, ${delayed} delayed alerts sent`);
}

function getActiveJobCount() {
  return activeJobs.size;
}

module.exports = {
  scheduleAlert,
  cancelScheduledAlert,
  initializeScheduler,
  getActiveJobCount,
};
