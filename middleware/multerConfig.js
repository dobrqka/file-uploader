const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  // Define the destination folder for uploads
  destination: async (req, file, cb) => {
    const userId = req.user.id;
    let folderId = req.body.folderId; // Ensure folderId is passed in the request
    folderId = parseInt(folderId, 10);
    try {
      // Get the folder details from the database to find the path
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { path: true },
      });

      if (!folder) {
        return cb(new Error("Folder not found"), false);
      }

      // Create the folder if it doesn't exist
      if (!fs.existsSync(folder.path)) {
        fs.mkdirSync(folder.path, { recursive: true });
      }

      cb(null, folder.path); // Upload to the folder path
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Set a unique filename for the file being uploaded
    const filename = `${file.originalname}_${Date.now()}`;
    cb(null, filename);
  },
});

// Create the multer instance with the storage configuration
const upload = multer({ storage });

module.exports = upload;
