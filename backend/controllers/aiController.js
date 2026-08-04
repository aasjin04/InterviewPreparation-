const generateAIResponse = require("../utils/gemini");

const parseAIJson = (aiResponse) => {
  const cleanedResponse = aiResponse
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleanedResponse);
};

const limitText = (value = "", maxLength = 1500) =>
  String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);

exports.testGemini = async (req, res) => {
  try {
    const response = await generateAIResponse(
      "Say hello in one short sentence.",
    );
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gemini test failed",
      error: error.message,
    });
  }
};

exports.generateATSScore = async (req, res) => {
  try {
    const { resumeText, jobRole } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const prompt = `
You are an ATS resume evaluator.

Target Job Role:
${jobRole || "General Software Developer"}

Resume Text:
${resumeText}

Analyze this resume and return only valid JSON.

JSON format:
{
  "atsScore": 85,
  "summary": "Short summary of the resume quality.",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "missingKeywords": ["keyword 1", "keyword 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}
`;

    const aiResponse = await generateAIResponse(prompt);

    const result = parseAIJson(aiResponse);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "ATS analysis failed",
      error: error.message,
    });
  }
};

exports.generateMockInterviewQuestions = async (req, res) => {
  try {
    const { jobRole, difficulty, numberOfQuestions, resumeText } = req.body;

    if (!jobRole || !difficulty || !numberOfQuestions) {
      return res.status(400).json({
        success: false,
        message: "Job role, difficulty and number of questions are required",
      });
    }

    const prompt = `
You are a professional interview question generator.

Generate interview questions for this candidate.

Job Role: ${jobRole}
Difficulty Level: ${difficulty}
Number of Questions: ${numberOfQuestions}

Resume:
${resumeText || "No resume provided"}

Rules:
- Generate questions according to job role.
- Match the difficulty level.
- If resume is provided, include some resume-based questions.
- Return only valid JSON.
- Do not add markdown.
- Do not add explanation.

JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "technical",
      "difficulty": "${difficulty}"
    }
  ]
}
`;

    const aiResponse = await generateAIResponse(prompt);

    const result = parseAIJson(aiResponse);

    res.json({
      success: true,
      questions: result.questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate interview questions",
      error: error.message,
    });
  }
};

exports.generateSkillGap = async (req, res) => {
  try {
    const { resumeText, jobRole } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({
        success: false,
        message: "Resume text and job role are required",
      });
    }

    const prompt = `
You are an AI career mentor.

Analyze this resume for the target job role.

Target Job Role:
${jobRole}

Resume:
${resumeText}

Return only valid JSON.

JSON format:
{
  "matchScore": 75,
  "summary": "Short role-specific summary.",
  "matchedSkills": ["skill 1", "skill 2"],
  "missingSkills": [
    {
      "skill": "Redux",
      "priority": "High",
      "reason": "Why this skill is important",
      "estimatedTime": "4 days"
    }
  ],
  "roadmap": ["step 1", "step 2", "step 3"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}
`;

    const aiResponse = await generateAIResponse(prompt);

    const result = parseAIJson(aiResponse);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Skill gap analysis failed",
      error: error.message,
    });
  }
};

exports.improveResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const prompt = `
You are an expert ATS resume writer.

Convert the following resume into a clean ATS-friendly structured resume.

Resume Text:
${resumeText}

Return only valid JSON. Do not add markdown.

JSON format:
{
  "resumeScore": 85,
  "personalInfo": {
    "name": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  },
  "summary": "",
  "skills": [],
  "education": [
    {
      "degree": "",
      "college": "",
      "year": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "techStack": "",
      "description": ""
    }
  ],
  "certifications": [],
  "achievements": [],
  "improvements": [],
  "missingSections": []
}
`;

    const aiResponse = await generateAIResponse(prompt);

    const result = parseAIJson(aiResponse);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Resume improvement failed",
      error: error.message,
    });
  }
};

