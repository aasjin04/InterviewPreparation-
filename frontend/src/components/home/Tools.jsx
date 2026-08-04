import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowRight,
  Bot,
  Briefcase,
  FilePlus,
  Mic,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const tools = [
  {
    title: "Smart Resume Builder",
    description:
      "Create polished resume sections with AI-assisted summaries, skills, projects, and experience points.",
    icon: FilePlus,
    path: "/builder",
    tone: "from-blue-500 to-cyan-400",
  },
  {
    title: "ATS Score Checker",
    description:
      "Scan your resume for role keywords, formatting gaps, ATS score, and targeted improvement suggestions.",
    icon: ShieldCheck,
    path: "/ats-checker",
    tone: "from-emerald-500 to-teal-400",
  },
  {
    title: "AI Resume Analyzer",
    description:
      "Understand weak sections, unclear wording, missing metrics, and profile gaps from your selected resume.",
    icon: SearchCheck,
    path: "/analyzer",
    tone: "from-violet-500 to-fuchsia-400",
  },
  {
    title: "Aptitude Preparation",
    description:
      "Practice placement-focused aptitude questions and build speed for campus recruitment rounds.",
    icon: Briefcase,
    path: "/aptitude-prep",
    tone: "from-amber-500 to-orange-400",
  },
  {
    title: "Mock Interview",
    description:
      "Practice profile-based interview questions from your resume and improve answers with guided feedback.",
    icon: Mic,
    path: "/mock-interview",
    tone: "from-pink-500 to-rose-400",
  },
  {
    title: "AI Interview",
    description:
      "Prepare with intelligent interview rounds, answer tracking, evaluation, and personalized next steps.",
    icon: Bot,
    path: "/ai-interview",
    tone: "from-indigo-500 to-blue-400",
  },
];

export default function Tools() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  return (
    <section
      id="tools"
      className="relative scroll-mt-32 overflow-hidden bg-white px-5 pb-16 pt-12 text-slate-950 md:px-8"
    >
      <style>{`
        @keyframes toolFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes toolGlow {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.08);
          }
        }

        @keyframes headingShine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-20 h-80 w-80 rounded-full bg-blue-100/80 blur-3xl animate-[toolGlow_8s_ease-in-out_infinite]" />
        <div className="absolute right-[-8rem] bottom-10 h-96 w-96 rounded-full bg-violet-100/80 blur-3xl animate-[toolGlow_9s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="relative flex flex-col items-center gap-5 text-center">
          <div className="mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-5 py-2 text-sm font-semibold text-[#2563EB] shadow-sm backdrop-blur-xl">
              <Sparkles size={16} />
              Career tools
            </span>

            <h2 className="group mt-4 pb-2 text-3xl font-semibold leading-[1.18] tracking-tight text-slate-950 md:text-5xl md:leading-[1.16]">
              Explore{" "}
              <span className="inline-block pb-1 bg-[linear-gradient(110deg,#2563EB,#7C3AED,#10B981,#2563EB)] bg-[length:220%_220%] bg-clip-text text-transparent transition duration-300 animate-[headingShine_6s_ease-in-out_infinite] group-hover:scale-[1.02]">
                Nourique
              </span>{" "}
              tools
            </h2>
          </div>

          {isLoggedIn && (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/85 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-[#2563EB] md:absolute md:right-0 md:top-2"
            >
              Go to dashboard
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => {
            const Icon = tool.icon;

            return (
              <article
                key={tool.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_26px_80px_rgba(37,99,235,0.14)]"
                style={{
                  animation: `toolFloat ${6 + index * 0.35}s ease-in-out infinite`,
                  animationDelay: `${index * 0.18}s`,
                }}
              >
                <div
                  className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${tool.tone} opacity-10 blur-2xl transition duration-300 group-hover:opacity-25`}
                />
                <div className="relative flex gap-4">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tool.tone} text-white shadow-lg`}
                  >
                    <Icon size={22} />
                  </span>

                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-950">
                      {tool.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      {tool.description}
                    </p>

                    <Link
                      to={isLoggedIn ? tool.path : "/login"}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
                    >
                      {isLoggedIn ? "Open tool" : "Login to use"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
