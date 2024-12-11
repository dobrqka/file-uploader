const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const showRegister = (req, res) => {
  res.render("register");
};

const registerValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("confirm")
    .notEmpty()
    .withMessage("Confirm Password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a placeholder file in Cloudinary to initialize the root folder
    const rootFolderName = `${name}_root`;

    await cloudinary.uploader.upload(
      "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAACAkQBADs=",
      {
        public_id: `${rootFolderName}/placeholder`,
      }
    );

    const rootFolder = await prisma.folder.create({
      data: {
        name: rootFolderName,
        path: rootFolderName,
      },
    });

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        rootFolderId: rootFolder.id,
      },
    });

    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

module.exports = { showRegister, registerValidationRules, registerUser };
