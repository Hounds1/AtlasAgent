const path = require('path');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { registerInteractionRouter } = require('./handlers/interactionRouter');
const { atlas } = require('./config.json');
const { ping } = require('./commands/ping');
const { versions } = require('./commands/versions');
const { loadDocs, findDocBest, searchDocs, splitForDiscord,
  extractMarkdownTables, tablesToEmbedFields, buildTableEmbeds } = require('./repository/docStore');

const token = process.env.DISCORD_TOKEN;
if (!token) {
  throw new Error('DISCORD_TOKEN is not set. Please set environment variable DISCORD_TOKEN.');
}

let startUpChennel;

const stage = atlas.stage;
if (stage === 'study') {
    startUpChennel = process.env.AGENT_CHANNEL;
} else if (stage === 'test') {
    startUpChennel = process.env.START_UP_CHANNEL;

    if (!startUpChennel) startUpChennel = process.env.DEFAULT_CHANNEL;
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (c) => {
    console.log(`Ready. Logged in as ${c.user.tag}`);
  
    const channel = await c.channels.fetch(startUpChennel);
    if (channel?.isTextBased()) {
      await channel.send('Intelligent System Analytic Computer is activated. All Atlas systems are functional and online.');
      await channel.send('Atlas Agent ready to intelligence support.');
    }
  });

const docsCmd = require('./commands/docs');
const docCmd = require('./commands/doc');
const searchCmd = require('./commands/search');

const docsDirAbs = path.join(process.cwd(), 'docs');
const docs = loadDocs(docsDirAbs);

const commandMap = new Map([
  [ping.name, ping],
  [versions.name, versions],
  [docsCmd.name, docsCmd],
  [docCmd.name, docCmd],
  [searchCmd.name, searchCmd],
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