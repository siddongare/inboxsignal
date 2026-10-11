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
  Flame,
  Volume2,
  VolumeX,
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
import {
  RubberStamp,
  MaskingTape,
  StickyCritique,
  BarcodeTicket,
  CropMarkCorner,
  VerticalEditorialLabel,
} from "@/components/inbox-signal/tactile-elements";

// ─── Hero Section (Issey Miyake / Zinezo Editorial Style) ──────────────────────
function HeroSection({
  onSampleClick,
}: {
  onSampleClick: () => void;
}) {
  return (
    <div className="relative text-center mb-6 w-full max-w-2xl mx-auto select-none">
      {/* Classification Tag Pill */}
      <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 mb-5 bg-[#121216] border-2 border-zinc-800 rounded-[2px] font-mono text-[11px] text-zinc-300 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold tracking-wider uppercase text-zinc-100">
          FREE TIER · 3 DIAGNOSTIC AUDITS / DAY
        </span>
        <span className="text-zinc-600">//</span>
        <span className="text-zinc-400">NO CARD REQUIRED</span>
      </div>

      {/* Main Stark Editorial Headline */}
      <div className="relative inline-block mb-3">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.95] font-sans">
          TURN COLD EMAILS
          <br />
          <span className="text-zinc-400 underline decoration-zinc-700 decoration-wavy underline-offset-8">
            INTO REPLIES.
          </span>
        </h1>

        {/* Tilted Stamp Offset (Breaks the grid) */}
        <div className="absolute -top-3.5 -right-6 sm:-right-12 hidden xs:block">
          <RubberStamp
            text="SPECIMEN: HIGH FRICTION"
            variant="critical"
            angle={6}
          />
        </div>
      </div>

      <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto leading-relaxed mt-2 font-sans font-medium">
        An editorial autopsy instrument for cold sales outreach. Diagnose why
        your messages get ignored — then rewrite them for reply velocity.
      </p>

      {/* Quick Interactive Stamped Tags */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 font-mono">
        <RubberStamp
          text="[4 DIAGNOSTIC VECTORS]"
          variant="neutral"
          angle={-1.5}
        />
        <RubberStamp
          text="[BENCHMARK CALIBRATED]"
          variant="low"
          angle={1.8}
        />
        <RubberStamp
          text="[CADENCE GENERATOR]"
          variant="caution"
          angle={-2}
        />
      </div>
    </div>
  );
}

// ─── Feature Grid (Editorial Brutalist Wireframe) ────────────────────────────
function FeatureGrid() {
  const items = [
    {
      n: "VEC.01",
      icon: Zap,
      stamp: "0–100 SCORE",
      color: "text-blue-400",
      title: "Signal Score Engine",
      desc: "Mathematical composite across clarity, relevance, credibility, and call-to-action friction.",
    },
    {
      n: "VEC.02",
      icon: AlertTriangle,
      stamp: "FORENSIC AUTOPSY",
      color: "text-red-400",
      title: "Failure Diagnosis",
      desc: "Exact failure mechanisms ranked Critical → Low with the psychological mechanism explained.",
    },
    {
      n: "VEC.03",
      icon: FileText,
      stamp: "REWRITE + 4 HOOKS",
      color: "text-emerald-400",
      title: "Conversion Rewrite",
      desc: "Flawless copy rewrite plus 4 distinct subject line angles ready for immediate A/B deployment.",
    },
    {
      n: "VEC.04",
      icon: Layers,
      stamp: "CADENCE SEQUENCE",
      color: "text-amber-400",
      title: "Multi-Touch Cadence",
      desc: "Day 3 context bump & Day 7 breakup sequence adding fresh leverage instead of 'just checking in'.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-xl mx-auto mt-10 font-mono">
      {items.map(({ n, icon: Icon, stamp, color, title, desc }) => (
        <div
          key={title}
          onClick={() => sfx.click()}
          className="relative p-4 rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 hover:border-zinc-500 transition shadow-sm cursor-default group"
        >
          <CropMarkCorner position="top-left" />
          <CropMarkCorner position="bottom-right" />

          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 mb-2.5">
            <div className="flex items-center gap-2">
              <Icon size={14} className={color} />
              <span className="text-[10px] font-black text-zinc-400">{n}</span>
            </div>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
              {stamp}
            </span>
          </div>

          <h3 className="text-sm font-bold text-zinc-100 font-sans tracking-tight mb-1">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 font-sans leading-relaxed">
            {desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Result Preview (Editorial Zine Sample Dossier) ──────────────────────────
function ResultPreview() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative w-full max-w-xl mx-auto mt-12 mb-8">
      {/* Tape on Top-Left */}
      <MaskingTape width={100} angle={-3} className="absolute -top-3 -left-3 hidden sm:block" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 font-mono text-[11px] border-b border-zinc-800">
        <span className="text-zinc-400 font-bold uppercase tracking-wider">
          CASE FILE // 0984 · SDR DRAFT AUTOPSY
        </span>
        <button
          onClick={() => {
            sfx.paper();
            setRevealed((r) => !r);
          }}
          className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-[2px] transition"
        >
          {revealed ? "[CONCEAL DOSSIER]" : "[EXAMINE CASE FILE →]"}
        </button>
      </div>

      {/* Dossier Card Container */}
      <div className="relative rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 p-5 shadow-lg overflow-hidden font-mono">
        <CropMarkCorner position="top-left" />
        <CropMarkCorner position="top-right" />
        <CropMarkCorner position="bottom-left" />
        <CropMarkCorner position="bottom-right" />

        {/* Conceal overlay */}
        {!revealed && (
          <div
            onClick={() => {
              sfx.paper();
              setRevealed(true);
            }}
            className="absolute inset-0 bg-[#0A0A0C]/85 backdrop-blur-[4px] z-30 flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          >
            <RubberStamp
              text="CLASSIFIED CASE // CLICK TO UNSEAL"
              variant="caution"
              angle={-2}
              className="mb-3 text-xs"
            />
            <p className="text-xs text-zinc-400 font-sans max-w-xs">
              Review a verified failure autopsy: original draft scored at 47/100,
              reasons it failed, and the conversion rewrite.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Column: Forensic Metric Readout */}
          <div className="flex flex-col gap-3">
            <div className="p-3 bg-[#141418] border border-zinc-800 rounded-[2px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">
                  SIGNAL READOUT
                </span>
                <span className="text-sm font-black text-red-400 font-mono">
                  47 / 100
                </span>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between text-zinc-400">
                  <span>CLARITY</span>
                  <span className="font-bold text-amber-400">58%</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>RELEVANCE</span>
                  <span className="font-bold text-red-400">35%</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>CREDIBILITY</span>
                  <span className="font-bold text-amber-400">50%</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>CTA STRENGTH</span>
                  <span className="font-bold text-amber-400">45%</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#141418] border border-zinc-800 rounded-[2px] flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-400 uppercase font-bold">
                DIAGNOSED THREATS
              </span>
              <div className="text-[10px] space-y-1 text-zinc-300 font-sans">
                <div className="flex items-center gap-1.5">
                  <span className="text-red-400 font-mono font-bold">[CRITICAL]</span>
                  <span>Zero prospect pain alignment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-400 font-mono font-bold">[HIGH]</span>
                  <span>Self-centered company pitch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 font-mono font-bold">[MEDIUM]</span>
                  <span>High friction 30-min calendar ask</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Case Rewrite Dossier */}
          <div className="p-3 bg-[#141418] border border-zinc-800 rounded-[2px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase">
                  VERIFIED REWRITE
                </span>
                <span className="text-[9px] text-zinc-500">[REV. 02]</span>
              </div>
              <p className="text-xs text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap">
                {`Hi Sarah,\n\nSaw you're scaling outbound to 12 AEs this quarter. Most revenue leaders find reply rates crater when reps send generic templates.\n\nWe helped Ramp boost cold pipeline by 42% without extra reps.\n\nOpen to seeing the teardown?`}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800 text-[10px] text-zinc-500 flex justify-between">
              <span>HOOK: HIRING TRIGGER</span>
              <span className="text-emerald-400 font-bold">PASS · 88/100</span>
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
    <header className="fixed top-0 left-0 right-0 z-50 h-13 px-4 sm:px-8 bg-[#09090C]/90 backdrop-blur-md border-b-2 border-zinc-800 flex items-center justify-between select-none">
      <button
        onClick={() => {
          sfx.click();
          onReset();
        }}
        className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 group"
      >
        <div className="w-7 h-7 rounded-[2px] bg-white text-black flex items-center justify-center font-mono font-black text-sm group-hover:scale-105 transition">
          IS
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-black tracking-wider text-white uppercase">
            INBOXSIGNAL
          </span>
          <span className="hidden sm:inline font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
            // REV. 2026
          </span>
        </div>
      </button>

      <div className="flex items-center gap-3.5 font-mono">
        {signedIn ? (
          <>
            <span className="text-xs font-bold text-zinc-400 bg-zinc-900 px-2.5 py-1 border border-zinc-800 rounded-[2px]">
              [{remaining}/{limit} LEFT TODAY]
            </span>
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: {
                    border: "2px solid #27272A",
                    borderRadius: "2px",
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
                className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white px-3 py-1.5 transition cursor-pointer"
              >
                [SIGN IN]
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                onClick={() => sfx.click()}
                className="text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 px-3.5 py-1.5 border border-white rounded-[2px] shadow-[2px_2px_0px_rgba(255,255,255,0.2)] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer"
              >
                START FREE
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
  const [autopsyMode, setAutopsyMode] = useState(false);

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
    sfx.stamp();
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

      sfx.stamp();
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

  // ── Iterate V2 Action: load rewrite into composer for next revision ──
  function handleIterateV2() {
    if (!analysis?.rewrite?.email) return;
    sfx.paper();
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
    sfx.paper();
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
    <div className="min-h-screen flex flex-col relative bg-[#08080B] text-zinc-100 selection:bg-yellow-300 selection:text-black">
      {/* Vertical Japanese / Magazine Editorial Margin Label */}
      <VerticalEditorialLabel text="INBOXSIGNAL // 受信箱のシグナル // FORENSIC OUTREACH UNIT" />

      {/* Header */}
      <Header
        signedIn={signedIn}
        remaining={remaining}
        limit={initialLimit}
        onReset={handleReset}
      />

      <div className="pt-13 flex-1 flex flex-col relative">
        {/* Top Print Ticket Header */}
        <div className="max-w-4xl w-full mx-auto px-4 mt-2 mb-2">
          <BarcodeTicket code="IS-902847-B2B" edition="VOL. 04 / ED. 2026" />
        </div>

        {/* ── LANDING PHASE ── */}
        <AnimatePresence>
          {isLanding && (
            <motion.main
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex flex-col items-center justify-center min-h-[calc(100vh-52px)] px-4 py-8 relative"
            >
              <HeroSection
                onSampleClick={() => {
                  setEmail(demoEmail);
                  setProspect(demoProspect);
                }}
              />

              {/* Asymmetrical Floating Sticky Critique Note (Easter egg) */}
              <div className="w-full max-w-xl mx-auto flex justify-end -mb-3 z-30 pr-2">
                <StickyCritique
                  title="CRITIQUE // FIELD RULE"
                  content="'I hope this email finds you well' = immediate archive. If your CTA asks for 30 minutes before proving measurable outcome, you're dead."
                  angle={2.2}
                />
              </div>

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

              {/* Editorial Feature Wireframe */}
              <FeatureGrid />

              {/* Verifiable Case Dossier Preview */}
              <ResultPreview />
            </motion.main>
          )}
        </AnimatePresence>

        {/* ── RESULTS & AUTOPSY DASHBOARD PHASE ── */}
        {!isLanding && (
          <div className="layout-row flex flex-1 min-h-[calc(100vh-52px)]">
            {/* Sidebar (Tactile Filing Cabinet) */}
            <aside className="sidebar-panel w-full md:w-[350px] shrink-0 sticky top-13 h-[calc(100vh-52px)] overflow-y-auto flex flex-col border-r-2 border-zinc-800 bg-[#0B0B0E]">
              {/* Sidebar Tabs */}
              <div className="flex p-2 gap-2 border-b-2 border-zinc-800 sticky top-0 z-10 bg-[#0B0B0E] font-mono">
                <button
                  onClick={() => {
                    sfx.click();
                    setSidebarTab("edit");
                  }}
                  className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-[2px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    sidebarTab === "edit"
                      ? "bg-white text-black border border-white shadow-[2px_2px_0px_rgba(255,255,255,0.2)]"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Mail size={12} />
                  <span>[SPEC EDIT]</span>
                </button>
                <button
                  onClick={() => {
                    sfx.click();
                    setSidebarTab("history");
                  }}
                  className={`flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-[2px] transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    sidebarTab === "history"
                      ? "bg-white text-black border border-white shadow-[2px_2px_0px_rgba(255,255,255,0.2)]"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Clock size={12} />
                  <span>CASE LOGS {history.length > 0 && `(${history.length})`}</span>
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
                    <div className="p-6 text-center border-2 border-zinc-800 rounded-[2px] bg-[#111115] font-mono">
                      <Layers className="text-zinc-500 mx-auto mb-3" size={24} />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                        ARCHIVE PROTECTED
                      </h3>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-4">
                        Sign in to preserve your diagnostic timeline and track
                        signal velocity over time.
                      </p>
                      <SignUpButton mode="modal">
                        <button
                          onClick={() => sfx.click()}
                          className="w-full py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-[2px] hover:bg-zinc-200 transition cursor-pointer"
                        >
                          CREATE ACCOUNT
                        </button>
                      </SignUpButton>
                    </div>
                  )
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 border-t-2 border-zinc-800 flex items-center justify-between font-mono text-[11px] text-zinc-500">
                <button
                  onClick={handleReset}
                  className="hover:text-zinc-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  ← [EXIT TO COVER]
                </button>
                <span>UTC MIDNIGHT RESET</span>
              </div>
            </aside>

            {/* Results pane */}
            <main
              ref={resultsRef}
              className="results-scroll flex-1 overflow-y-auto sticky top-13 h-[calc(100vh-52px)] p-4 sm:p-8"
            >
              <AnimatePresence mode="wait">
                {status === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="max-w-3xl mx-auto py-12 font-mono"
                  >
                    <div className="flex items-center gap-3 mb-6 p-4 border-2 border-zinc-800 bg-[#111115]">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span className="text-xs font-bold tracking-widest uppercase text-white">
                        RUNNING FORENSIC AUTOPSY ON COLD OUTREACH SPEC...
                      </span>
                    </div>
                    <div className="space-y-4">
                      {[140, 100, 100].map((h, i) => (
                        <div
                          key={i}
                          className="animate-pulse bg-[#111115] border border-zinc-800 rounded-[2px]"
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
                    className="max-w-3xl mx-auto p-4 border-2 border-red-500/80 bg-red-950/20 font-mono"
                  >
                    <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-1">
                      <AlertTriangle size={14} />
                      <span>[AUTOPSY HALTED // SYSTEM ERROR]</span>
                    </div>
                    <p className="text-xs text-red-200 font-sans">{error}</p>
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
