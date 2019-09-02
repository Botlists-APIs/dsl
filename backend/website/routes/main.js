const Bots = require("../../models/bots.js");

module.exports.run = async (req, res, renderTemplate) => {
  var topBots = await Bots.find({ approved: true }).sort([["upvotes", "descending"]]);
  topBots = topBots.splice(0, 3);

  var newBots = await Bots.find({ approved: true }).sort({ "_id": -1 });
  newBots = newBots.splice(0, 3);
  
  var featuredBots = await Bots.find({ featured: true });
  featuredBots = featuredBots.splice(0, 3);

  renderTemplate(res, req, "index.ejs", { topBots, newBots, featuredBots });
};