import API from "../services/api";

export function buildLocalInterviewFeedback(answers) {
  const answerFeedback = answers.map((item) => {
    const wordCount = (item.answer || "").trim().split(/\s+/).filter(Boolean).length;

    if (wordCount === 0) {
      return {
        question: item.question,
        score: 0,
        feedback: "No answer was provided, so the interviewer cannot judge clarity or knowledge.",
        missingPoints: ["Add a direct answer", "Use one resume-based example"],
        betterAnswer: "Start with a direct response, then support it with a specific project or skill from your resume.",
      };
    }

    if (wordCount < 25) {
      return {
        question: item.question,
        score: 4,
        feedback: "The answer is too short and needs more context, examples, and outcome-based explanation.",
        missingPoints: ["Specific example", "Impact or result", "Clear conclusion"],
        betterAnswer: "Explain the situation, your exact contribution, the tools used, and the result in a few structured sentences.",
      };
    }

    if (wordCount <= 70) {
      return {
        question: item.question,
        score: 7,
        feedback: "Good direction, but it can become stronger with clearer structure and measurable resume-based details.",
        missingPoints: ["More detail", "Measurable result"],
        betterAnswer: "Keep the answer structured and add one concrete metric, project detail, or learning outcome.",
      };
    }

    return {
      question: item.question,
      score: 8,
      feedback: "Strong answer with useful detail. Improve it further by making the ending sharper and more role-focused.",
      missingPoints: ["Sharper closing"],
      betterAnswer: "End by connecting the experience to the role and explaining how it proves your readiness.",
    };
  });

  const totalScore = answerFeedback.reduce((sum, item) => sum + item.score, 0);

  return {
    overallScore: answerFeedback.length
      ? Math.round((totalScore / (answerFeedback.length * 10)) * 100)
      : 0,
    overallFeedback:
      "AI feedback is temporarily unavailable, so this fallback report is based on answer length and structure.",
    strengths: ["Completed the interview flow", "Attempted resume-based questions"],
    improvements: ["Add clearer examples", "Mention tools, decisions, and outcomes"],
    answers: answerFeedback,
  };
}

export async function getAIInterviewFeedback({ resumeText, interviewType, answers }) {
  const payloadAnswers = answers.slice(0, 10).map((item) => ({
    question: item.question,
    answer: item.answer || "",
  }));

  const response = await API.post("/ai/interview-feedback", {
    resumeText,
    interviewType,
    answers: payloadAnswers,
  });

  return response.data.result;
}
