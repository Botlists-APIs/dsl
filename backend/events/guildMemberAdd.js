const profiles = require("../models/profiles.js");

module.exports.run = async (client, member) => {
  if (member.guild.id === "560865387206672384") {
    if (!member.user.bot) return;
    const role = member.guild.roles.get("568873150809636885");
    if (!role) return;
    await member.roles.add(role);
  }

  if (member.guild.id === "561629999111602185") {
    if (member.user.bot) {
      const role = member.guild.roles.get("569955356164358167");
      await member.roles.add(role);
      return;
    }

    if (!member.user.bot) {
      var entry = await profiles.findOne({ id: member.user.id });
      if (!entry) entry = { mod: false, admin: false };
      var permLvl = 0;
      if (entry.mod === true) permLvl = 1;
      if (entry.admin === true) permLvl = 2;
      if (permLvl < 1) {
          await member.user.send(":x: Permission Denied to enter Discord Bot House Verification center, only staff allowed!");
          await member.kick("Permission Denied to enter.");
      }
      return;
    }
  }
};