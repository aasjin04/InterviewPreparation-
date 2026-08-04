import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useResume } from "../../context/ResumeContext";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
import {
  ArrowRight,
  Bot,
  Brain,
  FileText,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const toolLogos = [
  "ATS Score Checker",
  "AI Resume Analyzer",
  "Smart Resume Builder",
  "Skill Gap Tracker",
  "Mock Interview",
  "AI Interview Prep",
];

const heroStats = [
  { icon: Target, value: 96, suffix: "%", label: "sample ATS score" },
  { icon: Users, value: 6, suffix: "", label: "connected tools" },
  { icon: TrendingUp, value: 1, suffix: "x", label: "resume upload" },
];

const matchedSkills = ["React", "Projects", "SQL", "Interview prep"];

export default function Hero() {
  const { user } = useAuth();
  const { activeResume, saveActiveResume } = useResume();
  const isLoggedIn = Boolean(user);

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

  const handleActiveResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      return;
    }

    try {
      const text = await extractPdfText(file);

      saveActiveResume({
        fileName: file.name,
        text,
        uploadedAt: new Date().toISOString(),
      });

      alert("Active resume selected successfully!");
    } catch (error) {
      console.log(error);
      alert("Unable to read this PDF. Please try another PDF.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div
      id="hero"
      className="relative z-10 mx-auto grid min-h-[calc(100svh-6rem)] scroll-mt-32 w-full max-w-7xl items-center gap-8 px-5 pb-8 pt-2 md:px-8 lg:grid-cols-[1fr_0.9fr] lg:gap-14"
    >
      <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
        <div className="animate-[fadeUp_0.7s_ease-out_both] inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/70 px-4 py-2 text-sm font-bold text-[#2563EB] shadow-sm backdrop-blur-xl">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7C3AED] opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-[#2563EB]" />
          </span>
          Built to beat the resume screen, not just look good
        </div>

        <h1 className="mt-5 animate-[fadeUp_0.75s_ease-out_0.1s_both] text-5xl font-semibold leading-[1.05] tracking-tight text-slate-950 md:text-7xl">
          Resumes that pass{" "}
          <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
            the bots
          </span>
          . Interviews you actually win.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl animate-[fadeUp_0.75s_ease-out_0.2s_both] text-sm leading-8 text-slate-600 md:text-base lg:mx-0">
          Turn one resume into ATS insights, skill gaps, smarter edits, and
          interview practice tailored to your profile.
        </p>

        <div className="mt-6 flex animate-[fadeUp_0.75s_ease-out_0.3s_both] flex-wrap items-center justify-center gap-3 lg:justify-start">
          <Link
            to={isLoggedIn ? "/dashboard" : "/signup"}
            className="group inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8] active:scale-95"
          >
            {isLoggedIn ? "Go to dashboard" : "Start building"}
            <ArrowRight
              size={18}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>

          {isLoggedIn ? (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition hover:border-violet-200 hover:text-[#7C3AED] active:scale-95">
              <Upload size={17} />
              {activeResume ? "Change active resume" : "Select active resume"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleActiveResumeUpload}
                className="hidden"
              />
            </label>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/75 px-7 py-3.5 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition hover:border-violet-200 hover:text-[#7C3AED] active:scale-95"
            >
              Login
            </Link>
          )}
        </div>

        <div className="mt-5 grid animate-[fadeUp_0.75s_ease-out_0.35s_both] grid-cols-3 gap-3 lg:max-w-xl">
          {heroStats.map((stat) => (
            <StatPill key={stat.label} {...stat} />
          ))}
        </div>

        <div
          id="tool-marquee"
          className="relative mt-4 animate-[fadeUp_0.75s_ease-out_0.4s_both] overflow-hidden rounded-2xl border border-slate-200 bg-white/65 py-3.5 shadow-sm backdrop-blur-xl [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
        >
          <div className="flex w-max animate-[marquee_26s_linear_infinite] items-center">
            {[...toolLogos, ...toolLogos].map((tool, index) => (
              <span
                key={`${tool}-${index}`}
                className="mx-6 shrink-0 text-sm font-bold text-slate-400"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-auto hidden w-full max-w-[500px] flex-col items-center justify-center gap-3 md:flex lg:mx-0">
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/75 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.075)_1px,transparent_1px)] bg-[size:56px_56px] opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(37,99,235,0.16),transparent_31%),radial-gradient(circle_at_78%_76%,rgba(124,58,237,0.14),transparent_28%)]" />
          <div className="absolute inset-5 rounded-[1.6rem] border border-white/80 bg-white/30" />

          <div className="relative h-[420px] w-[420px] scale-[0.72] sm:scale-[0.78] md:scale-[0.86] lg:scale-100">
            <OrbitRing size="376px" />
            <OrbitRing size="282px" />
            <OrbitRing size="190px" />

            <ScoreDial target={96} />

            <OrbitNode
              radius={158}
              duration={26}
              delay={0}
              icon={<FileText size={22} />}
              label="Builder"
              tone="blue"
            />
            <OrbitNode
              radius={162}
              duration={26}
              delay={-5.2}
              icon={<ShieldCheck size={22} />}
              label="ATS"
              tone="emerald"
            />
            <OrbitNode
              radius={158}
              duration={26}
              delay={-10.4}
              icon={<Bot size={22} />}
              label="Analyzer"
              tone="violet"
            />
            <OrbitNode
              radius={170}
              duration={26}
              delay={-15.6}
              icon={<Brain size={22} />}
              label="Skills"
              tone="pink"
            />
            <OrbitNode
              radius={170}
              duration={26}
              delay={-20.8}
              icon={<MessageCircle size={22} />}
              label="Interview"
              tone="cyan"
            />
          </div>
        </div>

        <div className="w-full rounded-2xl border border-slate-200/80 bg-white/85 px-5 py-3.5 shadow-lg shadow-slate-200/60 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Live ATS scan result
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Resume insights, weak areas, and interview prep in one flow.
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
              <Sparkles size={12} />
              96 Score
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, value, suffix, label }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1000;
          const start = performance.now();

          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(value * eased * 10) / 10);
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-1 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-3 text-center shadow-sm backdrop-blur-xl lg:items-start lg:text-left"
    >
      <Icon size={16} className="text-[#2563EB]" />
      <p className="text-lg font-extrabold tracking-tight text-slate-950">
        {count}
        {suffix}
      </p>
      <p className="text-[11px] font-semibold leading-tight text-slate-500">
        {label}
      </p>
    </div>
  );
}

