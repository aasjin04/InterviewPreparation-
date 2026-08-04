const express = require("express");

const {
  testGemini,
 
  generateATSScore,
  generateMockInterviewQuestions,
  generateSkillGap,
  generateInterviewFeedback,
  generateMasterResumeAnalysis,
  improveResume,
} = require("../controllers/aiController");

const router = express.Router();

router.get("/test", testGemini);
 
router.post("/ats-score", generateATSScore);
router.post("/resume-master-analysis", generateMasterResumeAnalysis);
router.post("/interview-feedback", generateInterviewFeedback);
router.post("/mock-interview-questions", generateMockInterviewQuestions);
router.post("/skill-gap", generateSkillGap);
router.post("/improve-resume", improveResume);

module.exports = router;
