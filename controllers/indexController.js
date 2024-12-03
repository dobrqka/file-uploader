const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const showHome = async (req, res) => {
  if (req.isAuthenticated()) {
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { folders: true },
    });

    return res.render("home", {
      user: updatedUser,
      folders: updatedUser.folders,
      files: updatedUser.folders.files,
    });
  } else {
    res.render("index");
  }
};

module.exports = { showHome };
