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
  // const errors = validationResult(req);

  const folderName = req.body.folder;
  try {
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: folderName,
        userId: req.user.id,
      },
    });

    if (existingFolder) {
      return res.status(400).json({ message: "Folder already exists." });
    }

    const folder = await prisma.folder.create({
      data: {
        name: folderName,
        userId: req.user.id,
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

module.exports = { createFolder, renameFolder, deleteFolder };
