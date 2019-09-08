const { Client, Collection } = require("discord.js");
const client = new Client();
const fs = require("fs");
const mongoose = require("mongoose");
const bots = require("./models/bots.js");
var eventsLoaded = 0;
var commandsLoaded = 0;
client.config = require("./config.js");
client.commands = new Collection();

mongoose.connect(client.config.dbUrl, { useNewUrlParser: true });

fs.readdir("./events/", (err, files) => {
	if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    eventsLoaded += 1;
    let eventName = file.split(".")[0];
    client.on(eventName, (...args) => eventFunction.run(client, ...args));
  });
});

fs.readdir("./commands/", (err, files) => {
	if(err) console.log(err);
	let jsfile = files.filter(f => f.split(".").pop() === "js")
	if(jsfile.length <= 0){
		console.log("No commands were found!");
		return;
	}

	jsfile.forEach((f, i) => {
		let props = require(`./commands/${f}`);
		commandsLoaded += 1;
		client.commands.set(props.help.name, props);
	});
});

console.log(`Loaded ${eventsLoaded} events.`);
console.log(`Loaded ${commandsLoaded} commands.`);

client.on("updatePresence", async () => {
	const totalBots = await bots.countDocuments({ approved: true });
  await client.user.setActivity(`${totalBots} Bots`, { type: "WATCHING" });
});

client.login(client.config.token);
