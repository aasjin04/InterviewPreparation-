import { BrainCircuit, Lightbulb, Rocket, Sparkles } from "lucide-react";

const aboutCards = [
  {
    title: "Why Nourique Exists",
    description:
      "Students often know their resume needs work, but not what to improve first. Nourique gives them a clear step-by-step path.",
    icon: Rocket,
    tone: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    title: "What Makes It Different",
    description:
      "Resume analysis, ATS score, skill gaps, AI feedback, and interview prep stay connected in one guided flow.",
    icon: Lightbulb,
    tone: "text-violet-600 bg-violet-50 border-violet-100",
  },
  {
    title: "How It Helps You",
    description:
      "Upload your resume, find weak areas, improve your profile, and practice questions based on your own experience.",
    icon: BrainCircuit,
    tone: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative scroll-mt-32 overflow-hidden bg-[#F8FAFC] px-5 py-14 text-slate-950 md:px-8"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/80 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-[-8rem] h-80 w-80 rounded-full bg-violet-100/80 blur-3xl" />
        <div className="absolute right-[-8rem] top-24 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-5 py-2 text-sm font-semibold text-[#7C3AED] shadow-sm backdrop-blur-xl">
            <Sparkles size={16} />
            About Us
          </span>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            Why{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              Nourique
            </span>{" "}
            Exists
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Nourique helps students analyze, improve, and practice for
            placements without jumping between disconnected tools.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto pb-3">
          <div className="grid min-w-[980px] grid-cols-3 gap-8">
          {aboutCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="group flex min-h-[250px] flex-col rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_24px_70px_rgba(37,99,235,0.14)]"
              >
                <span
                  className={`grid size-12 place-items-center rounded-2xl border ${card.tone}`}
                >
                  <Icon size={24} />
                </span>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {card.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </article>
            );
          })}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl px-6 py-2 text-center">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
            Built With{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              Purpose
            </span>
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            A practical system for improving resumes, closing skill gaps, and
            preparing confidently for interviews.
          </p>
        </div>
      </div>
    </section>
  );
}
