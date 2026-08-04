import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  FileText,
  LogOut,
  Menu,
  MessageCircle,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { label: "Home", to: "/#hero", icon: Sparkles },
  { label: "Tools", to: "/#tools", icon: Wrench },
  { label: "Features", to: "/#features", icon: FileText },
  { label: "About", to: "/#about", icon: MessageCircle },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isLoggedIn = Boolean(user);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const profileRef = useRef(null);
  const lastScrollYRef = useRef(0);

  const userName =
    user?.fullName || user?.name || user?.email?.split("@")[0] || "Candidate";
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
      setProfileOpen(false);
    });
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const handleClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollingDown = currentScrollY > lastScrollYRef.current;
      const scrollingUp = currentScrollY < lastScrollYRef.current;

      if (currentScrollY < 24 || scrollingUp) {
        setIsNavbarVisible(true);
      } else if (scrollingDown && currentScrollY > 120) {
        setIsNavbarVisible(false);
        setMobileOpen(false);
        setProfileOpen(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (to) => {
    const [path, hash] = to.split("#");
    if (hash === "hero") {
      return location.pathname === "/" && (!location.hash || location.hash === "#hero");
    }

    return location.pathname === path && location.hash === `#${hash}`;
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  return (
    <header
      className={`fixed inset-x-0 top-3 z-50 px-4 transition-all duration-200 ease-out md:px-8 ${
        isNavbarVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-24 opacity-0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-blue-100/90 bg-white/[0.94] px-3 shadow-[0_22px_80px_rgba(37,99,235,0.18)] ring-1 ring-white/80 backdrop-blur-2xl md:px-4">
        <Link to="/" className="group flex shrink-0 items-center gap-3">
          <span className="relative grid size-11 place-items-center overflow-hidden rounded-[1.15rem] bg-[#0B1220] shadow-[0_16px_34px_rgba(37,99,235,0.25)] ring-1 ring-blue-100/80 transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_42px_rgba(37,99,235,0.34)]">
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.3),transparent_24%),linear-gradient(135deg,#1D4ED8_0%,#4F46E5_52%,#0F172A_100%)]" />
            <span className="absolute -right-5 -top-4 size-10 rounded-full bg-cyan-300/25 blur-lg" />
            <span className="absolute left-[11px] top-[8px] h-[27px] w-[21px] rounded-[7px] border border-white/35 bg-white/92 shadow-lg shadow-slate-950/20" />
            <span className="absolute left-[24px] top-[8px] h-[8px] w-[8px] rounded-bl-[7px] border-b border-l border-blue-200 bg-blue-50" />
            <span className="absolute left-[15px] top-[15px] h-[3px] w-[10px] rounded-full bg-blue-500" />
            <span className="absolute left-[15px] top-[21px] h-[2px] w-[13px] rounded-full bg-slate-300" />
            <span className="absolute left-[15px] top-[26px] h-[2px] w-[9px] rounded-full bg-slate-300" />
            <span className="absolute bottom-[8px] right-[8px] grid size-4 place-items-center rounded-full border-2 border-white bg-emerald-400 shadow-[0_8px_16px_rgba(16,185,129,0.32)]">
              <span className="h-1.5 w-2 rotate-[-45deg] rounded-sm border-b-2 border-l-2 border-white" />
            </span>
          </span>

          <span className="leading-none">
            <span className="block text-xl font-black tracking-tight text-slate-950">
              <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
                Nouri
              </span>
              que
            </span>
            <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
              Career Studio
            </span>
          </span>
        </Link>

        <nav className="hidden rounded-full border border-blue-100/80 bg-gradient-to-r from-blue-50/90 via-white to-violet-50/90 p-1.5 shadow-inner shadow-blue-100/70 lg:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);

            return (
              <Link
                key={link.label}
                to={link.to}
                className={`group relative flex h-10 items-center gap-2 overflow-hidden rounded-full px-4 text-sm font-bold transition-all duration-300 ${
                  active
                    ? "bg-white text-[#2563EB] shadow-md shadow-blue-100 ring-1 ring-blue-100"
                    : "text-slate-600 hover:bg-white/90 hover:text-slate-950"
                }`}
              >
                <Icon
                  size={17}
                  className={active ? "text-[#2563EB]" : "text-slate-400"}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((current) => !current)}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-2 py-1.5 pr-3 text-sm font-bold text-slate-700 shadow-md shadow-blue-100/50 transition hover:border-blue-200 hover:text-[#2563EB]"
              >
                <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-black text-white">
                  {userInitial}
                </span>
                <span className="whitespace-nowrap">
                  Hello, {userName}
                </span>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-300/50 backdrop-blur-2xl">
                  <div className="px-3 py-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                      Signed in as
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-950">
                      {userName}
                    </p>
                  </div>

                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-[#2563EB]"
                  >
                    <BrainCircuit size={16} />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-rose-500 transition hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#2563EB]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
              >
                Sign up
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-[#2563EB] lg:hidden"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      <div
        className={`mx-auto mt-3 max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/60 backdrop-blur-2xl transition-all duration-300 lg:hidden ${
          mobileOpen ? "max-h-[620px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="grid gap-1 p-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);

            return (
              <Link
                key={link.label}
                to={link.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  active
                    ? "bg-blue-50 text-[#2563EB]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <Icon
                  size={17}
                  className={active ? "text-[#2563EB]" : "text-slate-400"}
                />
                {link.label}
              </Link>
            );
          })}

          <div className="mt-2 border-t border-slate-100 pt-3">
            {isLoggedIn ? (
              <div className="grid gap-2">
                <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-xs font-black text-white">
                    {userInitial}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                      Hello, {userName}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      Ready to continue
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-bold text-[#2563EB]"
                >
                  <BrainCircuit size={16} />
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-5 py-3 text-sm font-bold text-rose-500"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="rounded-full border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-[#2563EB] px-5 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-500/20"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
