const { getRoleFromCategory } = require("../../services/service");
const { sendEphemeral } = require("../utils");

const findOrCreateChannel = async (channelObject, guild) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name === name);
  if (alreadyExists) return alreadyExists;
  return await guild.channels.create(name, options);
};

const getChannelObjects = (guild, admin, student, roleName, channelName, category) => {
  roleName = roleName.replace(/ /g, "-");
  return [
    {
      name: `${roleName}_${channelName}`,
      parent: category,
      options: { type: "text", parent: category, permissionOverwrites: [] },
    },
  ];
};

const execute = async (interaction, client) => {

  const channelName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  if (!channel.parent) {
    return sendEphemeral(client, interaction, "Course not found, can´t create new channel");
  }

  if (guild.channels.cache.filter(c => c.parent === channel.parent).size >= 10) {
    return sendEphemeral(client, interaction, "Maximum text channel amount is 10");
  }
  else {
    const categoryName = channel.parent.name;
    const category = channel.parent;

    const courseName = getRoleFromCategory(categoryName);

    // Roles
    const student = await guild.roles.cache.find((role) => role.name === courseName);
    const admin = await guild.roles.cache.find((role) => role.name === `${courseName} admin`);

    // Channels
    const channelObjects = getChannelObjects(guild, admin, student, courseName, channelName, category);
    await Promise.all(channelObjects.map(
      async channelObject => await findOrCreateChannel(channelObject, guild),
    ));
    sendEphemeral(client, interaction, `Created new channel ${courseName}_${channelName}`);
  }
};

module.exports = {
  name: "newchannel",
  description: "Create new text channel to course.",
  usage: "[channel name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  options: [
    {
      name: "channel",
      description: "Create new text channel",
      type: 3,
      required: true,
    },
  ],
  execute,
};