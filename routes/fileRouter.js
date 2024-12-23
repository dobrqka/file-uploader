const { Router } = require("express");
const fileRouter = Router();
const {
  uploadFile,
  downloadFile,
  renameFile,
  deleteFile,
} = require("../controllers/fileController");

fileRouter.post("/upload", uploadFile);
fileRouter.get("/download/:fileId", downloadFile);
fileRouter.post("/rename/:id", renameFile);
fileRouter.post("/delete/:id", deleteFile);

module.exports = fileRouter;
