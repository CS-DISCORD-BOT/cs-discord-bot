/* eslint-disable no-var */
const { MessageEmbed } = require("discord.js");
const { sendEphemeral } = require("../utils");

const execute = async (interaction, client) => {

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  const pollTitle = interaction.data.options[0].value.trim();

  // If optional parameters come in different order, switch order
  if (interaction.data.options[1] && interaction.data.options[1].name.includes("duration")) {
    const temp = interaction.data.options[1];
    interaction.data.options[1] = interaction.data.options[2];
    interaction.data.options[2] = temp;
  }

  // If multiple choice poll
  if (interaction.data.options[1]) {

    const answers = interaction.data.options[1].value.split("," || ", ");
    const numbers = [ "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "🟥", "🟧", "🟩", "🟦", "🟫"];

    let answerOptions = "";


    // Inizialize answer options text
    for (var i = 0, len = answers.length; i < len; i++) {
      answerOptions = answerOptions.concat(numbers[i] + " = " + answers[i] + "\n\n");
    }

    const pollEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(pollTitle)
      .setDescription(answerOptions);

    // eslint-disable-next-line prefer-const
    let msgEmbed = await channel.send(pollEmbed);

    // eslint-disable-next-line no-redeclare
    for (var i = 0, len = answers.length; i < len; i++) {
      msgEmbed.react(numbers[i]);

    }

    sendEphemeral(client, interaction, "Poll ready");

    // if duration parameter exists
    if (interaction.data.options[2]) {
      const time = interaction.data.options[2].value * 60000;
      await sleep(time);
    }
    else {
      await sleep(90000);
    }

    const reactions = msgEmbed.reactions.cache;

    let resultsText = "";

    // Inizialize result options text
    // eslint-disable-next-line no-redeclare
    for (var i = 0, len = answers.length; i < len; i++) {
      resultsText = resultsText.concat("Number of " + numbers[i] + " = " + reactions.get(numbers[i]).count) + "\n\n";
    }

    const resultEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Results of the poll")
      .setDescription(resultsText);

    await channel.send(resultEmbed);

    // If yes/no poll
  }
  else {
    const pollEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(pollTitle);

    // eslint-disable-next-line prefer-const
    let msgEmbed = await channel.send(pollEmbed);

    await msgEmbed.react("👍");
    await msgEmbed.react("👎");

    sendEphemeral(client, interaction, "Poll ready");

    if (interaction.data.options[2]) {
      const time = interaction.data.options[2].value * 60000;
      await sleep(time);
    }
    else {
      await sleep(60000);
    }

    const reactions = msgEmbed.reactions.cache;

    const resultsText = "Number of 👍 = " + reactions.get("👍").count + "\n\nNumber of 👎 = " + reactions.get("👎").count;

    const resultEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Results of the poll")
      .setDescription(resultsText);

    await channel.send(resultEmbed);

    //setTimeout(() => {
    //  const reactions = msgEmbed.reactions.cache;
    // console.log(reactions.get("👍").count);
    //}, 7500);


  }
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = {
  name: "poll",
  description: "Create a poll",
  usage: "[poll title, <possible answers>]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "faculty",
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
    {
      name: "duration",
      description: "Duration of the poll (in minutes)",
      type: 4,
      required: false,
    },
  ],
  execute,
};
