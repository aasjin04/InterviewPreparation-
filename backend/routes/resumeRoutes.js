const express = require("express");
const {
  clearActiveResume,
  getActiveResume,
  saveActiveResume,
} = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/active", protect, getActiveResume);
router.post("/active", protect, saveActiveResume);
router.delete("/active", protect, clearActiveResume);

module.exports = router;
