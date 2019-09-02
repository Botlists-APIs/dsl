const Bots = require("../../models/bots.js");

module.exports.run = async (req, res, renderTemplate, paginate, dataType) => {
    var query = req.query.name;
    if (!query) return res.redirect("/");
    const dQuery = query;
    query = new RegExp(query, "i");

    var page = req.query.page;
    if (!page) page = 1;
    if (page && isNaN(parseInt(page))) {
        page = 1;
    } else {
        page = parseInt(page);
    }

    var bots = await Bots.find({ approved: true, name: query }).sort([["upvotes", "descending"]]);
    const totalPages = (dataType(bots.length / 9) === "float") ? (Math.floor(bots.length / 9 + 1)) : (bots.length / 9);
    bots = paginate(bots, 9, page);

    renderTemplate(res, req, "search.ejs", { bots, page, totalPages, query: dQuery });
};