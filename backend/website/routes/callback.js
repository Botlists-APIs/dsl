const Profiles = require("../../models/profiles");

module.exports.run = async (req, res, session) => {
    session.us = req.user;
    let userdata = await Profiles.findOne({ id: req.user.id });
    if (!userdata) {
      const usr = new Profiles({
        id: req.user.id,
        bio: "I'm a very mysterious person.",
        certifiedDev: false,
        bg: null,
        karma: 0,
        totalKarma: 0,
        mod: false,
        admin: false
      });
      await usr.save().catch(e => console.log(e));
      userdata = { id: req.user.id, bio: "I'm a very mysterious person.", certifiedDev: false, bg: null, mod: false, admin: false };
    }

    if (userdata.mod === true) req.session.permLevel = 1;
    if (userdata.admin === true) req.session.permLevel = 2;
    if (!req.session.permLevel) req.session.permLevel = 0;

    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
};