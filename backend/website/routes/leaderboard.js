const profiles = require("../../models/profiles.js");

module.exports.run = async (req, res, renderTemplate, client) => {
    var users = await profiles.find().sort([["karma", "descending"]]);
    users = users.filter(u => u.totalKarma > 0);

    renderTemplate(res, req, "leaderboard.ejs", { users });

};