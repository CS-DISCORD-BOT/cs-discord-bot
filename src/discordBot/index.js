require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");
const { Course } = require("../db/dbInit");

const token = process.env.BOT_TOKEN;
const client = new Discord.Client();

const eventFiles = fs.readdirSync("./src/discordBot/events").filter(file => file.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.ws) {
    client.ws.on(event.name, async (interaction) => {
      event.execute(interaction, client, Course);
    });
  }
  else if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client, Course));
  }
  else {
    client.on(event.name, (...args) => event.execute(...args, client, Course));
  }
}

const startDiscordBot = async () => {
  await client.login(token);
  console.log("Discord bot logged in");
};

module.exports = {
  client,
  startDiscordBot,
};
