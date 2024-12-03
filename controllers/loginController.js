const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const showLogin = (req, res) => {
  res.render("login");
};

const loginUser = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.login(user, async (err) => {
      if (err) {
        return next(err);
      }

      const updatedUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { folders: true },
      });

      res.redirect("/");
    });
  })(req, res, next);
};

module.exports = { showLogin, loginUser };
