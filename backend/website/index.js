const url = require("url");
const path = require("path");
const Discord = require("discord.js");
const express = require("express");
const app = express();
const moment = require("moment");
require("moment-duration-format");
const passport = require("passport");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const Strategy = require("passport-discord").Strategy;
const helmet = require("helmet");
const md = require("marked");
const validUrl = require("valid-url");
const Profiles = require("../models/profiles");
const Bots = require("../models/bots");
const config = require("../config");
const mongoose = require("mongoose");

module.exports.start = (client) => {
  mongoose.connect(client.config.dbUrl, { useNewUrlParser: true });
  const dataDir = path.resolve(`${process.cwd()}${path.sep}website`);
  const templateDir = path.resolve(`${dataDir}${path.sep}templates`);
  app.use("/assets", express.static(path.resolve(`${dataDir}${path.sep}assets`)));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  const validateBotForID = async (id) => {
    try {
      const bot = await client.users.fetch(id);
      if (bot.bot) {
        return true
      } else {
        return false;
      };
    } catch (e) {
      return false;
    }
  };

  const getClientIp = (req) => {
    var ipAddress = req.connection.remoteAddress;
    if (!ipAddress) {
      return '';
    }

    if (ipAddress.substr(0, 7) == "::ffff:") {
      ipAddress = ipAddress.substr(7)
    }

    return ipAddress;
  };

  const msToHMS = (ms) => {
    var seconds = ms / 1000;
    var hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;
    var minutes = parseInt(seconds / 60);
    seconds = seconds % 60;
    return `${hours} hours, ${minutes} minutes and ${Math.round(seconds)} seconds`;
  }

  const dataType = (x) => {
    if (typeof x === "number") {
      if (Math.round(x) === x && x.toString().indexOf('.') < -1) {
        return "integer";
      }
      return "float";
    }
  }

  const paginate = (arr, pageSize, selectedPage) => {
    --selectedPage;
    const output = arr.slice(selectedPage * pageSize, (selectedPage + 1) * pageSize);
    return output;
  }

  const fetchInviteURL = async (invite) => {
    try {
      const inv = await client.fetchInvite(invite);
      return { valid: true, temporary: false };
    } catch (e) {
      return { valid: false, temporary: null };
    }
  };

  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };

  passport.use(new Strategy({
    clientID: client.user.id,
    clientSecret: client.config.dashboard.oauthSecret,
    callbackURL: client.config.dashboard.callbackURL,
    scope: ["identify"]
  },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }))

  app.use((req, res, next) => {
    client.channels.get("572380571074953217").send(`[WEBSITE]: New request is being served.`);
    next();
  });

  app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret: client.config.dashboard.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  app.locals.domain = client.config.dashboard.domain;
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");
  var bodyParser = require("body-parser");
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/login");
  }

  app.get("/discord", (req, res) => res.redirect("https://discord.gg/E2Ker3E"));

  app.get("/login", (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL; // eslint-disable-line no-self-assign
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
    passport.authenticate("discord"));

  const callbackRoute = require("./routes/callback.js");
  const logoutRoute = require("./routes/logout.js");
  const mainRoute = require("./routes/main.js");
  const topRoute = require("./routes/top.js");
  const searchRoute = require("./routes/search.js");
  const newRoute = require("./routes/new.js");
  const newPostRoute = require("./routes/postNew.js");
  const leaderboardRoute = require("./routes/leaderboard.js");
  const botPageRoute = require("./routes/botPage.js");

  app.get("/callback", passport.authenticate("discord", { failureRedirect: "/forbidden" }), (req, res) => callbackRoute.run(req, res, session));
  app.get("/logout", (req, res) => logoutRoute.run(req, res));
  app.get("/", (req, res) => mainRoute.run(req, res, renderTemplate));
  app.get("/top", (req, res) => topRoute.run(req, res, renderTemplate, paginate, dataType));
  app.get("/search", (req, res) => searchRoute.run(req, res, renderTemplate, paginate, dataType));
  app.get("/new", checkAuth, (req, res) => newRoute.run(req, res, renderTemplate));
  app.post("/new", checkAuth, (req, res) => newPostRoute.run(req, res, renderTemplate, validateBotForID, client));
  app.get("/leaderboard", (req, res) => leaderboardRoute.run(req, res, renderTemplate, client));
  app.get("/bot/:term", (req, res) => botPageRoute.run(req, res, renderTemplate, client));
  
  client.site = app.listen(client.config.dashboard.port, null, null, () => console.log("List is up and running!"));
};