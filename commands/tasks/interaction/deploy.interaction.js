const { MessageFlags } = require('discord.js');
const { provideFlags } = require('../../../handlers/flag.provider');

const MAX_LEN = 2000;
const SAFE_MARGIN = 50;

function assertLen(label, text) {
  const limit = MAX_LEN - SAFE_MARGIN;
  if (text.length > limit) {
    throw new Error(`[${label}] 메시지 길이 초과: ${text.length} > ${limit}`);
  }
}

async function deployInteraction(interaction, messages, options = {}) {
  const {
    ephemeral = false,
    notifyDone = false,
  } = options;

  if (!interaction.channel) {
    return interaction.reply({
      content: '이 명령은 서버 채널에서만 사용할 수 있습니다.',
      ephemeral: true,
    });
  }

  try {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '문서를 채널에 출력합니다.', ephemeral: false });
    } else {
      await interaction.followUp({ content: '문서를 채널에 출력합니다.', ephemeral: false });
    }
  } catch (_) {
  }

  messages.forEach((m, i) => assertLen(`messages[${i}]`, m));

  const flags = provideFlags(); //include suppress flag

  try {
    for (const msg of messages) {
      await interaction.channel.send({
        content: msg,
        flags,
        allowedMentions: { parse: [] },
      });
    }

    if (notifyDone) {
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply('전송 완료입니다.');
        } else {
          await interaction.followUp({ content: '전송 완료입니다.', ephemeral });
        }
      } catch (_) {}
    }
  } catch (err) {
    const msg = err?.message ? `전송 실패: ${err.message}` : '전송 실패입니다.';
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(msg);
      } else {
        await interaction.followUp({ content: msg, ephemeral: true });
      }
    } catch (_) {}
  }
}

module.exports = { deployInteraction };
