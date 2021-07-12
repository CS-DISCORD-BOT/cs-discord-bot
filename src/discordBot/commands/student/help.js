const prefix = process.env.PREFIX;

const execute = (message, args) => {
  const user = message.member;
  const data = [];
  const commandsReadyToPrint = message.client.commands
    .filter(command => {
      if (!command.role) return true;
      return user.roles.cache.find(role => role.name === command.role);
    });

  if (!args.length) {
    data.push("Here's a list of all my commands:");
    data.push(commandsReadyToPrint.map(command => `${prefix}${command.name} - ${command.description}`).join("\n"));
    data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
    return message.channel.send(data, { split: true });
  }

  const name = args[0].toLowerCase();
  const command = commandsReadyToPrint.get(name);

  if (!command) {
    return message.reply("that's not a valid command!");
  }

  data.push(`**Name:** ${command.name}`);

  if (command.description) data.push(`**Description:** ${command.description}`);
  if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

  message.channel.send(data, { split: true });
};

module.exports = {
  name: "help",
  description: "List all of my commands or info about a specific command.",
  usage: "[command name]",
  args: false,
  joinArgs: false,
  execute,
};