import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useResume } from "../context/ResumeContext";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock3,
  FilePlus,
  FileText,
  Home,
  LayoutDashboard,
  Loader2,
  Mic,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import {
  loadToolResultSummary,
  saveToolResult,
} from "../services/toolResults";
import { formatAIValue } from "../utils/displayValue";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const panelClass =
  "rounded-[24px] border border-white/10 bg-[#0F1A2B]/92 text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl";

const heroPanelClass =
  "rounded-[24px] border border-white/10 bg-white/[0.07] text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl";

const toolCards = [
  {
    key: "builder",
    title: "Smart Resume Builder",
    description: "Generate a cleaner ATS-friendly resume from your active PDF.",
    icon: FilePlus,
    to: "/builder",
    tone: "blue",
  },
  {
    key: "ats",
    title: "ATS Score Checker",
    description: "Check score, strengths, weak areas, keywords, and suggestions.",
    icon: ShieldCheck,
    to: "/ats-checker",
    tone: "emerald",
  },
  {
    key: "analyzer",
    title: "AI Resume Analyzer",
    description: "Map your resume against a target role and track missing skills.",
    icon: SearchCheck,
    to: "/analyzer",
    tone: "violet",
  },
  {
    key: "mockInterview",
    title: "Mock Interview",
    description: "Practice resume-based questions with answer review and feedback.",
    icon: Mic,
    to: "/mock-interview",
    tone: "rose",
  },
  {
    key: "aiInterview",
    title: "AI Interview",
    description: "Run a guided interview round and generate a final report.",
    icon: Bot,
    to: "/ai-interview",
    tone: "indigo",
  },
  {
    key: "aptitude",
    title: "Aptitude Prep",
    description: "Practice shuffled quantitative and reasoning questions.",
    icon: Briefcase,
    to: "/aptitude-prep",
    tone: "amber",
  },
];

const resultTypes = [
  "ats",
  "builder",
  "analyzer",
  "mockInterview",
  "aiInterview",
  "aptitude",
];

const resultMeta = {
  ats: {
    title: "ATS Score Checker",
    icon: ShieldCheck,
    to: "/ats-checker",
    tone: "emerald",
  },
  builder: {
    title: "Smart Resume Builder",
    icon: FilePlus,
    to: "/builder",
    tone: "blue",
  },
  analyzer: {
    title: "AI Resume Analyzer",
    icon: SearchCheck,
    to: "/analyzer",
    tone: "violet",
  },
  mockInterview: {
    title: "Mock Interview",
    icon: Mic,
    to: "/mock-interview",
    tone: "rose",
  },
  aiInterview: {
    title: "AI Interview",
    icon: Bot,
    to: "/ai-interview",
    tone: "indigo",
  },
  aptitude: {
    title: "Aptitude Prep",
    icon: Briefcase,
    to: "/aptitude-prep",
    tone: "amber",
  },
};

const toneStyles = {
  blue: {
    soft: "bg-blue-50 text-blue-700 ring-blue-100",
    bar: "from-blue-500 to-sky-400",
    border: "hover:border-blue-200 hover:shadow-blue-500/10",
  },
  emerald: {
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    bar: "from-emerald-500 to-teal-400",
    border: "hover:border-emerald-200 hover:shadow-emerald-500/10",
  },
  violet: {
    soft: "bg-violet-50 text-violet-700 ring-violet-100",
    bar: "from-violet-500 to-fuchsia-400",
    border: "hover:border-violet-200 hover:shadow-violet-500/10",
  },
  rose: {
    soft: "bg-rose-50 text-rose-700 ring-rose-100",
    bar: "from-rose-500 to-pink-400",
    border: "hover:border-rose-200 hover:shadow-rose-500/10",
  },
  indigo: {
    soft: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    bar: "from-indigo-500 to-blue-400",
    border: "hover:border-indigo-200 hover:shadow-indigo-500/10",
  },
  amber: {
    soft: "bg-amber-50 text-amber-700 ring-amber-100",
    bar: "from-amber-500 to-orange-400",
    border: "hover:border-amber-200 hover:shadow-amber-500/10",
  },
};

function getScore(result) {
  const values = [
    result?.score,
    result?.atsScore,
    result?.overallScore,
    result?.resumeScore,
  ];

  for (const value of values) {
    if (value === undefined || value === null) continue;
    const match = String(value).match(/\d+/);
    if (match) return Math.min(Number(match[0]), 100);
  }

  return null;
}

