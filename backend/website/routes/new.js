module.exports.run = (req, res, renderTemplate) => {
    renderTemplate(res, req, "new.ejs", { alertDanger: false, alertSuccess: false });
};