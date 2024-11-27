const { Router } = require("express");
const indexRouter = Router();
const { showHome } = require("../controllers/indexController");

indexRouter.get("/", showHome);

module.exports = indexRouter;
