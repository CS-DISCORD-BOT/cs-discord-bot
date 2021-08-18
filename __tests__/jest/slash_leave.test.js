const { execute } = require("../../src/discordBot/commands/student/leave");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { updateGuide } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const roleString = "testing";
defaultTeacherInteraction.data.options = [{ value: roleString }];

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash leave command", () => {
  test("invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = `Invalid course name: ${roleString}`;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("if user does not have course role responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ data: { name: roleString } });
    const response = `You are not on a ${roleString} course.`;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("leave with proper course name and roles return correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    const memberRolesLengthAtStart = member.roles.cache.length;
    const response = `You have been removed from the ${roleString} course.`;
    await member.roles.add(roleString);
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.remove).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
    expect(member.roles.cache.length).toBe(memberRolesLengthAtStart);
    expect(member.fetch).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });
});