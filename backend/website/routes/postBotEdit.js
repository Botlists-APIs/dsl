const Bots = require("../../models/bots.js");
const Discord = require("discord.js");

module.exports.run = async (req, res, renderTemplate, validateBotForID, client) => {
    const rb = {
        id: req.body.client_id || "smh",
        lib: req.body.library || "invalidLibrary",
        shortDesc: req.body.short_description || "",
        longDesc: req.body.long_description || "",
        prefix: req.body.prefix || "",
        t1: req.body.tag_1 || "",
        t2: req.body.tag_2 || "",
        t3: req.body.tag_3 || "",
        tags: [],
        owners: req.body.owners || "",
        otherOwners: [],
        invite: req.body.bot_invite || "",
        support: req.body.bot_support || "",
        repo: req.body.bot_repo || "",
        web: req.body.bot_web || "",
        vNotes: req.body.verification_notes || ""
    };

    if (rb.t1.length > 2) rb.tags.push(rb.t1);
    if (rb.t2.length > 2) rb.tags.push(rb.t2);
    if (rb.t3.length > 2) rb.tags.push(rb.t3);
    rb.otherOwners = rb.owners.split(", ");
    const search = req.params.term;
    const try1 = await Bots.findOne({ id: search });
    if (try1) displayBot = try1;
    if (!try1) {
        displayBot = await Bots.findOne({ vanityUrl: search });
    }

    if (!displayBot) return res.redirect("/");
    const isValidBot = await validateBotForID(displayBot.id);
    if (isValidBot !== true) return renderTemplate(res, req, "bot/edit.ejs", { alertDanger: "Invalid Client ID provided. It is invalid or the user is not a bot.", alertSuccess: false, displayBot });
    if (rb.shortDesc.length < 40) return renderTemplate(res, req, "bot/edit.ejs", { alertDanger: "Short description too short. Short descriptions must be at least 40 character long.", alertSuccess: false, displayBot });
    if (rb.shortDesc.length > 140) return renderTemplate(res, req, "bot/edit.ejs", { alertDanger: "Short description too long. Short descriptions can be as long as 140 character long.", alertSuccess: false, displayBot });
    if (rb.longDesc.length < 250) return renderTemplate(res, req, "bot/edit.ejs", { alertDanger: "Long description too short. Long descriptions must be at least 250 character long.", alertSuccess: false, displayBot });
    if (rb.longDesc.length > 10000) return renderTemplate(res, req, "bot/edit.ejs", { alertDanger: "Long description too long. Long descriptions can be as long as 10,000 character long.", alertSuccess: false, displayBot });
    if (rb.prefix.length < 1) return renderTemplate(res, req, "bot/edit.ejs", { alertDanger: "You have to specify a prefix which is at least 1 character long.", alertSuccess: false, displayBot });
    if (rb.tags.length < 1) return renderTemplate(res, req, "bot/edit.ejs", { alertDanger: "You have to specify at least one tag which represents a feature of your bot.", alertSuccess: false, displayBot });
    const self = await client.users.fetch(displayBot.id);

    Bots.findOne({
      id: displayBot.id
    }, async (err, ress) => {
      if (!ress) return res.redirect("/");

      ress.name = self.username;
      ress.owners = rb.otherOwners;
      ress.library = rb.lib;
      ress.webite = rb.web;
      ress.github = rb.repo;
      ress.shortDesc = rb.shortDesc;
      ress.longDesc = rb.longDesc;
      ress.server = rb.support;
      ress.prefix = rb.prefix;
      ress.invite = rb.invite;
      ress.tags = rb.tags;
      await ress.save();
    });

    client.channels.get("561622522798407740").send(`<@${req.user.id}> updated <@${displayBot.id}>.`);

    renderTemplate(res, req, "bot/edit.ejs", { alertDanger: false, alertSuccess: "Bot has been edited.", displayBot });
};
