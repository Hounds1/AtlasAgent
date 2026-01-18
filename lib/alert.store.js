const fs = require('fs');
const path = require('path');

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

function getAlertsByGuild(guildId) {
  const alerts = loadAlerts();
  return alerts.filter(a => a.guildId === guildId);
}

function getAlertById(id) {
  const alerts = loadAlerts();
  return alerts.find(a => a.id === id) || null;
}

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
