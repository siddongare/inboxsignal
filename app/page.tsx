"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Copy,
  FileText,
  Layers,
  Mail,
  RotateCcw,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppPhase = "landing" | "loading" | "results";
type ImpactLevel = "low" | "medium" | "high" | "critical";

interface DiagnosisItem {
  issue: string;
  impact: ImpactLevel;
  whyItMatters: string;
  fix: string;
}

interface Signals {
  clarity: number;
  relevance: number;
  credibility: number;
  ctaStrength: number;
}

interface EmailBreakdown {
  hook: string;
  valueProp: string;
  personalization: string;
  cta: string;
}

interface RewriteData {
  email: string;
  subjectLines: string[];
  whyThisWorks: string;
}

interface FollowUps {
  day3: string;
  day7: string;
}

interface AnalysisResult {
  diagnosis: DiagnosisItem[];
  signals: Signals;
  emailBreakdown: EmailBreakdown;
  rewrite: RewriteData;
  followUps: FollowUps;
}

interface AuditApiResponse {
  success?: boolean;
  data?: AnalysisResult;
  error?: string;
  remaining?: number;
  limit?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAILY_LIMIT = 5;

const IMPACT_CONFIG: Record<
  ImpactLevel,
  { label: string; color: string; bg: string; border: string; hoverBorder: string }
> = {
  critical: {
    label: "CRITICAL",
    color: "rgba(255,255,255,0.92)",
    bg: "rgba(255,255,255,0.055)",
    border: "rgba(255,255,255,0.13)",
    hoverBorder: "rgba(255,255,255,0.28)",
  },
  high: {
    label: "HIGH",
    color: "rgba(255,255,255,0.72)",
    bg: "rgba(255,255,255,0.035)",
    border: "rgba(255,255,255,0.09)",
    hoverBorder: "rgba(255,255,255,0.22)",
  },
  medium: {
    label: "MEDIUM",
    color: "rgba(255,255,255,0.5)",
    bg: "rgba(255,255,255,0.02)",
    border: "rgba(255,255,255,0.065)",
    hoverBorder: "rgba(255,255,255,0.16)",
  },
  low: {
    label: "LOW",
    color: "rgba(255,255,255,0.35)",
    bg: "rgba(255,255,255,0.012)",
    border: "rgba(255,255,255,0.045)",
    hoverBorder: "rgba(255,255,255,0.12)",
  },
};

const IMPACT_ORDER: Record<ImpactLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// Ghost typewriter content — high-intent cold email examples
const EMAIL_TYPEWRITER_EXAMPLES: string[] = [
  "Subject: Quick question about {Company}'s pipeline\n\nHi {Name},\n\nSaw you closed 3 enterprise deals last quarter — congrats. We're helping sales teams like yours cut ramp time by 40%. Worth a 15-min call this week?",
  "Subject: {Company}'s outbound hitting a ceiling?\n\nHi {Name},\n\nYour VP posted about scaling to $10M ARR. The bottleneck we see at that stage is almost always outbound quality, not volume. Here's what we'd fix first...",
  "Subject: Noticed you're hiring 2 new AEs\n\nHi {Name},\n\nBuilding out your sales org is the right move. We've helped 3 Series-B founders ramp new hires 2x faster without changing their stack. Open to a quick look?",
];

const PROSPECT_TYPEWRITER_EXAMPLES: string[] = [
  "Director of Growth, Series A SaaS. Raised $6M in March. Hiring 2 AEs. Pain: low reply rates on outbound sequences.",
  "Head of Sales at a fintech startup. 8-person team, missing quota. Frustrated with generic outreach from SDRs.",
  "Founder doing outbound themselves. No sales team yet. Struggling to book demos from cold email.",
];

// ─── Spring physics ────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 260, damping: 30 };
const SPRING_SLOW = { type: "spring" as const, stiffness: 180, damping: 28 };

// ─── Motion variants ──────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: SPRING,
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...SPRING, delay },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const slideIn = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: SPRING,
  },
};

// ─── Noise overlay ────────────────────────────────────────────────────────────

const NOISE_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
  backgroundRepeat: "repeat",
};

// ─── Utility helpers ──────────────────────────────────────────────────────────

function scoreToLabel(s: number): string {
  if (s < 40) return "Failing";
  if (s < 60) return "Weak";
  if (s < 78) return "Average";
  return "Strong";
}

function scoreToBar(s: number): string {
  return `${Math.max(2, s)}%`;
}

// ─── Primitive: MonoTag ───────────────────────────────────────────────────────