function formatDate(date) {
  if (!date) return "Not used yet";

  try {
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Recently updated";
  }
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n|\u2022|\u00e2\u20ac\u00a2/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof value === "object") return Object.values(value).filter(Boolean);
  return [value];
}

function getResultSummary(type, result) {
  if (!result) return "No saved result yet. Open this tool once and its output will stay here.";

  if (type === "ats") {
    const strengths = normalizeList(result.strengths).slice(0, 2);
    const weaknesses = normalizeList(result.weaknesses).slice(0, 1);
    return formatAIValue(strengths[0] || weaknesses[0] || result.summary || "ATS result saved.");
  }

  if (type === "builder") {
    return formatAIValue(
      normalizeList(result.improvements)[0] ||
        result.summary ||
        "Improved resume draft is saved.",
    );
  }

  if (type === "analyzer") {
    return formatAIValue(
      normalizeList(result.missingSkills)[0] ||
        result.summary ||
        "Skill gap analysis is saved.",
    );
  }

  if (type === "aptitude") {
    return `${result.correct || 0} correct out of ${
      result.total || 0
    }. Latest score: ${result.score ?? 0}%.`;
  }

  const report = result.feedbackReport || result.report || result;
  return formatAIValue(
    report.overallFeedback ||
      normalizeList(report.improvements)[0] ||
      "Interview feedback is saved.",
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { activeResume, saveActiveResume } = useResume();
  const [toolResults, setToolResults] = useState({});
  const [resultsLoading, setResultsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const displayName =
    user?.fullName || user?.name || user?.email?.split("@")[0] || "Candidate";

  const firstName = displayName.split(" ")[0];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const wordCount = activeResume?.text
    ? activeResume.text.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const completedTools = useMemo(
    () => Object.values(toolResults).filter(Boolean).length,
    [toolResults],
  );

  const atsScore = getScore(toolResults.ats?.result);
  const readiness = activeResume ? Math.min(25 + completedTools * 15, 100) : 0;
  const nextRecommendedTool = activeResume
    ? toolCards.find((tool) => tool.to && !toolResults[tool.key]) || toolCards[1]
    : toolCards[0];
  const analyzerResult = toolResults.analyzer?.result;
  const matchedSkills = normalizeList(analyzerResult?.matchedSkills)
    .map(formatAIValue)
    .filter(Boolean);
  const missingSkills = normalizeList(analyzerResult?.missingSkills).map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return {
        skill: formatAIValue(item.skill || item.name || item.title || item),
        reason: formatAIValue(item.reason || item.details || item.description),
      };
    }

    return { skill: formatAIValue(item), reason: "" };
  });
  const completedTrackedSkills =
    toolResults.analyzer?.input?.completedSkills || [];
  const trackerTotal = matchedSkills.length + missingSkills.length;
  const trackerProgress = trackerTotal
    ? Math.round(
        ((matchedSkills.length + completedTrackedSkills.length) / trackerTotal) *
          100,
      )
    : 0;

  useEffect(() => {
    let isMounted = true;

    if (!activeResume?.text?.trim()) {
      queueMicrotask(() => setToolResults({}));
      return undefined;
    }

    queueMicrotask(() => setResultsLoading(true));

    loadToolResultSummary(activeResume)
      .then((results) => {
        if (!isMounted) return;
        const latestByType = Object.fromEntries(
          resultTypes.map((type) => [
            type,
            results.find((item) => item.toolType === type) || null,
          ]),
        );
        setToolResults(latestByType);
      })
      .catch((error) => {
        console.log(error.response?.data || error);
      })
      .finally(() => {
        if (isMounted) setResultsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeResume]);

  const extractPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + " ";
    }

    return text;
  };

  const toggleTrackedSkill = (skill) => {
    if (!activeResume?.text?.trim() || !toolResults.analyzer?.result) return;

    const nextCompletedSkills = completedTrackedSkills.includes(skill)
      ? completedTrackedSkills.filter((item) => item !== skill)
      : [...completedTrackedSkills, skill];

    const nextAnalyzerResult = {
      ...toolResults.analyzer,
      input: {
        ...toolResults.analyzer.input,
        completedSkills: nextCompletedSkills,
      },
    };

    setToolResults((current) => ({
      ...current,
      analyzer: nextAnalyzerResult,
    }));

    saveToolResult("analyzer", activeResume, toolResults.analyzer.result, {
      ...(toolResults.analyzer.input || {}),
      completedSkills: nextCompletedSkills,
    }).catch((error) => {
      console.log(error.response?.data || error);
    });
  };

  const handleActiveResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    setUploading(true);

    try {
      const text = await extractPdfText(file);
      saveActiveResume({
        fileName: file.name,
        text,
        uploadedAt: new Date().toISOString(),
      });
      alert("Active resume updated successfully!");
    } catch (error) {
      console.log(error);
      alert("Unable to read this PDF. Please try another PDF.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-[#070B14] text-white">
      <style>{`
        @keyframes dashboardFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes dashboardSweep {
          from { transform: translateX(-120%); }
          to { transform: translateX(120%); }
        }

        .dashboard-enter {
          animation: dashboardFadeUp 0.58s cubic-bezier(.2,.8,.2,1) both;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(59,130,246,0.24),transparent_32%),radial-gradient(circle_at_86%_4%,rgba(16,185,129,0.16),transparent_28%),linear-gradient(180deg,#0B1220_0%,#070B14_45%,#05070D_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />

      <section className="relative mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8">
        <nav className="dashboard-enter mb-4 flex min-h-14 items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-white/[0.07] px-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Home size={16} />
            Home
          </Link>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-300 sm:flex">
            <LayoutDashboard size={15} />
            Premium Dashboard
          </div>

          <Link
            to="/#tools"
            className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-400 active:translate-y-0"
          >
            Explore tools
            <ArrowRight size={16} />
          </Link>
        </nav>

        <header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className={`${heroPanelClass} dashboard-enter overflow-hidden p-5 sm:p-6`}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill icon={Sparkles} label="Premium workspace" tone="blue" />
              <StatusPill
                icon={Calendar}
                label={new Date().toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
                tone="slate"
              />
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-end">
              <div>
                <p className="text-sm font-bold text-blue-200">
                  {greeting}, {firstName}
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Your career cockpit, cleaned up.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  A focused view for your resume, scores, saved feedback, and
                  next move. Less clutter, more signal.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={activeResume ? nextRecommendedTool.to || "/#tools" : "/#hero"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0"
                  >
                    {activeResume ? `Open ${nextRecommendedTool.title}` : "Upload resume first"}
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/#tools"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-[#162239] px-5 py-3 text-sm font-black text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-[#1A2942] active:translate-y-0"
                  >
                    Explore other tools
                  </Link>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-[#101B2E] p-4 text-white shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/45">
                      Next action
                    </p>
                    <h2 className="mt-1 text-lg font-bold">
                      {activeResume
                        ? nextRecommendedTool.title
                        : "Upload active resume"}
                    </h2>
                  </div>
                  <span className="grid size-11 place-items-center rounded-2xl bg-blue-400/10 text-blue-200 shadow-sm">
                    <Zap size={18} />
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  {activeResume
                    ? nextRecommendedTool.description
                    : "Set one PDF as the source for every tool in this workspace."}
                </p>
              </div>
            </div>
          </section>

          <ActiveResumeCard
            activeResume={activeResume}
            wordCount={wordCount}
            uploading={uploading}
            onUpload={handleActiveResumeUpload}
          />
        </header>

        <section className="dashboard-enter mt-4 grid grid-cols-2 gap-3 [animation-delay:80ms] lg:grid-cols-4">
          <MetricCard
            icon={ShieldCheck}
            label="ATS score"
            value={atsScore ?? "--"}
            suffix={atsScore ? "/100" : ""}
            hint={atsScore ? "Last saved scan" : "Run ATS checker"}
            tone="blue"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Tools completed"
            value={completedTools}
            suffix="/6"
            hint={resultsLoading ? "Checking history" : "Saved results"}
            tone="emerald"
          />
          <MetricCard
            icon={FileText}
            label="Resume words"
            value={wordCount ? wordCount.toLocaleString() : "--"}
            hint={activeResume ? "From active resume" : "Upload PDF"}
            tone="violet"
          />
          <MetricCard
            icon={TrendingUp}
            label="Readiness"
            value={readiness}
            suffix="%"
            hint={activeResume ? "Based on progress" : "Resume needed"}
            tone="rose"
          />
        </section>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="grid gap-4">
            <section className={`${panelClass} dashboard-enter p-5 [animation-delay:130ms] sm:p-6`}>
              <SectionHeading
                eyebrow="Saved results"
                title="Latest AI feedback"
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    {resultsLoading && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                        <Loader2 size={15} className="animate-spin" />
                        Loading
                      </span>
                    )}
                    <Link
                      to="/#tools"
                      className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2.5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-blue-400"
                    >
                      Explore other tools
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                }
              />

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {resultTypes.map((type, index) => (
                  <ResultCard
                    key={type}
                    type={type}
                    result={toolResults[type]}
                    activeResume={activeResume}
                    index={index}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="grid content-start gap-4">
            <section className={`${panelClass} dashboard-enter p-5 [animation-delay:220ms] sm:p-6`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-violet-200">
                    Preparation score
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                    Resume readiness
                  </h2>
                </div>
                <ProgressRing value={readiness} />
              </div>

              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-violet-500 to-emerald-400 transition-all duration-700"
                  style={{ width: `${readiness}%` }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                {activeResume
                  ? "Run more tools and save results to move this readiness score higher."
                  : "Upload one active resume to unlock ATS scans, builders, skill tracking, and interview prep."}
              </p>
            </section>

            <SkillTrackerCard
              matchedSkills={matchedSkills}
              missingSkills={missingSkills}
              completedSkills={completedTrackedSkills}
              progress={trackerProgress}
              onToggle={toggleTrackedSkill}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}

function StatusPill({ icon: Icon, label, tone }) {
  const tones = {
    blue: "bg-blue-400/10 text-blue-100 ring-blue-300/20",
    slate: "bg-white/10 text-slate-200 ring-white/10",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase tracking-[0.14em] ring-1 ${tones[tone]}`}
    >
      <Icon size={14} />
      {label}
    </span>
  );
}

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-200">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function ActiveResumeCard({ activeResume, wordCount, uploading, onUpload }) {
  return (
    <section className={`${panelClass} dashboard-enter p-5 [animation-delay:50ms] sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
            Selected resume
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
            Active resume
          </h2>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black ${
            activeResume
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {activeResume ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
          {activeResume ? "Ready" : "Needed"}
        </span>
      </div>

      {activeResume ? (
        <div className="mt-5">
          <div className="rounded-[20px] border border-white/10 bg-[#111C2F] p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                <FileText size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">
                  {activeResume.fileName}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  {wordCount.toLocaleString()} words
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat label="Uploaded" value={new Date(activeResume.uploadedAt).toLocaleDateString()} />
              <MiniStat label="Status" value="Synced" />
            </div>
          </div>

          <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/10 bg-[#162239] px-5 py-3 text-sm font-black text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-[#1A2942] active:translate-y-0">
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCcw size={16} />
            )}
            {uploading ? "Reading resume" : "Change active resume"}
            <input
              type="file"
              accept="application/pdf"
              onChange={onUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <label className="mt-5 flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-blue-300/40 bg-blue-400/10 px-5 py-7 text-center transition hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-400/15">
          <span className="grid size-14 place-items-center rounded-2xl bg-blue-400/15 text-blue-100 shadow-sm">
            {uploading ? (
              <Loader2 size={21} className="animate-spin" />
            ) : (
              <Upload size={21} />
            )}
          </span>
          <p className="mt-4 text-base font-black text-white">
            {uploading ? "Reading your resume" : "Upload one PDF resume"}
          </p>
          <p className="mt-2 max-w-[260px] text-sm leading-6 text-slate-300">
            Your active resume powers ATS checks, gap analysis, builders, and interviews.
          </p>
          <input
            type="file"
            accept="application/pdf"
            onChange={onUpload}
            className="hidden"
          />
        </label>
      )}
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-xs font-black text-slate-100">
        {value}
      </p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, suffix, hint, tone }) {
  const toneClass = toneStyles[tone] || toneStyles.blue;

  return (
    <article className={`${panelClass} group p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_65px_rgba(0,0,0,0.24)]`}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-11 place-items-center rounded-2xl ring-1 ${toneClass.soft} transition group-hover:scale-105`}
        >
          <Icon size={19} />
        </span>
        <BarChart3 size={18} className="text-slate-500" />
      </div>
      <p className="mt-4 text-3xl font-black tracking-tight text-white">
        {value}
        {suffix && (
          <span className="ml-1 text-sm font-black text-slate-400">{suffix}</span>
        )}
      </p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-500">{hint}</p>
    </article>
  );
}

