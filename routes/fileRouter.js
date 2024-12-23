const { Router } = require("express");
const fileRouter = Router();
const {
  uploadFile,
  downloadFile,
  deleteFile,
} = require("../controllers/fileController");

fileRouter.post("/upload", uploadFile);
fileRouter.get("/download/:fileId", downloadFile);
fileRouter.post("/delete/:id", deleteFile);

module.exports = fileRouter;
