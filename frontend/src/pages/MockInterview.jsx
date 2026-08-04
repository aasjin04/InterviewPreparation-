import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  Mic,
  RotateCcw,
  Sparkles,
  Timer,
} from "lucide-react";
import { useResume } from "../context/ResumeContext";
import {
  getInterviewQuestionsFromAnalysis,
  getOrCreateResumeAnalysis,
  saveMockInterviewQuestions,
  shuffleItems,
} from "../utils/resumeAnalysis";
import {
  buildLocalInterviewFeedback,
  getAIInterviewFeedback,
} from "../utils/interviewFeedback";
import { formatAIValue } from "../utils/displayValue";
import { saveToolResult } from "../services/toolResults";

const levelTimers = {
  easy: 90,
  medium: 120,
  hard: 180,
};

const baseQuestions = {
  easy: [
    "Tell me about yourself using the details from your resume.",
    "Which project from your resume are you most confident about?",
    "What are your strongest skills, and where did you use them?",
    "Explain your education background and how it supports this role.",
    "Why should we select you for this opportunity?",
  ],
  medium: [
    "Walk me through one resume project and explain your exact contribution.",
    "Describe a technical challenge you faced and how you solved it.",
    "How do your skills match the role you are applying for?",
    "Tell me about a mistake or blocker in a project and what you learned.",
    "How would you improve one project mentioned in your resume?",
  ],
  hard: [
    "Defend the most important technical decision in one of your resume projects.",
    "If your project had to support ten times more users, what would you change?",
    "Explain a tradeoff you made between speed, quality, and maintainability.",
    "Which skill on your resume is weakest, and what is your plan to improve it?",
    "How would you explain your resume experience to a senior interviewer?",
  ],
};

