const fetch = require("node-fetch");

const version = "9";
const guildId = process.env.GUILD_ID;
const DISCORD_API = `https://discord.com/api/v${version}/guilds/${guildId}`;

const authorization_type = "Bot";
const authorization_token = process.env.BOT_TOKEN;

const getChannels = async () => {
  const response = await fetch(`${DISCORD_API}/channels`, {
    method: "GET",
    headers: {
      Authorization: `${authorization_type} ${authorization_token}`,
    },
  });
  return response.json();
};

module.exports = {
  getChannels,
};