"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion, useMotionValue, useSpring, useInView } from "framer-motion";
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

const EMAIL_TYPEWRITER_EXAMPLES: string[] = [
  "Subject: Quick question about {Company}'s pipeline\n\nHi {Name},\n\nSaw you closed 3 enterprise deals last quarter — congrats. We help sales teams cut ramp time by 40%. Worth a 15-min call this week?",
  "Subject: {Company}'s outbound hitting a ceiling?\n\nHi {Name},\n\nYour VP posted about scaling to $10M ARR. The bottleneck at that stage is almost always outbound quality, not volume. Here's what we'd fix first...",
  "Subject: Noticed you're hiring 2 new AEs\n\nHi {Name},\n\nBuilding out your sales org is the right move. We've helped 3 Series-B founders ramp new hires 2x faster without changing their stack. Open to a quick look?",
];

const PROSPECT_TYPEWRITER_EXAMPLES: string[] = [
  "Director of Growth, Series A SaaS. Raised $6M in March. Hiring 2 AEs. Pain: low reply rates on outbound.",
  "Head of Sales at a fintech startup. 8-person team, missing quota. Frustrated with generic outreach.",
  "Founder doing outbound solo. No sales team yet. Struggling to book demos from cold email.",
];

// ─── Motion config ────────────────────────────────────────────────────────────

const SPRING = { type: "spring" as const, stiffness: 260, damping: 30 };
const SPRING_SLOW = { type: "spring" as const, stiffness: 180, damping: 28 };

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: SPRING },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...SPRING, delay },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.16 } },
};

const slideIn = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: SPRING },
};

// ─── Noise overlay ────────────────────────────────────────────────────────────

const NOISE_STYLE: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
  backgroundImage:
    'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3CfeColorMatrix type=\'saturate\' values=\'0\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'0.038\'/%3E%3C/svg%3E")',
  backgroundRepeat: "repeat",
};

// ─── Utility ──────────────────────────────────────────────────────────────────

function scoreToLabel(s: number): string {
  if (s < 40) return "Failing";
  if (s < 60) return "Weak";
  if (s < 78) return "Average";
  return "Strong";
}

// ─── Mouse-following ambient glow ─────────────────────────────────────────────

function MouseGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 55, damping: 22 });
  const springY = useSpring(y, { stiffness: 55, damping: 22 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 200);
      y.set(e.clientY - 200);
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        zIndex: 0,
        pointerEvents: "none",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(255,255,255,0.045) 0%, transparent 70%)",
        left: springX,
        top: springY,
        filter: "blur(2px)",
      }}
    />
  );
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
      className="font-mono"
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

function Rule() {
  return (
    <div
      style={{
        height: 1,
        background:
          "linear-gradient(to right, transparent, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent)",
        margin: "20px 0",
      }}
    />
  );
}

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
      {copied ? (
        <CheckCircle size={11} strokeWidth={1.5} />
      ) : (
        <Copy size={11} strokeWidth={1.5} />
      )}
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
      <motion.div
        style={{
          position: "absolute",
          top: -1,
          height: 2,
          width: "35%",
          background:
            "linear-gradient(to right, transparent, rgba(255,255,255,0.5), transparent)",
          filter: "blur(0.5px)",
        }}
        animate={{ left: ["-35%", "100%"] }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatDelay: 0.7 }}
      />
      <motion.div
        style={{
          position: "absolute",
          bottom: -1,
          height: 2,
          width: "35%",
          background:
            "linear-gradient(to left, transparent, rgba(255,255,255,0.25), transparent)",
          filter: "blur(0.5px)",
        }}
        animate={{ right: ["-35%", "100%"] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.7,
          delay: duration / 2,
        }}
      />
    </div>
  );
}

// ─── Waveform icon (loading state) ────────────────────────────────────────────

function WaveformIcon({ color = "#000" }: { color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 14 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          style={{ width: 2.5, borderRadius: 2, background: color, originY: 0.5 }}
          animate={{ height: ["3px", "13px", "3px"] }}
          transition={{ duration: 0.55, repeat: Infinity, ease: "easeInOut", delay: i * 0.09 }}
        />
      ))}
    </div>
  );
}

