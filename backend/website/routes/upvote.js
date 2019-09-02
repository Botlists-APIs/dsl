const bots = require("../../models/bots.js");
const md = require("markdown");
const Profiles = require("../../models/profiles.js");

const msToHMS = (ms) => {
  var seconds = ms / 1000;
  var hours = parseInt(seconds / 3600);
  seconds = seconds % 3600;
  var minutes = parseInt(seconds / 60);
  seconds = seconds % 60;
  return `${hours} hours, ${minutes} minutes and ${Math.round(seconds)} seconds`;
}

module.exports.run = async (req, res, renderTemplate, client) => {
    const search = req.params.term;
    var displayBot;
    const try1 = await bots.findOne({ approved: true, id: search });
    if (try1) displayBot = try1;
    if (!try1) {
        displayBot = await bots.findOne({ approved: true, vanityUrl: search });
    }

    if (!displayBot) return res.redirect("/");

    bots.findOne({ id: displayBot.id }, async (err, Bot) => {
      var user = await Profiles.findOne({ id: Bot.mainOwner });
      const uVoteIndex = Bot.votes.findIndex(u => u.id === req.user.id);
      if (uVoteIndex > -1) {
        if (Date.now() - Bot.votes[uVoteIndex].timestamp < 43200000) return renderTemplate(res, req, "bot/page.ejs", { displayBot, alertSuccess: null, alertDanger: `You have aleady voted for this bot. Try again in ${msToHMS(43200000 - (Date.now() - Bot.votes[uVoteIndex].timestamp))}.`, md });
        Bot.votes.splice(uVoteIndex, 1);
      }

      const voteObj = {
        timestamp: Date.now(),
        id: req.user.id
      };
      displayBot.upvotes + 1;
      Bot.upvotes = Bot.upvotes + 1;
      Bot.totalVotes = Bot.totalVotes + 1;
      user.karma = user.karma + 1;
      user.totalKarma = user.totalKarma +1;
      Bot.votes.push(voteObj);
      await Bot.save().catch(e => console.log(e));
      await user.save().catch(e => console.log(e));
      renderTemplate(res, req, "bot/page.ejs", { displayBot, alertSuccess: "Your vote has been counted.", alertDanger: null, md });
    });
};
