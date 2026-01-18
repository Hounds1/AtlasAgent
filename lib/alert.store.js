const fs = require('fs');
const path = require('path');

// Railway 환경: /data, 로컬 환경: ./data
const DATA_DIR = process.env.DATA_PATH || (
  fs.existsSync('/data') ? '/data' : path.join(__dirname, '..', 'data')
);
const ALERTS_FILE = path.join(DATA_DIR, 'alerts.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadAlerts() {
  ensureDataDir();
  if (!fs.existsSync(ALERTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(ALERTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[AlertStore] Failed to load alerts:', err.message);
    return [];
  }
}

function saveAlerts(alerts) {
  ensureDataDir();
  try {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AlertStore] Failed to save alerts:', err.message);
    throw err;
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * 새 알림 예약 추가
 * @param {Object} alert - { channelId, guildId, userId, message, scheduledAt }
 * @returns {Object} 저장된 알림 객체 (id 포함)
 */
function addAlert(alert) {
  const alerts = loadAlerts();
  const newAlert = {
    id: generateId(),
    ...alert,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  saveAlerts(alerts);
  return newAlert;
}

/**
 * 알림 삭제
 * @param {string} id - 알림 ID
 * @returns {Object|null} 삭제된 알림 또는 null
 */
function removeAlert(id) {
  const alerts = loadAlerts();
  const index = alerts.findIndex(a => a.id === id);
  if (index === -1) {
    return null;
  }
  const [removed] = alerts.splice(index, 1);
  saveAlerts(alerts);
  return removed;
}

/**
 * 특정 길드의 알림 목록 조회
 * @param {string} guildId - 길드 ID
 * @returns {Array} 해당 길드의 알림 목록
 */
function getAlertsByGuild(guildId) {
  const alerts = loadAlerts();
  return alerts.filter(a => a.guildId === guildId);
}

/**
 * ID로 알림 조회
 * @param {string} id - 알림 ID
 * @returns {Object|null} 알림 객체 또는 null
 */
function getAlertById(id) {
  const alerts = loadAlerts();
  return alerts.find(a => a.id === id) || null;
}

/**
 * 모든 알림 조회 (스케줄러 초기화용)
 * @returns {Array} 전체 알림 목록
 */
function getAllAlerts() {
  return loadAlerts();
}

module.exports = {
  addAlert,
  removeAlert,
  getAlertsByGuild,
  getAlertById,
  getAllAlerts,
  DATA_DIR,
};
