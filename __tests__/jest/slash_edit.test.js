const { execute } = require("../../src/discordBot/commands/faculty/edit");
const { sendEphemeral, sendErrorEphemeral } = require("../../src/discordBot/services/message");
const {
  findCategoryName,
  msToMinutesAndSeconds,
  trimCourseName,
  findCourseFromDb } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

const time = "14:59";
msToMinutesAndSeconds.mockImplementation(() => time);
findCategoryName.mockImplementation((name) => `📚 ${name}`);
trimCourseName.mockImplementation(() => "test");
findCourseFromDb
  .mockImplementation(() => {
    return {
      code: "tkt",
      name: "test",
      save: jest.fn(),
    };
  })
  .mockImplementationOnce(() => {
    return {
      code: "test",
      name: "test",
    };
  })
  .mockImplementationOnce(() => false);


const { defaultTeacherInteraction, defaultStudentInteraction } = require("../mocks/mockInteraction");
defaultTeacherInteraction.options = { getString: jest
  .fn((option) => {
    const options = {
      options: "code",
      new_value: "test",
    };
    return options[option];
  })
  .mockImplementationOnce((option) => {
    const options = {
      options: "code",
      new_value: "test",
    };
    return options[option];
  }),
};

defaultStudentInteraction.options = { getString: jest.fn((name) => {
  const names = {
    coursecode: "test",
    full_name: "Long course name",
  };
  return names[name];
}),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash edit command", () => {
  test("if not course channel reponds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "This is not a course category, can not execute the command";
    await execute(defaultTeacherInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("if target channel name exists with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = "Course name already exists";
    await execute(defaultTeacherInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("edit with valid args reponds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = "Course information has been changed";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("edit with valid args reponds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Command cooldown [mm:ss]: you need to wait ${time}.`;
    await execute(defaultTeacherInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});