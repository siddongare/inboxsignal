"use client";

import { useState, useEffect, useRef } from "react";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import {
  ArrowRight,
  Mail,
  Zap,
  AlertTriangle,
  FileText,
  Layers,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  AnalysisResult,
  AuditApiResponse,
  SavedAnalysis,
} from "@/lib/analysis-types";
import { Composer } from "@/components/inbox-signal/composer";
import { HistoryPanel } from "@/components/inbox-signal/history-panel";
import { ProgressPanel } from "@/components/inbox-signal/progress-panel";
import { ResultPanel } from "@/components/inbox-signal/result-panel";
import { demoEmail, demoProspect } from "@/components/inbox-signal/utils";
import { sfx } from "@/components/inbox-signal/tactile-audio";

// ─── Haute Hero Section (Issey Miyake × Mikalai Precision) ───────────────────
function HeroSection() {
  return (
    <div className="relative text-center mb-8 w-full max-w-3xl mx-auto select-none pt-4">
      {/* Sleek Minimalist Status Pill */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 mb-6 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00] animate-pulse" />
        <span className="font-mono text-[11px] font-medium tracking-wider text-slate-300 uppercase">
          Signal Laboratory
        </span>
        <span className="text-white/20">/</span>
        <span className="text-[11px] text-slate-400 font-normal">
          Executive Outbound Teardown
        </span>
      </div>

      {/* Main Sculpted Headline with Electric Acid Lime Accent */}
      <h1 className="text-4xl sm:text-6xl md:text-[5.2rem] font-extrabold text-white tracking-[-0.04em] leading-[0.96] font-sans">
        Eliminate cold outreach{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4FF00] via-emerald-300 to-teal-200">
          blind spots.
        </span>
      </h1>

      <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed mt-5 font-normal tracking-[-0.01em]">
        Diagnose the precise cognitive failure mechanisms that trigger executive deletes.
        Calibrated mathematical scoring, forensic breakdown, and high-conversion rewrites.
      </p>
    </div>
  );
}

