const bots = require("../../models/bots.js");
const md = require("markdown");

module.exports.run = async (req, res, renderTemplate, client) => {
    const search = req.params.term;
    var displayBot;
    const try1 = await bots.findOne({ approved: true, id: search });
    if (try1) displayBot = try1;
    if (!try1) {
        displayBot = await bots.findOne({ approved: true, vanityUrl: search });
    }

    if (!displayBot) return res.redirect("/");

    renderTemplate(res, req, "bot/page.ejs", { displayBot, md, alertDanger: null, alertSuccess: null });
};
