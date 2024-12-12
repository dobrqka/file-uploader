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
        public_id: `${req.user.name}_root/${folderName}/placeholder`,
      }
    );

    const folderPath = `${req.user.name}_root/${folderName}`;
    const parentId = await prisma.folder.findFirst({
      where: {
        userId: req.user.id,
        parentId: { equals: null },
      },
      select: { id: true },
    });

    // Save folder reference in the database
    const folder = await prisma.folder.create({
      data: {
        name: folderName,
        userId: req.user.id,
        path: folderPath,
        parentId: parentId.id,
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

    const userRootPrefix = `${req.user.name}_root`;
    const oldFolderPath = `${userRootPrefix}/${folder.name}`;
    const newFolderPath = `${userRootPrefix}/${newName}`;

    // List all resources in the old folder
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: oldFolderPath,
    });

    // Move each resource to the new folder
    for (const resource of resources.resources) {
      const newPublicId = resource.public_id.replace(
        oldFolderPath,
        newFolderPath
      );
      await cloudinary.uploader.rename(resource.public_id, newPublicId);
    }

    try {
      await cloudinary.api.delete_resources_by_prefix(
        `${oldFolderPath}/placeholder`
      );
    } catch (error) {
      console.warn("No placeholder to delete:", error.message);
    }

    // Update folder name in the database
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { name: newName, path: newFolderPath },
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

    // Check if there are any resources in the folder first
    const resources = await cloudinary.api.resources({
      type: "upload",
      prefix: folderName,
    });

    if (resources.resources.length > 0) {
      console.log("Folder is not empty. Deleting files...");
      await cloudinary.api.delete_resources_by_prefix(folderName);
    } else {
      console.log("Folder is empty, no files to delete.");
    }

    // Check if folder is empty after resources are deleted
    const checkEmptyFolder = await cloudinary.api.resources({
      type: "upload",
      prefix: folderName,
      max_results: 1, // check if there's at least one resource left
    });

    if (checkEmptyFolder.resources.length === 0) {
      // If the folder is empty, skip deleting it explicitly
      console.log(`Folder ${folderName} is empty. Skipping folder deletion.`);
    } else {
      // Delete the folder explicitly from Cloudinary if it's not empty
      await cloudinary.api.delete_folder(folderName);
      console.log(`Folder ${folderName} deleted from Cloudinary.`);
    }

    // Now delete the folder from the database
    const deletedFolder = await prisma.folder.delete({
      where: { id: folderId },
    });

    // Log database deletion success
    console.log("Deleted folder from database:", deletedFolder);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting folder:", error);
    next(error);
  }
};

module.exports = {
  newFolderValidation,
  createFolder,
  renameFolder,
  deleteFolder,
};