exports.generateMasterResumeAnalysis = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const prompt = `
You are Nourique, an AI resume and placement preparation assistant.

Analyze the resume once and produce complete data for these tools:
1. ATS Score Checker
2. AI Resume Analyzer / Skill Gap Tracker
3. Smart Resume Builder
4. Interview Preparation for future use

Do not ask for a target role. Infer the most suitable target role from the resume.
If the resume is for a student or fresher, evaluate it for entry-level/internship placement readiness.

Resume Text:
${resumeText}

Return only valid JSON. Do not add markdown. Do not add explanation.

JSON format:
{
  "inferredRole": "Most suitable target role inferred from resume",
  "candidateLevel": "student/fresher/experienced",
  "ats": {
    "atsScore": 85,
    "summary": "Short summary of ATS readiness.",
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "missingKeywords": ["keyword 1", "keyword 2"],
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "skillGap": {
    "matchScore": 75,
    "summary": "Short summary of skill readiness.",
    "matchedSkills": ["skill 1", "skill 2"],
    "missingSkills": [
      {
        "skill": "skill name",
        "priority": "High/Medium/Low",
        "reason": "Why this skill matters",
        "estimatedTime": "estimated learning time"
      }
    ],
    "roadmap": ["step 1", "step 2", "step 3"],
    "suggestions": ["suggestion 1", "suggestion 2"]
  },
  "improvedResume": {
    "resumeScore": 85,
    "personalInfo": {
      "name": "",
      "email": "",
      "phone": "",
      "location": "",
      "linkedin": "",
      "github": ""
    },
    "summary": "",
    "skills": [],
    "education": [
      {
        "degree": "",
        "college": "",
        "year": ""
      }
    ],
    "experience": [
      {
        "company": "",
        "role": "",
        "duration": "",
        "description": ""
      }
    ],
    "projects": [
      {
        "title": "",
        "techStack": "",
        "description": ""
      }
    ],
    "certifications": [],
    "achievements": [],
    "improvements": [],
    "missingSections": []
  },
  "interviewPrep": {
    "questions": [
      {
        "question": "Question text here",
        "type": "technical/hr/project",
        "difficulty": "easy/medium/hard"
      }
    ]
  }
}

Interview question rules:
- Generate at least 24 interview questions.
- Include 8 easy, 8 medium, and 8 hard questions.
- Include HR, technical, project-based, and resume-specific questions.
- Difficulty values must be exactly: "easy", "medium", or "hard".
`;

    const aiResponse = await generateAIResponse(prompt);
    const result = parseAIJson(aiResponse);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Master resume analysis failed",
      error: error.message,
    });
  }
};

exports.generateInterviewFeedback = async (req, res) => {
  try {
    const { resumeText, interviewType, answers } = req.body;

    if (!resumeText || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Resume text and interview answers are required",
      });
    }

    const limitedAnswers = answers.slice(0, 10).map((item, index) => ({
      id: index + 1,
      question: limitText(item.question, 500),
      answer: limitText(item.answer || "No answer provided.", 1500),
    }));

    const prompt = `
You are Nourique's AI interview coach for students and freshers.

Evaluate the candidate's interview answers using the resume context.
Be practical, supportive, and specific. Do not be generic.

Interview Type:
${interviewType || "interview"}

Resume Context:
${limitText(resumeText, 5000)}

Candidate Answers:
${JSON.stringify(limitedAnswers, null, 2)}

Rules:
- Evaluate up to 10 answers only.
- Give fair scoring based on relevance, clarity, technical depth, confidence, and resume alignment.
- Mention what is missing and how the answer can improve.
- Keep each feedback under 45 words.
- Keep each betterAnswer under 70 words.
- Return only valid JSON. Do not add markdown. Do not add explanation.

JSON format:
{
  "overallScore": 78,
  "overallFeedback": "Short overall interview feedback.",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "answers": [
    {
      "question": "Question text",
      "score": 7,
      "feedback": "Specific feedback about the answer.",
      "missingPoints": ["missing point 1", "missing point 2"],
      "betterAnswer": "A concise improved sample answer."
    }
  ]
}
`;

    const aiResponse = await generateAIResponse(prompt);
    const result = parseAIJson(aiResponse);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Interview feedback failed",
      error: error.message,
    });
  }
};
