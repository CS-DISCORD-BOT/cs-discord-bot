const { updateGuide, createCategoryName, findChannelWithNameAndType, msToMinutesAndSeconds, handleCooldown  } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const Discord = require("discord.js");

const execute = async (interaction, client, Groups) => {
    
    // return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is private already.`);

    // const channel = client.channels.cache.find(c => c.name === "general" && c.type === "text");

    const guild = client.guild;
    const channel = guild.channels.cache.get(interaction.channel_id);

    // const guild = client.guild;
    // const channel = guild.channels.cache.get(interaction.channel_id).parent;

    const pollTitle = interaction.data.options[0].value.trim();

    // If multiple choice poll
    if (interaction.data.options[1]) {

        const answers = interaction.data.options[1].value.split(',' || ', ');
        const numbers = [ '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🟥', '🟧', '🟩', '🟦', '🟫'];

        let answerOptions = '';


        // Inizialize answer options text
        for (var i = 0, len = answers.length; i < len; i++) {
            answerOptions = answerOptions.concat(numbers[i] + ' = ' + answers[i] + '\n\n');
        }

        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(pollTitle)
            .setDescription(answerOptions);

        let msgEmbed = await channel.send(exampleEmbed);

        for (var i = 0, len = answers.length; i < len; i++) {
            await msgEmbed.react(numbers[i]);
        }

    //If yes/no poll
    } else {
        const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(pollTitle)

        let msgEmbed = await channel.send(exampleEmbed);

        await msgEmbed.react('👍')
        await msgEmbed.react('👎')
    }
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
            name: "title",
            description: "Set the title of the poll",
            type: 3,
            required: true,
        },
        {
            name: "answers",
            description: "Possible answers",
            type: 3,
            required: false,
        },
    ],
    execute,
};