function MonoTag({
  children,
  dim = false,
}: {
  children: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <span
      style={{
        fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: dim ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.42)",
      }}
    >
      {children}
    </span>
  );
}

/** Hairline separator */
function Rule() {
  return (
    <div
      style={{
        height: 1,
        background:
          "linear-gradient(to right, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
        margin: "22px 0",
      }}
    />
  );
}

/** Copy-to-clipboard button */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(() => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [text]);

  return (
    <button
      onClick={handle}
      title="Copy"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        background: copied ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 6,
        cursor: "pointer",
        color: copied ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.3)",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {copied ? <CheckCircle size={11} strokeWidth={1.5} /> : <Copy size={11} strokeWidth={1.5} />}
      <MonoTag>{copied ? "copied" : "copy"}</MonoTag>
    </button>
  );
}

// ─── Border beam ──────────────────────────────────────────────────────────────

function BorderBeam({ duration = 3.5 }: { duration?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {/* Top beam → */}
      <motion.div
        style={{
          position: "absolute",
          top: -1,
          height: 2,
          width: "35%",
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.55), transparent)",
          filter: "blur(0.5px)",
        }}
        animate={{ left: ["-35%", "100%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
      />
      {/* Bottom beam ← */}
      <motion.div
        style={{
          position: "absolute",
          bottom: -1,
          height: 2,
          width: "35%",
          background:
            "linear-gradient(to left, transparent, rgba(255,255,255,0.28), transparent)",
          filter: "blur(0.5px)",
        }}
        animate={{ right: ["-35%", "100%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatDelay: 0.8, delay: duration / 2 }}
      />
    </div>
  );
}

// ─── Waveform loading icon ────────────────────────────────────────────────────

function WaveformIcon({ color = "#000" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 14 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          style={{ width: 2.5, borderRadius: 2, background: color, originY: 0.5 }}
          animate={{ height: ["3px", "13px", "3px"] }}
          transition={{
            duration: 0.55,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.09,
          }}
        />
      ))}
    </div>
  );
}

// ─── Ghost typewriter ─────────────────────────────────────────────────────────

interface GhostTypewriterProps {
  examples: string[];
  show: boolean;
  typingSpeed?: number;
  eraseSpeed?: number;
  pauseMs?: number;
}

function GhostTypewriter({
  examples,
  show,
  typingSpeed = 28,
  eraseSpeed = 12,
  pauseMs = 2800,
}: GhostTypewriterProps) {
  const [idx, setIdx] = useState(0);
  const [display, setDisplay] = useState("");
  const [mode, setMode] = useState<"typing" | "pausing" | "erasing">("typing");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!show) return;
    const current = examples[idx];

    if (mode === "typing") {
      if (display.length < current.length) {
        const t = setTimeout(() => {
          setDisplay(current.slice(0, display.length + 1));
        }, typingSpeed);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setMode("erasing"), pauseMs);
      return () => clearTimeout(t);
    }

    if (mode === "erasing") {
      if (display.length > 0) {
        const t = setTimeout(() => {
          setDisplay((d) => d.slice(0, -1));
        }, eraseSpeed);
        return () => clearTimeout(t);
      }
      setIdx((i) => (i + 1) % examples.length);
      setMode("typing");
    }
  }, [display, mode, idx, examples, show, typingSpeed, eraseSpeed, pauseMs]);

  // Blink cursor
  useEffect(() => {
    const t = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  if (!show) return null;

  return (
    <span
      style={{
        fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
        fontSize: 13,
        color: "rgba(255,255,255,0.16)",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        pointerEvents: "none",
        userSelect: "none",
        lineHeight: 1.75,
      }}
    >
      {display}
      <span
        style={{
          opacity: visible ? 0.6 : 0,
          transition: "opacity 0.1s",
          fontWeight: 400,
        }}
      >
        ▌
      </span>
    </span>
  );
}

// ─── Scanner line (loading skeleton) ─────────────────────────────────────────

function ScannerLine() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 5,
        borderRadius: "inherit",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.18) 70%, transparent)",
        }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2.6, ease: "linear", repeat: Infinity }}
      />
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      variants={itemVariants}
      custom={delay}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.045)",
        borderRadius: 10,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ScannerLine />
      {[70, 90, 55].map((w, i) => (
        <motion.div
          key={i}
          style={{
            height: 8,
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            width: `${w}%`,
            marginBottom: i < 2 ? 10 : 0,
          }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15 + delay,
          }}
        />
      ))}
    </motion.div>
  );
}

// ─── Hoverable card wrapper ───────────────────────────────────────────────────

function HoverCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.01 : 1,
        borderColor: hovered ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)",
      }}
      transition={{ ...SPRING, stiffness: 380, damping: 28 }}
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "default",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Signal bar ───────────────────────────────────────────────────────────────

function SignalBar({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <MonoTag>{label}</MonoTag>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span
            style={{
              fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.88)",
              letterSpacing: "-0.04em",
            }}
          >
            {score}
          </span>
          <MonoTag dim>/100</MonoTag>
          <MonoTag dim>{scoreToLabel(score)}</MonoTag>
        </div>
      </div>
      <div style={{ height: 3, borderRadius: 999, background: "rgba(255,255,255,0.055)", overflow: "hidden" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: scoreToBar(score) }}
          transition={{ ...SPRING_SLOW, delay: 0.15 }}
          style={{
            height: "100%",
            borderRadius: 999,
            background: "rgba(255,255,255,0.52)",
          }}
        />
      </div>
    </div>
  );
}

// ─── Score section ────────────────────────────────────────────────────────────

function ScoreSection({ signals }: { signals: Signals }) {
  const avg = Math.round(
    (signals.clarity + signals.relevance + signals.credibility + signals.ctaStrength) / 4
  );

  return (
    <motion.div variants={itemVariants} style={{ position: "relative" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: "22px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <BorderBeam duration={3.5} />

        {/* Score hero row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 22 }}>
          <div style={{ flexShrink: 0 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING}
              style={{
                fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                fontSize: "clamp(52px, 9vw, 68px)",
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1,
                letterSpacing: "-0.06em",
              }}
            >
              {avg}
            </motion.div>
            <MonoTag dim>/ 100</MonoTag>
          </div>
          <div style={{ flex: 1, paddingTop: 6 }}>
            <div
              style={{
                fontSize: "clamp(18px, 3vw, 24px)",
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "-0.04em",
                marginBottom: 5,
              }}
            >
              {scoreToLabel(avg)}
            </div>
            <MonoTag dim>Signal score · composite of 4 dimensions</MonoTag>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <SignalBar label="Clarity" score={signals.clarity} />
          <SignalBar label="Relevance" score={signals.relevance} />
          <SignalBar label="Credibility" score={signals.credibility} />
          <SignalBar label="CTA" score={signals.ctaStrength} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Diagnosis section ────────────────────────────────────────────────────────

function DiagnosisSection({ items }: { items: DiagnosisItem[] }) {
  const sorted = [...items].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);

  return (
    <motion.div variants={itemVariants}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
        <AlertTriangle size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
        <MonoTag>Failure Diagnosis</MonoTag>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.18)",
          }}
        >
          {sorted.length} issues
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ display: "flex", flexDirection: "column", gap: 8 }}
      >
        {sorted.map((item, i) => {
          const cfg = IMPACT_CONFIG[item.impact];
          return (
            <DiagnosisCard key={`${item.issue}-${i}`} item={item} cfg={cfg} index={i} />
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function DiagnosisCard({
  item,
  cfg,
  index,
}: {
  item: DiagnosisItem;
  cfg: (typeof IMPACT_CONFIG)[ImpactLevel];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.01 : 1,
        borderColor: hovered ? cfg.hoverBorder : cfg.border,
      }}
      transition={{ ...SPRING, stiffness: 380, damping: 28 }}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 9,
        padding: "14px 16px",
        cursor: "default",
        zIndex: hovered ? 2 : 1,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: cfg.color,
            letterSpacing: "-0.01em",
            lineHeight: 1.35,
          }}
        >
          {item.issue}
        </span>
        <MonoTag>{cfg.label}</MonoTag>
      </div>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.65 }}>
        {item.whyItMatters}
      </p>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.045)",
          paddingTop: 10,
          fontSize: 12,
          color: "rgba(255,255,255,0.58)",
          lineHeight: 1.6,
        }}
      >
        <MonoTag>→ fix · </MonoTag>
        {item.fix}
      </div>
    </motion.div>
  );
}

// ─── Terminal / Pro Preview (Rewrite section) ─────────────────────────────────

function TerminalChrome({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      {/* Monochrome traffic lights */}
      {[0.7, 0.35, 0.18].map((o, i) => (
        <div
          key={i}
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: `rgba(255,255,255,${o})`,
          }}
        />
      ))}
      <div style={{ flex: 1, textAlign: "center" }}>
        <MonoTag dim>{label}</MonoTag>
      </div>
    </div>
  );
}

