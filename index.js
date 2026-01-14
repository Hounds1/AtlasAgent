const path = require('path');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { registerInteractionRouter } = require('./handlers/interactionRouter');
const { atlasSetup } = require('./config.json');
const { loadDocs, findDocBest, searchDocs, splitForDiscord,
  extractMarkdownTables, tablesToEmbedFields, buildTableEmbeds } = require('./repository/docStore');

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

const QUIET_HOURS_ENABLED = (process.env.QUIET_HOURS_ENABLED || 'true') === 'true';

client.once(Events.ClientReady, async (c) => {
    console.log(`Ready. Logged in as ${c.user.tag}`);
  
    if (QUIET_HOURS_ENABLED && isQuietHoursKST()) {
      console.log('[Atlas] Quiet hours (KST 22:00~08:00). Skip startup announcements.');
      return;
    }

    const channel = await c.channels.fetch(startUpChannel);
    if (channel?.isTextBased()) {
      await channel.send('Intelligent System Analytic Computer is activated. All Atlas systems are functional and online.');
      await channel.send('Atlas Agent ready to intelligence support.');
    }
  });

//commands
const atlas = require('./commands/atlas');
const help = require('./commands/help');
const ping = require('./commands/ping');
const versions = require('./commands/versions');
const docsCmd = require('./commands/docs');
const docCmd = require('./commands/doc');
const searchCmd = require('./commands/search');
const nestCliCmd = require('./commands/nest.cli');

const docsDirAbs = path.join(process.cwd(), 'docs');
const docs = loadDocs(docsDirAbs);

const commandMap = new Map([
  [atlas.name, atlas],
  [help.name, help],
  [ping.name, ping],
  [versions.name, versions],
  [docsCmd.name, docsCmd],
  [docCmd.name, docCmd],
  [searchCmd.name, searchCmd],
  [nestCliCmd.name, nestCliCmd]
]);

const ctx = {
  docs,
  commandMap,
  findDocBest,
  searchDocs,
  splitForDiscord,
  extractMarkdownTables,
  tablesToEmbedFields,
  buildTableEmbeds,
};


registerInteractionRouter(client, ctx);

client.login(token);

function isQuietHoursKST(date = new Date()) {
  const kstHour = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      hour12: false,
    }).format(date)
  );

  return kstHour >= 22 || kstHour < 8;
}