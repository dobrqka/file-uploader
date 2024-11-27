const { Router } = require("express");
const passport = require("passport");
const loginRouter = Router();
const { showLogin, loginUser } = require("../controllers/loginController");

loginRouter.get("/", showLogin);
loginRouter.post("/", loginUser);

module.exports = loginRouter;
