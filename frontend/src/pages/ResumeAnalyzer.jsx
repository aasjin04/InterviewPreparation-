import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  Route,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { useResume } from "../context/ResumeContext";
import API from "../services/api";
import { formatAIValue } from "../utils/displayValue";
import {
  loadLatestToolResult,
  saveToolResult,
} from "../services/toolResults";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ResumeAnalyzer() {
  const { activeResume, saveActiveResume } = useResume();

  const [jobRole, setJobRole] = useState("");
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState(null);
  const [completedSkills, setCompletedSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const roleSuggestions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Software Engineer",
  ];

  useEffect(() => {
    let isMounted = true;

    if (!activeResume?.text?.trim()) {
      queueMicrotask(() => {
        setResult(null);
        setSavedAt(null);
      });
      return undefined;
    }

    queueMicrotask(() => {
      setResult(null);
      setCompletedSkills([]);
      setSavedAt(null);
    });

    loadLatestToolResult("analyzer", activeResume)
      .then((savedResult) => {
        if (!isMounted || !savedResult?.result) return;
        setResult(savedResult.result);
        setJobRole(savedResult.input?.jobRole || "");
        setCompletedSkills(savedResult.input?.completedSkills || []);
        setSavedAt(savedResult.updatedAt);
      })
      .catch((error) => {
        console.log(error.response?.data || error);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    setFileName(file.name);
    setLoading(true);

    try {
      const text = await extractPdfText(file);
      setResumeText(text);

      saveActiveResume({
        fileName: file.name,
        text,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.log(error);
      alert("Unable to read this PDF. Please try another PDF.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillGap = async () => {
    const finalResumeText = resumeText || activeResume?.text || "";

    if (!jobRole.trim()) {
      alert("Please enter the target job role.");
      return;
    }

    if (!finalResumeText.trim()) {
      alert("Please upload or select an active resume first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setCompletedSkills([]);

    try {
      const res = await API.post("/ai/skill-gap", {
        jobRole,
        resumeText: finalResumeText,
      });

      setResult(res.data.result);
      setSavedAt(new Date().toISOString());
      await saveToolResult(
        "analyzer",
        activeResume || {
          fileName: fileName || "Uploaded resume",
          text: finalResumeText,
          uploadedAt: "temporary",
        },
        res.data.result,
        { jobRole: jobRole.trim(), completedSkills: [] },
      );
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Skill gap analysis failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    const skillLabel = formatAIValue(skill);

    setCompletedSkills((prev) => {
      const next = prev.includes(skillLabel)
        ? prev.filter((item) => item !== skillLabel)
        : [...prev, skillLabel];

      if (result && activeResume?.text?.trim()) {
        saveToolResult("analyzer", activeResume, result, {
          jobRole: jobRole.trim(),
          completedSkills: next,
        }).catch((error) => {
          console.log(error.response?.data || error);
        });
      }

      return next;
    });
  };

  const matchedSkills = (result?.matchedSkills || []).map(formatAIValue);
  const missingSkills = (result?.missingSkills || []).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return {
        skill: formatAIValue(item),
        priority: "Medium",
        estimatedTime: "Not specified",
        reason: "",
      };
    }

    return {
      ...item,
      skill: formatAIValue(item.skill || item.name || item.title || item),
      priority: formatAIValue(item.priority || "Medium"),
      estimatedTime: formatAIValue(
        item.estimatedTime || item.time || "Not specified",
      ),
      reason: formatAIValue(item.reason || item.details || item.description),
    };
  });

  const totalSkills = result ? matchedSkills.length + missingSkills.length : 0;
  const completedCount = result
    ? matchedSkills.length + completedSkills.length
    : 0;
  const progress = totalSkills
    ? Math.round((completedCount / totalSkills) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#12182A] px-4 py-5 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes analyzerFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes analyzerGlow {
          0%, 100% { opacity: 0.45; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: 0.8; transform: translate3d(16px, -14px, 0) scale(1.07); }
        }

        @keyframes analyzerShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#60A5FA]/28 blur-[115px] animate-[analyzerGlow_8s_ease-in-out_infinite]" />
        <div className="absolute right-8 top-24 h-80 w-80 rounded-full bg-[#A78BFA]/24 blur-[125px] animate-[analyzerGlow_9s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-[#34D399]/14 blur-[135px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px] opacity-18" />
      </div>

      <div className="relative mx-auto max-w-[1380px] animate-[analyzerFadeUp_0.65s_ease-out_both]">
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

        <header className="relative mb-3 rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-3 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 md:pr-[290px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-black/10 backdrop-blur-xl">
                <BrainCircuit size={16} className="text-violet-300" />
                AI Skill Gap Tracker
              </div>
              <h1 className="mt-2 bg-[linear-gradient(90deg,#FFFFFF,#BAE6FD,#DDD6FE,#FFFFFF)] bg-[length:220%_220%] bg-clip-text pb-2 text-3xl font-semibold leading-[1.18] tracking-tight text-transparent animate-[analyzerShine_6s_ease-in-out_infinite] md:text-4xl md:leading-[1.16]">
                Map your role readiness
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200/90">
                Add a target role and get matched skills, missing skills, and a focused learning path from your active resume.
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
                    {activeResume?.fileName || fileName || "Resume needed"}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.055] p-3 ring-1 ring-white/10 md:grid-cols-[minmax(260px,420px)_180px] md:items-end md:justify-start">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                <Target size={17} className="text-blue-300" />
                Target Job Role
              </label>
              <input
                type="text"
                list="target-role-suggestions"
                autoComplete="off"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Choose or type a role"
                className="w-full rounded-2xl border border-white/70 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-950 shadow-inner shadow-slate-300/40 outline-none transition placeholder:text-slate-500 focus:border-blue-300/80 focus:bg-white focus:ring-4 focus:ring-blue-400/20"
              />
              <datalist id="target-role-suggestions">
                {roleSuggestions.map((role) => (
                  <option key={role} value={role} />
                ))}
              </datalist>
            </div>

            <button
              onClick={analyzeSkillGap}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {result ? "Re-analyze" : "Analyze"}
                </>
              )}
            </button>

            {!activeResume && (
              <label className="block cursor-pointer rounded-2xl border border-dashed border-slate-500/60 bg-white/5 p-3 text-center transition hover:border-blue-300 hover:bg-blue-500/10 md:col-span-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white">
                  <Upload size={16} />
                  Upload Resume PDF
                </span>
              </label>
            )}
          </div>
        </header>

        {!result ? (
          <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/[0.075] text-violet-200 ring-1 ring-white/10">
              <BrainCircuit size={28} />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
              Your skill gap report will appear here
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Enter a target role, run the analyzer, and track missing skills with priority, time estimate, roadmap, and resume suggestions.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <ScorePanel matchScore={result.matchScore} progress={progress} />

              <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.11] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  AI Summary
                </p>
                {savedAt && (
                  <p className="mt-2 text-xs font-semibold text-emerald-200">
                    Saved result restored
                  </p>
                )}
                <p className="mt-3 text-sm leading-6 text-slate-100/90">
                  {formatAIValue(result.summary)}
                </p>
              </div>
            </div>

            <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MatchedSkillsCard skills={matchedSkills} />
              <MissingSkillsSummary skills={missingSkills} />
              <ResultCard
                title="Learning Roadmap"
                items={result.roadmap}
                icon={Route}
                tone="blue"
                scrollable
              />
              <ResultCard
                title="Resume Suggestions"
                items={result.suggestions}
                icon={Lightbulb}
                tone="violet"
                scrollable
              />
            </div>

            <MissingSkillsTracker
              skills={missingSkills}
              completedSkills={completedSkills}
              onToggle={toggleSkill}
            />
          </section>
        )}
      </div>
    </div>
  );
}

const toneStyles = {
  emerald: "bg-emerald-400/10 text-emerald-200 ring-emerald-300/15",
  rose: "bg-rose-400/10 text-rose-200 ring-rose-300/15",
  blue: "bg-blue-400/10 text-blue-200 ring-blue-300/15",
  violet: "bg-violet-400/10 text-violet-200 ring-violet-300/15",
};

function ScorePanel({ matchScore, progress }) {
  const safeMatch = Math.min(100, Math.max(0, Number(matchScore) || 0));
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.11] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Resume Match
          </p>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-5xl font-semibold tracking-tight text-white">
              {safeMatch}
            </span>
            <span className="pb-1 text-base font-bold text-slate-300">%</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Skill Progress
          </p>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-5xl font-semibold tracking-tight text-emerald-100">
              {safeProgress}
            </span>
            <span className="pb-1 text-base font-bold text-slate-300">%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-violet-400 to-emerald-400 transition-all duration-700"
          style={{ width: `${safeProgress}%` }}
        />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-200/85">
        Skill progress increases when you tick missing skills in the tracker below.
      </p>
    </div>
  );
}

