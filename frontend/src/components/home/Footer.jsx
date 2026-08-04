import { Code2, Mail, Sparkles } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "#" },
  { label: "Tools", href: "#tools" },
  { label: "Features", href: "#features" },
  { label: "About Us", href: "#about" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#0B1020] px-5 py-10 text-white md:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute right-[-8rem] bottom-[-10rem] h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.9fr] md:gap-16">
        <div>
          <a href="#" className="inline-flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-blue-500/20">
              <Sparkles size={18} />
            </span>
            <span className="text-3xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                Nouri
              </span>
              que
            </span>
          </a>

          <p className="mt-5 max-w-sm text-base leading-7 text-slate-300">
            Your AI-powered companion for resume analysis, ATS scoring, skill
            gap tracking, and interview preparation.
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Quick Links</h3>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="w-fit text-base font-semibold text-slate-300 transition hover:text-blue-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Contact</h3>
          <div className="mt-5 grid gap-4 text-base font-semibold text-slate-300">
            <a
              href="mailto:support@nourique.com"
              className="inline-flex w-fit items-center gap-3 transition hover:text-blue-300"
            >
              <Mail size={19} />
              support@nourique.com
            </a>
            <a
              href="#"
              className="inline-flex w-fit items-center gap-3 transition hover:text-blue-300"
            >
              <span className="grid size-[19px] place-items-center text-sm font-bold">
                in
              </span>
              LinkedIn
            </a>
            <a
              href="#"
              className="inline-flex w-fit items-center gap-3 transition hover:text-blue-300"
            >
              <Code2 size={19} />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
