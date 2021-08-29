const { execute } = require("../../src/discordBot/commands/admin/sortCourses");

const { messageInCommandsChannel, student } = require("../mocks/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix reload command", () => {
  test("user with administrator role can reload commands", async () => {
    const client = messageInCommandsChannel.client;
    const channelA = { name: "📚 a", type: "GUILD_CATEGORY", edit: jest.fn(), position: 2 };
    const channelB = { name: "📚 b", type: "GUILD_CATEGORY", edit: jest.fn(), position: 1 };
    client.guild.channels.cache.set(1, channelB);
    client.guild.channels.cache.set(2, channelA);
    await execute(messageInCommandsChannel);
    expect(channelA.edit).toHaveBeenCalledTimes(1);
    expect(channelB.edit).toHaveBeenCalledTimes(1);
    client.guild.channels.init();
  });

  test("user without administrator role cannot reload commands", async () => {
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    const channelA = { name: "📚 a", type: "GUILD_CATEGORY", edit: jest.fn(), position: 2 };
    const channelB = { name: "📚 b", type: "GUILD_CATEGORY", edit: jest.fn(), position: 1 };
    client.guild.channels.cache.set(1, channelB);
    client.guild.channels.cache.set(2, channelA);
    await execute(messageInCommandsChannel);
    expect(channelA.edit).toHaveBeenCalledTimes(0);
    expect(channelB.edit).toHaveBeenCalledTimes(0);
    client.guild.channels.init();
  });
});