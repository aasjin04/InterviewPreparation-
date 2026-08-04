import { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { useResume } from "../context/ResumeContext";
import { getOrCreateResumeAnalysis } from "../utils/resumeAnalysis";
import { formatAIValue } from "../utils/displayValue";
import { loadToolResult, saveToolResult } from "../services/toolResults";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ATSChecker() {
  const { activeResume, saveActiveResume } = useResume();

  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

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
      setSavedAt(null);
    });

    loadToolResult("ats", activeResume)
      .then((savedResult) => {
        if (!isMounted || !savedResult?.result) return;
        setResult(savedResult.result);
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

  const checkATS = async () => {
    const resumeForAnalysis =
      activeResume ||
      (resumeText
        ? {
            fileName: fileName || "Uploaded resume",
            text: resumeText,
            uploadedAt: "temporary",
          }
        : null);

    if (!resumeForAnalysis?.text?.trim()) {
      alert("Please upload or select an active resume first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const analysis = await getOrCreateResumeAnalysis(resumeForAnalysis, {
        force: Boolean(result),
      });
      setResult(analysis.ats);
      setSavedAt(new Date().toISOString());
      await saveToolResult("ats", resumeForAnalysis, analysis.ats);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || error.message || "ATS analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#12182A] px-4 py-5 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes atsFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes atsGlow {
          0%, 100% { opacity: 0.45; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: 0.8; transform: translate3d(16px, -14px, 0) scale(1.07); }
        }

        @keyframes atsShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#60A5FA]/28 blur-[115px] animate-[atsGlow_8s_ease-in-out_infinite]" />
        <div className="absolute right-8 top-24 h-80 w-80 rounded-full bg-[#A78BFA]/24 blur-[125px] animate-[atsGlow_9s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-[#34D399]/14 blur-[135px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px] opacity-18" />
      </div>

      <div className="relative mx-auto max-w-[1380px] animate-[atsFadeUp_0.65s_ease-out_both]">
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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-black/10 backdrop-blur-xl">
                <ShieldCheck size={16} className="text-emerald-300" />
                ATS Score Checker
              </div>
              <h1 className="mt-2 bg-[linear-gradient(90deg,#FFFFFF,#BAE6FD,#BBF7D0,#FFFFFF)] bg-[length:220%_220%] bg-clip-text pb-2 text-4xl font-semibold leading-[1.16] tracking-tight text-transparent animate-[atsShine_6s_ease-in-out_infinite] md:text-5xl md:leading-[1.14]">
                Improve your resume score
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200/90 md:text-base">
                Check ATS readiness, keyword coverage, formatting gaps, and practical resume improvements from your selected resume.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-300/15">
                  <FileText size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Selected resume
                  </p>
                  <h2 className="mt-1 truncate text-sm font-bold text-white">
                    {activeResume?.fileName || fileName || "Resume needed"}
                  </h2>
                </div>
              </div>

              {!activeResume && (
                <label className="mt-3 block cursor-pointer rounded-2xl border border-dashed border-slate-500/60 bg-white/5 p-3 text-center transition hover:border-blue-300 hover:bg-blue-500/10">
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

              <button
                onClick={checkATS}
                disabled={loading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#10B981] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {result ? "Re-analyze ATS Report" : "Generate ATS Report"}
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {!result ? (
          <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/[0.075] text-blue-200 ring-1 ring-white/10">
              <ShieldCheck size={28} />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white">
              Your ATS report will appear here
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Generate once to see score, strengths, weaknesses, missing keywords, and improvement suggestions in a clean grid report.
            </p>
          </section>
        ) : (
          <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-5 ring-1 ring-white/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  ATS Score
                </p>
                {savedAt && (
                  <p className="mt-2 text-xs font-semibold text-emerald-200">
                    Saved result restored
                  </p>
                )}
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-6xl font-semibold tracking-tight text-white">
                    {result.atsScore}
                  </span>
                  <span className="pb-2 text-lg font-bold text-slate-400">
                    /100
                  </span>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#2563EB] via-[#10B981] to-[#7C3AED] transition-all duration-700"
                    style={{
                      width: `${Math.min(100, Math.max(0, result.atsScore || 0))}%`,
                    }}
                  />
                </div>
                <p className="mt-5 text-sm leading-6 text-slate-300">
                  {formatAIValue(result.summary)}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ResultCard
                  title="Strengths"
                  items={result.strengths}
                  icon={CheckCircle2}
                  tone="emerald"
                />
                <ResultCard
                  title="Weaknesses"
                  items={result.weaknesses}
                  icon={AlertTriangle}
                  tone="rose"
                />
                <ResultCard
                  title="Missing Keywords"
                  items={result.missingKeywords}
                  icon={KeyRound}
                  tone="blue"
                />
                <ResultCard
                  title="Suggestions"
                  items={result.suggestions}
                  icon={Lightbulb}
                  tone="violet"
                />
              </div>
            </div>
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

function ResultCard({ title, items, icon: Icon, tone }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-5 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09]">
      <div className="mb-4 flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-2xl ring-1 ${toneStyles[tone]}`}>
          <Icon size={19} />
        </span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <ul className="space-y-2.5">
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
