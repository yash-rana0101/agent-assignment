const multer = require("multer");
const path = require("path");

// Use memory storage — Vercel's serverless filesystem is read-only.
// The file buffer will be available as req.file.buffer in the controller.
const storage = multer.memoryStorage();

// File filter - only allow CSV, XLSX, and XLS files
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".csv", ".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only .csv, .xlsx and .xls files are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
