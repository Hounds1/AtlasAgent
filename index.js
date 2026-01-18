const path = require('path');
const { Client, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { registerInteractionRouter } = require('./handlers/interactionRouter');
const { initializeScheduler } = require('./lib/alert.scheduler');
const { newCommands } = require('./config.json');
const { version } = require('./package.json');
const changelog = require('./changelog.json');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN is not set. Please set environment variable DISCORD_TOKEN.');
}

const stage = (process.env.ATLAS_STAGE || '').toLowerCase();

const base = process.env.START_UP_CHANNEL || process.env.DEFAULT_CHANNEL;
const startUpChannel = 
        stage === 'buddies' ? (process.env.AGENT_CHANNEL || base) : base;

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

// const QUIET_HOURS_ENABLED = (process.env.QUIET_HOURS_ENABLED || 'true') === 'true';

//commands
const atlasMe = require('./commands/atlas');
const help = require('./commands/help');
const ping = require('./commands/ping');
const versions = require('./commands/versions');
const nestCliCmd = require('./commands/nest.cli');
const tasks = require('./commands/tasks/task.entry');
const task1 = require('./commands/tasks/task.first');
const task2 = require('./commands/tasks/task.sec');
const task3 = require('./commands/tasks/task.third');
const alert = require('./commands/alert');
const alertList = require('./commands/alert-list');
const alertCancel = require('./commands/alert-cancel');

const commandMap = new Map([
  [atlasMe.name, atlasMe],
  [help.name, help],
  [ping.name, ping],
  [versions.name, versions],
  [nestCliCmd.name, nestCliCmd],
  [tasks.name, tasks],
  [task1.name, task1],
  [task2.name, task2],
  [task3.name, task3],
  [alert.name, alert],
  [alertList.name, alertList],
  [alertCancel.name, alertCancel],
]);

const ctx = {
  commandMap,
};

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready. Logged in as ${c.user.tag}`);

  // 저장된 알림 스케줄러 초기화
  initializeScheduler(c);

  const flags = MessageFlags.SuppressNotifications;
  const channel = await c.channels.fetch(startUpChannel);
  if (channel?.isTextBased()) {
    const messageParts = [];
    
    messageParts.push('Intelligent System Analytic Computer is activated. All Atlas systems are confirmed online.');
    
    const newCommandNames = (newCommands || [])
      .filter(name => commandMap.has(name));
    
    if (newCommandNames.length > 0) {
      const newCommandsList = newCommandNames.map(name => `\`/${name}\``).join(', ');
      messageParts.push(`**Atlas launched with new commands:** ${newCommandsList}`);
    }

    if (changelog.changes && changelog.changes.length > 0) {
      const changesList = changelog.changes.map(c => `• ${c}`).join('\n');
      messageParts.push(`\n**What's new in v${changelog.version}:**\n${changesList}`);
    }
    
    messageParts.push(`\nAtlas Agent ready to intelligence support. (v${version})`);

    await channel.send({
      content: messageParts.join('\n'),
      flags,
      allowedMentions: { parse: [] }
    });
  }
});


registerInteractionRouter(client, ctx);
client.login(token);