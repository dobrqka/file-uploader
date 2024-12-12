const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const userId = req.user.id;
    const folderId = parseInt(req.body.folderId, 10);

    const folder = prisma.folder.findUnique({
      where: { id: folderId },
      select: { name: true },
    });

    if (!folder) {
      throw new Error("Folder not found.");
    }

    return {
      folder: folder.name,
      resource_type: "raw",
      public_id: `${file.originalname}_${Date.now()}`,
    };
  },
});

// Create the multer instance with the storage configuration
const upload = multer({ storage });

module.exports = upload;
