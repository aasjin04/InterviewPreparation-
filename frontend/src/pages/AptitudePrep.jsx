import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  RotateCcw,
  Shuffle,
  XCircle,
} from "lucide-react";
import { useResume } from "../context/ResumeContext";
import { fetchAptitudeQuestions } from "../services/aptitude";
import { saveToolResult } from "../services/toolResults";

const questionCounts = [10, 15, 20, 40];

export default function AptitudePrep() {
  const { activeResume } = useResume();
  const [questionCount, setQuestionCount] = useState(15);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState("");

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : "";
  const answeredCount = Object.keys(answers).length;
  const correctCount = useMemo(
    () =>
      questions.filter((question) => answers[question.id] === question.answer)
        .length,
    [answers, questions],
  );
  const percentage = questions.length
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  const loadQuiz = async (nextCount = questionCount) => {
    setQuestionCount(nextCount);
    setLoadingQuestions(true);
    setLoadError("");
    setCurrentIndex(0);
    setAnswers({});
    setFinished(false);

    try {
      const nextQuestions = await fetchAptitudeQuestions(nextCount);
      setQuestions(nextQuestions);
    } catch (error) {
      setLoadError(
        error.response?.data?.message ||
          "Unable to load aptitude questions from database.",
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    fetchAptitudeQuestions(15)
      .then((nextQuestions) => {
        if (!ignore) setQuestions(nextQuestions);
      })
      .catch((error) => {
        if (!ignore) {
          setLoadError(
            error.response?.data?.message ||
              "Unable to load aptitude questions from database.",
          );
        }
      })
      .finally(() => {
        if (!ignore) setLoadingQuestions(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const restartQuiz = (nextCount = questionCount) => {
    loadQuiz(nextCount);
  };

  const selectAnswer = (option) => {
    if (!currentQuestion) return;
    if (answers[currentQuestion.id]) return;

    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: option,
    }));
  };

  const goNext = () => {
    if (!currentQuestion) return;

    if (currentIndex === questions.length - 1) {
      finishQuiz();
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  const finishQuiz = async () => {
    setFinished(true);

    if (!activeResume?.text?.trim()) return;

    setSaving(true);

    const result = {
      score: percentage,
      correct: correctCount,
      total: questions.length,
      completedAt: new Date().toISOString(),
      answers: questions.map((question) => ({
        id: question.id,
        category: question.category,
        question: question.question,
        selectedAnswer: answers[question.id] || "",
        correctAnswer: question.answer,
        isCorrect: answers[question.id] === question.answer,
      })),
    };

    saveToolResult("aptitude", activeResume, result)
      .catch((error) => {
        console.log(error.response?.data || error);
      })
      .finally(() => setSaving(false));
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#12182A] px-4 py-5 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes aptitudeFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes aptitudeGlow {
          0%, 100% { opacity: 0.45; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: 0.85; transform: translate3d(18px, -14px, 0) scale(1.08); }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#60A5FA]/28 blur-[115px] animate-[aptitudeGlow_8s_ease-in-out_infinite]" />
        <div className="absolute right-8 top-24 h-80 w-80 rounded-full bg-[#A78BFA]/24 blur-[125px] animate-[aptitudeGlow_9s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-[#F59E0B]/16 blur-[135px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px] opacity-18" />
      </div>

      <section className="relative mx-auto max-w-[1380px] animate-[aptitudeFadeUp_0.65s_ease-out_both]">
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

        <header className="mb-4 rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-black/10 backdrop-blur-xl">
                <Briefcase size={16} className="text-amber-300" />
                Aptitude Preparation
              </div>
              <h1 className="mt-2 pb-2 text-4xl font-semibold leading-[1.16] tracking-tight text-white md:text-5xl md:leading-[1.14]">
                Practice shuffled aptitude questions
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200/90 md:text-base">
                Questions are picked randomly from your bank. Select an option
                to instantly check whether your answer is correct.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 ring-1 ring-white/10">
              <p className="mb-2 text-sm font-bold text-white">Question set</p>
              <div className="grid grid-cols-4 gap-2">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => restartQuiz(count)}
                    className={`rounded-2xl px-3 py-2 text-sm font-bold transition ${
                      questionCount === count
                        ? "bg-white text-slate-950"
                        : "bg-white/8 text-slate-300 hover:bg-white/12 hover:text-white"
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            {loadingQuestions ? (
              <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <Loader2 className="mx-auto animate-spin text-blue-200" size={34} />
                  <p className="mt-4 text-sm font-bold text-white">
                    Loading shuffled questions from database
                  </p>
                </div>
              </div>
            ) : loadError ? (
              <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <p className="text-lg font-bold text-white">{loadError}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Run the aptitude seed script once, then refresh this page.
                  </p>
                  <button
                    type="button"
                    onClick={() => restartQuiz(questionCount)}
                    className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : !questions.length ? (
              <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <p className="text-lg font-bold text-white">
                    No aptitude questions found
                  </p>
                  <p className="mt-2 text-sm text-slate-300">
                    Seed the PDF questions into MongoDB, then reload the quiz.
                  </p>
                  <button
                    type="button"
                    onClick={() => restartQuiz(questionCount)}
                    className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
                  >
                    Reload questions
                  </button>
                </div>
              </div>
            ) : finished ? (
              <ResultPanel
                correctCount={correctCount}
                percentage={percentage}
                questions={questions}
                answers={answers}
                restartQuiz={restartQuiz}
                saving={saving}
              />
            ) : (
              <QuestionPanel
                currentIndex={currentIndex}
                question={currentQuestion}
                questions={questions}
                selectedAnswer={selectedAnswer}
                selectAnswer={selectAnswer}
                goNext={goNext}
                finishQuiz={finishQuiz}
              />
            )}
          </section>

          <aside className="grid gap-4">
            <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/15">
                  <BarChart3 size={20} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">Live score</p>
                  <p className="text-xs font-semibold text-slate-400">
                    Updates after every answer
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <ScoreMini label="Correct" value={correctCount} tone="text-emerald-200" />
                <ScoreMini label="Answered" value={answeredCount} tone="text-blue-200" />
                <ScoreMini label="Score" value={`${percentage}%`} tone="text-amber-200" />
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 via-blue-400 to-emerald-300 transition-all duration-500"
                  style={{
                    width: questions.length
                      ? `${(answeredCount / questions.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
              <p className="text-sm font-bold text-white">Question navigator</p>
              <div className="mt-4 grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const answered = answers[question.id];
                  const correct = answered === question.answer;

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => {
                        if (!finished) setCurrentIndex(index);
                      }}
                      className={`grid size-10 place-items-center rounded-2xl text-sm font-bold transition ${
                        index === currentIndex && !finished
                          ? "bg-white text-slate-950"
                          : answered
                            ? correct
                              ? "bg-emerald-400/18 text-emerald-100 ring-1 ring-emerald-300/15"
                              : "bg-rose-400/18 text-rose-100 ring-1 ring-rose-300/15"
                            : "bg-white/8 text-slate-400 ring-1 ring-white/10"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => restartQuiz(questionCount)}
              disabled={loadingQuestions}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.075] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.12]"
            >
              <Shuffle size={17} />
              Shuffle new set
            </button>
          </aside>
        </div>
      </section>
    </main>
  );
}

function QuestionPanel({
  currentIndex,
  question,
  questions,
  selectedAnswer,
  selectAnswer,
  goNext,
  finishQuiz,
}) {
  const isCorrect = selectedAnswer === question.answer;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <span className="mt-2 inline-flex rounded-full bg-amber-400/12 px-3 py-1 text-xs font-bold text-amber-100 ring-1 ring-amber-300/15">
            {question.category}
          </span>
        </div>

        <button
          type="button"
          onClick={finishQuiz}
          className="rounded-2xl border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/[0.12]"
        >
          Finish test
        </button>
      </div>

      <h2 className="text-2xl font-semibold leading-9 text-white">
        {question.question}
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => {
          const selected = selectedAnswer === option;
          const correctOption = question.answer === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => selectAnswer(option)}
              disabled={Boolean(selectedAnswer)}
              className={`rounded-2xl border p-4 text-left text-sm font-bold leading-6 transition ${
                selectedAnswer
                  ? correctOption
                    ? "border-emerald-300/30 bg-emerald-400/12 text-emerald-50"
                    : selected
                      ? "border-rose-300/30 bg-rose-400/12 text-rose-50"
                      : "border-white/10 bg-white/[0.05] text-slate-400"
                  : "border-white/10 bg-white/[0.075] text-slate-100 hover:-translate-y-0.5 hover:bg-white/[0.12]"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selectedAnswer && (
        <div
          className={`mt-5 rounded-2xl border p-4 ${
            isCorrect
              ? "border-emerald-300/20 bg-emerald-400/10"
              : "border-rose-300/20 bg-rose-400/10"
          }`}
        >
          <p
            className={`flex items-center gap-2 text-sm font-bold ${
              isCorrect ? "text-emerald-100" : "text-rose-100"
            }`}
          >
            {isCorrect ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
            {isCorrect ? "Correct answer" : `Wrong answer. Correct: ${question.answer}`}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {question.explanation}
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={goNext}
          disabled={!selectedAnswer}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {currentIndex === questions.length - 1 ? "Show result" : "Next question"}
          <ArrowRight size={17} />
        </button>
      </div>
    </div>
  );
}

function ResultPanel({ correctCount, percentage, questions, answers, restartQuiz, saving }) {
  return (
    <div>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.065] p-5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-200">
          Test completed
        </p>
        <h2 className="mt-3 text-5xl font-black text-white">
          {percentage}
          <span className="text-2xl text-blue-200">%</span>
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-300">
          You answered {correctCount} out of {questions.length} questions correctly.
        </p>
        {saving && (
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-blue-100">
            <Loader2 size={16} className="animate-spin" />
            Saving result to dashboard
          </p>
        )}
      </div>

      <div className="mt-5 grid gap-3">
        {questions.map((question, index) => {
          const selected = answers[question.id];
          const correct = selected === question.answer;

          return (
            <div
              key={question.id}
              className="rounded-2xl border border-white/10 bg-white/[0.065] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold leading-6 text-white">
                  {index + 1}. {question.question}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                    correct
                      ? "bg-emerald-400/12 text-emerald-100"
                      : "bg-rose-400/12 text-rose-100"
                  }`}
                >
                  {correct ? "Correct" : "Wrong"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-300">
                Your answer: {selected || "Not answered"} | Correct answer:{" "}
                {question.answer}
              </p>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => restartQuiz()}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
      >
        <RotateCcw size={17} />
        Retest with shuffled questions
      </button>
    </div>
  );
}

function ScoreMini({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.065] px-3 py-3">
      <p className={`text-lg font-black ${tone}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}