function MatchedSkillsCard({ skills }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/[0.11] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 xl:max-h-[560px]">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`grid size-10 place-items-center rounded-2xl ring-1 ${toneStyles.emerald}`}
        >
          <CheckCircle2 size={19} />
        </span>
        <h3 className="text-lg font-bold text-white">Matched Skills</h3>
      </div>
      {skills.length ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.25)_rgba(255,255,255,0.05)] [scrollbar-width:thin]">
          <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-100"
            >
              <CheckCircle2 size={15} />
              {skill}
            </span>
          ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">No matched skills returned yet.</p>
      )}
    </div>
  );
}

function MissingSkillsSummary({ skills }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/[0.11] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 xl:max-h-[560px]">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`grid size-10 place-items-center rounded-2xl ring-1 ${toneStyles.rose}`}
        >
          <AlertCircle size={19} />
        </span>
        <div>
          <h3 className="text-lg font-bold text-white">Missing Skills</h3>
          <p className="text-xs font-semibold text-slate-400">
            Full tracker is below
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.25)_rgba(255,255,255,0.05)] [scrollbar-width:thin]">
        {skills.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/10 bg-white/[0.055] p-3"
          >
            <p className="text-sm font-bold text-white">{item.skill}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-rose-100/80">
              {item.priority} priority
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MissingSkillsTracker({ skills, completedSkills, onToggle }) {
  return (
    <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.11] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`grid size-10 place-items-center rounded-2xl ring-1 ${toneStyles.rose}`}
          >
            <AlertCircle size={19} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">
              Missing Skills Tracker
            </h3>
            <p className="text-sm text-slate-300">
              Tick a skill when you start learning it. Your Skill Progress score updates instantly.
            </p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-100">
          {completedSkills.length}/{skills.length} tracked
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {skills.map((item, index) => {
          const skillName = item.skill || item.name || item.title || item;
          const skillLabel = formatAIValue(skillName);
          const done = completedSkills.includes(skillLabel);

          return (
            <label
              key={index}
              className={`block cursor-pointer rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 ${
                done
                  ? "border-emerald-300/20 bg-emerald-400/10"
                  : "border-white/10 bg-white/[0.055] hover:bg-white/[0.075]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => onToggle(skillName)}
                  className="mt-1 h-5 w-5 accent-emerald-400"
                />

                <div>
                  <h4
                    className={`font-bold ${
                      done ? "text-emerald-100 line-through" : "text-white"
                    }`}
                  >
                    {skillLabel}
                  </h4>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {formatAIValue(item.priority || "Medium")} priority |{" "}
                    {formatAIValue(item.estimatedTime || "Not specified")}
                  </p>
                  {item.reason && (
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {formatAIValue(item.reason)}
                    </p>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ResultCard({ title, items, icon: Icon, tone, scrollable = false }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/[0.11] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 xl:max-h-[560px]">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`grid size-10 place-items-center rounded-2xl ring-1 ${toneStyles[tone]}`}
        >
          <Icon size={19} />
        </span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <ul
        className={`space-y-2.5 ${
          scrollable
            ? "min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.25)_rgba(255,255,255,0.05)] [scrollbar-width:thin]"
            : ""
        }`}
      >
        {items.map((item, index) => (
          <li
            key={index}
            className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 text-sm leading-6 text-slate-300"
          >
            {formatAIValue(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}
