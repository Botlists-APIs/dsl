module.exports.run = (req, res) => {
  req.session.destroy(() => {
    req.logout();
    res.redirect("/");
  });
};