/* eslint-disable no-var */
const { MessageEmbed } = require("discord.js");
const { sendEphemeral } = require("../utils");

const execute = async (interaction, client) => {

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  const pollTitle = interaction.data.options[0].value.trim();

  // If multiple choice poll
  if (interaction.data.options[1]) {

    const answers = interaction.data.options[1].value.split("," || ", ");
    const numbers = [ "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🟥", "🟧", "🟩", "🟦", "🟫"];

    let answerOptions = "";


    // Inizialize answer options text
    for (var i = 0, len = answers.length; i < len; i++) {
      answerOptions = answerOptions.concat(numbers[i] + " = " + answers[i] + "\n\n");
    }

    const exampleEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(pollTitle)
      .setDescription(answerOptions);

    // eslint-disable-next-line prefer-const
    let msgEmbed = await channel.send(exampleEmbed);

    // eslint-disable-next-line no-redeclare
    for (var i = 0, len = answers.length; i < len; i++) {
      msgEmbed.react(numbers[i]);

    }

    sendEphemeral(client, interaction, "Poll ready");

    // If yes/no poll
  }
  else {
    const exampleEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(pollTitle);

    // eslint-disable-next-line prefer-const
    let msgEmbed = await channel.send(exampleEmbed);

    await msgEmbed.react("👍");
    await msgEmbed.react("👎");

    sendEphemeral(client, interaction, "Poll ready");
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