// ─── Feature Bento Grid (Architectural Haute Minimalism) ─────────────────────
function FeatureGrid() {
  const items = [
    {
      icon: Zap,
      accent: "text-[#D4FF00] border-[#D4FF00]/25 bg-[#D4FF00]/10",
      tag: "Engine",
      title: "Signal Score Composite",
      desc: "Mathematical calibration across clarity, buyer relevance, verifiable proof, and CTA friction.",
    },
    {
      icon: AlertTriangle,
      accent: "text-[#FF2A55] border-[#FF2A55]/25 bg-[#FF2A55]/10",
      tag: "Forensics",
      title: "Cognitive Rejection Traps",
      desc: "Instant identification of executive triggers: fake familiarity, vague claims, and calendar drag.",
    },
    {
      icon: FileText,
      accent: "text-emerald-400 border-emerald-500/25 bg-emerald-500/10",
      tag: "Synthesis",
      title: "Conversion-Calibrated Rewrite",
      desc: "Sub-120 word surgical draft with 4 distinct psychological subject angles ready for launch.",
    },
    {
      icon: Layers,
      accent: "text-indigo-400 border-indigo-500/25 bg-indigo-500/10",
      tag: "Cadence",
      title: "Multi-Touch Sequence",
      desc: "Day 3 context bump and Day 7 breakup sequence that adds fresh enterprise angles without filler.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mx-auto mt-12">
      {items.map(({ icon: Icon, accent, tag, title, desc }) => (
        <div
          key={title}
          onClick={() => sfx.click()}
          className="p-6 rounded-3xl bg-[#0D0F14]/90 border border-white/[0.08] hover:border-white/[0.16] hover:bg-[#12151D] transition-all duration-300 shadow-xl backdrop-blur-2xl group cursor-default relative overflow-hidden"
        >
          {/* Subtle corner light reflection */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.03] to-transparent pointer-events-none" />

          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${accent}`}
            >
              <Icon size={18} />
            </div>
            <span className="font-mono text-[10px] tracking-widest uppercase text-slate-500 bg-white/[0.02] px-2 py-0.5 rounded border border-white/[0.04]">
              {tag}
            </span>
          </div>

          <h3 className="text-sm font-semibold text-white tracking-tight mb-1.5">
            {title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Result Preview (Haute Teardown Mockup) ──────────────────────────────────
function ResultPreview() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto mt-14 mb-8">
      <div className="flex items-center justify-between pb-2 mb-2 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
          <span className="text-slate-400 font-mono text-[11px] tracking-wider uppercase">
            Teardown Dossier · SDR to VP of Revenue
          </span>
        </div>
        <button
          onClick={() => {
            sfx.click();
            setRevealed((r) => !r);
          }}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition cursor-pointer"
        >
          {revealed ? "Conceal Teardown" : "Examine Specimen →"}
        </button>
      </div>

      <div className="relative rounded-3xl bg-[#0D0F14]/95 border border-white/[0.08] p-6 shadow-2xl backdrop-blur-2xl overflow-hidden">
        {/* Conceal overlay */}
        {!revealed && (
          <div
            onClick={() => {
              sfx.click();
              setRevealed(true);
            }}
            className="absolute inset-0 bg-[#060709]/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#D4FF00]/10 border border-[#D4FF00]/25 flex items-center justify-center text-[#D4FF00] mb-2.5 group-hover:scale-105 transition shadow-[0_0_18px_rgba(212,255,0,0.2)]">
              <TrendingUp size={18} />
            </div>
            <span className="text-xs font-semibold text-white mb-1 tracking-tight">
              Click to Reveal Specimen Breakdown
            </span>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Experience how InboxSignal dissects a 47/100 outbound failure and synthesizes high-signal copy.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Column: Radial score teaser */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">
                Composite Signal
              </span>
              <span className="font-mono text-sm font-bold text-[#FF2A55]">
                47 / 100
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Clarity</span>
                <span className="font-mono text-amber-400 font-semibold">58%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Relevance</span>
                <span className="font-mono text-[#FF2A55] font-semibold">35%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Credibility</span>
                <span className="font-mono text-amber-400 font-semibold">50%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>CTA Friction</span>
                <span className="font-mono text-amber-400 font-semibold">45%</span>
              </div>
            </div>
          </div>

          {/* Right Column: Rewrite preview */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold text-[#D4FF00] block mb-2 font-mono uppercase tracking-wider">
                Synthesized Vector
              </span>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {`Hi Sarah,\n\nSaw you're scaling outbound to 12 AEs this quarter. Most revenue leaders find reply rates crater when reps send generic templates.\n\nWe helped Ramp boost cold pipeline by 42% without extra reps.\n\nOpen to seeing the teardown?`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Header Navigation (Mikalai × Issey Miyake Fluid Architecture) ──────────
function Header({
  signedIn,
  remaining,
  limit,
  activeNav,
  onNavChange,
  onReset,
}: {
  signedIn: boolean;
  remaining: number;
  limit: number;
  activeNav: "studio" | "analytics" | "templates" | "rubric";
  onNavChange: (tab: "studio" | "analytics" | "templates" | "rubric") => void;
  onReset: () => void;
}) {
  const navItems: { id: "studio" | "analytics" | "templates" | "rubric"; label: string; icon: any }[] = [
    { id: "studio", label: "Studio", icon: Zap },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "templates", label: "Swipe File", icon: FileText },
    { id: "rubric", label: "Rubric", icon: ShieldCheck },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 px-6 sm:px-12 bg-gradient-to-b from-[#060709]/95 via-[#060709]/80 to-transparent backdrop-blur-xl flex items-center justify-between select-none transition-all">
      {/* Brand: Mikalai-Style Geometric Haute Monogram */}
      <div className="flex items-center gap-10">
        <button
          onClick={() => {
            sfx.click();
            onReset();
          }}
          className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 group"
        >
          {/* Mikalai Geometric Icon: Precision origami fold & radar pulse */}
          <div className="relative w-9 h-9 rounded-xl bg-[#0D0F14] border border-white/[0.1] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,255,0,0.15)] group-hover:border-[#D4FF00]/60 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4FF00]/10 via-transparent to-transparent pointer-events-none" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transform group-hover:scale-105 transition-transform duration-300">
              {/* Outer structural diamond/hexagon */}
              <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" stroke="#D4FF00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              {/* Center signal core */}
              <circle cx="12" cy="12" r="3.2" fill="#D4FF00" />
              <line x1="12" y1="2" x2="12" y2="7" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
              <line x1="12" y1="17" x2="12" y2="22" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4" />
            </svg>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold tracking-[-0.03em] text-white">
              InboxSignal
            </span>
            <span className="font-mono text-[9px] text-[#D4FF00] font-bold tracking-widest uppercase opacity-90 px-1.5 py-0.5 rounded bg-[#D4FF00]/10 border border-[#D4FF00]/20">
              Lab
            </span>
          </div>
        </button>

        {/* Seamless Floating Pill Navigation */}
        <nav className="hidden sm:flex items-center gap-1 p-1 rounded-2xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-md">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                sfx.click();
                onNavChange(id);
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                activeNav === id
                  ? "bg-white/[0.1] text-white shadow-sm border border-white/[0.1] font-semibold"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon
                size={13}
                className={activeNav === id ? "text-[#D4FF00]" : "text-slate-500"}
              />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right User Status */}
      <div className="flex items-center gap-4">
        {signedIn ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_6px_#D4FF00] animate-pulse" />
              <span className="font-mono text-xs text-slate-300 font-medium">
                {remaining}/{limit} left
              </span>
            </div>
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: {
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: "999px",
                  },
                },
              }}
            />
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <button
                onClick={() => sfx.click()}
                className="text-xs font-medium text-slate-400 hover:text-white px-3.5 py-1.5 transition cursor-pointer"
              >
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                onClick={() => sfx.click()}
                className="text-xs font-bold bg-[#D4FF00] text-black px-4.5 py-2 rounded-xl shadow-[0_0_20px_rgba(212,255,0,0.3)] hover:shadow-[0_0_28px_rgba(212,255,0,0.45)] hover:bg-[#e2ff33] transition active:scale-98 cursor-pointer"
              >
                Get Started
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </header>
  );
}



import { AnalyticsView } from "@/components/inbox-signal/analytics-view";
import { TemplateSwipeFile, type SwipeTemplate } from "@/components/inbox-signal/template-swipe-file";
import { BenchmarkRubricView } from "@/components/inbox-signal/benchmark-rubric-view";

// ─── Main Shell Component ────────────────────────────────────────────────────
interface InboxSignalShellProps {
  initialHistory: SavedAnalysis[];
  initialLimit: number;
  initialRemaining: number;
  initialNav?: NavTab;
}

type ApiState = "idle" | "loading" | "error";
type SidebarTab = "edit" | "history";
type NavTab = "studio" | "analytics" | "templates" | "rubric";

export default function InboxSignalShell({
  initialHistory,
  initialLimit,
  initialRemaining,
  initialNav = "studio",
}: InboxSignalShellProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const signedIn = Boolean(isLoaded && isSignedIn);

  const [activeNav, setActiveNav] = useState<NavTab>(initialNav);
  const [history, setHistory] = useState(initialHistory);
  const [email, setEmail] = useState("");
  const [prospect, setProspect] = useState("");
  const [active, setActive] = useState<SavedAnalysis | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [status, setStatus] = useState<ApiState>("idle");
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [phase, setPhase] = useState<"landing" | "loading" | "results">("landing");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("edit");

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRemaining(initialRemaining);
  }, [initialRemaining]);
  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  // Restore prefill after Clerk redirect
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const stashed = sessionStorage.getItem("inboxsignal_prefill");
    if (stashed) {
      sessionStorage.removeItem("inboxsignal_prefill");
      setEmail(stashed);
    }
  }, [isLoaded, isSignedIn]);

  async function analyze() {
    if (!email.trim() || !prospect.trim() || !signedIn) return;
    sfx.click();
    setPhase("loading");
    setStatus("loading");
    setError("");
    setAnalysis(null);
    setSubmittedEmail(email);

    setTimeout(() => {
      resultsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prospect }),
      });
      const data = (await res.json()) as AuditApiResponse;
      setRemaining(data.remaining);

      if (!res.ok || data.error || !data.data || !data.savedAnalysis) {
        throw new Error(data.error ?? "Server error, please try again");
      }

      setAnalysis(data.data);
      setActive(data.savedAnalysis);
      setHistory((h) => [data.savedAnalysis!, ...h].slice(0, 50));
      setStatus("idle");
      setPhase("results");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unexpected error");
      setPhase("results");
    }
  }

  // ── Iterate V2 Action: transfer rewrite into composer ──
  function handleIterateV2() {
    if (!analysis?.rewrite?.email) return;
    sfx.click();
    setEmail(analysis.rewrite.email);
    setSidebarTab("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteSaved(id: string) {
    sfx.click();
    const next = history.filter((i) => i.id !== id);
    setHistory(next);
    if (active?.id === id) {
      const n = next[0] ?? null;
      setActive(n);
      setAnalysis(n?.result ?? null);
      if (!n) setPhase("landing");
    }
    await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  }

  async function renameSaved(id: string, title: string) {
    sfx.click();
    setHistory((h) => h.map((i) => (i.id === id ? { ...i, title } : i)));
    if (active?.id === id) setActive((a) => (a ? { ...a, title } : a));
    await fetch("/api/history", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title }),
    });
  }

  function selectSaved(item: SavedAnalysis) {
    sfx.click();
    setActive(item);
    setAnalysis(item.result);
    setEmail(item.email);
    setProspect(item.prospect);
    setSubmittedEmail(item.email);
    setPhase("results");
    setSidebarTab("edit");
  }

  function handleSignInAndAnalyze() {
    if (email.trim()) {
      sessionStorage.setItem("inboxsignal_prefill", email.trim());
    }
  }

  function handleReset() {
    sfx.click();
    setPhase("landing");
    setAnalysis(null);
    setActive(null);
    setError("");
    setStatus("idle");
    setActiveNav("studio");
  }

  function handleLoadTemplate(tpl: SwipeTemplate) {
    sfx.click();
    setEmail(tpl.email);
    setProspect(`Target: ${tpl.targetPersona}`);
    setActiveNav("studio");
    setSidebarTab("edit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isLanding = phase === "landing";

  return (
    <div className="min-h-screen flex flex-col relative bg-[#060709] text-slate-100">
      {/* Header */}
      <Header
        signedIn={signedIn}
        remaining={remaining}
        limit={initialLimit}
        activeNav={activeNav}
        onNavChange={(tab) => {
          setActiveNav(tab);
          if (typeof window !== "undefined") {
            const url = tab === "studio" ? "/" : `/?tab=${tab}`;
            window.history.pushState(null, "", url);
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onReset={handleReset}
      />

      <div className="pt-20 flex-1 flex flex-col relative z-10">
        {/* ── TAB 1: ANALYTICS VIEW ── */}
        {activeNav === "analytics" && (
          <main className="flex-1 p-4 sm:p-8">
            <AnalyticsView
              history={history}
              onSelectAudit={(item) => {
                selectSaved(item);
                setActiveNav("studio");
              }}
              onGoToStudio={() => {
                setActiveNav("studio");
                setPhase("landing");
              }}
            />
          </main>
        )}

        {/* ── TAB 2: SWIPE FILE / TEMPLATES ── */}
        {activeNav === "templates" && (
          <main className="flex-1 p-4 sm:p-8">
            <TemplateSwipeFile onLoadIntoStudio={handleLoadTemplate} />
          </main>
        )}

        {/* ── TAB 3: BENCHMARK RUBRIC ── */}
        {activeNav === "rubric" && (
          <main className="flex-1 p-4 sm:p-8">
            <BenchmarkRubricView
              onGoToStudio={() => {
                setActiveNav("studio");
                setPhase("landing");
              }}
            />
          </main>
        )}

        {/* ── TAB 4: STUDIO (DIAGNOSTIC ENGINE) ── */}
        {activeNav === "studio" && isLanding && (
          <AnimatePresence>
            <motion.main
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-4 py-12 relative"
            >
              <HeroSection />

              {/* Composer */}
              <Composer
                displayMode="landing"
                email={email}
                prospect={prospect}
                remaining={remaining}
                limit={initialLimit}
                signedIn={signedIn}
                loading={status === "loading"}
                onEmailChange={setEmail}
                onProspectChange={setProspect}
                onAnalyze={analyze}
                onSignInAndAnalyze={handleSignInAndAnalyze}
                onUseDemo={() => {
                  setEmail(demoEmail);
                  setProspect(demoProspect);
                }}
              />

              {/* Minimalist Feature Bento Grid */}
              <FeatureGrid />

              {/* Verified Result Preview */}
              <ResultPreview />
            </motion.main>
          </AnimatePresence>
        )}

        {/* ── STUDIO: RESULTS DASHBOARD PHASE ── */}
        {activeNav === "studio" && !isLanding && (
          <div className="layout-row flex flex-1 min-h-[calc(100vh-56px)]">
            {/* Sidebar */}
            <aside className="sidebar-panel w-full md:w-[350px] shrink-0 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex flex-col border-r border-white/[0.08] bg-[#0A0B10]">
              {/* Sidebar Tabs */}
              <div className="flex p-2.5 gap-2 border-b border-white/[0.06] sticky top-0 z-10 bg-[#0A0B10]/95 backdrop-blur-md">
                <button
                  onClick={() => {
                    sfx.click();
                    setSidebarTab("edit");
                  }}
                  className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    sidebarTab === "edit"
                      ? "bg-white/[0.08] text-white border border-white/[0.12]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Mail size={13} />
                  <span>Edit Draft</span>
                </button>
                <button
                  onClick={() => {
                    sfx.click();
                    setSidebarTab("history");
                  }}
                  className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    sidebarTab === "history"
                      ? "bg-white/[0.08] text-white border border-white/[0.12]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock size={13} />
                  <span>Timeline {history.length > 0 && `(${history.length})`}</span>
                </button>
              </div>

              <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
                {sidebarTab === "edit" && (
                  <Composer
                    displayMode="sidebar"
                    email={email}
                    prospect={prospect}
                    remaining={remaining}
                    limit={initialLimit}
                    signedIn={signedIn}
                    loading={status === "loading"}
                    onEmailChange={setEmail}
                    onProspectChange={setProspect}
                    onAnalyze={analyze}
                    onSignInAndAnalyze={handleSignInAndAnalyze}
                    onUseDemo={() => {
                      setEmail(demoEmail);
                      setProspect(demoProspect);
                    }}
                  />
                )}

                {sidebarTab === "history" && (
                  signedIn ? (
                    <>
                      <ProgressPanel history={history} />
                      <HistoryPanel
                        history={history}
                        activeId={active?.id ?? null}
                        signedIn={signedIn}
                        onSelect={selectSaved}
                        onDelete={deleteSaved}
                        onRename={renameSaved}
                      />
                    </>
                  ) : (
                    <div className="p-6 text-center border border-white/[0.08] rounded-2xl bg-white/[0.02]">
                      <Layers className="text-slate-500 mx-auto mb-3" size={24} />
                      <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                        Preserve Analysis History
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        Sign in to track analyses and measure your signal score
                        improvement over time.
                      </p>
                      <SignUpButton mode="modal">
                        <button
                          onClick={() => sfx.click()}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                        >
                          Create Account
                        </button>
                      </SignUpButton>
                    </div>
                  )
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500">
                <button
                  onClick={handleReset}
                  className="hover:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  ← Back to landing
                </button>
                <span>UTC reset</span>
              </div>
            </aside>

            {/* Results pane */}
            <main
              ref={resultsRef}
              className="results-scroll flex-1 overflow-y-auto sticky top-14 h-[calc(100vh-56px)] p-4 sm:p-8"
            >
              <AnimatePresence mode="wait">
                {status === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-3xl mx-auto py-12"
                  >
                    <div className="flex items-center gap-3 mb-6 p-4 border border-blue-500/20 bg-blue-500/[0.04] rounded-2xl">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                      <span className="text-xs font-semibold text-blue-300">
                        Diagnosing cold outreach vectors...
                      </span>
                    </div>
                    <div className="space-y-4">
                      {[140, 100, 100].map((h, i) => (
                        <div
                          key={i}
                          className="animate-pulse bg-[#111319] border border-white/[0.06] rounded-2xl"
                          style={{ height: h }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-3xl mx-auto p-4 border border-rose-500/30 bg-rose-500/[0.05] rounded-2xl"
                  >
                    <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs mb-1">
                      <AlertTriangle size={14} />
                      <span>Analysis Interrupted</span>
                    </div>
                    <p className="text-xs text-rose-200">{error}</p>
                  </motion.div>
                )}

                {status === "idle" && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-3xl mx-auto"
                  >
                    <ResultPanel
                      analysis={analysis}
                      selected={active}
                      originalEmail={submittedEmail}
                      onIterateV2={handleIterateV2}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
