const schedule = require('node-schedule');
const { getAllAlerts, removeAlert } = require('./alert.store');

// 활성 스케줄 작업 저장 (id -> Job)
const activeJobs = new Map();

/**
 * 단일 알림 스케줄 등록
 * @param {Object} alert - 알림 객체
 * @param {Object} client - Discord 클라이언트
 */
function scheduleAlert(alert, client) {
  const { id, channelId, message, scheduledAt } = alert;
  const scheduledDate = new Date(scheduledAt);

  // 이미 과거 시간이면 스킵
  if (scheduledDate <= new Date()) {
    console.log(`[Scheduler] Alert ${id} is in the past, removing...`);
    removeAlert(id);
    return;
  }

  // 이미 등록된 작업이면 스킵
  if (activeJobs.has(id)) {
    return;
  }

  const job = schedule.scheduleJob(scheduledDate, async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        await channel.send({
          content: message,
          allowedMentions: { parse: ['users', 'roles'] },
        });
        console.log(`[Scheduler] Alert ${id} sent successfully`);
      } else {
        console.error(`[Scheduler] Channel ${channelId} not found or not text-based`);
      }
    } catch (err) {
      console.error(`[Scheduler] Failed to send alert ${id}:`, err.message);
    } finally {
      // 전송 후 삭제
      removeAlert(id);
      activeJobs.delete(id);
    }
  });

  if (job) {
    activeJobs.set(id, job);
    console.log(`[Scheduler] Alert ${id} scheduled for ${scheduledDate.toISOString()}`);
  }
}

/**
 * 알림 스케줄 취소
 * @param {string} id - 알림 ID
 * @returns {boolean} 취소 성공 여부
 */
function cancelScheduledAlert(id) {
  const job = activeJobs.get(id);
  if (job) {
    job.cancel();
    activeJobs.delete(id);
    return true;
  }
  return false;
}

/**
 * 저장된 모든 알림을 스케줄러에 등록 (봇 시작 시 호출)
 * @param {Object} client - Discord 클라이언트
 */
function initializeScheduler(client) {
  const alerts = getAllAlerts();
  const now = new Date();
  let scheduled = 0;
  let expired = 0;

  for (const alert of alerts) {
    const scheduledDate = new Date(alert.scheduledAt);
    if (scheduledDate <= now) {
      // 과거 알림은 삭제
      removeAlert(alert.id);
      expired++;
    } else {
      scheduleAlert(alert, client);
      scheduled++;
    }
  }

  console.log(`[Scheduler] Initialized: ${scheduled} alerts scheduled, ${expired} expired alerts removed`);
}

/**
 * 활성 작업 수 조회
 * @returns {number}
 */
function getActiveJobCount() {
  return activeJobs.size;
}

module.exports = {
  scheduleAlert,
  cancelScheduledAlert,
  initializeScheduler,
  getActiveJobCount,
};