function ResultCard({ type, result, activeResume, index }) {
  const meta = resultMeta[type];
  const Icon = meta.icon;
  const saved = Boolean(result);
  const tone = toneStyles[meta.tone] || toneStyles.blue;
  const score =
    type === "ats"
      ? getScore(result?.result)
      : result?.result?.feedbackReport?.overallScore ||
        result?.result?.overallScore ||
        null;

  return (
    <Link
      to={activeResume ? meta.to : "/#hero"}
      className="group block h-full"
      style={{
        animation: `dashboardFadeUp 0.56s cubic-bezier(.2,.8,.2,1) ${0.05 + index * 0.035}s both`,
      }}
    >
      <article className={`relative h-full overflow-hidden rounded-[20px] border border-white/10 bg-[#111C2F] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${tone.border}`}>
        <div className="flex items-start justify-between gap-3">
          <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ${tone.soft}`}>
            <Icon size={21} />
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
              saved
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {saved ? "Saved" : "Pending"}
          </span>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white">
              {meta.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">
              {getResultSummary(type, result?.result)}
            </p>
          </div>
          {score !== null && (
            <span className="shrink-0 rounded-2xl bg-blue-500 px-3 py-2 text-sm font-black text-white">
              {score}
              <span className="text-xs">%</span>
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <p className="text-xs font-bold text-slate-500">
            {saved ? `Updated ${formatDate(result.updatedAt)}` : "Open tool to create result"}
          </p>
          <ArrowRight
            size={16}
            className="text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-blue-200"
          />
        </div>
      </article>
    </Link>
  );
}

function SkillTrackerCard({
  matchedSkills,
  missingSkills,
  completedSkills,
  progress,
  onToggle,
}) {
  return (
    <section className="dashboard-enter overflow-hidden rounded-[24px] border border-slate-800 bg-slate-950 p-5 text-white shadow-[0_22px_70px_rgba(15,23,42,0.24)] [animation-delay:260ms] sm:p-6">
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px overflow-hidden bg-white/10">
          <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[dashboardSweep_3.5s_linear_infinite]" />
        </div>
        <div className="flex items-start justify-between gap-4 pt-1">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.14em] text-blue-200">
              Skill tracker
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">
              Role readiness
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/62">
              Tick missing skills as you improve them. Progress is saved with
              your analyzer result.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-center">
            <p className="text-xl font-black">{progress}%</p>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
              ready
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-300 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {matchedSkills.length === 0 && missingSkills.length === 0 ? (
        <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.06] p-4 text-sm leading-6 text-white/65">
          Run AI Resume Analyzer once with a target role. Your matched and
          missing skills will appear here.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {matchedSkills.slice(0, 3).map((skill) => (
            <div
              key={skill}
              className="flex items-center gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/10 px-3 py-2.5"
            >
              <CheckCircle2 size={16} className="shrink-0 text-emerald-200" />
              <span className="text-sm font-bold text-emerald-50">
                {skill}
              </span>
            </div>
          ))}

          {missingSkills.slice(0, 5).map((item) => {
            const checked = completedSkills.includes(item.skill);

            return (
              <button
                key={item.skill}
                type="button"
                onClick={() => onToggle(item.skill)}
                className={`rounded-2xl border px-3 py-2.5 text-left transition hover:-translate-y-0.5 ${
                  checked
                    ? "border-emerald-300/20 bg-emerald-400/10"
                    : "border-white/10 bg-white/[0.06] hover:bg-white/[0.1]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border ${
                      checked
                        ? "border-emerald-300 bg-emerald-400 text-slate-950"
                        : "border-white/25"
                    }`}
                  >
                    {checked && <CheckCircle2 size={13} />}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-white">
                      {item.skill}
                    </span>
                    {item.reason && (
                      <span className="mt-1 block text-xs leading-5 text-white/55">
                        {item.reason}
                      </span>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ProgressRing({ value }) {
  return (
    <div
      className="grid size-20 place-items-center rounded-full shadow-inner"
      style={{
        background: `conic-gradient(#60a5fa ${value * 3.6}deg, #243047 0deg)`,
      }}
    >
      <div className="grid size-14 place-items-center rounded-full bg-[#0F1A2B]">
        <span className="text-sm font-black text-white">{value}%</span>
      </div>
    </div>
  );
}