export default function MockInterview() {
  const [questionCount, setQuestionCount] = useState(5);
  const [level, setLevel] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(levelTimers.medium);
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);
  const { activeResume } = useResume();

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (timeLeft % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  useEffect(() => {
    if (!practiceStarted || practiceFinished || timeLeft === 0) return;

    const timerId = window.setInterval(() => {
      setTimeLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [practiceFinished, practiceStarted, timeLeft]);

  const startPractice = async () => {
    const resumeForAnalysis = activeResume;

    if (!resumeForAnalysis?.text?.trim()) {
      alert("Please select an active resume first.");
      return;
    }

    setLoading(true);

    try {
      const analysis = await getOrCreateResumeAnalysis(resumeForAnalysis);
      const aiQuestions = getInterviewQuestionsFromAnalysis(analysis, {
        difficulty: level,
        count: questionCount,
      });

      const finalQuestions = aiQuestions.length
        ? aiQuestions
        : shuffleItems(baseQuestions[level]).slice(0, questionCount);

      saveMockInterviewQuestions(finalQuestions);
      setQuestions(finalQuestions);
      setAnswers(Array(finalQuestions.length).fill(""));
      setCurrentQuestion(0);
      setTimeLeft(levelTimers[level]);
      setPracticeStarted(true);
      setPracticeFinished(false);
      setFeedbackReport(null);
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to generate questions.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (value) => {
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, index) =>
        index === currentQuestion ? value : answer
      )
    );
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    setTimeLeft(levelTimers[level]);
  };

  const goToNextQuestion = () => {
    if (currentQuestion === questions.length - 1) {
      setPracticeFinished(true);
      return;
    }

    goToQuestion(currentQuestion + 1);
  };

  const getFeedback = async () => {
    if (!activeResume?.text?.trim()) {
      alert("Please select an active resume first.");
      return;
    }

    const submittedAnswers = questions.map((question, index) => ({
      question,
      answer: answers[index] || "",
    }));

    setFeedbackLoading(true);

    try {
      const report = await getAIInterviewFeedback({
        resumeText: activeResume.text,
        interviewType: `Mock Interview - ${level} level`,
        answers: submittedAnswers,
      });

      setFeedbackReport(report);
      saveToolResult("mockInterview", activeResume, {
        questions,
        answers: submittedAnswers,
        feedbackReport: report,
        level,
        questionCount,
      }).catch((saveError) => {
        console.log(saveError.response?.data || saveError);
      });
    } catch (error) {
      console.log(error.response?.data || error);
      alert("AI feedback could not be generated right now. Showing basic feedback instead.");
      const fallbackReport = buildLocalInterviewFeedback(submittedAnswers);
      setFeedbackReport(fallbackReport);
      saveToolResult("mockInterview", activeResume, {
        questions,
        answers: submittedAnswers,
        feedbackReport: fallbackReport,
        level,
        questionCount,
      }).catch((saveError) => {
        console.log(saveError.response?.data || saveError);
      });
    } finally {
      setFeedbackLoading(false);
    }
  };

  const currentAnswer = answers[currentQuestion] || "";
  const currentPrompt = questions[currentQuestion] || "";

  return (
    <div className="min-h-screen bg-[#12182A] px-4 py-5 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes mockFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes mockGlow {
          0%, 100% { opacity: 0.45; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: 0.8; transform: translate3d(16px, -14px, 0) scale(1.07); }
        }

        @keyframes mockShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#60A5FA]/28 blur-[115px] animate-[mockGlow_8s_ease-in-out_infinite]" />
        <div className="absolute right-8 top-24 h-80 w-80 rounded-full bg-[#A78BFA]/24 blur-[125px] animate-[mockGlow_9s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-[#34D399]/14 blur-[135px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px] opacity-18" />
      </div>

      <div className="relative mx-auto max-w-[1380px] animate-[mockFadeUp_0.65s_ease-out_both]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link
            to="/#tools"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-bold text-slate-200 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:bg-white/12 hover:text-white"
          >
            <ArrowLeft size={17} />
            Explore more tools
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-bold text-slate-200 shadow-lg shadow-black/10 backdrop-blur-xl transition hover:bg-white/12 hover:text-white"
          >
            Go to dashboard
            <LayoutDashboard size={17} />
          </Link>
        </div>

        <header className="relative mb-4 rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 md:pr-[300px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-black/10 backdrop-blur-xl">
                <Mic size={16} className="text-pink-300" />
                Mock Interview
              </div>
              <h1 className="mt-2 bg-[linear-gradient(90deg,#FFFFFF,#BAE6FD,#FBCFE8,#FFFFFF)] bg-[length:220%_220%] bg-clip-text pb-2 text-3xl font-semibold leading-[1.18] tracking-tight text-transparent animate-[mockShine_6s_ease-in-out_infinite] md:text-4xl md:leading-[1.16]">
                Practice resume-based answers
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200/90">
                Generate written interview questions from your active resume, answer under timed pressure, then request AI feedback.
              </p>
            </div>

            <div className="ml-auto w-full max-w-[260px] self-start rounded-2xl border border-white/10 bg-[#1B2438]/85 p-3 ring-1 ring-white/10 md:absolute md:right-3 md:top-3 md:w-[260px]">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-300/15">
                  <FileText size={18} />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Selected resume
                  </p>
                  <h2 className="mt-1 truncate text-sm font-bold text-white">
                    {activeResume?.fileName || "Resume needed"}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3 ring-1 ring-white/10 md:grid-cols-[150px_minmax(280px,1fr)_190px] md:items-end">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Questions
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(Math.min(10, Math.max(1, Number(e.target.value))))
                }
                className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-950 shadow-inner shadow-slate-300/40 outline-none transition focus:border-blue-300/80 focus:bg-white focus:ring-4 focus:ring-blue-400/20"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">
                Question Level
              </label>
              <div className="relative grid grid-cols-3 rounded-2xl border border-white/10 bg-[#111827]/80 p-1">
                {["easy", "medium", "hard"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setLevel(item);
                      setTimeLeft(levelTimers[item]);
                    }}
                    className={`rounded-xl px-3 py-2.5 text-sm font-bold capitalize transition ${
                      level === item
                        ? "bg-white text-slate-950 shadow-lg shadow-black/20"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startPractice}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#EC4899] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Start
                </>
              )}
            </button>
          </div>
        </header>

        <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          {!practiceStarted ? (
            <EmptyPracticePanel activeResume={activeResume} />
          ) : practiceFinished ? (
            <ReviewPanel
              questions={questions}
              answers={answers}
              feedbackReport={feedbackReport}
              feedbackLoading={feedbackLoading}
              onFeedback={getFeedback}
              onRestart={startPractice}
            />
          ) : (
            <PracticePanel
              currentQuestion={currentQuestion}
              questions={questions}
              level={level}
              timeLeft={timeLeft}
              formattedTime={formattedTime}
              currentPrompt={currentPrompt}
              currentAnswer={currentAnswer}
              answers={answers}
              updateAnswer={updateAnswer}
              goToQuestion={goToQuestion}
              goToNextQuestion={goToNextQuestion}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyPracticePanel({ activeResume }) {
  return (
    <div className="flex min-h-[430px] items-center justify-center text-center">
      <div className="max-w-xl">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/[0.075] text-pink-200 ring-1 ring-white/10">
          <MessageSquareText size={28} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
          Practice panel is ready
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {activeResume
            ? "Choose question count and difficulty, then start a timed written practice round."
            : "Select an active resume from the home page or dashboard before starting practice."}
        </p>
      </div>
    </div>
  );
}

function ReviewPanel({
  questions,
  answers,
  feedbackReport,
  feedbackLoading,
  onFeedback,
  onRestart,
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Answer Review
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Review your mock interview
          </h2>
          {feedbackReport?.overallScore !== undefined && (
            <p className="mt-2 text-sm text-slate-300">
              AI Score:{" "}
              <span className="font-bold text-emerald-200">
                {feedbackReport.overallScore}%
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onFeedback}
            disabled={feedbackLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 disabled:opacity-60"
          >
            {feedbackLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Getting Feedback...
              </>
            ) : (
              <>
                <BrainCircuit size={18} />
                Get AI Feedback
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.075] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.11]"
          >
            <RotateCcw size={18} />
            Restart
          </button>
        </div>
      </div>

      {feedbackReport?.overallFeedback && (
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.065] p-4 text-sm leading-6 text-slate-200">
          {formatAIValue(feedbackReport.overallFeedback)}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {questions.map((question, index) => {
          const feedback = feedbackReport?.answers?.[index];

          return (
            <div
              key={question}
              className="rounded-[1.35rem] border border-white/10 bg-white/[0.065] p-4 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.085]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Question {index + 1}
              </p>
              <h3 className="mt-2 font-bold leading-6 text-white">{question}</h3>
              <p className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-[#111827]/70 p-3 text-sm leading-6 text-slate-300">
                {answers[index] || "No answer written."}
              </p>

              {feedback && (
                <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-50">
                  <p>
                    <strong>Score:</strong> {feedback.score}/10
                  </p>
                  <p className="mt-2">
                    <strong>Feedback:</strong>{" "}
                    {formatAIValue(feedback.feedback)}
                  </p>
                  {feedback.missingPoints?.length > 0 && (
                    <p className="mt-2">
                      <strong>Missing:</strong>{" "}
                      {feedback.missingPoints.map(formatAIValue).join(", ")}
                    </p>
                  )}
                  {feedback.betterAnswer && (
                    <p className="mt-2">
                      <strong>Better answer:</strong>{" "}
                      {formatAIValue(feedback.betterAnswer)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PracticePanel({
  currentQuestion,
  questions,
  level,
  timeLeft,
  formattedTime,
  currentPrompt,
  currentAnswer,
  answers,
  updateAnswer,
  goToQuestion,
  goToNextQuestion,
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <h2 className="mt-1 text-2xl font-bold capitalize text-white">
            {level} Level
          </h2>
        </div>

        <div
          className={`rounded-2xl px-5 py-3 text-center font-bold ring-1 ${
            timeLeft === 0
              ? "bg-rose-400/10 text-rose-100 ring-rose-300/15"
              : "bg-blue-400/10 text-blue-100 ring-blue-300/15"
          }`}
        >
          <p className="flex items-center justify-center gap-2 text-xs uppercase">
            <Timer size={14} />
            Timer
          </p>
          <p className="text-2xl">{formattedTime}</p>
        </div>
      </div>

      <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.065] p-5">
        <p className="text-xl font-bold leading-8 text-white">{currentPrompt}</p>
      </div>

      <label className="mt-5 block text-sm font-bold text-white">
        Your Answer
      </label>
      <textarea
        rows="9"
        value={currentAnswer}
        onChange={(e) => updateAnswer(e.target.value)}
        disabled={timeLeft === 0}
        placeholder="Write your answer here..."
        className="mt-3 w-full resize-none rounded-2xl border border-white/70 bg-white/95 p-4 text-sm font-semibold leading-6 text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-300/80 focus:ring-4 focus:ring-blue-400/20 disabled:bg-slate-200 disabled:text-slate-500"
      />

      {timeLeft === 0 && (
        <p className="mt-3 rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm font-semibold text-rose-100">
          Time is up for this question. Move to the next question or finish.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goToQuestion(Math.max(currentQuestion - 1, 0))}
          disabled={currentQuestion === 0}
          className="rounded-2xl border border-white/10 bg-white/[0.075] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/[0.11] disabled:opacity-45"
        >
          Previous
        </button>

        <div className="flex flex-wrap gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToQuestion(index)}
              className={`grid size-10 place-items-center rounded-full text-sm font-bold transition ${
                currentQuestion === index
                  ? "bg-white text-slate-950"
                  : answers[index]
                    ? "bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/15"
                    : "bg-white/[0.075] text-slate-300 ring-1 ring-white/10"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={goToNextQuestion}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#EC4899] px-5 py-2.5 text-sm font-bold text-white"
        >
          <ClipboardCheck size={18} />
          {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
