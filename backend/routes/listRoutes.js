const express = require("express");
const router = express.Router();
const {
  uploadAndDistribute,
  getAllLists,
  getBatches,
  getBatchById,
} = require("../controllers/listController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All list routes are protected
router.use(protect);

// @route POST /api/lists/upload  - Upload a file and distribute tasks
router.post("/upload", upload.single("file"), uploadAndDistribute);

// @route GET  /api/lists          - Get all task lists
router.get("/", getAllLists);

// @route GET  /api/lists/batches  - Get all upload batches with summary
router.get("/batches", getBatches);

// @route GET  /api/lists/batch/:batchId  - Get all lists for a specific batch
router.get("/batch/:batchId", getBatchById);

module.exports = router;
