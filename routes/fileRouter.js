const { Router } = require("express");
const fileRouter = Router();
const { uploadFile, downloadFile } = require("../controllers/fileController");

fileRouter.post("/upload", uploadFile);
fileRouter.get("/download/:fileId", downloadFile);

module.exports = fileRouter;
