const fs = require("fs");
const { Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes } = require("discord-api-types/v9");
const clientId = process.env.BOT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.BOT_TOKEN;
const { findCoursesFromDb } = require("./service");

const getCourseChoices = async (showPrivate, Course) => {
  showPrivate = showPrivate ? undefined : false;
  const courseData = await findCoursesFromDb("name", Course, showPrivate);
  const choices = courseData
    .map((c) => {
      const regExp = /[^0-9]*/;
      const fullname = c.fullName.charAt(0).toUpperCase() + c.fullName.slice(1);
      const matches = regExp.exec(c.code)?.[0];
      const code = matches ? matches.toUpperCase() + c.code.slice(matches.length) : c.code;
      return (
        {
          name: `${code} - ${fullname} - ${c.name}`,
          value: c.name,
        }
      );
    });
  return choices;
};

const updateDynamicChoices = async (client, commandNames, Course) => {
  const all = await getCourseChoices(undefined, Course);
  const public = await getCourseChoices(false, Course);
  const loadedCommands = await client.guilds.cache.get(guildId)?.commands.fetch();
  const filteredCommands = await loadedCommands.filter((command) => commandNames.includes(command.name));
  const commands = filteredCommands.map(async (c) => {
    const obj = {
      data: new SlashCommandBuilder()
        .setName(c.name)
        .setDescription(c.description)
        .setDefaultPermission(!c.role)
        .addStringOption(option =>
          option.setName(c.options[0].name)
            .setDescription(c.options[0].description)
            .setRequired(true)),
    };
    obj.data.name === "join" ?
      public.forEach((ch) => obj.data.options[0].addChoice(ch.name, ch.value)) :
      all.forEach((ch) => obj.data.options[0].addChoice(ch.name, ch.value));
    const options = obj.data.options;
    await c.edit({
      options: options,
    })
      .catch(console.erro);
    // return obj.data.toJSON();
  });
  // await deployCommands(commands);
};

const setCommandPermissions = async (client) => {
  const loadedCommands = await client.guilds.cache.get(guildId)?.commands.fetch();
  const createCommandsWithPermission = loadedCommands.filter((command) => !command.defaultPermission);
  const fullPermissions = createCommandsWithPermission.map((command) => {
    const commandObj = client.slashCommands.get(command.name);
    const perms = [];
    commandObj.roles
      .forEach((commandRole) => {
        client.guild.roles.cache
          .filter((role) => role.name.includes(commandRole))
          .map((r) => perms.push({ id: r.id, type: "ROLE", permission: true }));
      });
    return {
      id: command.id,
      permissions: perms,
    };
  });
  await client.guilds.cache.get(guildId)?.commands.permissions.set({ fullPermissions });
  console.log("Successfully loaded all command permissions.");
};

const deployCommands = async (commands) => {
  const rest = new REST({ version: "9" }).setToken(token);

  (async () => {
    try {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log("Successfully registered application commands.");
    }
    catch (error) {
      console.error(error);
    }
  })();
};

const loadCommands = (client) => {
  const commands = [];
  client.commands = new Collection();
  const slashCommands = new Collection();
  const commandFolders = fs.readdirSync("./src/discordBot/commands/", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of commandFolders) {
    const slashCommandFiles = fs.readdirSync(`./src/discordBot/commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of slashCommandFiles) {
      const command = require(`../commands/${folder}/${file}`);
      if (command.prefix) {
        client.commands.set(command.name, command);
      }
      else {
        slashCommands.set(command.data.name, command);
        commands.push(command.data.toJSON());
      }
    }
    client.slashCommands = new Collection([...slashCommands.entries()].sort());
  }
  console.log("Successfully loaded all bot commands.");
  return commands;
};

const setUpCommands = async (client, Course) => {
  const commands = loadCommands(client);
  // await deployCommands(commands);
  await setCommandPermissions(client);
  await updateDynamicChoices(client, ["join", "leave"], Course);
};

module.exports = {
  setUpCommands,
  updateDynamicChoices,
};