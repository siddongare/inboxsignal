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
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
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

const SPRING = { type: "spring" as const, stiffness: 260, damping: 30 };

// ─── Score helpers ───────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s < 45) return "var(--critical)";
  if (s < 68) return "var(--medium)";
  return "var(--low)";
}

// ─── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ textAlign: "center", marginBottom: 16, width: "100%" }}
    >
      {/* Status pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 14px",
          borderRadius: 999,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          marginBottom: 20,
          fontSize: 12,
          color: "var(--text-muted)",
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--low)",
            flexShrink: 0,
          }}
        />
        Free · 3 analyses / day · No card needed
      </div>

      <h1
        style={{
          fontSize: "clamp(36px, 7vw, 64px)",
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.04em",
          lineHeight: 1.05,
          margin: "0 auto 12px",
          maxWidth: 660,
        }}
      >
        Turn cold emails{" "}
        <span style={{ color: "var(--accent)" }}>into replies.</span>
      </h1>

      <p
        style={{
          fontSize: "clamp(14px, 2vw, 17px)",
          color: "var(--text-muted)",
          lineHeight: 1.7,
          maxWidth: 440,
          margin: "0 auto",
          fontWeight: 400,
        }}
      >
        Diagnose why your outreach is being ignored.
        <br />
        Get the score, the fix, and the rewrite.
      </p>
    </motion.div>
  );
}

// ─── Feature Grid ────────────────────────────────────────────────────────────
function FeatureGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const items = [
    { icon: Zap, color: "var(--accent)", title: "Signal Score", desc: "0–100 composite across clarity, relevance, credibility, CTA." },
    { icon: AlertTriangle, color: "var(--critical)", title: "Failure Diagnosis", desc: "Each weak point ranked Critical → High → Medium → Low." },
    { icon: FileText, color: "var(--low)", title: "Optimized Rewrite", desc: "Better email + 4 subject line variants, copy-ready." },
    { icon: Layers, color: "var(--indigo)", title: "Follow-Up Sequence", desc: "Day 3 & Day 7 emails that add new angles, not repeats." },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
        width: "100%",
        maxWidth: 600,
        marginTop: 40,
      }}
      className="feature-grid-inner"
    >
      {items.map(({ icon: Icon, color, title, desc }, idx) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3, delay: 0.1 + idx * 0.06 }}
          style={{
            padding: 16,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            transition: "border-color 0.15s",
          }}
          className="hover:border-[var(--border-hover)]"
        >
          <Icon size={16} strokeWidth={1.8} style={{ color }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {title}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            {desc}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Result Preview (Landing) ────────────────────────────────────────────────
function ResultPreview() {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const mockSignals = [
    { label: "Clarity", score: 58, color: "var(--medium)" },
    { label: "Relevance", score: 35, color: "var(--critical)" },
    { label: "Credibility", score: 50, color: "var(--medium)" },
    { label: "CTA", score: 45, color: "var(--medium)" },
  ];

  const mockIssues = [
    { level: "CRITICAL", text: "Lack of Personalization", color: "var(--critical)" },
    { level: "HIGH", text: "Weak Value Proposition", color: "var(--high)" },
    { level: "MEDIUM", text: "Generic Subject Line", color: "var(--medium)" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{ width: "100%", maxWidth: 600, marginTop: 48 }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 500 }}>
          Sample Analysis · AutoLead → VP of Sales
        </span>
        <button
          onClick={() => setRevealed((r) => !r)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: revealed ? "var(--surface-hover)" : "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            cursor: "pointer",
            color: revealed ? "var(--text-secondary)" : "var(--text-muted)",
            fontSize: 12,
            fontWeight: 500,
            transition: "all 0.15s",
          }}
        >
          {revealed ? "Hide preview" : "See a sample →"}
        </button>
      </div>

      {/* Preview card */}
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
        {/* Blur overlay */}
        <motion.div
          animate={{ opacity: revealed ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            background: "rgba(9,9,11,0.6)",
            zIndex: 3,
            pointerEvents: revealed ? "none" : "all",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--text-faint)", fontWeight: 500 }}>
            Click "See a sample" to reveal
          </span>
        </motion.div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Left: Score + Issues */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Score ring */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 72, height: 72 }}>
                <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={36} cy={36} r={33} fill="none" stroke="var(--border)" strokeWidth={4} />
                  <motion.circle
                    cx={36} cy={36} r={33} fill="none"
                    stroke="var(--critical)" strokeWidth={4} strokeLinecap="round"
                    strokeDasharray={207}
                    initial={{ strokeDashoffset: 207 }}
                    animate={revealed ? { strokeDashoffset: 207 * (1 - 47 / 100) } : { strokeDashoffset: 207 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span className="font-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--critical)" }}>47</span>
                  <span className="font-mono" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: "0.06em" }}>/ 100</span>
                </div>
              </div>
              {mockSignals.map(({ label, score, color }) => (
                <div key={label} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
                    <span className="font-mono" style={{ fontSize: 11, color, fontWeight: 600 }}>{score}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={revealed ? { width: `${score}%` } : { width: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      style={{ height: "100%", borderRadius: 999, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Issues */}
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Failure Diagnosis</span>
              {mockIssues.map(({ level, text, color }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span className="font-mono" style={{ fontSize: 10, color, fontWeight: 600, minWidth: 56, textTransform: "uppercase", letterSpacing: "0.04em" }}>{level}</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Rewrite preview */}
          <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Optimized Rewrite</span>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.8, margin: 0 }}>
              Hi [Name],{"\n\n"}Your SDR team spends hours researching leads. Our AI cuts that to minutes — and we&apos;ve helped similar teams increase reply rates by 3x.{"\n\n"}Worth a 15-min look?
            </p>
            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Subject variants</span>
              {["Quick question about [Company]'s pipeline", "Saw you're scaling your sales team"].map((s) => (
                <div key={s} style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px" }}>{s}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function Header({ signedIn, remaining, limit, onReset }: { signedIn: boolean; remaining: number; limit: number; onReset: () => void }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(16px, 4vw, 28px)",
        borderBottom: "1px solid var(--border)",
        background: "rgba(9,9,11,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <button
        onClick={onReset}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Mail size={14} strokeWidth={2} color="#fff" />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          InboxSignal
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-faint)", padding: "2px 8px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Beta
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {signedIn ? (
          <>
            <span className="font-mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {remaining}/{limit} left
            </span>
            <UserButton
              appearance={{
                elements: {
                  userButtonTrigger: { border: "1px solid var(--border)", borderRadius: "50%" },
                },
              }}
            />
          </>
        ) : (
          <>
            <SignInButton mode="modal">
              <button style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "6px 12px", borderRadius: 6, transition: "color 0.15s" }}>
                Log in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{ background: "var(--accent)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "7px 16px", borderRadius: 7, transition: "background 0.15s" }}>
                Sign up free
              </button>
            </SignUpButton>
          </>
        )}
      </div>
    </header>
  );
}

// ─── Main Shell ──────────────────────────────────────────────────────────────
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

  useEffect(() => { setRemaining(initialRemaining); }, [initialRemaining]);
  useEffect(() => { setHistory(initialHistory); }, [initialHistory]);

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
        throw new Error(data.error ?? "Server error, try again");
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

  // ── Iterate V2: pre-fill rewrite back into composer ──
  function handleIterateV2() {
    if (!analysis?.rewrite?.email) return;
    setEmail(analysis.rewrite.email);
    setAnalysis(null);
    setActive(null);
    setSubmittedEmail("");
    setSidebarTab("edit");
    // Stay on results page so user can immediately re-analyze
    setPhase("landing");
  }

  async function deleteSaved(id: string) {
    const next = history.filter((i) => i.id !== id);
    setHistory(next);
    if (active?.id === id) {
      const n = next[0] ?? null;
      setActive(n);
      setAnalysis(n?.result ?? null);
      if (!n) setPhase("landing");
    }
    await fetch(`/api/history?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async function renameSaved(id: string, title: string) {
    setHistory((h) => h.map((i) => (i.id === id ? { ...i, title } : i)));
    if (active?.id === id) setActive((a) => (a ? { ...a, title } : a));
    await fetch("/api/history", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, title }) });
  }

  function selectSaved(item: SavedAnalysis) {
    setActive(item);
    setAnalysis(item.result);
    setEmail(item.email);
    setProspect(item.prospect);
    setSubmittedEmail(item.email);
    setPhase("results");
    setSidebarTab("edit");
  }

  function handleSignInAndAnalyze() {
    if (email.trim()) sessionStorage.setItem("inboxsignal_prefill", email.trim());
  }

  function handleReset() {
    setPhase("landing");
    setAnalysis(null);
    setActive(null);
    setError("");
    setStatus("idle");
  }

  const isLanding = phase === "landing";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <Header signedIn={signedIn} remaining={remaining} limit={initialLimit} onReset={handleReset} />

      <div style={{ paddingTop: 52, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* ── LANDING ── */}
        <AnimatePresence>
          {isLanding && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(100vh - 52px)",
                padding: "24px 20px 56px",
              }}
            >
              <HeroSection />
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
                onUseDemo={() => { setEmail(demoEmail); setProspect(demoProspect); }}
              />
              <FeatureGrid />
              <ResultPreview />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULTS ── */}
        {!isLanding && (
          <div className="layout-row" style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 52px)" }}>
            {/* Sidebar */}
            <div
              className="sidebar-panel"
              style={{
                width: "clamp(300px, 28vw, 360px)",
                flexShrink: 0,
                position: "sticky",
                top: 52,
                height: "calc(100vh - 52px)",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                borderRight: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              {/* Tabs */}
              <div style={{ display: "flex", padding: 8, gap: 4, borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10, background: "var(--bg)" }}>
                {([["edit", Mail, "Edit"], ["history", Clock, "History"]] as const).map(([id, Icon, label]) => (
                  <button
                    key={id}
                    onClick={() => setSidebarTab(id)}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: sidebarTab === id ? "1px solid var(--border)" : "1px solid transparent",
                      background: sidebarTab === id ? "var(--surface)" : "transparent",
                      color: sidebarTab === id ? "var(--text-primary)" : "var(--text-muted)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <Icon size={13} />
                    {label}
                    {id === "history" && history.length > 0 && ` (${history.length})`}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
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
                    onUseDemo={() => { setEmail(demoEmail); setProspect(demoProspect); }}
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
                    <div style={{ padding: "40px 16px", textAlign: "center", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)" }}>
                      <Layers style={{ color: "var(--text-faint)", margin: "0 auto 12px" }} size={24} />
                      <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>Save your history</h3>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 20px" }}>
                        Create a free account to track analyses and compare scores over time.
                      </p>
                      <SignUpButton mode="modal">
                        <button style={{ width: "100%", padding: "9px 0", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          Start saving <ArrowRight size={14} />
                        </button>
                      </SignUpButton>
                    </div>
                  )
                )}
              </div>

              {/* Sidebar footer */}
              <div style={{ padding: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={handleReset} style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  ← Back
                </button>
              </div>
            </div>

            {/* Results pane */}
            <div
              ref={resultsRef}
              className="results-scroll"
              style={{ flex: 1, overflowY: "auto", position: "sticky", top: 52, height: "calc(100vh - 52px)", padding: "24px clamp(16px, 4vw, 44px)" }}
            >
              <AnimatePresence mode="wait">
                {status === "loading" && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: 840, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                      <div className="animate-spin" style={{ width: 16, height: 16, border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Analyzing...</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[180, 120, 120].map((h, i) => (
                        <div key={i} className="animate-pulse" style={{ height: h, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10 }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {status === "error" && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: 840, margin: "0 auto" }}>
                    <div style={{ padding: 16, border: "1px solid var(--critical)", background: "var(--critical-dim)", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 12 }}>
                      <AlertTriangle style={{ color: "var(--critical)", flexShrink: 0, marginTop: 2 }} size={16} />
                      <div>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Analysis failed</h4>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {status === "idle" && (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 840, margin: "0 auto" }}>
                    <ResultPanel analysis={analysis} selected={active} originalEmail={submittedEmail} onIterateV2={handleIterateV2} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
