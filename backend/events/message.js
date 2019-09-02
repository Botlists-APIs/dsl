const Discord = require("discord.js");
const prefix = "-";

module.exports.run = async (client, message) => {
  const reply = (ctx) => message.channel.send(ctx);

  if (message.author.bot) return;
  if (message.channel.type !== "text") return;
  if (message.content.indexOf("-") !== 0) return;

  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.get(command);
  if (!cmd) return;

  try {
    await message.channel.startTyping();
    await cmd.run(client, message, args, reply);
    await message.channel.stopTyping();
  } catch (e) {
    reply(`<:redTick:568885082321059865> Couldn't run the command.\nReason: \`${e}\`.`);
    await message.channel.stopTyping();
    return;
  }
};