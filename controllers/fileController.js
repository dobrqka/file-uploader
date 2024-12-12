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

      // Get folder details from the database
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const file = await prisma.file.create({
        data: {
          name: req.file.originalname,
          path: req.file.path,
          folderId: folderId,
        },
      });

      res.redirect("/");
    } catch (error) {
      res.status(500).json({
        message: "Error saving file to the database",
        error: error.message,
      });
    }
  });
};

const downloadFile = async (req, res, next) => {
  const fileId = req.params.fileId;
  try {
    // Fetch file details from your database
    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (!file) {
      return res.status(404).send("File not found");
    }

    // Send the file as a download response
    const filePath = path.join(__dirname, file.path);
    res.download(filePath, file.name); // This triggers the file download
  } catch (error) {
    res.status(500).send("Error downloading the file");
  }
};

module.exports = { uploadFile, downloadFile };
