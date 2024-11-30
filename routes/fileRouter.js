const { Router } = require("express");
const fileRouter = Router();
const { uploadFile } = require("../controllers/fileController");

fileRouter.post("/upload", uploadFile);

module.exports = fileRouter;
