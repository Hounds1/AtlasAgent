const { MessageFlags } = require('discord.js');
const { isQuietHoursKST } = require('../handlers/flag.provider')

function toBitfield(flags) {
  if (flags == null) return 0;
  if (typeof flags === 'number') return flags;
  return Number(flags) || 0;
}

function normalizeMessageOptions(payload, { silent }) {
  if (typeof payload === 'string') {
    const opts = { content: payload };
    return normalizeMessageOptions(opts, { silent });
  }

  const out = { ...payload };

  out.allowedMentions = { parse: [], ...(out.allowedMentions || {}) };

  const isEphemeral = !!out.ephemeral;

  if (silent && !isEphemeral) {
    const merged = toBitfield(out.flags) | MessageFlags.SuppressNotifications;
    out.flags = merged;
  }

  return out;
}

function applyQuietPolicy(interaction, options = {}) {
  const silent = options.quietHours !== false && isQuietHoursKST();

  if (interaction.__quiet_patched) return () => {};
  interaction.__quiet_patched = true;

  const original = {
    reply: interaction.reply?.bind(interaction),
    followUp: interaction.followUp?.bind(interaction),
    deferReply: interaction.deferReply?.bind(interaction),
    channelSend: interaction.channel?.send?.bind(interaction.channel),
  };

  if (original.reply) {
    interaction.reply = (payload) => original.reply(normalizeMessageOptions(payload, { silent }));
  }

  if (original.followUp) {
    interaction.followUp = (payload) => original.followUp(normalizeMessageOptions(payload, { silent }));
  }

  if (interaction.channel && original.channelSend) {
    interaction.channel.send = (payload) =>
      original.channelSend(normalizeMessageOptions(payload, { silent }));
  }
  
  if (original.deferReply) {
    interaction.deferReply = (payload) => original.deferReply(payload);
  }

  return () => {
    if (original.reply) interaction.reply = original.reply;
    if (original.followUp) interaction.followUp = original.followUp;
    if (interaction.channel && original.channelSend) interaction.channel.send = original.channelSend;
    if (original.deferReply) interaction.deferReply = original.deferReply;
    delete interaction.__quiet_patched;
  };
}

module.exports = { applyQuietPolicy };
