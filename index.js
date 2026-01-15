const path = require('path');
const { Client, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { registerInteractionRouter } = require('./handlers/interactionRouter');
const { atlas, newCommands } = require('./config.json');

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

const commandMap = new Map([
  [atlasMe.name, atlasMe],
  [help.name, help],
  [ping.name, ping],
  [versions.name, versions],
  [nestCliCmd.name, nestCliCmd],
  [tasks.name, tasks],
  [task1.name, task1],
  [task2.name, task2],
  [task3.name, task3]
]);

const ctx = {
  commandMap,
};

const version = atlas.version;

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready. Logged in as ${c.user.tag}`);

  const flags = MessageFlags.SuppressNotifications;
  const channel = await c.channels.fetch(startUpChannel);
  if (channel?.isTextBased()) {
    await channel.send({
      content: 'Intelligent System Analytic Computer is activated. All Atlas systems are functional and online.',
      flags,
      allowedMentions: { parse: [] }
    });
    
    const newCommandNames = (newCommands || [])
      .filter(name => commandMap.has(name));
    
    let updateMessage = `Atlas Agent ready to intelligence support. (v${version})`;
    
    if (newCommandNames.length > 0) {
      const newCommandsList = newCommandNames.map(name => `\`/${name}\``).join(', ');
      updateMessage = `**Atlas launched with new commands:** ${newCommandsList}\n\nAtlas Agent ready to intelligence support. (v${version})`;
    }
    
    await channel.send({
      content: updateMessage,
      flags,
      allowedMentions: { parse: [] }
    });
  }
});


registerInteractionRouter(client, ctx);
client.login(token);