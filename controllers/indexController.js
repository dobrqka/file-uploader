const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const showHome = async (req, res) => {
  if (req.isAuthenticated()) {
    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { folders: true },
    });

    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id, parentId: { not: null } },
      include: {
        files: true,
      },
    });

    return res.render("home", {
      user: updatedUser,
      folders,
    });
  } else {
    res.render("index");
  }
};

module.exports = { showHome };
