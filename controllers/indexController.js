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
        files: {
          select: {
            id: true,
            name: true, // Include file name
            size: true, // Include file size
            createdAt: true, // Include upload time (createdAt)
          },
        },
      },
    });

    folders.forEach((folder) => {
      folder.files.forEach((file) => {
        file.uploadTime = file.createdAt.toLocaleString(); // Format the time here
      });
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
