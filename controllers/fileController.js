const upload = require("../middleware/multerConfig");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const uploadFile = (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload failed", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const folderId = parseInt(req.body.folderId, 10);

      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const file = await prisma.file.create({
        data: {
          name: req.file.filename,
          path: req.file.path,
          folderId: folderId,
        },
      });

      // res.status(200).json({
      //   message: "File uploaded successfully",
      //   file: {
      //     filename: req.file.filename,
      //     originalName: req.file.originalname,
      //     path: req.file.path,
      //     size: req.file.size,
      //   },
      // });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({
        message: "Error saving file to the database",
        error: error.message,
      });
    }
  });
};

module.exports = { uploadFile };
