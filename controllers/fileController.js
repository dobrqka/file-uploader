const upload = require("../middleware/multerConfig");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary = require("cloudinary").v2;
const fetch = require("node-fetch");

const uploadFile = (req, res) => {
  upload.single("file")(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload failed", error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      const folderId = parseInt(req.body.folderId, 10);

      if (isNaN(folderId)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      const fileName = req.file.filename.split("/").pop();

      const file = await prisma.file.create({
        data: {
          name: fileName,
          path: req.file.path,
          folderId: folderId,
          size: req.file.size,
        },
      });
      // res.json({ success: true, message: "File uploaded successfully!" });
      res.redirect("/");
    } catch (error) {
      res.status(500).json({
        message: "Error saving file to the database",
        error: error.message,
      });
    }
  });
};

const getPublicIdFromDatabase = async (fileId, prisma) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { folder: true },
  });

  if (!file) {
    throw new Error("File not found.");
  }

  let folderPath = "";
  let currentFolder = file.folder;

  while (currentFolder) {
    folderPath = `${currentFolder.name}/${folderPath}`;
    if (!currentFolder.parentId) break;
    currentFolder = await prisma.folder.findUnique({
      where: { id: currentFolder.parentId },
    });
  }

  const publicId = `${folderPath}${file.name}`;
  return { publicId, file };
};

const downloadFile = async (req, res, next) => {
  const fileId = parseInt(req.params.fileId);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const { publicId, file } = await getPublicIdFromDatabase(fileId, prisma);

    const resourceTypes = ["image", "video", "raw"];
    let resource = null;

    for (const type of resourceTypes) {
      try {
        resource = await cloudinary.api.resource(publicId, {
          resource_type: type,
        });
        if (resource) {
          break;
        }
      } catch (error) {
        if (error.http_code !== 404) {
          console.error(`Error fetching resource of type ${type}:`, error);
        }
      }
    }

    if (!resource || !resource.secure_url) {
      return res.status(404).json({ message: "File not found in Cloudinary." });
    }

    const fileUrl = resource.secure_url;
    const downloadStream = await fetch(fileUrl);

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);
    res.setHeader(
      "Content-Type",
      resource.format === "txt"
        ? "text/plain"
        : resource.format
        ? `application/${resource.format}`
        : "application/octet-stream"
    );

    // Pipe the download stream to the response
    downloadStream.body.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    next(error);
  }
};

const deleteFile = async (req, res, next) => {
  const fileId = parseInt(req.params.id);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        folder: {
          userId: req.user.id,
        },
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found or access denied." });
    }

    const { publicId } = await getPublicIdFromDatabase(fileId, prisma);

    const resourceTypes = ["image", "raw", "video"];
    let resource = null;

    for (const type of resourceTypes) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: type });
      } catch (error) {
        if (error.http_code !== 404) {
          console.error(`Error fetching resource of type ${type}:`, error);
        }
      }
    }
    const deletedFile = await prisma.file.delete({
      where: { id: fileId },
    });
    res.json({ success: true, message: "File deleted successfully!" });
  } catch (error) {
    console.error("Error deleting file:", error);
    next(error);
  }
};

const renameFile = async (req, res, next) => {
  const fileId = parseInt(req.params.id);
  const newName = req.body.newName;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        folder: {
          userId: req.user.id,
        },
      },
      include: {
        folder: true,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found or access denied." });
    }

    const { publicId } = await getPublicIdFromDatabase(fileId, prisma);
    const pidSegments = publicId.split("/");
    pidSegments[pidSegments.length - 1] = newName;
    const newPublicId = pidSegments.join("/");

    const resourceTypes = ["image", "raw", "video"];
    let resource = null;

    for (const type of resourceTypes) {
      try {
        await cloudinary.uploader.rename(publicId, newPublicId, {
          resource_type: type,
        });
        await cloudinary.api.update(newPublicId, {
          resource_type: type,
          display_name: newName,
        });
      } catch (error) {
        if (error.http_code !== 404) {
          console.error(`Error fetching resource of type ${type}:`, error);
        }
      }
    }

    const pathSegments = file.path.split("/");
    pathSegments[pathSegments.length - 1] = newName;
    const newFilePath = pathSegments.join("/");

    const updatedFile = await prisma.file.update({
      where: { id: fileId },
      data: { name: newName, path: newFilePath },
    });
    res.json({ success: true, message: "File renamed successfully!" });
  } catch (error) {
    console.error("Error renaming file:", error);
    next(error);
  }
};

module.exports = { uploadFile, downloadFile, renameFile, deleteFile };
