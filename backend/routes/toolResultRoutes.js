const express = require("express");
const {
  deleteToolResult,
  getToolResult,
  getToolSummary,
  saveToolResult,
} = require("../controllers/toolResultController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getToolSummary);
router.get("/:toolType", protect, getToolResult);
router.post("/", protect, saveToolResult);
router.delete("/:toolType", protect, deleteToolResult);

module.exports = router;