function RewriteSection({
  rewrite,
  originalEmail,
}: {
  rewrite: RewriteData;
  originalEmail: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <motion.div variants={itemVariants} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <FileText size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
        <MonoTag>Optimized Version</MonoTag>
      </div>

      {/* Terminal window */}
      <div
        style={{
          background: "#080808",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          flex: 1,
        }}
      >
        <BorderBeam duration={4.5} />

        <TerminalChrome label={showOriginal ? "original · unedited" : "rewritten · optimized"} />

        {/* Toggle */}
        <div
          style={{
            display: "inline-flex",
            margin: "12px 14px 0",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 7,
            padding: 3,
            gap: 2,
          }}
        >
          {[
            { id: false, label: "Optimized" },
            { id: true, label: "Original" },
          ].map(({ id, label }) => (
            <button
              key={String(id)}
              onClick={() => setShowOriginal(id)}
              style={{
                padding: "4px 12px",
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                fontSize: 10,
                fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: showOriginal === id ? "rgba(255,255,255,0.1)" : "transparent",
                color: showOriginal === id ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.28)",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Email body */}
        <div style={{ padding: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginBottom: 10,
            }}
          >
            {!showOriginal && <CopyButton text={rewrite.email} />}
          </div>
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
              lineHeight: 1.85,
              color: showOriginal ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.7)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 340,
              overflowY: "auto",
            }}
          >
            {showOriginal ? originalEmail : rewrite.email}
          </pre>
        </div>

        {/* Subject lines */}
        {rewrite.subjectLines.length > 0 && (
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <MonoTag dim>Subject line variants</MonoTag>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {rewrite.subjectLines.map((line, i) => (
                <div
                  key={`${line}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "8px 12px",
                    background: i === 0 ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.018)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 7,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 0 }}>
                    <MonoTag dim>{["A", "B", "C", "D"][i] ?? String(i + 1)}</MonoTag>
                    <span
                      style={{
                        fontSize: 12,
                        color: i === 0 ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.38)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {line}
                    </span>
                  </div>
                  <CopyButton text={line} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why this works */}
        {rewrite.whyThisWorks && (
          <div
            style={{
              margin: "0 14px 14px",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.045)",
              borderRadius: 8,
            }}
          >
            <MonoTag dim>Why this works</MonoTag>
            <p
              style={{
                margin: "7px 0 0",
                fontSize: 11,
                color: "rgba(255,255,255,0.38)",
                lineHeight: 1.7,
              }}
            >
              {rewrite.whyThisWorks}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Follow-up section ────────────────────────────────────────────────────────

function FollowUpSection({ followUps }: { followUps: FollowUps }) {
  return (
    <motion.div variants={itemVariants}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
        <Layers size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
        <MonoTag>Follow-Up Sequence</MonoTag>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Day 3", sub: "Soft nudge", content: followUps.day3 },
          { label: "Day 7", sub: "Value add", content: followUps.day7 },
        ].map(({ label, sub, content }) => (
          <HoverCard
            key={label}
            style={{
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                  <MonoTag>{label}</MonoTag>
                  <MonoTag dim>{sub}</MonoTag>
                </div>
                <CopyButton text={content} />
              </div>
              <pre
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.48)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {content}
              </pre>
            </div>
          </HoverCard>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Breakdown section ────────────────────────────────────────────────────────

function BreakdownSection({ breakdown }: { breakdown: AnalysisResult["emailBreakdown"] }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Hook", value: breakdown.hook },
    { label: "Value Prop", value: breakdown.valueProp },
    { label: "Personalization", value: breakdown.personalization },
    { label: "CTA", value: breakdown.cta },
  ];

  return (
    <motion.div variants={itemVariants}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}>
        <Zap size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
        <MonoTag>Section Breakdown</MonoTag>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            style={{
              display: "grid",
              gridTemplateColumns: "96px 1fr",
              gap: 14,
              padding: "11px 16px",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              alignItems: "start",
            }}
          >
            <MonoTag dim>{label}</MonoTag>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.48)", lineHeight: 1.65 }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  phase: AppPhase;
  remaining: number;
  limit: number;
  onReset: () => void;
}

function Navbar({ isLoaded, isSignedIn, phase, remaining, limit, onReset }: NavbarProps) {
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
        padding: "0 clamp(16px, 4vw, 32px)",
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.045)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Mail size={14} strokeWidth={1.5} color="rgba(255,255,255,0.55)" />
        <span
          style={{
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.02em",
          }}
        >
          InboxSignal
        </span>
      </div>

      {/* Right cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        {phase === "results" && isSignedIn && (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.065)",
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                  fontSize: 10,
                  color: remaining <= 0 ? "rgba(255,100,100,0.65)" : "rgba(255,255,255,0.3)",
                  letterSpacing: "0.06em",
                }}
              >
                {remaining}/{limit}
              </span>
            </div>
            <button
              onClick={onReset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 10px",
                background: "rgba(255,255,255,0.035)",
                border: "1px solid rgba(255,255,255,0.065)",
                borderRadius: 7,
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                transition: "all 0.15s",
                fontSize: 10,
                fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              <RotateCcw size={11} strokeWidth={1.5} />
              Reset
            </button>
          </div>
        )}

        {!isLoaded ? (
          <div style={{ width: 88, height: 27, borderRadius: 7, background: "rgba(255,255,255,0.04)" }} />
        ) : isSignedIn ? (
          <UserButton />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SignInButton mode="modal" forceRedirectUrl="/">
              <button
                style={{
                  padding: "4px 13px",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.45)",
                  borderRadius: 7,
                  fontSize: 11,
                  fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
              >
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/">
              <button
                style={{
                  padding: "4px 13px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.11)",
                  color: "rgba(255,255,255,0.82)",
                  borderRadius: 7,
                  fontSize: 11,
                  fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                Sign up
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
}

// ─── Input panel ──────────────────────────────────────────────────────────────

interface InputPanelProps {
  phase: AppPhase;
  email: string;
  prospect: string;
  isLoading: boolean;
  limitReached: boolean;
  isSignedIn: boolean | undefined;
  onEmailChange: (v: string) => void;
  onProspectChange: (v: string) => void;
  onAnalyze: () => void;
  onSignInAndAnalyze: () => void;
}

function InputPanel({
  phase,
  email,
  prospect,
  isLoading,
  limitReached,
  isSignedIn,
  onEmailChange,
  onProspectChange,
  onAnalyze,
  onSignInAndAnalyze,
}: InputPanelProps) {
  const [focusedField, setFocusedField] = useState<"email" | "prospect" | null>(null);
  const isSidebar = phase === "loading" || phase === "results";
  const canSubmit =
    !isLoading && !limitReached && email.trim().length > 0 && prospect.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      if (isSignedIn) onAnalyze();
      else onSignInAndAnalyze();
    }
  };

  const textareaBase: CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "rgba(255,255,255,0.78)",
    fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
    fontSize: "16px", // iOS zoom prevention
    lineHeight: 1.75,
    resize: "none",
    display: "block",
    caretColor: "rgba(255,255,255,0.55)",
    WebkitTextSizeAdjust: "100%",
  };

  // The analyze button — used inside the prospect box
  const AnalyzeButton = () => {
    if (isSignedIn) {
      return (
        <button
          onClick={onAnalyze}
          disabled={!canSubmit}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: canSubmit ? "7px 14px" : "7px 14px",
            background: canSubmit ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.07)",
            border: "none",
            borderRadius: 8,
            color: canSubmit ? "#000" : "rgba(255,255,255,0.18)",
            fontSize: 11,
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "all 0.18s",
            flexShrink: 0,
            height: 32,
          }}
        >
          {isLoading ? (
            <WaveformIcon color="#000" />
          ) : limitReached ? (
            "Limit"
          ) : (
            <>
              Analyze
              <ArrowRight size={12} strokeWidth={2} />
            </>
          )}
        </button>
      );
    }
    return (
      <SignInButton mode="modal" forceRedirectUrl="/">
        <button
          onClick={onSignInAndAnalyze}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            background: "rgba(255,255,255,0.92)",
            border: "none",
            borderRadius: 8,
            color: "#000",
            fontSize: 11,
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            height: 32,
          }}
        >
          Sign in
          <ArrowRight size={12} strokeWidth={2} />
        </button>
      </SignInButton>
    );
  };

  return (
    <motion.div
      layout
      layoutId="input-panel"
      style={{
        ...(isSidebar
          ? {
              position: "fixed" as CSSProperties["position"],
              top: 52,
              left: 0,
              bottom: 0,
              width: "clamp(280px, 28vw, 340px)",
              overflowY: "auto" as CSSProperties["overflowY"],
              borderRight: "1px solid rgba(255,255,255,0.05)",
              background: "#000",
              padding: "22px 18px",
              display: "flex" as CSSProperties["display"],
              flexDirection: "column" as CSSProperties["flexDirection"],
              gap: 12,
              zIndex: 10,
            }
          : {
              width: "100%",
              maxWidth: 600,
              display: "flex" as CSSProperties["display"],
              flexDirection: "column" as CSSProperties["flexDirection"],
              gap: 11,
            }),
      }}
      transition={SPRING_SLOW}
    >
      {/* Cold Email input */}
      <div
        style={{
          background: "rgba(255,255,255,0.022)",
          border: `1px solid ${focusedField === "email" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)"}`,
          borderRadius: 10,
          padding: "12px 14px",
          transition: "border-color 0.18s",
          position: "relative",
          minHeight: isSidebar ? 200 : 180,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
          <Mail size={10} strokeWidth={1.5} color="rgba(255,255,255,0.28)" />
          <MonoTag dim>Cold Email</MonoTag>
          {email.length > 0 && <MonoTag dim>· {email.length}ch</MonoTag>}
        </div>

        {/* Ghost typewriter placeholder */}
        {email.length === 0 && focusedField !== "email" && (
          <div
            style={{
              position: "absolute",
              top: 38,
              left: 14,
              right: 14,
              bottom: 12,
              pointerEvents: "none",
              zIndex: 1,
              overflow: "hidden",
            }}
          >
            <GhostTypewriter examples={EMAIL_TYPEWRITER_EXAMPLES} show />
          </div>
        )}

        <textarea
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onFocus={() => setFocusedField("email")}
          onBlur={() => setFocusedField(null)}
          onKeyDown={handleKeyDown}
          rows={isSidebar ? 8 : 5}
          placeholder=""
          style={{ ...textareaBase, position: "relative", zIndex: 2 }}
        />
      </div>

      {/* Prospect context — Analyze button lives inside this box */}
      <div
        style={{
          background: "rgba(255,255,255,0.022)",
          border: `1px solid ${focusedField === "prospect" ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)"}`,
          borderRadius: 10,
          padding: "12px 14px",
          transition: "border-color 0.18s",
          position: "relative",
          minHeight: isSidebar ? 130 : 110,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
          <MonoTag dim>Prospect Context</MonoTag>
        </div>

        {/* Ghost placeholder for prospect */}
        {prospect.length === 0 && focusedField !== "prospect" && (
          <div
            style={{
              position: "absolute",
              top: 38,
              left: 14,
              right: 14,
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <GhostTypewriter
              examples={PROSPECT_TYPEWRITER_EXAMPLES}
              show
              typingSpeed={22}
              eraseSpeed={10}
              pauseMs={2500}
            />
          </div>
        )}

        <textarea
          value={prospect}
          onChange={(e) => onProspectChange(e.target.value)}
          onFocus={() => setFocusedField("prospect")}
          onBlur={() => setFocusedField(null)}
          onKeyDown={handleKeyDown}
          rows={isSidebar ? 3 : 2}
          placeholder=""
          style={{
            ...textareaBase,
            color: "rgba(255,255,255,0.52)",
            position: "relative",
            zIndex: 2,
          }}
        />

        {/* Analyze button — bottom right of prospect box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
              fontSize: 9,
              color: "rgba(255,255,255,0.13)",
              letterSpacing: "0.06em",
            }}
          >
            ⌘ + ENTER
          </span>
          <AnalyzeButton />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function HeroSection({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hero"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.05 } }}
          exit={{ opacity: 0, y: -14, transition: { duration: 0.22 } }}
          style={{ textAlign: "center", marginBottom: 36 }}
        >
          {/* Status pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 26,
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.55)",
              }}
            />
            <MonoTag>Free · 5 analyses / day · No card</MonoTag>
          </div>

          <h1
            style={{
              fontSize: "clamp(30px, 7vw, 62px)",
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              letterSpacing: "-0.05em",
              lineHeight: 1.06,
              margin: "0 0 18px",
              fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
              maxWidth: 680,
            }}
          >
            Turn cold emails
            <br />
            into replies.
          </h1>

          <p
            style={{
              fontSize: "clamp(12px, 2vw, 15px)",
              color: "rgba(255,255,255,0.27)",
              lineHeight: 1.72,
              maxWidth: 420,
              margin: "0 auto",
              fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            }}
          >
            InboxSignal diagnoses exactly why your outreach is being ignored — then rewrites it.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Feature grid ─────────────────────────────────────────────────────────────

function FeatureGrid({ visible }: { visible: boolean }) {
  const items = [
    { icon: Zap, n: "01", title: "Signal Score", desc: "0–100 composite across clarity, relevance, credibility, CTA." },
    { icon: AlertTriangle, n: "02", title: "Failure Diagnosis", desc: "Each weak point ranked — Critical, High, Medium, Low." },
    { icon: FileText, n: "03", title: "Optimized Rewrite", desc: "Better email + 4 subject line variants, copy-ready." },
    { icon: Layers, n: "04", title: "Follow-Up Sequence", desc: "Day 3 & Day 7 emails that add new angles, not repeats." },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="features"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0, transition: { ...SPRING, delay: 0.14 } }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 9,
            width: "100%",
            maxWidth: 600,
            marginTop: 34,
          }}
        >
          {items.map(({ icon: Icon, n, title, desc }) => (
            <motion.div
              key={n}
              whileHover={{ scale: 1.02, borderColor: "rgba(255,255,255,0.1)" }}
              transition={{ ...SPRING, stiffness: 380, damping: 28 }}
              style={{
                padding: "15px",
                background: "rgba(255,255,255,0.018)",
                border: "1px solid rgba(255,255,255,0.045)",
                borderRadius: 9,
                display: "flex",
                flexDirection: "column",
                gap: 7,
                cursor: "default",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Icon size={11} strokeWidth={1.5} color="rgba(255,255,255,0.28)" />
                <MonoTag dim>{n}</MonoTag>
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.72)",
                  letterSpacing: "-0.025em",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.26)",
                  lineHeight: 1.65,
                }}
              >
                {desc}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────

function LoadingResults() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <SkeletonCard delay={0} />
      <SkeletonCard delay={0.07} />
      <SkeletonCard delay={0.14} />
      <SkeletonCard delay={0.21} />
    </motion.div>
  );
}

// ─── Results panel — 2-column grid ───────────────────────────────────────────

function ResultsPanel({
  analysis,
  originalEmail,
}: {
  analysis: AnalysisResult;
  originalEmail: string;
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", flexDirection: "column", gap: 22 }}
    >
      {/* 2-column grid: left = score + diagnosis, right = pro preview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <ScoreSection signals={analysis.signals} />
          <DiagnosisSection items={analysis.diagnosis} />
        </div>

        {/* Right column — terminal rewrite */}
        <RewriteSection rewrite={analysis.rewrite} originalEmail={originalEmail} />
      </div>

      <Rule />

      {/* Follow-ups */}
      <FollowUpSection followUps={analysis.followUps} />

      <Rule />

      {/* Breakdown */}
      <BreakdownSection breakdown={analysis.emailBreakdown} />

      <div style={{ height: 48 }} />
    </motion.div>
  );
}

// ─── Error block ──────────────────────────────────────────────────────────────

function ErrorBlock({ message }: { message: string }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      custom={0}
      style={{
        padding: "16px",
        background: "rgba(255,60,60,0.05)",
        border: "1px solid rgba(255,60,60,0.14)",
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        <AlertTriangle size={12} strokeWidth={1.5} color="rgba(255,100,100,0.65)" />
        <MonoTag>Error</MonoTag>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "rgba(255,140,140,0.65)",
          fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
    </motion.div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────

export default function Page() {
  const { isSignedIn, isLoaded } = useAuth();

  const [phase, setPhase] = useState<AppPhase>("landing");
  const [email, setEmail] = useState("");
  const [prospect, setProspect] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [limit] = useState(DAILY_LIMIT);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const resultsRef = useRef<HTMLDivElement>(null);
  const limitReached = remaining <= 0;

  // Restore stashed email after Clerk redirect
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const stashed = sessionStorage.getItem("inboxsignal_prefill");
    if (stashed) {
      sessionStorage.removeItem("inboxsignal_prefill");
      setEmail(stashed);
    }
  }, [isLoaded, isSignedIn]);

  const runAudit = useCallback(async () => {
    if (!email.trim() || !prospect.trim() || limitReached) return;

    setPhase("loading");
    setError("");
    setAnalysis(null);
    setSubmittedEmail(email);

    setTimeout(() => {
      resultsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prospect }),
      });

      let data: AuditApiResponse;
      const rawText = await res.text();
      try {
        data = JSON.parse(rawText) as AuditApiResponse;
      } catch {
        throw new Error("Server error, try again");
      }

      if (typeof data.remaining === "number") setRemaining(data.remaining);

      if (!res.ok || data.error) {
        const apiError = data.error ?? "";
        if (
          res.status === 401 ||
          apiError.toLowerCase().includes("login") ||
          apiError.toLowerCase().includes("unauthorized")
        ) {
          throw new Error("Login required — please sign in and try again");
        }
        if (res.status === 429 || apiError.toLowerCase().includes("limit")) {
          throw new Error("Daily limit reached — come back tomorrow");
        }
        throw new Error("Server error — try again in a moment");
      }

      if (!data.success || !data.data) {
        throw new Error("Server error — try again in a moment");
      }

      setAnalysis(data.data);
      setPhase("results");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error, try again";
      setError(msg);
      setPhase("results");
    }
  }, [email, prospect, limitReached]);

  const handleSignInAndAnalyze = () => {
    if (email.trim()) {
      sessionStorage.setItem("inboxsignal_prefill", email.trim());
    }
  };

  const handleReset = () => {
    setPhase("landing");
    setAnalysis(null);
    setError("");
  };

  const isLanding = phase === "landing";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          background: #000;
          color: rgba(255,255,255,0.82);
          font-family: 'Geist Mono', 'DM Mono', ui-monospace, monospace;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        ::selection {
          background: rgba(255,255,255,0.14);
          color: #fff;
        }

        textarea { resize: none; }
        textarea::placeholder { color: transparent; }
        textarea:focus { outline: none; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 999px; }

        [data-framer-component-type] { will-change: transform, opacity; }

        button:focus-visible {
          outline: 1.5px solid rgba(255,255,255,0.28);
          outline-offset: 2px;
        }

        /* Animated mesh background */
        @keyframes meshShift {
          0%   { transform: translate(0, 0) rotate(0deg); }
          33%  { transform: translate(20px, -15px) rotate(0.5deg); }
          66%  { transform: translate(-12px, 10px) rotate(-0.3deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        .mesh-bg {
          position: fixed;
          inset: -60px;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 55% 35% at 20% 30%, rgba(255,255,255,0.018) 0%, transparent 65%),
            radial-gradient(ellipse 40% 50% at 80% 70%, rgba(255,255,255,0.012) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,255,255,0.008) 0%, transparent 70%);
          animation: meshShift 18s ease-in-out infinite;
        }

        /* Mobile: sidebar goes full-width at top */
        @media (max-width: 767px) {
          .sidebar-panel {
            position: relative !important;
            width: 100% !important;
            top: auto !important;
            left: auto !important;
            bottom: auto !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
          }
          .results-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Mesh gradient */}
      <div className="mesh-bg" aria-hidden="true" />

      {/* Grain overlay */}
      <div style={NOISE_STYLE} aria-hidden="true" />

      {/* Navbar */}
      <Navbar
        isLoaded={isLoaded}
        isSignedIn={isSignedIn}
        phase={phase}
        remaining={remaining}
        limit={limit}
        onReset={handleReset}
      />

      {/* Main layout */}
      <div style={{ paddingTop: 52, minHeight: "100vh", position: "relative", zIndex: 1 }}>

        {/* ── LANDING ── */}
        <AnimatePresence>
          {isLanding && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(100vh - 52px)",
                padding: "32px 20px",
              }}
            >
              <HeroSection visible />
              <InputPanel
                phase={phase}
                email={email}
                prospect={prospect}
                isLoading={false}
                limitReached={limitReached}
                isSignedIn={isSignedIn}
                onEmailChange={setEmail}
                onProspectChange={setProspect}
                onAnalyze={runAudit}
                onSignInAndAnalyze={handleSignInAndAnalyze}
              />
              <FeatureGrid visible />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOADING / RESULTS ── */}
        {!isLanding && (
          <div style={{ display: "flex", minHeight: "calc(100vh - 52px)" }}>
            {/* Fixed sidebar */}
            <div
              className="sidebar-panel"
              style={{
                width: "clamp(280px, 28vw, 340px)",
                flexShrink: 0,
                position: "sticky",
                top: 52,
                height: "calc(100vh - 52px)",
                overflowY: "auto",
                borderRight: "1px solid rgba(255,255,255,0.05)",
                background: "#000",
                padding: "22px 18px",
              }}
            >
              <motion.div
                variants={slideIn}
                initial="hidden"
                animate="visible"
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <InputPanel
                  phase={phase}
                  email={email}
                  prospect={prospect}
                  isLoading={phase === "loading"}
                  limitReached={limitReached}
                  isSignedIn={isSignedIn}
                  onEmailChange={setEmail}
                  onProspectChange={setProspect}
                  onAnalyze={runAudit}
                  onSignInAndAnalyze={handleSignInAndAnalyze}
                />
              </motion.div>
            </div>

            {/* Scrollable results */}
            <div
              ref={resultsRef}
              style={{
                flex: 1,
                minWidth: 0,
                overflowY: "auto",
                height: "calc(100vh - 52px)",
                position: "sticky",
                top: 52,
                padding: "26px clamp(18px, 4vw, 48px)",
              }}
            >
              <AnimatePresence mode="wait">
                {phase === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  >
                    <LoadingResults />
                  </motion.div>
                )}

                {phase === "results" && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    {error ? (
                      <ErrorBlock message={error} />
                    ) : analysis ? (
                      <ResultsPanel analysis={analysis} originalEmail={submittedEmail} />
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
