const { Router } = require("express");
const folderRouter = Router();
const {
  createFolder,
  renameFolder,
  deleteFolder,
} = require("../controllers/folderController");

folderRouter.post("/create", createFolder);
folderRouter.post("/rename/:id", renameFolder);
folderRouter.post("/delete/:id", deleteFolder);

module.exports = folderRouter;
