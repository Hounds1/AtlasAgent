const MAX_LEN = 2000;
const SAFE_MARGIN = 50;

function assertLen(label, text) {
  const limit = MAX_LEN - SAFE_MARGIN;
  if (text.length > limit) {
    throw new Error(`[${label}] 메시지 길이 초과: ${text.length} > ${limit}`);
  }
}

async function deployInteraction(interaction, messages, options = {}) {
  const { ephemeral = true } = options;

  if (!interaction.channel) {
    return interaction.reply({
      content: '이 명령은 서버 채널에서만 사용할 수 있습니다.',
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral });

  messages.forEach((m, i) => assertLen(`messages[${i}]`, m));

  for (const msg of messages) {
    await interaction.channel.send({
      content: msg,
      allowedMentions: { parse: [] },
    });
  }

  await interaction.editReply('전송 완료입니다.');
}

module.exports = { deployInteraction };
