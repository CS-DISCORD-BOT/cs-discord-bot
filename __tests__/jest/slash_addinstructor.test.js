const { execute } = require("../../src/discordBot/commands/instructor/addinstructor");
const { sendErrorEphemeral, sendEphemeral } = require("../../src/discordBot/services/message");
const { isACourseCategory, trimCourseName } = require("../../src/discordBot/services/service");
const { courseAdminRole } = require("../../config.json");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

isACourseCategory.mockImplementation(() => true);
trimCourseName.mockImplementation(() => "test");

const { defaultTeacherInteraction, defaultStudentInteraction, defaultAdminInteraction } = require("../mocks/mockInteraction");
defaultAdminInteraction.options = { getUser: jest.fn(() => { return { id: 3 }; }) };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash add instructor command", () => {
  test("if no permission to use the command reponds with correct ephemeral", async () => {
    const client = defaultStudentInteraction.client;
    const response = "You don't have the permission to use this command!";
    await execute(defaultStudentInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("command must be used in course channel", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Command must be used in a course channel!";
    await execute(defaultTeacherInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("instructor role can be given", async () => {
    const roleString = "test";
    const client = defaultAdminInteraction.client;
    const response = `Gave role '${roleString} ${courseAdminRole}' to admin.`;
    const admin = client.guild.members.cache.get(3);
    client.guild.roles.create({ name: `${roleString} ${courseAdminRole}`, members: [] });
    await execute(defaultAdminInteraction, client);
    expect(admin.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, response);
  });
});