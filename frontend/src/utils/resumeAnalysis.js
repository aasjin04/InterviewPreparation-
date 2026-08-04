import API from "../services/api";

const ANALYSIS_KEY = "activeResumeAnalysis";
const MOCK_QUESTIONS_KEY = "activeMockInterviewQuestions";

export function getResumeFingerprint(activeResume) {
  if (!activeResume) return "";

  return [
    activeResume.fileName || "resume",
    activeResume.uploadedAt || "unknown-date",
    activeResume.text?.length || 0,
  ].join("::");
}

export function clearStoredResumeAnalysis() {
  localStorage.removeItem(ANALYSIS_KEY);
  localStorage.removeItem(MOCK_QUESTIONS_KEY);
}

export function shuffleItems(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function getInterviewQuestionsFromAnalysis(analysis, options = {}) {
  const allQuestions = analysis?.interviewPrep?.questions || [];
  const normalizedQuestions = allQuestions
    .map((item) => {
      if (typeof item === "string") {
        return {
          question: item,
          difficulty: "medium",
          type: "general",
        };
      }

      return {
        question: item.question,
        difficulty: item.difficulty?.toLowerCase?.() || "medium",
        type: item.type || "general",
      };
    })
    .filter((item) => item.question);

  const filteredQuestions = options.difficulty
    ? normalizedQuestions.filter(
        (item) => item.difficulty === options.difficulty.toLowerCase(),
      )
    : normalizedQuestions;

  const questionPool = filteredQuestions.length
    ? filteredQuestions
    : normalizedQuestions;

  if (!options.difficulty) {
    const orderedQuestions = ["easy", "medium", "hard"].flatMap((difficulty) =>
      shuffleItems(questionPool.filter((item) => item.difficulty === difficulty)),
    );

    const remainingQuestions = shuffleItems(
      questionPool.filter(
        (item) => !["easy", "medium", "hard"].includes(item.difficulty),
      ),
    );

    return [...orderedQuestions, ...remainingQuestions]
      .slice(0, options.count || questionPool.length)
      .map((item) => item.question);
  }

  return shuffleItems(questionPool)
    .slice(0, options.count || questionPool.length)
    .map((item) => item.question);
}

export function saveMockInterviewQuestions(questions) {
  localStorage.setItem(MOCK_QUESTIONS_KEY, JSON.stringify(questions));
}

export function getStoredMockInterviewQuestions() {
  const savedQuestions = localStorage.getItem(MOCK_QUESTIONS_KEY);

  if (!savedQuestions) return [];

  try {
    const parsed = JSON.parse(savedQuestions);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(MOCK_QUESTIONS_KEY);
    return [];
  }
}

export async function getOrCreateResumeAnalysis(activeResume, options = {}) {
  if (!activeResume?.text?.trim()) {
    throw new Error("Please upload or select an active resume first.");
  }

  const fingerprint = getResumeFingerprint(activeResume);

  if (!options.force) {
    const savedAnalysis = localStorage.getItem(ANALYSIS_KEY);

    if (savedAnalysis) {
      try {
        const parsed = JSON.parse(savedAnalysis);

        if (parsed.fingerprint === fingerprint && parsed.result) {
          return parsed.result;
        }
      } catch {
        localStorage.removeItem(ANALYSIS_KEY);
      }
    }
  }

  const response = await API.post("/ai/resume-master-analysis", {
    resumeText: activeResume.text,
  });

  const result = response.data.result;

  localStorage.setItem(
    ANALYSIS_KEY,
    JSON.stringify({
      fingerprint,
      generatedAt: new Date().toISOString(),
      result,
    }),
  );

  return result;
}
