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
        folder: `${req.user.name}_root/${folderName}`,
        public_id: "placeholder",
        resource_type: "raw",
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
    res.json({ success: true, message: "Folder deleted successfully!" });
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

    // List all resources (assets) in the old folder
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

    // Ensure new folder is created by uploading a placeholder file to it (this step is to explicitly create the folder)
    try {
      await cloudinary.uploader.upload(
        "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAACAkQBADs=", // Upload a dummy image as a placeholder to create the folder
        {
          folder: `${newFolderPath}`,
          public_id: `${newFolderPath}/placeholder`,
          resource_type: "image",
        }
      );
      console.log("New folder created with placeholder");
    } catch (error) {
      console.warn(
        "Error creating new folder with placeholder:",
        error.message
      );
    }

    // Delete the old folder (this effectively deletes the folder by removing all assets)
    try {
      await cloudinary.api.delete_resources_by_prefix(`${oldFolderPath}`, {
        resource_type: "raw",
      });
      await cloudinary.api.delete_resources_by_prefix(`${oldFolderPath}`, {
        resource_type: "image",
      });
      await cloudinary.api.delete_resources_by_prefix(`${oldFolderPath}`, {
        resource_type: "video",
      });
      await cloudinary.api.delete_folder(`${oldFolderPath}`);
      console.log(`Old folder deleted from Cloudinary: ${oldFolderPath}`);
    } catch (error) {
      console.warn("Error deleting old folder from Cloudinary:", error.message);
    }

    // Update the folder name in the database
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { name: newName, path: newFolderPath },
    });

    console.log("Folder renamed in database:", updatedFolder);

    // Redirect or respond with success
    res.json({ success: true, message: "Folder renamed successfully!" });
  } catch (error) {
    console.error("Error renaming folder:", error);
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

    const folderPath = `${req.user.name}_root/${folder.name}`;
    console.log(`Deleting resources with prefix: ${folderPath}`);

    await cloudinary.api.delete_resources_by_prefix(`${folderPath}`, {
      resource_type: "raw",
    });
    await cloudinary.api.delete_resources_by_prefix(`${folderPath}`, {
      resource_type: "image",
    });
    await cloudinary.api.delete_resources_by_prefix(`${folderPath}`, {
      resource_type: "video",
    });

    await cloudinary.api.delete_folder(`${folderPath}`);

    // Delete the folder from the database
    const deletedFolder = await prisma.folder.delete({
      where: { id: folderId },
    });

    res.json({ success: true, message: "Folder deleted successfully!" });
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
