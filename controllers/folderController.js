const fs = require("fs");
const path = require("path");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const newFolderValidation = [
  body("folder")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required.")
    .isLength({ min: 3 })
    .withMessage("Must be at least 3 letters long."),
];

const createFolder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const folderName = req.body.folder;
  const userId = req.user.id;

  const userRootFolderPath = path.join(
    process.cwd(),
    "uploads",
    `${req.user.name}_root`
  );

  const folderPath = path.join(userRootFolderPath, folderName);

  try {
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: folderName,
        userId,
      },
    });

    if (existingFolder) {
      return res.status(400).json({ message: "Folder already exists." });
    }

    // Check if the root folder exists on the filesystem
    if (!fs.existsSync(userRootFolderPath)) {
      fs.mkdirSync(userRootFolderPath, { recursive: true });
    }

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { rootFolderId: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const folder = await prisma.folder.create({
      data: {
        name: folderName,
        userId,
        parentId: req.user.rootFolderId,
        path: folderPath,
      },
    });
    res.json({ success: true, folder: folder });
  } catch (error) {
    next(error);
  }
};

const renameFolder = async (req, res, next) => {
  const folderId = parseInt(req.params.id);
  const newName = req.body.newName;

  try {
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: { name: newName },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const deleteFolder = async (req, res, next) => {
  const folderId = parseInt(req.params.id);

  try {
    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFolder,
  renameFolder,
  deleteFolder,
  newFolderValidation,
};
