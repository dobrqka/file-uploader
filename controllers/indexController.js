const showHome = (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.user.folders);
    res.render("home", { user: req.user, folders: req.user.folders });
  } else {
    res.render("index");
  }
};

module.exports = { showHome };
