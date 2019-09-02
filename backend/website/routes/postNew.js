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
        owners: req.body.owners || "aaaaaaa",
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

    const isValidBot = await validateBotForID(rb.id);
    if (isValidBot !== true) return renderTemplate(res, req, "new.ejs", { alertDanger: "Invalid Client ID provided. It is invalid or the user is not a bot.", alertSuccess: false });
    if (rb.shortDesc.length < 40) return renderTemplate(res, req, "new.ejs", { alertDanger: "Short description too short. Short descriptions must be at least 40 character long.", alertSuccess: false });
    if (rb.shortDesc.length > 140) return renderTemplate(res, req, "new.ejs", { alertDanger: "Short description too long. Short descriptions can be as long as 140 character long.", alertSuccess: false });
    if (rb.longDesc.length < 250) return renderTemplate(res, req, "new.ejs", { alertDanger: "Long description too short. Long descriptions must be at least 250 character long.", alertSuccess: false });
    if (rb.longDesc.length > 10000) return renderTemplate(res, req, "new.ejs", { alertDanger: "Long description too long. Long descriptions can be as long as 10,000 character long.", alertSuccess: false });
    if (rb.prefix.length < 1) return renderTemplate(res, req, "new.ejs", { alertDanger: "You have to specify a prefix which is at least 1 character long.", alertSuccess: false });
    if (rb.tags.length < 1) return renderTemplate(res, req, "new.ejs", { alertDanger: "You have to specify at least one tag which represents a feature of your bot.", alertSuccess: false });
    const entry = await Bots.findOne({ id: rb.id });
    if (entry) return renderTemplate(res, req, "new.ejs", { alertDanger: "This bot is already listed or on approving queue.", alertSuccess: false });
    const self = await client.users.fetch(rb.id);

    const newBot = new Bots({
        id: rb.id,
        name: self.username,
        mainOwner: req.user.id,
        owners: rb.otherOwners,
        library: rb.lib,
        upvotes: 0,
        totalVotes: 0,
        website: rb.web,
        votes: [],
        rates: [],
        github: rb.repo,
        shortDesc: rb.shortDesc,
        longDesc: rb.longDesc,
        server: rb.support,
        prefix: rb.prefix,
        verified: false,
        trusted: false,
        certified: false,
        vanityUrl: null,
        invite: rb.invite,
        featured: false,
        tags: rb.tags,
        token: null,
        shardID: null,
        serverCount: null,
        shardCount: null,
        approved: false,
        createdAt: Date.now()
    });
    await newBot.save().catch(e => console.log(e));

    const embed = new Discord.MessageEmbed()
        .setTitle("New Bot Added")
        .setDescription(`**Bot**: ${self.tag} (ID: ${rb.id})\n**Owner**: ${req.user.username}#${req.user.discriminator} (ID: ${req.user.id})\n**Prefix**: \`${rb.prefix}\`\n**Sort Desc**: ${rb.shortDesc}\n**Tags**: ${rb.tags.join(", ")}\n**Library**: ${rb.lib}\n**Website**: ${rb.web.length < 1 ? "No Website" : rb.web}\n**Repository**: ${rb.repo.length < 1 ? "No GitHub" : rb.repo}\n**Support Server**: ${rb.support}\n**Other Owners**: ${rb.owners.split(", ")[0] !== "" ? rb.owners.split(", ").join(", ") : "No Other Owners"}\n**Invite**: ${rb.invite.indexOf("https://discordapp.com/api/oauth2/authorize") !== 0 ? `https://discordapp.com/api/oauth2/authorize?client_id=${rb.id}&permissions=0&scope=bot` : `${rb.invite}`}\n**URL**: https://discordhouse.org/bot/${rb.id}`)
        .setColor("#008081");
    client.channels.get("561622527919783938").send(embed);

    renderTemplate(res, req, "new.ejs", { alertDanger: false, alertSuccess: "Bot has been queued, a moderator will verify the bot, it usually takes 0-12 hours." });
};
