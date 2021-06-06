const { getRoleFromCategory } = require("../../service");

const execute = (message) => {
  const category = message.channel.parent;
  const roleString = getRoleFromCategory(category.name);

  const courseAdminRole = message.guild.roles.cache.find(role => role.name === `${roleString} admin`);
  if (!courseAdminRole) throw new Error(`Could not get admin role for ${roleString}`);

  console.log(courseAdminRole.members);
  const adminsString = courseAdminRole.members
    .map(member => member.nickname || member.user.username)
    .join(", ");
  if (!adminsString) return message.reply("It seems as if there are no instructors for this course yet. They need to be added manually.");

  message.reply(`Here are the instructors for ${roleString}: ${adminsString}`);
};

module.exports = {
  name: "instructors",
  description: "Prints out the instructors of the course. This command is available in most channels.",
  args: false,
  joinArgs: false,
  execute,
};