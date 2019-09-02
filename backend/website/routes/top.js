const Bots = require("../../models/bots.js");

module.exports.run = async (req, res, renderTemplate, paginate, dataType) => {
    var page = req.query.page;
    if (!page) page = 0;
    if (page && isNaN(parseInt(page))) {
        page = 0;
    } else {
        page = parseInt(page);
    }

    var bots = await Bots.find({ approved: true }).sort([["upvotes", "descending"]]);
    const totalPages = (dataType(bots.length / 9) === "float") ? (Math.floor(bots.length / 9 + 1)) : (bots.length / 9);
    bots = paginate(bots, 9, page);
    if (bots.length < 1) return res.redirect("/top?page=1");
    
    renderTemplate(res, req, "/lists/top.ejs", { bots, totalPages, page });
};