require("dotenv").config();
const { execute } = require("../../src/discordBot/events/messageCreate");
const sort = require("../../src/discordBot/commands/admin/sortCourses");
const deleteCommand = require("../../src/discordBot/commands/admin/deleteCommand");
const removeCommand = require("../../src/discordBot/commands/admin/remove");
const { messageInGuideChannel, messageInCommandsChannel, student, teacher } = require("../mocks/mockMessages");

jest.mock("../../src/discordBot/commands/admin/sortCourses");
jest.mock("../../src/discordBot/commands/admin/deleteCommand");
jest.mock("../../src/discordBot/commands/admin/remove");

const prefix = process.env.PREFIX;

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix commands", () => {
  test("commands cannot be used in guide channel", async () => {
    messageInGuideChannel.content = `${prefix}sort`;
    const client = messageInGuideChannel.client;
    await execute(messageInGuideChannel, client);
    expect(messageInGuideChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInGuideChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("invalid command in commands channel does nothing", async () => {
    messageInCommandsChannel.content = `${prefix}join test`;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("valid command in commands channel is executed", async () => {
    messageInCommandsChannel.content = `${prefix}sort`;
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(sort.execute).toHaveBeenCalledTimes(1);
  });

  test("invalid use of command sends correct message", async () => {
    messageInCommandsChannel.content = `${prefix}deletecommand`;
    const msg = `You didn't provide any arguments, ${messageInCommandsChannel.author}!`;
    const response = { content: msg, reply: { messageReference: messageInCommandsChannel.id } };
    const client = messageInCommandsChannel.client;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledWith(response);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
    expect(deleteCommand.execute).toHaveBeenCalledTimes(0);
  });

  test("if no command role do nothing", async () => {
    messageInCommandsChannel.content = `${prefix}sort`;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = student;
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
  });

  test("if command has emit parameter call client emit", async () => {
    messageInCommandsChannel.content = `${prefix}remove test`;
    const client = messageInCommandsChannel.client;
    messageInCommandsChannel.author = teacher;
    messageInCommandsChannel.member = teacher;
    await execute(messageInCommandsChannel, client);
    expect(messageInCommandsChannel.channel.send).toHaveBeenCalledTimes(0);
    expect(messageInCommandsChannel.reply).toHaveBeenCalledTimes(0);
    expect(removeCommand.execute).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.react).toHaveBeenCalledTimes(1);
    expect(messageInCommandsChannel.react).toHaveBeenCalledWith("✅");
    expect(client.emit).toHaveBeenCalledTimes(1);
  });
});