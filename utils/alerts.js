function setAlert(req, res, type, title, message) {
    const alert = { type, title, message };
    req.session.alert = alert;
    res.locals.alert = alert;
}

module.exports = { setAlert };
