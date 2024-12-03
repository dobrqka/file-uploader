const { Router } = require("express");
const passport = require("passport");
const logoutRouter = Router();
const { logoutUser } = require("../controllers/logoutController");

logoutRouter.get("/", logoutUser);

module.exports = logoutRouter;
