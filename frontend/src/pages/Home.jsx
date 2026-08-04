import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import About from "../components/home/About";
import Footer from "../components/home/Footer";
import Tools from "../components/home/Tools";

const initialPathname = window.location.pathname;
const initialHash = window.location.hash;
let handledHomeRefreshForPageLoad = false;
 
export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const skippedRefreshHashScrollRef = useRef(false);

  useEffect(() => {
    if (handledHomeRefreshForPageLoad) return;
    handledHomeRefreshForPageLoad = true;

    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isRefresh = navigationEntry?.type === "reload";
    const refreshedOnHome = isRefresh && initialPathname === "/";

    if (refreshedOnHome) {
      window.history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });

      if (initialHash) {
        skippedRefreshHashScrollRef.current = true;
        navigate("/", { replace: true });
      }
    }
  }, [location.hash, navigate]);

  useEffect(() => {
    if (!location.hash) return;

    if (skippedRefreshHashScrollRef.current) {
      skippedRefreshHashScrollRef.current = false;
      return;
    }

    const targetId = location.hash.replace("#", "");

    window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: targetId === "hero" ? "start" : "center",
        inline: "nearest",
      });
    }, 0);
  }, [location.hash]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F8FAFC] pt-24 text-slate-950">
      <style>{`
        @keyframes floatOne {
          0%, 100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-14px) rotate(1deg);
          }
        }

        @keyframes floatTwo {
          0%, 100% {
            transform: translateY(0) rotate(1deg);
          }
          50% {
            transform: translateY(12px) rotate(-1deg);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        @keyframes glowDrift {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(22px, -18px, 0) scale(1.08);
          }
        }

        @keyframes orbitClockwise {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitCounter {
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes hubPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.25), 0 28px 90px rgba(37, 99, 235, 0.24);
          }
          50% {
            box-shadow: 0 0 0 18px rgba(37, 99, 235, 0), 0 34px 110px rgba(124, 58, 237, 0.26);
          }
        }
      `}</style>

      <section className="relative bg-[#F8FAFC]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] overflow-hidden">
          <div className="absolute left-[-8rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-blue-200/70 blur-3xl animate-[glowDrift_9s_ease-in-out_infinite]" />
          <div className="absolute right-[-8rem] top-24 h-[26rem] w-[26rem] rounded-full bg-violet-200/70 blur-3xl animate-[glowDrift_10s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] bg-[size:72px_72px] opacity-50" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
        </div>

        <Navbar />

        <Hero />
        <Tools />
        <Features />
        <About />
      </section>
      <Footer />
    </main>
  );
}



 
