const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const cloudinary = require("cloudinary").v2;
const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const newFolderValidation = [
  body("folder")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required.")
    .isLength({ min: 3 })
    .withMessage("Must be at least 3 letters long."),
];

const createFolder = async (req, res, next) => {
  const folderName = req.body.folder;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    // Check if the folder already exists in Cloudinary
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folderName,
      max_results: 1,
    });

    if (result.resources.length > 0) {
      return res.status(400).json({ message: "Folder already exists." });
    }

    // Create a placeholder to initialize the folder in Cloudinary
    await cloudinary.uploader.upload(
      "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAACAkQBADs=",
      {
        public_id: `${folderName}/placeholder`,
      }
    );

    // Save folder reference in the database
    const folder = await prisma.folder.create({
      data: {
        name: folderName,
        userId: req.user.id,
      },
    });

    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

const renameFolder = async (req, res, next) => {
  const folderId = parseInt(req.params.id);
  const newName = req.body.newName;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: req.user.id },
    });

    if (!folder) {
      return res
        .status(404)
        .json({ message: "Folder not found or access denied." });
    }

    const oldName = folder.name;

    // List all resources in the old folder
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: oldName,
    });

    // Move each resource to the new folder
    for (const resource of resources.resources) {
      const newPublicId = resource.public_id.replace(oldName, newName);
      await cloudinary.uploader.rename(resource.public_id, newPublicId);
    }

    // Delete the placeholder in the old folder
    await cloudinary.api.delete_resources_by_prefix(`${oldName}/placeholder`);

    // Update folder name in the database
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { name: newName },
    });

    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

const deleteFolder = async (req, res, next) => {
  const folderId = parseInt(req.params.id);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const folder = await prisma.folder.findFirst({
      where: { id: folderId, userId: req.user.id },
    });

    if (!folder) {
      return res
        .status(404)
        .json({ message: "Folder not found or access denied." });
    }

    const folderName = folder.name;

    // Delete all resources in the folder
    await cloudinary.api.delete_resources_by_prefix(folderName);

    // Delete the folder itself
    await cloudinary.api.delete_folder(folderName);

    // Remove the folder from the database
    await prisma.folder.delete({
      where: {
        id: folderId,
        userId: req.user.id,
      },
    });

    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  newFolderValidation,
  createFolder,
  renameFolder,
  deleteFolder,
};
