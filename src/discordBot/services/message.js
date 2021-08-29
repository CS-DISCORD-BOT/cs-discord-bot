const validateChannel = (channel) => {
  if (channel.parent) return false;
  else if (channel.name !== "commands") return false;
  else if (channel.type !== "GUILD_TEXT") return false;
  else return true;
};

const sendErrorReport = async (interaction, client, error) => {
  const commandsChannel = client.guild.channels.cache.find((c) => validateChannel(c));
  const member = client.guild.members.cache.get(interaction.member.user.id);
  const channel = client.guild.channels.cache.get(interaction.channelId);
  const msg = `**ERROR DETECTED!**\nMember: ${member.displayName}\nCommand: ${interaction.commandName}\nChannel: ${channel.name}`;
  await commandsChannel.send({ content: msg });
  await commandsChannel.send({ content: error });
};

const sendErrorEphemeral = async (interaction, msg) => {
  await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
};

const sendEphemeral = async (interaction, msg) => {
  await interaction.reply({ content: `${msg}`, ephemeral: true });
};

module.exports = {
  sendErrorReport,
  sendErrorEphemeral,
  sendEphemeral,
};