// ─── Count-up number ──────────────────────────────────────────────────────────

function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return <>{value}</>;
}



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
  const [mode, setMode] = useState<"typing" | "erasing">("typing");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!show) return;
    const current = examples[idx];

    if (mode === "typing") {
      if (display.length < current.length) {
        const t = setTimeout(
          () => setDisplay(current.slice(0, display.length + 1)),
          typingSpeed
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setMode("erasing"), pauseMs);
      return () => clearTimeout(t);
    }

    if (mode === "erasing") {
      if (display.length > 0) {
        const t = setTimeout(() => setDisplay((d) => d.slice(0, -1)), eraseSpeed);
        return () => clearTimeout(t);
      }
      setIdx((i) => (i + 1) % examples.length);
      setMode("typing");
    }
  }, [display, mode, idx, examples, show, typingSpeed, eraseSpeed, pauseMs]);

  useEffect(() => {
    const t = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);

  if (!show) return null;

  return (
    <span
      style={{
        fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
        fontSize: 13,
        color: "rgba(255,255,255,0.15)",
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
          opacity: cursorVisible ? 0.5 : 0,
          transition: "opacity 0.1s",
        }}
      >
        ▌
      </span>
    </span>
  );
}

// ─── Scanner line ─────────────────────────────────────────────────────────────

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
            "linear-gradient(to right, transparent, rgba(255,255,255,0.18) 30%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.18) 70%, transparent)",
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
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.04)",
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

