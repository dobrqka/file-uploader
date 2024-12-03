const { Router } = require("express");
const folderRouter = Router();
const {
  createFolder,
  renameFolder,
  deleteFolder,
  newFolderValidation,
} = require("../controllers/folderController");

folderRouter.post("/create", newFolderValidation, createFolder);
folderRouter.post("/rename/:id", renameFolder);
folderRouter.post("/delete/:id", deleteFolder);

module.exports = folderRouter;
