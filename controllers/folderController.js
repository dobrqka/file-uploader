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

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { folders: true },
    });

    res.render("home", { user: updatedUser, folders: updatedUser.folders });
  } catch (error) {
    next(error);
  }
};

module.exports = { createFolder };
