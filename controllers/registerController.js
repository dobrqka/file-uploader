const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

    const rootFolder = await prisma.folder.create({
      data: {
        name: `${name}_root`,
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
