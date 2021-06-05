const { commandsCategory } = require("../config.json");

const { findOrCreateRoleWithName } = require("./service");

const findOrCreateChannel = (guild, channelObject) => {
  const { name, options } = channelObject;
  const alreadyExists = guild.channels.cache.find(
    (c) => c.type === options.type && c.name === name,
  );
  if (alreadyExists) return alreadyExists;
  return guild.channels.create(name, options);
};

const initChannels = async (guild, categoryName) => {
  const adminRole = await findOrCreateRoleWithName("admin", guild);
  const category = await guild.channels.cache.find(c => c.type === "category" && c.name === categoryName) ||
  await guild.channels.create(
    categoryName,
    {
      type: "category",
    });

  const channels = [
    {
      name: "commands",
      options: {
        parent: category,
        type: "text",
      },
    },
    {
      name: "guide",
      options: {
        parent: category,
        type: "text",
        topic: " ",
        permissionOverwrites: [{ id: guild.id, deny: ["SEND_MESSAGES"], "allow": ["VIEW_CHANNEL"] }, { id: adminRole.id, allow: ["SEND_MESSAGES", "VIEW_CHANNEL"] } ],
      },
    },
  ];
  await channels.reduce(async (promise, channel) => {
    await promise;
    await findOrCreateChannel(guild, channel);
  }, Promise.resolve());
};

const initRoles = async (guild) => {
  await findOrCreateRoleWithName("teacher", guild);
  await findOrCreateRoleWithName("student", guild);
};

const setInitialGuideMessage = async (guild, channelName) => {
  const guideChannel = guild.channels.cache.find(c => c.type === "text" && c.name === channelName);
  if(!guideChannel.lastPinTimestamp) {
    const msg = await guideChannel.send("initial");
    await msg.pin();
  }
};

const initializeApplicationContext = async (client) => {
  await initChannels(client.guild, commandsCategory);
  await setInitialGuideMessage(client.guild, "guide");
  await initRoles(client.guild);
};

module.exports = {
  initializeApplicationContext,
};