import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import { useResume } from "../context/ResumeContext";
import {
  getInterviewQuestionsFromAnalysis,
  getOrCreateResumeAnalysis,
} from "../utils/resumeAnalysis";
import {
  buildLocalInterviewFeedback,
  getAIInterviewFeedback,
} from "../utils/interviewFeedback";
import { formatAIValue } from "../utils/displayValue";
import { saveToolResult } from "../services/toolResults";

export default function AIInterview() {
  const { activeResume } = useResume();

  const [questionCount, setQuestionCount] = useState(5);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackReport, setFeedbackReport] = useState(null);

  const recognitionRef = useRef(null);

  const progressPercent = useMemo(() => {
    if (!questions.length) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const speakText = (text) => {
    if (!text) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const speakCurrentQuestion = () => {
    speakText(questions[currentIndex]);
  };

  const startVoiceAnswer = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported. Please use Google Chrome.");
      return;
    }

    window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer((prev) => `${prev} ${transcript}`.trim());
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === "network") {
        alert(
          "Speech recognition needs a stable internet connection. Please try again or type your answer manually.",
        );
      }
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const stopVoiceAnswer = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
  };

  const startInterview = async () => {
    if (!activeResume?.text?.trim()) {
      alert("Please select an active resume first.");
      return;
    }

    setLoading(true);
    setAnswers([]);
    setAnswer("");
    setCurrentIndex(0);
    setShowReport(false);
    setFeedbackReport(null);

    try {
      const analysis = await getOrCreateResumeAnalysis(activeResume);
      const aiQuestions = getInterviewQuestionsFromAnalysis(analysis, {
        count: questionCount,
      });

      if (!aiQuestions.length) {
        alert("No questions generated. Please try again.");
        return;
      }

      setQuestions(aiQuestions);
      setStarted(true);

      setTimeout(() => {
        speakText(
          `Welcome to your Nourique AI interview. Question 1. ${aiQuestions[0]}`,
        );
      }, 600);
    } catch (error) {
      console.log(error.response?.data || error);
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to generate interview questions.",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async () => {
    if (isListening) stopVoiceAnswer();
    window.speechSynthesis.cancel();

    const updatedAnswers = [
      ...answers,
      {
        question: questions[currentIndex],
        answer,
      },
    ];

    setAnswers(updatedAnswers);
    setAnswer("");

    if (currentIndex === questions.length - 1) {
      setFeedbackLoading(true);

      try {
        const report = await getAIInterviewFeedback({
          resumeText: activeResume.text,
          interviewType: "AI Interview",
          answers: updatedAnswers,
        });

        setFeedbackReport(report);
        saveToolResult("aiInterview", activeResume, {
          questions,
          answers: updatedAnswers,
          feedbackReport: report,
          questionCount,
        }).catch((saveError) => {
          console.log(saveError.response?.data || saveError);
        });
      } catch (error) {
        console.log(error.response?.data || error);
        alert(
          "AI feedback could not be generated right now. Showing basic feedback instead.",
        );
        const fallbackReport = buildLocalInterviewFeedback(updatedAnswers);
        setFeedbackReport(fallbackReport);
        saveToolResult("aiInterview", activeResume, {
          questions,
          answers: updatedAnswers,
          feedbackReport: fallbackReport,
          questionCount,
        }).catch((saveError) => {
          console.log(saveError.response?.data || saveError);
        });
      } finally {
        setFeedbackLoading(false);
        setStarted(false);
        setShowReport(true);
      }
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    setTimeout(() => {
      speakText(`Question ${nextIndex + 1}. ${questions[nextIndex]}`);
    }, 500);
  };

  const restartInterview = () => {
    window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();

    setStarted(false);
    setCurrentIndex(0);
    setAnswer("");
    setAnswers([]);
    setShowReport(false);
    setIsListening(false);
    setIsSpeaking(false);
    setQuestions([]);
    setFeedbackReport(null);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#101626] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-[-12%] top-[-16%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute right-[-10%] top-24 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-[-18%] left-1/3 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/#tools"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-white/12"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore more tools
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-slate-200 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-white/12"
          >
            <LayoutDashboard className="h-4 w-4" />
            Go to dashboard
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/14 bg-white/9 p-4 shadow-2xl shadow-black/25 backdrop-blur-2xl sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

          <div className="relative md:pr-[280px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100">
              <Bot className="h-4 w-4 text-blue-300" />
              AI Interview Coach
            </div>

            <h1 className="mt-5 max-w-3xl pb-2 text-4xl font-black leading-[1.12] tracking-tight text-slate-50 sm:text-5xl sm:leading-[1.1] lg:text-6xl lg:leading-[1.08]">
              Practice a live{" "}
              <span className="bg-gradient-to-r from-blue-300 via-violet-300 to-emerald-200 bg-clip-text text-transparent">
                resume-based
              </span>{" "}
              interview
            </h1>

            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-300 sm:text-lg">
              Nourique asks questions from your active resume, listens to your
              answer, and creates a final report with AI feedback for every
              response.
            </p>

            <SelectedResume resume={activeResume} />
          </div>

          {!started && !showReport && (
            <StartPanel
              activeResume={activeResume}
              loading={loading}
              questionCount={questionCount}
              setQuestionCount={setQuestionCount}
              startInterview={startInterview}
            />
          )}

          {started && !showReport && (
            <InterviewPanel
              answer={answer}
              currentIndex={currentIndex}
              feedbackLoading={feedbackLoading}
              isListening={isListening}
              isSpeaking={isSpeaking}
              progressPercent={progressPercent}
              question={questions[currentIndex]}
              questions={questions}
              saveAnswer={saveAnswer}
              setAnswer={setAnswer}
              speakCurrentQuestion={speakCurrentQuestion}
              startVoiceAnswer={startVoiceAnswer}
              stopVoiceAnswer={stopVoiceAnswer}
            />
          )}

          {showReport && (
            <ReportPanel
              answers={answers}
              feedbackReport={feedbackReport}
              restartInterview={restartInterview}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function SelectedResume({ resume }) {
  return (
    <div className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-white/12 bg-white/8 p-3 shadow-lg shadow-black/10 md:absolute md:right-0 md:top-0 md:mt-0 md:w-[250px]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/20">
        <FileText className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Selected resume
        </p>
        <p className="truncate text-sm font-semibold text-slate-50">
          {resume?.fileName || "Resume needed"}
        </p>
      </div>
    </div>
  );
}

function StartPanel({
  activeResume,
  loading,
  questionCount,
  setQuestionCount,
  startInterview,
}) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[1.5rem] border border-white/12 bg-[#151C30]/85 p-5 shadow-xl shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-50">
              Interview setup
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Questions come from your master resume analysis, no target role
              needed.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[240px_1fr] sm:items-end">
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">
              Number of questions
            </span>
            <input
              type="number"
              min="1"
              max="10"
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(
                  Math.min(10, Math.max(1, Number(e.target.value))),
                )
              }
              className="mt-2 h-12 w-full rounded-2xl border border-white/12 bg-white/95 px-4 text-base font-semibold text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-4 focus:ring-blue-400/15"
            />
          </label>

          <button
            onClick={startInterview}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing questions
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start AI interview
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5">
        <p className="text-sm font-semibold text-slate-100">Session flow</p>
        <div className="mt-4 space-y-3 text-sm font-semibold text-slate-300">
          <FlowItem label="AI reads each question aloud" />
          <FlowItem label="You can answer by voice or typing" />
          <FlowItem label="Final report gives AI feedback" />
        </div>
        {!activeResume?.text?.trim() && (
          <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-sm font-semibold text-amber-100">
            Select one active resume before starting.
          </div>
        )}
      </div>
    </div>
  );
}

function InterviewPanel({
  answer,
  currentIndex,
  feedbackLoading,
  isListening,
  isSpeaking,
  progressPercent,
  question,
  questions,
  saveAnswer,
  setAnswer,
  speakCurrentQuestion,
  startVoiceAnswer,
  stopVoiceAnswer,
}) {
  return (
    <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="rounded-[1.5rem] border border-white/12 bg-[#151C30]/90 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
              Question {currentIndex + 1} of {questions.length}
            </p>
            <h2 className="mt-3 max-w-4xl text-2xl font-semibold leading-tight text-slate-50 sm:text-3xl">
              {question}
            </h2>
          </div>
          <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Progress
            </p>
            <p className="text-2xl font-semibold text-blue-200">
              {progressPercent}%
            </p>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-300 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Speak or type your answer here..."
          rows="8"
          className="mt-5 w-full resize-none rounded-[1.25rem] border border-white/12 bg-white/95 p-4 text-base font-semibold leading-7 text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-300 focus:ring-4 focus:ring-blue-400/15"
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={speakCurrentQuestion}
            disabled={isSpeaking || feedbackLoading}
            className="inline-flex items-center gap-2 rounded-2xl border border-blue-300/25 bg-blue-400/12 px-4 py-3 text-sm font-semibold text-blue-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Volume2 className="h-4 w-4" />
            {isSpeaking ? "Speaking..." : "Speak question"}
          </button>

          {!isListening ? (
            <button
              onClick={startVoiceAnswer}
              disabled={feedbackLoading}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/12 px-4 py-3 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Mic className="h-4 w-4" />
              Start voice answer
            </button>
          ) : (
            <button
              onClick={stopVoiceAnswer}
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-300/25 bg-rose-400/12 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:-translate-y-0.5"
            >
              <MicOff className="h-4 w-4" />
              Stop voice answer
            </button>
          )}

          <button
            onClick={saveAnswer}
            disabled={feedbackLoading}
            className="ml-auto inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {feedbackLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing AI report
              </>
            ) : currentIndex === questions.length - 1 ? (
              <>
                <ClipboardCheck className="h-4 w-4" />
                Finish interview
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Save and next
              </>
            )}
          </button>
        </div>
      </div>

      <aside className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5">
        <p className="text-sm font-semibold text-slate-100">Question path</p>
        <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-3">
          {questions.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className={`flex h-10 items-center justify-center rounded-2xl text-sm font-semibold transition ${
                index === currentIndex
                  ? "bg-blue-400 text-slate-950 shadow-lg shadow-blue-900/20"
                  : index < currentIndex
                    ? "bg-emerald-400/18 text-emerald-100"
                    : "bg-white/8 text-slate-400"
              }`}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-4">
          <p className="text-sm font-semibold text-slate-100">Voice status</p>
          <p className="mt-2 text-sm font-semibold text-slate-400">
            {isListening
              ? "Listening to your answer..."
              : isSpeaking
                ? "Nourique is reading the question..."
                : "Ready for your next response."}
          </p>
        </div>
      </aside>
    </div>
  );
}

function ReportPanel({ answers, feedbackReport, restartInterview }) {
  return (
    <div className="mt-8">
      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-[1.5rem] border border-white/12 bg-[#151C30]/90 p-5 shadow-xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">
            Interview report
          </p>
          <p className="mt-4 text-6xl font-bold text-slate-50">
            {feedbackReport?.overallScore || 0}
            <span className="text-2xl text-blue-200">%</span>
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
            {formatAIValue(feedbackReport?.overallFeedback) ||
              "Your interview report is ready. Review each answer below and improve the weak areas first."}
          </p>
          <button
            onClick={restartInterview}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            Restart interview
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <MiniReportCard
            label="Strengths"
            value={feedbackReport?.strengths?.length || 0}
            tone="text-emerald-200"
            text="Good points detected from your spoken or typed answers."
          />
          <MiniReportCard
            label="Improve"
            value={feedbackReport?.improvements?.length || 0}
            tone="text-violet-200"
            text="Focused corrections to make your answers more complete."
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {answers.map((item, index) => {
          const feedback = feedbackReport?.answers?.[index];

          return (
            <div
              key={`${item.question}-${index}`}
              className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5 shadow-lg shadow-black/10"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold leading-6 text-slate-50">
                  Q{index + 1}. {item.question}
                </h3>
                <span className="shrink-0 rounded-full bg-blue-400/15 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-blue-300/20">
                  {feedback?.score ?? 0}/10
                </span>
              </div>

              <p className="mt-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm font-semibold leading-6 text-slate-300">
                <span className="font-semibold text-slate-100">Your answer: </span>
                {item.answer || "No answer submitted."}
              </p>

              <p className="mt-4 text-sm font-semibold leading-6 text-slate-300">
                <span className="font-semibold text-blue-100">AI feedback: </span>
                {formatAIValue(feedback?.feedback) ||
                  "Feedback not available for this answer."}
              </p>

              {feedback?.missingPoints?.length > 0 && (
                <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                  <p className="text-sm font-semibold text-amber-100">
                    Missing points
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-amber-50/85">
                    {feedback.missingPoints.map(formatAIValue).join(", ")}
                  </p>
                </div>
              )}

              {feedback?.betterAnswer && (
                <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                  <p className="text-sm font-semibold text-emerald-100">
                    Better answer
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-emerald-50/85">
                    {formatAIValue(feedback.betterAnswer)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FlowItem({ label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-blue-300 to-emerald-300 shadow-[0_0_18px_rgba(96,165,250,0.55)]" />
      <span>{label}</span>
    </div>
  );
}

function MiniReportCard({ label, value, tone, text }) {
  return (
    <div className="rounded-[1.5rem] border border-white/12 bg-white/8 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className={`mt-3 text-4xl font-bold ${tone}`}>{value}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}
