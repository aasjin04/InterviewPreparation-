import {
  Bot,
  Briefcase,
  FileCheck2,
  FilePlus,
  Mic,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Smart Resume Builder",
    description:
      "Turn your active resume into a polished ATS-ready draft with stronger summaries, projects, skills, and experience points.",
    icon: FilePlus,
    tone: "from-blue-500 to-cyan-400",
    stat: "AI",
    label: "Resume draft",
  },
  {
    title: "ATS Score Checker",
    description:
      "See strengths, weak areas, missing keywords, and practical suggestions in a clean score-based report.",
    icon: Sparkles,
    tone: "from-violet-500 to-fuchsia-400",
    stat: "ATS",
    label: "Score report",
  },
  {
    title: "AI Resume Analyzer",
    description:
      "Analyze your resume for a target role, identify skill gaps, and follow a focused tracker for improvement.",
    icon: FileCheck2,
    tone: "from-emerald-500 to-teal-400",
    stat: "Gap",
    label: "Skill map",
  },
  {
    title: "Aptitude Preparation",
    description:
      "Practice placement-style aptitude questions by category, difficulty, and speed for campus recruitment rounds.",
    icon: Briefcase,
    tone: "from-amber-500 to-rose-400",
    stat: "Prep",
    label: "Aptitude",
  },
  {
    title: "Mock Interview",
    description:
      "Attempt resume-based questions with difficulty levels, timers, answer previews, and AI feedback after practice.",
    icon: Mic,
    tone: "from-indigo-500 to-blue-400",
    stat: "Q&A",
    label: "Timed round",
  },
  {
    title: "AI Interview",
    description:
      "Practice a voice-style interview where Nourique asks questions, listens to answers, and generates a final report.",
    icon: Bot,
    tone: "from-slate-700 to-slate-500",
    stat: "Live",
    label: "AI coach",
  },
];

export default function Features() {
  const flowingFeatures = [...features, ...features];

  return (
    <section
      id="features"
      className="relative scroll-mt-32 overflow-hidden bg-[#F8FAFC] px-5 py-20 text-slate-950 md:px-8"
    >
      <style>{`
        @keyframes featureFlow {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/80 blur-3xl" />
        <div className="absolute right-[-8rem] bottom-10 h-80 w-80 rounded-full bg-violet-100/80 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB] shadow-sm backdrop-blur-xl">
            Placement workflow
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Tools that move with your preparation
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            From resume building to ATS checks, skill tracking, aptitude
            practice, mock interviews, and AI feedback in one guided flow.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent" />

          <div className="overflow-hidden">
            <div className="flex w-max gap-6 animate-[featureFlow_34s_linear_infinite] hover:[animation-play-state:paused]">
              {flowingFeatures.map((feature, index) => (
                <FeatureCard
                  key={`${feature.title}-${index}`}
                  feature={feature}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;

  return (
    <article className="group w-[280px] shrink-0 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(37,99,235,0.14)] sm:w-[320px]">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div
          className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${feature.tone} opacity-20 blur-2xl transition duration-300 group-hover:opacity-35`}
        />
        <div className="relative flex items-center justify-between">
          <span
            className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${feature.tone} text-white shadow-lg`}
          >
            <Icon size={22} />
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500">
            {feature.label}
          </span>
        </div>

        <div className="relative mt-8 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Insight
              </p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">
                {feature.stat}
              </p>
            </div>
            <div className="flex h-14 items-end gap-1.5">
              <span className="h-7 w-2 rounded-full bg-blue-200" />
              <span className="h-11 w-2 rounded-full bg-[#2563EB]" />
              <span className="h-8 w-2 rounded-full bg-violet-300" />
              <span className="h-14 w-2 rounded-full bg-[#7C3AED]" />
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-5 text-base font-bold text-slate-900">
        {feature.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {feature.description}
      </p>
    </article>
  );
}
