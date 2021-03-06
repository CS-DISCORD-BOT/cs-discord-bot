const fs = require("fs");
const { Client } = require("discord-slash-commands-client");
const { Collection } = require("discord.js");
const { facultyRole, courseAdminRole } = require("../../../config.json");
const { findCoursesFromDb } = require("../services/service");
require("dotenv").config();

const slashClient = new Client(
  process.env.BOT_TOKEN,
  process.env.BOT_ID,
);

const sendEphemeral = (client, interaction, content) => {
  try {
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          content,
          // make the response ephemeral
          flags: 64,
        },
      },
    });
  }
  catch (error) {
    console.log("Ephemeral message token expired");
  }
};

const sendEphemeralembed = (client, interaction, embeds) => {
  try {
    client.api.interactions(interaction.id, interaction.token).callback.post({
      data: {
        type: 4,
        data: {
          embeds: embeds,
          // make the response ephemeral
          flags: 64,
        },
      },
    });
  }
  catch (error) {
    console.log("Ephemeral message token expired");
  }
};

const findInstructorRoles = (client) => {
  const instructorRoles = client.guild.roles.cache.filter(r => r.name.includes(courseAdminRole));
  const roleNames = instructorRoles.map(r => r.name);
  return roleNames;
};

const createCommandRolePermissions = (client, highestRole) => {
  const allRoles = [];
  switch (highestRole) {
    case "admin":
      allRoles.push("admin");
      break;
    case facultyRole:
      allRoles.push("admin", facultyRole);
      break;
    case courseAdminRole:
      allRoles.push("admin", facultyRole);
      allRoles.push(...findInstructorRoles(client));
      break;
    default:
      break;
  }
  const permissions = [];

  allRoles.forEach(role => {
    const roleID = client.guild.roles.cache.find(r => r.name === role).id;
    permissions.push(
      {
        id: roleID,
        type: 1,
        permission: true,
      },
    );
  });

  return permissions;
};

const createSlashCommand = async (client, command, Course) => {
  if (command.name === "join") command.options[0].choices = await getCourseChoices(false, Course);
  if (command.name === "leave") command.options[0].choices = await getCourseChoices(true, Course);
  try {
    const createdCommand = await slashClient
      .createCommand({
        name: command.name,
        description: command.description,
        guildId: process.env.GUILD_ID,
        // disable the command for everyone if there's a role defined
        default_permission: !command.role,
        options: command.options,
      }, process.env.GUILD_ID,
      );
    if (command.role) {
      const permissions = createCommandRolePermissions(client, command.role);
      slashClient.editCommandPermissions(permissions, client.guild.id, createdCommand.id);
    }
  }
  catch (error) {
    console.log(error);
  }
  console.log(`Created command ${command.name}`);
};

const loadCommands = (client) => {
  client.commands = new Collection();
  const slashCommands = new Collection();
  const commandFolders = fs.readdirSync("./src/discordBot/commands/", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  for (const folder of commandFolders) {
    const slashCommandFiles = fs.readdirSync(`./src/discordBot/commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of slashCommandFiles) {
      const command = require(`./${folder}/${file}`);
      if (command.devOnly && process.env.NODE_ENV !== "development") continue;
      if (command.prefix) {
        client.commands.set(command.name, command);
      }
      else {
        slashCommands.set(
          command.name,
          {
            command: command,
            file: `./${folder}/${file}`,
          },
        );
      }

    }
  }

  const alphabetisedCommands = new Collection([...slashCommands.entries()].sort());
  client.slashCommands = alphabetisedCommands;
  return alphabetisedCommands;
};

const reloadCommands = async (client, commandNames, Course) => {
  commandNames.map(async (commandName) => {
    try {
      const { file } = client.slashCommands.get(commandName);
      delete require.cache[require.resolve(file)];
      const reloadedCommand = require(file);
      client.slashCommands.set(
        commandName,
        {
          command: reloadedCommand,
          file,
        },
      );
      await createSlashCommand(client, reloadedCommand, Course);
    }
    catch (error) {
      console.log(`Unknown slash command${commandName}`);
    }
  });
};

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

const initCommands = async (client, Course) => {
  if (process.env.NODE_ENV === "test") return;

  const slashCommands = loadCommands(client);

  for (const slashCommand of slashCommands.values()) {
    await createSlashCommand(client, slashCommand.command, Course);
    // reduce spam to discord api
    await new Promise(resolve => setTimeout(resolve, 4000));
  }
};

module.exports = {
  sendEphemeral,
  initCommands,
  reloadCommands,
  sendEphemeralembed,
  getCourseChoices,
};