// ─── Hoverable card ───────────────────────────────────────────────────────────

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
        borderColor: hovered ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.055)",
      }}
      transition={{ ...SPRING, stiffness: 380, damping: 28 }}
      style={{
        border: "1px solid rgba(255,255,255,0.055)",
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

// ─── Score ring (SVG animated circle) ────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const size = 120;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - progress);
  const label = scoreToLabel(score);

  // Score drives the "ring fill": 0–39 sparse, 40–59 half, 60–77 3/4, 78+ full
  const ringOpacity = score < 40 ? 0.35 : score < 60 ? 0.55 : score < 78 ? 0.72 : 0.9;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`rgba(255,255,255,${ringOpacity})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ type: "spring", stiffness: 260, damping: 30, delay: 0.1 }}
        />
      </svg>
      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          style={{
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontSize: 28,
            fontWeight: 700,
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1,
            letterSpacing: "-0.06em",
          }}
        >
          {score}
        </motion.span>
        <span
          style={{
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontSize: 8,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Signal bar ───────────────────────────────────────────────────────────────

function SignalBar({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <MonoTag>{label}</MonoTag>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span
            style={{
              fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
              fontSize: 15,
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
      <div
        style={{
          height: 3,
          borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, score)}%` }}
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
    <motion.div variants={itemVariants}>
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: "22px",
          position: "relative",
          overflow: "hidden",
          // drop-shadow for premium "lit" look
          filter: "drop-shadow(0 0 15px rgba(255,255,255,0.03))",
        }}
      >
        <BorderBeam duration={3.5} />

        {/* Score — centered vertically */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <ScoreRing score={avg} />
          <div style={{ textAlign: "center" }}>
            <MonoTag dim>Signal score</MonoTag>
            <div
              style={{
                fontSize: "clamp(20px, 3vw, 26px)",
                fontWeight: 700,
                color: "rgba(255,255,255,0.88)",
                letterSpacing: "-0.04em",
                marginTop: 5,
                marginBottom: 4,
              }}
            >
              {scoreToLabel(avg)}
            </div>
            <MonoTag dim>Composite of 4 signal dimensions</MonoTag>
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

function DiagnosisCard({
  item,
  cfg,
}: {
  item: DiagnosisItem;
  cfg: (typeof IMPACT_CONFIG)[ImpactLevel];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        scale: hovered ? 1.008 : 1,
        borderColor: hovered ? cfg.hoverBorder : cfg.border,
      }}
      transition={{ ...SPRING, stiffness: 380, damping: 28 }}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${cfg.border}`,
        borderRadius: 9,
        padding: "13px 15px",
        cursor: "default",
        position: "relative",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        filter: hovered ? "drop-shadow(0 0 15px rgba(255,255,255,0.04))" : "none",
        transition: "filter 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 9,
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
      <p
        style={{
          margin: "0 0 9px",
          fontSize: 12,
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1.65,
        }}
      >
        {item.whyItMatters}
      </p>
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: 9,
          fontSize: 12,
          color: "rgba(255,255,255,0.56)",
          lineHeight: 1.6,
        }}
      >
        <MonoTag>→ fix · </MonoTag>
        {item.fix}
      </div>
    </motion.div>
  );
}

function DiagnosisSection({ items }: { items: DiagnosisItem[] }) {
  const sorted = [...items].sort(
    (a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]
  );

  return (
    <motion.div variants={itemVariants}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 13,
        }}
      >
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
        style={{ display: "flex", flexDirection: "column", gap: 7 }}
      >
        {sorted.map((item, i) => (
          <DiagnosisCard
            key={`${item.issue}-${i}`}
            item={item}
            cfg={IMPACT_CONFIG[item.impact]}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Terminal chrome (rewrite window) ────────────────────────────────────────

function TerminalChrome({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.022)",
      }}
    >
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

// ─── Rewrite section ──────────────────────────────────────────────────────────

function RewriteSection({
  rewrite,
  originalEmail,
}: {
  rewrite: RewriteData;
  originalEmail: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}
      >
        <FileText size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
        <MonoTag>Optimized Version</MonoTag>
      </div>

      <div
        style={{
          background: "#070707",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          filter: "drop-shadow(0 0 15px rgba(255,255,255,0.025))",
        }}
      >
        <BorderBeam duration={4.5} />
        <TerminalChrome
          label={showOriginal ? "original · unedited" : "rewritten · optimized"}
        />

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
                background:
                  showOriginal === id ? "rgba(255,255,255,0.1)" : "transparent",
                color:
                  showOriginal === id
                    ? "rgba(255,255,255,0.82)"
                    : "rgba(255,255,255,0.28)",
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>

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
              color: showOriginal
                ? "rgba(255,255,255,0.25)"
                : "rgba(255,255,255,0.7)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {showOriginal ? originalEmail : rewrite.email}
          </pre>
        </div>

        {rewrite.subjectLines.length > 0 && (
          <div
            style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <MonoTag dim>Subject line variants</MonoTag>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginTop: 8,
              }}
            >
              {rewrite.subjectLines.map((line, i) => (
                <div
                  key={`${line}-${i}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "7px 12px",
                    background:
                      i === 0
                        ? "rgba(255,255,255,0.045)"
                        : "rgba(255,255,255,0.018)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 7,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <MonoTag dim>{["A", "B", "C", "D"][i] ?? String(i + 1)}</MonoTag>
                    <span
                      style={{
                        fontSize: 12,
                        color:
                          i === 0
                            ? "rgba(255,255,255,0.72)"
                            : "rgba(255,255,255,0.38)",
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

        {rewrite.whyThisWorks && (
          <div
            style={{
              margin: "0 14px 14px",
              padding: "12px 14px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.04)",
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
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}
      >
        <Layers size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
        <MonoTag>Follow-Up Sequence</MonoTag>
      </div>

      {/* Stack on mobile, grid on md+ via inline responsive logic */}
      <div
        className="followup-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 10,
        }}
      >
        {[
          { label: "Day 3", sub: "Soft nudge", content: followUps.day3 },
          { label: "Day 7", sub: "Value add", content: followUps.day7 },
        ].map(({ label, sub, content }) => (
          <HoverCard key={label} style={{ background: "rgba(255,255,255,0.018)" }}>
            <div style={{ padding: "14px 16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
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
                  color: "rgba(255,255,255,0.46)",
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

function BreakdownSection({
  breakdown,
}: {
  breakdown: AnalysisResult["emailBreakdown"];
}) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Hook", value: breakdown.hook },
    { label: "Value Prop", value: breakdown.valueProp },
    { label: "Personalization", value: breakdown.personalization },
    { label: "CTA", value: breakdown.cta },
  ];

  return (
    <motion.div variants={itemVariants}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 13 }}
      >
        <Zap size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
        <MonoTag>Section Breakdown</MonoTag>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.018)",
          border: "1px solid rgba(255,255,255,0.05)",
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
              borderBottom:
                i < rows.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
              alignItems: "start",
            }}
          >
            <MonoTag dim>{label}</MonoTag>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(255,255,255,0.46)",
                lineHeight: 1.65,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Limit reached banner ─────────────────────────────────────────────────────

function LimitBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: SPRING }}
      style={{
        padding: "14px 18px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={14} strokeWidth={1.5} color="rgba(255,255,255,0.5)" />
      </div>
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 3,
          }}
        >
          Daily limit reached
        </div>
        <span
          style={{
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.06em",
          }}
        >
          5 / 5 analyses used · resets in 24h
        </span>
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

function Navbar({
  isLoaded,
  isSignedIn,
  phase,
  remaining,
  limit,
  onReset,
}: NavbarProps) {
  const limitReached = remaining <= 0;

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
        background: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        borderBottom: "none",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Mail size={14} strokeWidth={1.5} color="rgba(255,255,255,0.5)" />
        <span
          style={{
            fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          InboxSignal
          <span
            style={{
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.35)",
              fontSize: 9,
              letterSpacing: "0.08em",
              fontWeight: 500,
            }}
          >
            BETA
          </span>
        </span>
      </div>

      {/* Right cluster */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {phase === "results" && isSignedIn && (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {/* Usage pill */}
            <div
              style={{
                padding: "3px 10px",
                borderRadius: 6,
                background: limitReached
                  ? "rgba(255,60,60,0.08)"
                  : "rgba(255,255,255,0.035)",
                border: `1px solid ${limitReached ? "rgba(255,60,60,0.2)" : "rgba(255,255,255,0.065)"}`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                  fontSize: 10,
                  color: limitReached
                    ? "rgba(255,100,100,0.75)"
                    : "rgba(255,255,255,0.32)",
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
              <RotateCcw size={10} strokeWidth={1.5} />
              Reset
            </button>
          </div>
        )}

        {!isLoaded ? (
          <div
            style={{
              width: 88,
              height: 27,
              borderRadius: 7,
              background: "rgba(255,255,255,0.04)",
            }}
          />
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
                  border: "1px solid rgba(255,255,255,0.12)",
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

// ─── Analyze button (standalone — stable component identity prevents re-mount bug) ──

interface AnalyzeButtonProps {
  isLoading: boolean;
  limitReached: boolean;
  isSignedIn: boolean | undefined;
  canSubmit: boolean;
  onAnalyze: () => void;
  onSignInAndAnalyze: () => void;
}

function AnalyzeButton({
  isLoading,
  limitReached,
  isSignedIn,
  canSubmit,
  onAnalyze,
  onSignInAndAnalyze,
}: AnalyzeButtonProps) {
  if (isSignedIn) {
    return (
      <button
        onClick={onAnalyze}
        disabled={!canSubmit}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          background: canSubmit
            ? "rgba(255,255,255,0.92)"
            : "rgba(255,255,255,0.07)",
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
  const [focusedField, setFocusedField] = useState<"email" | "prospect" | null>(
    null
  );
  const isSidebar = phase === "loading" || phase === "results";
  const canSubmit =
    !isLoading &&
    !limitReached &&
    email.trim().length > 0 &&
    prospect.trim().length > 0;

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
    fontSize: "16px", // Prevents iOS zoom
    lineHeight: 1.75,
    resize: "none",
    display: "block",
    caretColor: "rgba(255,255,255,0.55)",
    WebkitTextSizeAdjust: "100%",
  };

  return (
    <motion.div
      layout
      layoutId="input-panel"
      style={{
        ...(isSidebar
          ? {
              display: "flex" as CSSProperties["display"],
              flexDirection: "column" as CSSProperties["flexDirection"],
              gap: 11,
            }
          : {
              width: "100%",
              maxWidth: 600,
              display: "flex" as CSSProperties["display"],
              flexDirection: "column" as CSSProperties["flexDirection"],
              gap: 10,
            }),
      }}
      transition={SPRING_SLOW}
    >
      {/* New Metrics Bar (Landing Page Only) */}
      {!isSidebar && (
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            margin: "0 auto 16px",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
            background: "rgba(255,255,255,0.015)",
            width: "fit-content",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <BorderBeam duration={12} />
          {[
            { prefix: "<", countTo: 30, suffix: "s", btm: "TO DIAGNOSE" },
            { prefix: "0–", countTo: 100, suffix: "", btm: "SIGNAL SCORE" },
            { prefix: "", countTo: 4, suffix: " dims", btm: "OF ANALYSIS" },
          ].map((item, i) => (
            <motion.div
              key={item.btm}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.18 + i * 0.1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px 28px",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: "-0.04em",
                }}
              >
                {item.prefix}<CountUp target={item.countTo} duration={900} />{item.suffix}
              </span>
              <span
                style={{
                  fontFamily: "'Geist Mono', 'DM Mono', ui-monospace, monospace",
                  fontSize: 9,
                  color: "rgba(255,255,255,0.36)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 3,
                }}
              >
                {item.btm}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cold Email textarea */}
      <div
        style={{
          background: "rgba(255,255,255,0.022)",
          border: `1px solid ${
            focusedField === "email"
              ? "rgba(255,255,255,0.14)"
              : "rgba(255,255,255,0.05)"
          }`,
          borderRadius: 10,
          padding: "12px 14px",
          transition: "border-color 0.18s",
          position: "relative",
          minHeight: isSidebar ? 200 : 140,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}
        >
          <Mail size={10} strokeWidth={1.5} color="rgba(255,255,255,0.28)" />
          <MonoTag dim>Cold Email</MonoTag>
          {email.length > 0 && <MonoTag dim>· {email.length}ch</MonoTag>}
        </div>

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
          rows={isSidebar ? 8 : 4}
          placeholder=""
          style={{ ...textareaBase, position: "relative", zIndex: 2 }}
        />
      </div>

      {/* Prospect context + Analyze button */}
      <div
        style={{
          background: "rgba(255,255,255,0.022)",
          border: `1px solid ${
            focusedField === "prospect"
              ? "rgba(255,255,255,0.14)"
              : "rgba(255,255,255,0.05)"
          }`,
          borderRadius: 10,
          padding: "12px 14px",
          transition: "border-color 0.18s",
          position: "relative",
          minHeight: isSidebar ? 130 : 90,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}
        >
          <MonoTag dim>Prospect Context</MonoTag>
        </div>

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
          <AnalyzeButton
            isLoading={isLoading}
            limitReached={limitReached}
            isSignedIn={isSignedIn}
            canSubmit={canSubmit}
            onAnalyze={onAnalyze}
            onSignInAndAnalyze={onSignInAndAnalyze}
          />
        </div>
      </div>

      {/* Limit reached state — shown in sidebar */}
      {isSidebar && limitReached && <LimitBanner />}
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
          animate={{
            opacity: 1,
            y: 0,
            transition: { ...SPRING, delay: 0.05 },
          }}
          exit={{ opacity: 0, y: -14, transition: { duration: 0.22 } }}
          style={{ textAlign: "center", marginBottom: 12, width: "100%" }}
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { ...SPRING, delay: 0.08 } }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 12,
            }}
          >
            <div style={{ position: "relative", width: 8, height: 8, flexShrink: 0 }}>
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(120,255,160,0.6)",
                }}
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 1.5,
                  borderRadius: "50%",
                  background: "rgba(120,255,160,0.9)",
                }}
              />
            </div>
            <MonoTag>Free · 5 analyses / day · No card</MonoTag>
          </motion.div>

          <h1
            style={{
              fontSize: "clamp(32px, 7.5vw, 68px)",
              fontWeight: 800,
              color: "rgba(255,255,255,0.94)",
              letterSpacing: "-0.04em",
              lineHeight: 1.04,
              margin: "0 auto 8px",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              maxWidth: 700,
            }}
          >
            Turn cold emails
            <br />
            <span className="shimmer-text">into replies.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(13px, 2vw, 16px)",
              color: "rgba(255,255,255,0.32)",
              lineHeight: 1.7,
              maxWidth: 420,
              margin: "0 auto",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 400,
            }}
          >
            Diagnose why your outreach is being ignored.
            <br />
            Get the score, the fix, and the rewrite.
          </p>

          {/* Decorative signal bars below headline */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: 3,
              marginTop: 16,
              height: 20,
              opacity: 0.38,
            }}
          >
            {[5, 9, 14, 11, 7, 12, 16, 10, 6].map((h, i) => (
              <motion.div
                key={i}
                style={{
                  width: 3,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.7)",
                  originY: 1,
                }}
                animate={{ height: [`${h * 0.5}px`, `${h}px`, `${h * 0.65}px`, `${h}px`, `${h * 0.5}px`] }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Feature grid ─────────────────────────────────────────────────────────────

function FeatureGrid({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const items = [
    {
      icon: Zap,
      n: "01",
      title: "Signal Score",
      desc: "0–100 composite across clarity, relevance, credibility, CTA.",
    },
    {
      icon: AlertTriangle,
      n: "02",
      title: "Failure Diagnosis",
      desc: "Each weak point ranked Critical → High → Medium → Low.",
    },
    {
      icon: FileText,
      n: "03",
      title: "Optimized Rewrite",
      desc: "Better email + 4 subject line variants, copy-ready.",
    },
    {
      icon: Layers,
      n: "04",
      title: "Follow-Up Sequence",
      desc: "Day 3 & Day 7 emails that add new angles, not repeats.",
    },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={ref}
          key="features"
          initial={{ opacity: 0, y: 26 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { ...SPRING, delay: 0.14 },
          }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
            width: "100%",
            maxWidth: 600,
            marginTop: 32,
          }}
        >
          {items.map(({ icon: Icon, n, title, desc }, idx) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ ...SPRING, delay: 0.1 + idx * 0.08 }}
              whileHover={{ scale: 1.028, borderColor: "rgba(255,255,255,0.16)", y: -2 }}
              style={{
                padding: "16px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderTop: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                gap: 7,
                cursor: "default",
                boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: 7 }}
              >
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

// ─── Loading skeletons ────────────────────────────────────────────────────────

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

// ─── Results panel ────────────────────────────────────────────────────────────

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
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* 2-col: score+diagnosis left, rewrite right. Stacks on narrow screens. */}
      <div className="results-grid" style={{ display: "contents" }}>
        <div
          style={{
            display: "grid",
            // Responsive: 2-col on wide, 1-col on narrow
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Left: score + diagnosis */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ScoreSection signals={analysis.signals} />
            <DiagnosisSection items={analysis.diagnosis} />
          </div>

          {/* Right: terminal rewrite */}
          <RewriteSection
            rewrite={analysis.rewrite}
            originalEmail={originalEmail}
          />
        </div>
      </div>

      <Rule />
      <FollowUpSection followUps={analysis.followUps} />
      <Rule />
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
        border: "1px solid rgba(255,60,60,0.13)",
        borderRadius: 10,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}
      >
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

  // Restore prefill after Clerk redirect
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const stashed = sessionStorage.getItem("inboxsignal_prefill");
    if (stashed) {
      sessionStorage.removeItem("inboxsignal_prefill");
      setEmail(stashed);
    }
  }, [isLoaded, isSignedIn]);

  // runAudit — zero-latency perceived: sets phase="loading" synchronously before the fetch
  const runAudit = useCallback(async () => {
    if (!email.trim() || !prospect.trim() || limitReached) return;

    // Immediate state update — no double-click bug
    setPhase("loading");
    setError("");
    setAnalysis(null);
    setSubmittedEmail(email);

    // Scroll results pane to top on mobile
    setTimeout(() => {
      resultsRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      // Also scroll window for mobile full-page layout
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);

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
        if (
          res.status === 429 ||
          apiError.toLowerCase().includes("limit")
        ) {
          // Hard limit reached — update counter and show banner
          setRemaining(0);
          throw new Error("Daily limit reached — resets in 24 hours");
        }
        throw new Error("Server error — try again in a moment");
      }

      if (!data.success || !data.data) {
        throw new Error("Server error — try again in a moment");
      }

      setAnalysis(data.data);
      setPhase("results");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unexpected error, try again";
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
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          background: #000;
          color: rgba(255,255,255,0.82);
          font-family: 'Geist Mono', 'DM Mono', ui-monospace, monospace;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        ::selection { background: rgba(255,255,255,0.14); color: #fff; }

        textarea { resize: none; }
        textarea::placeholder { color: transparent; }
        textarea:focus { outline: none; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 999px; }

        button:focus-visible {
          outline: 1.5px solid rgba(255,255,255,0.28);
          outline-offset: 2px;
        }

        /* Shimmer sweep for hero accent */
        @keyframes shimmerSweep {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(
            105deg,
            rgba(255,255,255,0.18) 0%,
            rgba(255,255,255,0.18) 35%,
            rgba(255,255,255,0.72) 50%,
            rgba(255,255,255,0.18) 65%,
            rgba(255,255,255,0.18) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerSweep 12s linear infinite;
        }

        /* Animated mesh background */
        @keyframes meshShift {
          0%   { transform: translate(0, 0); }
          33%  { transform: translate(18px, -12px); }
          66%  { transform: translate(-10px, 8px); }
          100% { transform: translate(0, 0); }
        }
        .mesh-bg {
          position: fixed;
          inset: -60px;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse 55% 35% at 20% 30%, rgba(120,100,255,0.08) 0%, transparent 65%),
            radial-gradient(ellipse 40% 50% at 80% 70%, rgba(255,255,255,0.055) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 50%, rgba(80,120,255,0.045) 0%, transparent 70%);
          animation: meshShift 18s ease-in-out infinite;
        }

        /* Mobile: sidebar stacks vertically above results (< 768px) */
        @media (max-width: 767px) {
          .sidebar-panel {
            position: relative !important;
            width: 100% !important;
            top: auto !important;
            left: auto !important;
            bottom: auto !important;
            height: auto !important;
            max-height: none !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.05) !important;
            overflow-y: visible !important;
          }
          .results-scroll {
            height: auto !important;
            min-height: 60vh !important;
            position: relative !important;
            overflow-y: auto !important;
          }
          .layout-row {
            flex-direction: column !important;
            min-height: unset !important;
          }
        }

        /* Feature grid: 1-col on very small screens */
        @media (max-width: 440px) {
          .feature-grid-inner {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Background layers */}
      <div className="mesh-bg" aria-hidden="true" />
      <div style={NOISE_STYLE} aria-hidden="true" />
      <MouseGlow />

      {/* Navbar */}
      <Navbar
        isLoaded={isLoaded}
        isSignedIn={isSignedIn}
        phase={phase}
        remaining={remaining}
        limit={limit}
        onReset={handleReset}
      />

      {/* Main */}
      <div
        style={{
          paddingTop: 52,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* ── LANDING ── */}
        <AnimatePresence>
          {isLanding && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.18 } }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "calc(100vh - 52px)",
                padding: "16px 20px",
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
              {/* Feature grid — hidden class for mobile 1-col */}
              <div className="feature-grid-inner" style={{ width: "100%", maxWidth: 600 }}>
                <FeatureGrid visible />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LOADING / RESULTS ── */}
        {!isLanding && (
          <motion.div
            layout
            className="layout-row"
            style={{ display: "flex", minHeight: "calc(100vh - 52px)" }}
          >
            {/* Sidebar */}
            <motion.div
              layout
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
                padding: "20px 18px",
              }}
            >
              <motion.div
                variants={slideIn}
                initial="hidden"
                animate="visible"
                style={{ display: "flex", flexDirection: "column", gap: 11 }}
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
            </motion.div>

            {/* Results scroll area */}
            <motion.div
              layout
              ref={resultsRef}
              className="results-scroll"
              style={{
                flex: 1,
                minWidth: 0,
                overflowY: "auto",
                height: "calc(100vh - 52px)",
                position: "sticky",
                top: 52,
                padding: "24px clamp(16px, 4vw, 44px)",
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
                    transition={{ duration: 0.22 }}
                  >
                    {error ? (
                      <ErrorBlock message={error} />
                    ) : analysis ? (
                      <ResultsPanel
                        analysis={analysis}
                        originalEmail={submittedEmail}
                      />
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </div>
    </>
  );
}