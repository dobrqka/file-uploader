const multer = require("multer");
const upload = multer({ dest: "../uploads/" });

const uploadFile = (req, res, next) => {};

module.exports = { uploadFile };
