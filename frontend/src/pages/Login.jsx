import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/login", form);
      login(response.data.user, response.data.token);

      if (!rememberMe) {
        localStorage.removeItem("rememberNouriqueLogin");
      } else {
        localStorage.setItem("rememberNouriqueLogin", "true");
      }

      alert("Login successful. Welcome back to Nourique!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert("Forgot password flow will be added soon.");
  };

  return (
    <main className="h-screen overflow-hidden bg-[#070A12] text-white">
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatSoft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-9px);
          }
        }

        @keyframes glowMove {
          0%, 100% {
            opacity: 0.55;
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            opacity: 0.85;
            transform: translate3d(18px, -12px, 0) scale(1.08);
          }
        }
      `}</style>

      <div className="relative grid h-screen overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#2563EB]/35 blur-[110px] animate-[glowMove_8s_ease-in-out_infinite]" />
          <div className="absolute right-8 top-24 h-80 w-80 rounded-full bg-[#7C3AED]/30 blur-[120px] animate-[glowMove_9s_ease-in-out_infinite]" />
          <div className="absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-[#10B981]/20 blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
        </div>

        <section className="relative hidden h-screen items-center justify-center px-8 py-8 lg:flex">
          <div className="absolute inset-y-6 left-6 right-0 rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl" />

          <div className="relative z-10 flex h-full w-full max-w-2xl flex-col justify-center animate-[fadeUp_0.7s_ease-out_both]">
            <Link to="/" className="inline-flex w-fit items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-blue-500/25">
                <Sparkles size={19} />
              </span>
              <span className="text-xl font-bold tracking-tight">
                Nourique
              </span>
            </Link>

            <div className="mt-10">
              <p className="mb-4 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 shadow-sm backdrop-blur-xl">
                Resume-first AI preparation workspace
              </p>

              <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white xl:text-6xl">
                Welcome back to Nourique
              </h1>

              <p className="mt-4 max-w-lg text-base leading-7 text-slate-300">
                Continue building ATS-ready resumes, checking skill gaps, and
                preparing for interviews from one focused dashboard.
              </p>
            </div>

            <div className="relative mt-7 h-[330px]">
              <PreviewCard className="left-0 top-0 w-[340px] animate-[floatSoft_6s_ease-in-out_infinite]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      Active Resume
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">
                      Career Readiness Resume
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Resume ready for analysis
                    </p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-500/15 text-blue-200 ring-1 ring-blue-300/15">
                    <FileText size={21} />
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <MiniStat label="ATS" value="86" tone="emerald" />
                  <MiniStat label="Skills" value="12" tone="blue" />
                  <MiniStat label="Fit" value="78" tone="violet" />
                </div>

                <div className="mt-3 space-y-3">
                  {[
                    "Build Resume is ready",
                    "ATS Checker found 4 improvements",
                    // "Mock Interview queue prepared",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#10B981]" />
                      <span className="text-sm font-medium text-slate-300">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </PreviewCard>

              <PreviewCard className="bottom-0 right-0 w-[320px] animate-[floatSoft_5s_ease-in-out_infinite] [animation-delay:0.8s]">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-200 ring-1 ring-violet-300/15">
                    <Bot size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      AI Preparation Insight
                    </p>
                    <p className="text-sm text-slate-400">
                      Skill gap + interview focus
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/[0.055] p-4 ring-1 ring-white/10">
                  <p className="text-sm leading-6 text-slate-300">
                    Strengthen your ATS keywords, revise missing skills, and
                    practice resume-based mock interview questions.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {["ATS review", "Skill gap", "Aptitude prep", "AI interview"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-xl bg-white/[0.05] px-3 py-2 text-sm font-medium text-slate-300 ring-1 ring-white/10"
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </PreviewCard>
            </div>
          </div>
        </section>

        <section className="relative z-10 flex h-screen items-center justify-center px-5 py-5 sm:px-8">
          <div className="w-full max-w-md animate-[fadeUp_0.7s_ease-out_0.1s_both]">
            <div className="mb-5 flex items-center justify-center lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-blue-500/25">
                  <Sparkles size={19} />
                </span>
                <span className="text-xl font-bold tracking-tight">
                  Nourique
                </span>
              </Link>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.075] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7"
            >
              <div className="mb-6 text-center">
                <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white shadow-lg shadow-blue-500/25">
                  <Lock size={21} />
                </span>

                <h2 className="text-3xl font-semibold tracking-tight text-white">
                  Login to your workspace
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Access your active resume, ATS checks, skill-gap tracker, and
                  interview practice tools.
                </p>
              </div>

              <div className="space-y-4">
                <InputField
                  icon={<Mail size={18} />}
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Password
                  </label>
                  <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 shadow-sm transition focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-blue-500/15">
                    <Lock size={18} className="text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="text-slate-500 transition hover:text-white"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2 font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-4 rounded border-white/20 bg-slate-950 text-[#2563EB] focus:ring-[#2563EB]"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="font-semibold text-blue-300 transition hover:text-blue-200"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
              >
                {loading ? "Logging in..." : "Login"}
                <ArrowRight size={17} />
              </button>

              <p className="mt-5 text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-violet-300 transition hover:text-violet-200"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function InputField({ icon, label, ...inputProps }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 shadow-sm transition focus-within:border-[#2563EB] focus-within:ring-4 focus-within:ring-blue-500/15">
        <span className="text-slate-500">{icon}</span>
        <input
          {...inputProps}
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
      </div>
    </div>
  );
}

function PreviewCard({ children, className = "" }) {
  return (
    <div
      className={`absolute rounded-[1.4rem] border border-white/10 bg-white/[0.075] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const tones = {
    blue: "text-blue-300",
    emerald: "text-emerald-300",
    violet: "text-violet-300",
  };

  return (
    <div className="rounded-2xl bg-white/[0.055] p-3 ring-1 ring-white/10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
