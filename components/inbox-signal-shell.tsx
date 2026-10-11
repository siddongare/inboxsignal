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

// ─── Luma-Style Hero Section ──────────────────────────────────────────────────
function HeroSection() {
  return (
    <div className="relative text-center mb-6 w-full max-w-2xl mx-auto select-none">
      {/* Subtle Luminous Status Pill */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 mb-5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl shadow-inner">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-medium text-slate-300">
          Free · 3 diagnostic analyses / day
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-xs text-slate-400">No credit card</span>
      </div>

      {/* Main Elegant Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] font-sans">
        Turn cold emails{" "}
        <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
          into pipeline.
        </span>
      </h1>

      <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto leading-relaxed mt-4 font-normal">
        Diagnose why executive buyers ignore your outbound. Get an objective
        signal score, failure mechanisms, and high-converting rewrites.
      </p>
    </div>
  );
}

// ─── Feature Bento Grid (Luma Minimalist Style) ──────────────────────────────
function FeatureGrid() {
  const items = [
    {
      icon: Zap,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      title: "Signal Score Engine",
      desc: "Mathematical composite across clarity, relevance, credibility, and CTA friction.",
    },
    {
      icon: AlertTriangle,
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      title: "Forensic Failure Diagnosis",
      desc: "Severity-ranked failure points with the cognitive rejection mechanism explained.",
    },
    {
      icon: FileText,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      title: "Conversion-Focused Rewrite",
      desc: "Compelling message rewrite plus 4 distinct subject line variations ready for deployment.",
    },
    {
      icon: Layers,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      title: "Multi-Touch Cadence",
      desc: "Day 3 context bump and Day 7 breakup sequence adding fresh angles without filler.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mx-auto mt-10">
      {items.map(({ icon: Icon, color, title, desc }) => (
        <div
          key={title}
          onClick={() => sfx.click()}
          className="p-5 rounded-3xl bg-[#111319]/80 border border-white/[0.08] hover:border-white/[0.14] transition-all shadow-sm backdrop-blur-xl group cursor-default"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3.5 ${color}`}
          >
            <Icon size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Result Preview (Luma Mockup Sample) ──────────────────────────────────────
function ResultPreview() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto mt-12 mb-8">
      <div className="flex items-center justify-between pb-2 mb-2 text-xs">
        <span className="text-slate-400 font-medium">
          Verified Audit · AutoLead to VP of Sales
        </span>
        <button
          onClick={() => {
            sfx.click();
            setRevealed((r) => !r);
          }}
          className="px-3 py-1 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition"
        >
          {revealed ? "Conceal Sample" : "Examine Sample →"}
        </button>
      </div>

      <div className="relative rounded-3xl bg-[#111319]/90 border border-white/[0.08] p-6 shadow-xl backdrop-blur-xl overflow-hidden">
        {/* Conceal overlay */}
        {!revealed && (
          <div
            onClick={() => {
              sfx.click();
              setRevealed(true);
            }}
            className="absolute inset-0 bg-[#090A0F]/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
              <TrendingUp size={18} />
            </div>
            <span className="text-xs font-semibold text-white mb-1">
              Click to Reveal Diagnostic Breakdown
            </span>
            <p className="text-xs text-slate-400 max-w-xs">
              Preview how InboxSignal scores a draft (47/100) and rewrites it into
              high-signal outbound.
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
              <span className="font-mono text-sm font-bold text-rose-400">
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
                <span className="font-mono text-rose-400 font-semibold">35%</span>
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
              <span className="text-xs font-semibold text-emerald-400 block mb-2">
                Conversion Rewrite
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

// ─── Header Navigation ───────────────────────────────────────────────────────
function Header({
  signedIn,
  remaining,
  limit,
  onReset,
}: {
  signedIn: boolean;
  remaining: number;
  limit: number;
  onReset: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 px-4 sm:px-8 bg-[#090A0F]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between select-none">
      <button
        onClick={() => {
          sfx.click();
          onReset();
        }}
        className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md group-hover:scale-105 transition">
          IS
        </div>
        <span className="text-sm font-bold tracking-tight text-white">
          InboxSignal
        </span>
        <span className="font-mono text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06] uppercase">
          Beta
        </span>
      </button>

      <div className="flex items-center gap-3">
        {signedIn ? (
          <>
            <span className="font-mono text-xs font-medium text-slate-400 bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
              {remaining}/{limit} left
            </span>
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: {
                    border: "1px solid rgba(255,255,255,0.12)",
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
                className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 transition cursor-pointer"
              >
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                onClick={() => sfx.click()}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.25)] transition cursor-pointer"
              >
                Sign up free
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </header>
  );
}

// ─── Main Shell Component ────────────────────────────────────────────────────
interface InboxSignalShellProps {
  initialHistory: SavedAnalysis[];
  initialLimit: number;
  initialRemaining: number;
}

type ApiState = "idle" | "loading" | "error";
type SidebarTab = "edit" | "history";

export default function InboxSignalShell({
  initialHistory,
  initialLimit,
  initialRemaining,
}: InboxSignalShellProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const signedIn = Boolean(isLoaded && isSignedIn);

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
  }

  const isLanding = phase === "landing";

  return (
    <div className="min-h-screen flex flex-col relative bg-[#090A0F] text-slate-100">
      {/* Header */}
      <Header
        signedIn={signedIn}
        remaining={remaining}
        limit={initialLimit}
        onReset={handleReset}
      />

      <div className="pt-14 flex-1 flex flex-col relative z-10">
        {/* ── LANDING PHASE ── */}
        <AnimatePresence>
          {isLanding && (
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
          )}
        </AnimatePresence>

        {/* ── RESULTS DASHBOARD PHASE ── */}
        {!isLanding && (
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
