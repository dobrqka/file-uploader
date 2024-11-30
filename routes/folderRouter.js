const { Router } = require("express");
const folderRouter = Router();
const { createFolder } = require("../controllers/folderController");

folderRouter.post("/create", createFolder);

module.exports = folderRouter;