function ScoreDial({ target }) {
  const [percent, setPercent] = useState(0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  useEffect(() => {
    const timer = setTimeout(() => setPercent(target), 400);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <div className="absolute left-1/2 top-1/2 z-20 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center">
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(148,163,184,0.25)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s ease-out" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative grid size-20 place-items-center rounded-full border border-white/80 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-[0_24px_70px_rgba(37,99,235,0.32)] animate-[hubPulse_3.8s_ease-in-out_infinite]">
        <div className="text-center">
          <p className="text-xl font-extrabold leading-none">
            {Math.round(percent)}
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-wide opacity-90">
            ATS Score
          </p>
        </div>
      </div>
    </div>
  );
}

function OrbitRing({ size }) {
  return (
    <div
      className="absolute left-1/2 top-1/2 rounded-full border border-slate-300/80"
      style={{
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}

function OrbitNode({ radius, duration, delay, icon, label, tone }) {
  const tones = {
    blue: "text-blue-600 bg-blue-50 shadow-blue-100/80",
    emerald: "text-emerald-600 bg-emerald-50 shadow-emerald-100/80",
    violet: "text-violet-600 bg-violet-50 shadow-violet-100/80",
    pink: "text-pink-600 bg-pink-50 shadow-pink-100/80",
    cyan: "text-cyan-600 bg-cyan-50 shadow-cyan-100/80",
  };

  return (
    <div
      className="absolute left-1/2 top-1/2 z-10"
      style={{
        width: `${radius * 2}px`,
        height: `${radius * 2}px`,
        marginLeft: `-${radius}px`,
        marginTop: `-${radius}px`,
        animation: `orbitClockwise ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <div
          className="origin-center"
          style={{
            animation: `orbitCounter ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        >
          <div className="flex w-20 flex-col items-center gap-2">
            <span
              className={`grid size-14 place-items-center rounded-2xl border border-white bg-white shadow-xl transition-transform duration-300 hover:scale-110 ${tones[tone]}`}
            >
              {icon}
            </span>
            <span className="rounded-full border border-slate-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-bold leading-none text-slate-600 shadow-sm backdrop-blur">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
