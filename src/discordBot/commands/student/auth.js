const { sendEphemeral } = require("../utils");
const { facultyRole } = require("../../../../config.json");

const execute = async (interaction, client) => {
  sendEphemeral(client, interaction, `${process.env.BACKEND_SERVER_URL}/authenticate_faculty`);
};

module.exports = {
  name: "auth",
  description: `Get auth URL to acquire ${facultyRole} role.`,
  usage: "/auth",
  execute,
};