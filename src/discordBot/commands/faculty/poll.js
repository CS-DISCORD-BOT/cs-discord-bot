// const { Emoji } = require("discord.js");
const { updateGuide, createCategoryName, findChannelWithNameAndType, msToMinutesAndSeconds, handleCooldown } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const Discord = require("discord.js");

// const used = new Map();

const execute = async (interaction, client, Groups) => {
    // const courseName = interaction.data.options[0].value.toLowerCase().trim();
    // const guild = client.guild;
    // return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is private already.`);

    const channel = client.channels.cache.find(c => c.name === "general" && c.type === "text");
    // const channel = guild.channels.cache.get(interaction.channel_id);

    // let pollDescription = args.slice(1).join(' ');
    const pollTitle = interaction.data.options[0].value.toLowerCase().trim();

    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(pollTitle)
        
        let msgEmbed = await channel.send(exampleEmbed);

        await msgEmbed.react('👍')
        await msgEmbed.react('👎')

    // channel.send(exampleEmbed);
};

module.exports = {
    name: "poll",
    description: "Create a poll",
    usage: "[course name]",
    args: true,
    joinArgs: true,
    guide: true,
    role: "teacher",
    options: [
        {
            name: "course",
            description: "Send poll to current channel",
            type: 3,
            required: false,
        },
    ],
    execute,
};
