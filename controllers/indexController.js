const showHome = (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home", { user: req.user });
  } else {
    res.render("index");
  }
};

module.exports = { showHome };
