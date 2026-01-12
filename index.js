const { Client, Events, GatewayIntentBits } = require('discord.js');
const { atlas } = require('./config.json');

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

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
  
    if (interaction.commandName === 'ping') {
      await interaction.reply('pong');
    }
});

client.login(token);