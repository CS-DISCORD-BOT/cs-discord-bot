const {
  createDiscordUser,
  validDiscordChannel,
  sendMessageToDiscord,
  sendMessageToTelegram } = require("../../bridge/service");

const execute = async (ctx, message, telegramClient, Course) => {
  const id = ctx.message.chat.id;
  const group = await Course.findOne({ where: { telegramId: String(id) } });

  if (ctx.message.text.startsWith("/bridge")) {
    const discordCourseName = ctx.message.text.slice(7).toLowerCase().trim();
    const telegramCourseName = (await ctx.getChat()).title;
    const channel = await validDiscordChannel(discordCourseName);
    if (!channel) {
      return await sendMessageToTelegram(id,
        `Bridge not created: Invalid discord channel ${discordCourseName}`);
    }
    if (group) {
      return await sendMessageToTelegram(id,
        `Bridge not created: the bridge already exists ${telegramCourseName} <--> ${group.name}`);
    }
    await channel.createWebhook(discordCourseName, { avatar: "https://cdn.discordapp.com/embed/avatars/1.png" }).catch(console.error);
    // await createNewGroup([discordCourseName, id], Groups).catch((error) => console.log(error));
    const databaseValue = await Course.findOne({ where: { name: discordCourseName } }).catch((error) => console.log(error));
    if (databaseValue.telegramId) {
      return await sendMessageToTelegram(id,
        `Bridge not created: this course ${group.name} has bridge already`);
    }
    databaseValue.telegramId = String(id);
    await databaseValue.save();

    const discordUser = await createDiscordUser(ctx);
    const msg = { user: discordUser, content: { text: `Bridge created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}` } };
    await sendMessageToDiscord(msg, channel);
    await sendMessageToTelegram(id, `Bridge created: Discord course ${discordCourseName} <--> Telegram course ${telegramCourseName}`);
  }

  if (!group) return;

  const courseName = group.name;

  if (String(ctx.message.chat.id) === group.telegramId) {
    const discordUser = await createDiscordUser(ctx);
    const msg = { user: discordUser, content: { text: ctx.message.text } };

    const ents = ctx.message.entities ? [ ...ctx.message.entities ] : undefined;
    if (ents) {
      ents.sort((a, b) => b.offset - a.offset);

      let formattedMessage = msg.content.text;
      ents.forEach(ent => {
        const start = formattedMessage.substring(0, ent.offset);
        const mid = formattedMessage.substr(ent.offset, ent.length);
        const end = formattedMessage.substring(ent.offset + ent.length);
        if (ent.type === "code") {
          formattedMessage = `${start}\`${mid}\`${end}`;
        }
        else if (ent.type === "pre") {
          formattedMessage = `${start}\`\`\`\n${mid}\`\`\`${end}`;
        }
      });
      msg.content.text = formattedMessage;
    }

    const channel = await validDiscordChannel(courseName);
    if (!channel) return;
    await sendMessageToDiscord(msg, channel);
  }
};

module.exports = {
  name: "text",
  execute,
};
