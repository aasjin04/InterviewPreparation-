const express = require("express");
const { getRandomAptitudeQuestions } = require("../controllers/aptitudeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/questions", protect, getRandomAptitudeQuestions);

module.exports = router;
