const website = require("../website/index.js");

module.exports.run = (client) => {
    console.log("List starting...");
    client.emit("updatePresence");
    website.start(client);
};