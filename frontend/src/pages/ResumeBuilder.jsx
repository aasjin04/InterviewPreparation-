import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  Layers3,
  LayoutDashboard,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useResume } from "../context/ResumeContext";
import { getOrCreateResumeAnalysis } from "../utils/resumeAnalysis";
import { formatAIValue } from "../utils/displayValue";
import { loadToolResult, saveToolResult } from "../services/toolResults";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ResumeBuilder() {
  const resumeRef = useRef(null);
  const { activeResume, saveActiveResume } = useResume();

  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeData, setResumeData] = useState(null);
  const [template, setTemplate] = useState("minimal");
  const [loading, setLoading] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const templates = ["minimal", "modern", "professional"];
  const templateIndex = templates.indexOf(template);

  useEffect(() => {
    let isMounted = true;

    if (!activeResume?.text?.trim()) {
      queueMicrotask(() => {
        setResumeData(null);
        setSavedAt(null);
      });
      return undefined;
    }

    queueMicrotask(() => {
      setResumeData(null);
      setSavedAt(null);
    });

    loadToolResult("builder", activeResume)
      .then((savedResult) => {
        if (!isMounted || !savedResult?.result) return;
        setResumeData(savedResult.result);
        setTemplate(savedResult.input?.template || "minimal");
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

  const handleUpload = async (e) => {
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
      alert("Unable to read this PDF.");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (nextTemplate) => {
    setTemplate(nextTemplate);

    if (resumeData && activeResume?.text?.trim()) {
      saveToolResult("builder", activeResume, resumeData, {
        template: nextTemplate,
      }).catch((error) => {
        console.log(error.response?.data || error);
      });
    }
  };

  const generateResume = async () => {
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

    try {
      const analysis = await getOrCreateResumeAnalysis(resumeForAnalysis, {
        force: Boolean(resumeData),
      });
      setResumeData(analysis.improvedResume);
      setSavedAt(new Date().toISOString());
      await saveToolResult(
        "builder",
        resumeForAnalysis,
        analysis.improvedResume,
        { template },
      );
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          error.message ||
          "Resume generation failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!resumeData) {
      alert("Please generate resume first.");
      return;
    }

    const canvas = await html2canvas(resumeRef.current, { scale: 2 });
    const imageData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imageData, "PNG", 0, 0, width, height);
    pdf.save("ats-friendly-resume.pdf");
  };

  return (
    <div className="min-h-screen bg-[#12182A] px-4 py-5 text-white sm:px-6 lg:px-8">
      <style>{`
        @keyframes builderFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes builderGlow {
          0%, 100% { opacity: 0.45; transform: translate3d(0, 0, 0) scale(1); }
          50% { opacity: 0.85; transform: translate3d(18px, -14px, 0) scale(1.08); }
        }

        @keyframes titleShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#60A5FA]/28 blur-[115px] animate-[builderGlow_8s_ease-in-out_infinite]" />
        <div className="absolute right-8 top-24 h-80 w-80 rounded-full bg-[#A78BFA]/24 blur-[125px] animate-[builderGlow_9s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-[#34D399]/14 blur-[135px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:64px_64px] opacity-18" />
      </div>

      <div className="relative mx-auto max-w-[1580px] animate-[builderFadeUp_0.65s_ease-out_both]">
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

        <header className="mb-3 rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_560px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.075] px-4 py-2 text-sm font-semibold text-blue-100 shadow-lg shadow-black/10 backdrop-blur-xl">
                <Sparkles size={16} className="text-blue-300" />
                Smart Resume Builder
              </div>
              <h1 className="mt-2 bg-[linear-gradient(90deg,#FFFFFF,#BAE6FD,#DDD6FE,#FFFFFF)] bg-[length:220%_220%] bg-clip-text pb-2 text-4xl font-semibold leading-[1.16] tracking-tight text-transparent animate-[titleShine_6s_ease-in-out_infinite] md:text-5xl md:leading-[1.14]">
                Build a polished ATS resume
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200/90 md:text-base">
                Convert your active resume into a cleaner, structured, recruiter-ready document with AI improvements and downloadable PDF output.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 ring-1 ring-white/10">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <Layers3 size={17} className="text-violet-300" />
                  Choose Template
                </p>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-slate-300">
                  {templateIndex + 1}/3
                </span>
              </div>

              <div className="relative grid grid-cols-3 rounded-2xl border border-white/10 bg-[#111827]/80 p-1">
                <div
                  className="absolute bottom-1 left-1 top-1 rounded-xl bg-gradient-to-r from-white to-blue-50 shadow-lg shadow-blue-950/20 transition-transform duration-300 ease-out"
                  style={{
                    width: "calc((100% - 0.5rem) / 3)",
                    transform: `translateX(${templateIndex * 100}%)`,
                  }}
                />
                {templates.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleTemplateChange(item)}
                    className={`relative z-10 min-w-0 rounded-xl px-2 py-2 text-xs font-bold capitalize transition sm:text-sm ${
                      template === item
                        ? "text-slate-950"
                        : "text-slate-300 hover:text-white"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </header>

        <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-[1.5rem] border border-white/12 bg-white/[0.09] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Active resume</h3>
                  <p className="text-sm text-slate-400">
                    {activeResume?.fileName || fileName || "Resume needed"}
                  </p>
                </div>
              </div>

              {activeResume ? (
                <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-100">
                    Ready for AI generation and PDF export.
                  </p>
                </div>
              ) : (
                <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-slate-500/60 bg-white/5 p-4 text-center transition hover:border-blue-300 hover:bg-blue-500/10">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <span className="text-sm font-semibold text-white">
                    Upload Resume PDF
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    PDF only, text will be extracted locally.
                  </span>
                </label>
              )}
            </div>

            <div className="grid gap-3">
              <button
                onClick={generateResume}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#7C3AED] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {resumeData ? "Regenerate ATS Resume" : "Generate ATS Resume"}
                  </>
                )}
              </button>

              <button
                onClick={downloadPDF}
                disabled={!resumeData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>

            {resumeData && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <h3 className="font-bold text-white">AI Improvements</h3>
                <ul className="mt-3 space-y-2">
                  {normalizeResumeList(resumeData.improvements)
                    .slice(0, 4)
                    .map((item, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-5 text-slate-300"
                    >
                      {formatAIValue(item)}
                    </li>
                  ))}
                </ul>

                {normalizeResumeList(resumeData.missingSections).length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-bold text-white">Missing Sections</h3>
                    <ul className="mt-3 space-y-2">
                      {normalizeResumeList(resumeData.missingSections)
                        .slice(0, 3)
                        .map((item, index) => (
                          <li
                            key={index}
                            className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-100"
                          >
                            {formatAIValue(item)}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>

          <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/95 shadow-2xl shadow-black/30">
            <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/95 px-5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Live preview
                </p>
                <h2 className="text-base font-bold text-slate-950">
                  {template.charAt(0).toUpperCase() + template.slice(1)} resume template
                </h2>
                {savedAt && (
                  <p className="text-xs font-semibold text-emerald-600">
                    Saved resume restored
                  </p>
                )}
              </div>
              <button
                onClick={downloadPDF}
                disabled={!resumeData}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Download size={17} />
                Download PDF
              </button>
            </div>

            {!resumeData ? (
              <div className="flex min-h-[700px] items-center justify-center bg-[radial-gradient(circle_at_top,#EEF2FF,transparent_36%),linear-gradient(135deg,#F8FAFC,#EEF2F7)] p-8 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-300">
                    <FileText size={26} />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-slate-950">
                    Your full resume preview will appear here
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Generate once, switch templates with the slider, then download the polished PDF from the preview toolbar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-auto bg-[#E8EDF5] p-3 sm:p-5">
                <div className="min-w-[794px]">
                  <div ref={resumeRef} className="mx-auto w-[794px]">
                    {template === "minimal" && <MinimalTemplate data={resumeData} />}
                    {template === "modern" && <ModernTemplate data={resumeData} />}
                    {template === "professional" && (
                      <ProfessionalTemplate data={resumeData} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function MinimalTemplate({ data }) {
  return (
    <div className="bg-white text-black w-[794px] min-h-[1123px] mx-auto p-10 border">
      <Header data={data} center />
      <Section title="Summary" content={data.summary} />
      <ListSection title="Skills" items={data.skills} />
      <Education data={data.education} />
      <Experience data={data.experience} />
      <Projects data={data.projects} />
      <ListSection title="Certifications" items={data.certifications} />
      <ListSection title="Achievements" items={data.achievements} />
    </div>
  );
}

function ModernTemplate({ data }) {
  const skills = normalizeResumeList(data.skills).map(formatAIValue);

  return (
    <div className="bg-white text-black w-[794px] min-h-[1123px] mx-auto border grid grid-cols-[250px_1fr]">
      <aside className="bg-[#24160F] text-white p-8">
        <h1 className="text-3xl font-bold leading-[1.18]">
          {formatAIValue(data.personalInfo?.name) || "Your Name"}
        </h1>
        <p className="mt-4 text-sm">{data.personalInfo?.email}</p>
        <p className="text-sm">{data.personalInfo?.phone}</p>
        <p className="text-sm">{data.personalInfo?.location}</p>

        <h3 className="mt-8 font-bold uppercase border-b border-white pb-1">
          Skills
        </h3>
        <ul className="mt-3 space-y-2 text-sm">
          {skills.map((skill, index) => (
            <li key={index}>• {skill}</li>
          ))}
        </ul>
      </aside>

      <main className="p-8">
        <Section title="Professional Summary" content={data.summary} />
        <Education data={data.education} />
        <Experience data={data.experience} />
        <Projects data={data.projects} />
        <ListSection title="Certifications" items={data.certifications} />
        <ListSection title="Achievements" items={data.achievements} />
      </main>
    </div>
  );
}

function ProfessionalTemplate({ data }) {
  return (
    <div className="bg-white text-black w-[794px] min-h-[1123px] mx-auto p-12 border">
      <Header data={data} />
      <Section title="Profile" content={data.summary} />
      <Experience data={data.experience} />
      <Projects data={data.projects} />
      <Education data={data.education} />
      <ListSection title="Technical Skills" items={data.skills} />
      <ListSection title="Certifications" items={data.certifications} />
      <ListSection title="Achievements" items={data.achievements} />
    </div>
  );
}

function Header({ data, center }) {
  const info = data.personalInfo || {};

  return (
    <div className={`${center ? "text-center" : ""} border-b pb-4`}>
      <h1 className="text-3xl font-bold uppercase leading-[1.18]">
        {formatAIValue(info.name) || "Your Name"}
      </h1>
      <p className="mt-2 text-sm">
        {formatAIValue(info.email)} | {formatAIValue(info.phone)} |{" "}
        {formatAIValue(info.location)}
      </p>
      <p className="mt-1 text-sm">
        {formatAIValue(info.linkedin)}{" "}
        {info.github && `| ${formatAIValue(info.github)}`}
      </p>
    </div>
  );
}

function Section({ title, content }) {
  if (!content) return null;

  return (
    <section className="mt-6">
      <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">
        {title}
      </h2>
      <p className="text-sm leading-6 whitespace-pre-line">
        {formatAIValue(content)}
      </p>
    </section>
  );
}

function ListSection({ title, items }) {
  const normalizedItems = normalizeResumeList(items);

  if (normalizedItems.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">
        {title}
      </h2>
      <ul className="text-sm leading-6 list-disc ml-5">
        {normalizedItems.map((item, index) => (
          <li key={index}>{formatAIValue(item)}</li>
        ))}
      </ul>
    </section>
  );
}

function Education({ data }) {
  const items = normalizeResumeList(data);

  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">
        Education
      </h2>
      {items.map((item, index) => (
        <div key={index} className="mb-3">
          <p className="font-bold text-sm">{formatAIValue(item.degree)}</p>
          <p className="text-sm">{formatAIValue(item.college)}</p>
          <p className="text-xs">{formatAIValue(item.year)}</p>
        </div>
      ))}
    </section>
  );
}

function Experience({ data }) {
  const items = normalizeResumeList(data);

  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">
        Experience
      </h2>
      {items.map((item, index) => (
        <div key={index} className="mb-4">
          <p className="font-bold text-sm">
            {formatAIValue(item.role)} {item.company && `- ${formatAIValue(item.company)}`}
          </p>
          <p className="text-xs">{formatAIValue(item.duration)}</p>
          <p className="text-sm leading-6 mt-1">
            {formatAIValue(item.description)}
          </p>
        </div>
      ))}
    </section>
  );
}

function Projects({ data }) {
  const items = normalizeResumeList(data);

  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="text-base font-bold uppercase border-b border-black pb-1 mb-2">
        Projects
      </h2>
      {items.map((item, index) => (
        <div key={index} className="mb-4">
          <p className="font-bold text-sm">{formatAIValue(item.title)}</p>
          <p className="text-xs">{formatAIValue(item.techStack)}</p>
          <p className="text-sm leading-6 mt-1">
            {formatAIValue(item.description)}
          </p>
        </div>
      ))}
    </section>
  );
}

function normalizeResumeList(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(
      (item) =>
        item !== null &&
        item !== undefined &&
        !(typeof item === "string" && item.trim() === ""),
    );
  }

  if (typeof value === "string") {
    return value
      .split(/\n|•|-/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "object") {
    const itemLikeKeys = [
      "title",
      "name",
      "degree",
      "role",
      "company",
      "description",
      "skill",
      "college",
      "techStack",
    ];

    if (itemLikeKeys.some((key) => key in value)) {
      return [value];
    }

    return Object.entries(value).map(([key, item]) => ({
      title: key,
      description: item,
    }));
  }

  return [value];
}
