const multer = require("multer");

// Configure storage engine
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/\s+/g, ""); // Removes spaces
    cb(null, "api-img" + Date.now() + "-" + sanitizedFilename);
  },
});

// Set file size limits and file filter
let uploadFile = multer({
  storage: fileStorageEngine,
  limits: { fileSize: 10000 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

module.exports = uploadFile;
