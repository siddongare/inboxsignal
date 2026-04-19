"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface RewriteSection {
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
  rewrite: RewriteSection;
  followUps: FollowUps;
}

interface AuditApiResponse {
  success?: boolean;
  data?: AnalysisResult;
  error?: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s < 45) return "#F87171";
  if (s < 68) return "#FBBF24";
  return "#34D399";
}

function scoreLabel(s: number) {
  if (s < 45) return "failing";
  if (s < 68) return "weak";
  if (s < 80) return "moderate";
  return "strong";
}

function verdictLabel(s: number) {
  if (s < 45) return "Failing";
  if (s < 68) return "Weak";
  if (s < 80) return "Average";
  return "Strong";
}

const IMPACT: Record<ImpactLevel, {
  dot: string; text: string; bg: string; border: string;
  cardBg: string; cardBorder: string; cardAccent: string;
  label: string;
}> = {
  critical: {
    dot: "#EF4444", text: "#FCA5A5", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)",
    cardBg: "rgba(239,68,68,0.04)", cardBorder: "rgba(239,68,68,0.18)", cardAccent: "#EF4444",
    label: "CRITICAL",
  },
  high: {
    dot: "#F97316", text: "#FDBA74", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.22)",
    cardBg: "rgba(249,115,22,0.03)", cardBorder: "rgba(249,115,22,0.15)", cardAccent: "#F97316",
    label: "HIGH",
  },
  medium: {
    dot: "#F59E0B", text: "#FDE68A", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.20)",
    cardBg: "rgba(255,255,255,0.02)", cardBorder: "rgba(255,255,255,0.08)", cardAccent: "#F59E0B",
    label: "MEDIUM",
  },
  low: {
    dot: "#10B981", text: "#6EE7B7", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.18)",
    cardBg: "rgba(255,255,255,0.015)", cardBorder: "rgba(255,255,255,0.06)", cardAccent: "#10B981",
    label: "LOW",
  },
};

const IMPACT_ORDER: Record<ImpactLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };

// ─── Primitives ───────────────────────────────────────────────────────────────

function Row({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: "flex", alignItems: "center", ...style }}>{children}</div>;
}

function Label({ children, color = "#334155", size = 9 }: {
  children: React.ReactNode; color?: string; size?: number;
}) {
  return (
    <div style={{
      fontSize: size, fontFamily: "'Geist Mono', 'DM Mono', monospace",
      color, letterSpacing: "0.10em", textTransform: "uppercase",
    }}>{children}</div>
  );
}

function CopyBtn({ text, id, label = "copy" }: { text: string; id?: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      id={id}
      onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 2000); }}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", fontSize: 10,
        fontFamily: "'Geist Mono', 'DM Mono', monospace",
        background: ok ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.04)",
        color: ok ? "#6EE7B7" : "#475569",
        border: `1px solid ${ok ? "rgba(52,211,153,0.22)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 6, cursor: "pointer", transition: "all 0.15s",
        whiteSpace: "nowrap", flexShrink: 0,
        letterSpacing: "0.06em", textTransform: "uppercase",
      }}
    >{ok ? "✓ captured" : label}</button>
  );
}

function GradientDivider() {
  return (
    <div style={{
      height: 1,
      background: "linear-gradient(to right, transparent, rgba(99,102,241,0.12) 20%, rgba(99,102,241,0.12) 80%, transparent)",
      margin: "44px 0",
    }} />
  );
}

// ─── Signal Orb (logo mark) ───────────────────────────────────────────────────
function SignalOrb({ size = 26 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, flexShrink: 0,
      background: "linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)",
      border: "1px solid rgba(99,102,241,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 0 12px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Inner pulse rings */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 40% 35%, rgba(139,92,246,0.4) 0%, transparent 65%)",
      }} />
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 12 12" fill="none" style={{ position: "relative", zIndex: 1 }}>
        <circle cx="6" cy="6" r="1.5" fill="#818CF8" />
        <circle cx="6" cy="6" r="3.5" stroke="rgba(129,140,248,0.5)" strokeWidth="0.8" fill="none" />
        <circle cx="6" cy="6" r="5.2" stroke="rgba(129,140,248,0.2)" strokeWidth="0.6" fill="none" />
      </svg>
    </div>
  );
}

// ─── Hero score ───────────────────────────────────────────────────────────────

function HeroScore({ signals }: { signals: Signals }) {
  const avg = Math.round(
    (signals.clarity + signals.relevance + signals.credibility + signals.ctaStrength) / 4
  );
  const c = scoreColor(avg);

  const sparkBars = [
    { label: "Clarity",      value: signals.clarity      },
    { label: "Relevance",    value: signals.relevance    },
    { label: "Credibility",  value: signals.credibility  },
    { label: "CTA",          value: signals.ctaStrength  },
  ];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 28,
      padding: "24px 28px",
      background: `linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(99,102,241,0.04) 100%)`,
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: `3px solid ${c}`,
      borderRadius: 16, marginBottom: 28,
      boxShadow: `0 0 40px ${c}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Background aura */}
      <div style={{
        position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%",
        background: `radial-gradient(circle, ${c}08 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Score number */}
      <div style={{ flexShrink: 0, textAlign: "center", minWidth: 92 }}>
        <div style={{
          fontSize: 62, fontWeight: 900, color: c,
          lineHeight: 1, letterSpacing: "-0.06em",
          fontFamily: "'Geist Mono', 'DM Mono', monospace",
          textShadow: `0 0 30px ${c}40`,
        }}>{avg}</div>
        <div style={{ fontSize: 10, color: "#1E293B", fontFamily: "'Geist Mono', 'DM Mono', monospace", marginTop: 3, letterSpacing: "0.08em" }}>
          / 100
        </div>
      </div>

      {/* Verdict + sub-label */}
      <div style={{ flex: 1 }}>
        <Label color="#1E293B" size={9}>Signal score</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 28, fontWeight: 800, color: c,
            letterSpacing: "-0.04em", lineHeight: 1,
            fontFamily: "'Geist Mono', 'DM Mono', monospace",
          }}>{verdictLabel(avg)}</span>
          <span style={{
            fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace",
            padding: "3px 9px", borderRadius: 999,
            background: `${c}18`, color: c, border: `1px solid ${c}40`,
            letterSpacing: "0.08em",
          }}>{scoreLabel(avg)}</span>
        </div>
        <p style={{ margin: 0, fontSize: 11, color: "#334155", fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>
          Composite of 4 diagnostic signals · see Signal Detail ↓
        </p>
      </div>

      {/* Mini spark bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 136 }}>
        {sparkBars.map(({ label, value }) => {
          const sc = scoreColor(value);
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#334155",
                width: 64, letterSpacing: "0.04em", flexShrink: 0,
              }}>{label}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${value}%`, height: "100%", background: sc, borderRadius: 999, boxShadow: `0 0 6px ${sc}60` }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: sc, width: 22, textAlign: "right" }}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Top Priority callout ─────────────────────────────────────────────────────

function TopPriorityCallout({ items }: { items: DiagnosisItem[] }) {
  const top = items[0];
  if (!top) return null;
  const cfg = IMPACT[top.impact];

  return (
    <div style={{
      padding: "16px 18px", borderRadius: 12, marginBottom: 16,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      display: "flex", alignItems: "flex-start", gap: 14,
      boxShadow: `0 0 20px ${cfg.dot}08`,
    }}>
      <div style={{ flexShrink: 0, marginTop: 4 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", background: cfg.dot,
          boxShadow: `0 0 8px ${cfg.dot}80`,
        }} />
      </div>
      <div style={{ flex: 1 }}>
        <Row style={{ gap: 8, marginBottom: 6 }}>
          <Label color={cfg.dot} size={9}>Primary threat</Label>
          <span style={{
            fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace",
            padding: "1px 7px", borderRadius: 999,
            background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
            letterSpacing: "0.08em",
          }}>{cfg.label}</span>
        </Row>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.4, marginBottom: 5 }}>
          {top.issue}
        </div>
        <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.65 }}>
          {top.whyItMatters}
        </div>
      </div>
    </div>
  );
}

// ─── Diagnosis card ───────────────────────────────────────────────────────────

function DiagnosisCard({ item, index }: { item: DiagnosisItem; index: number }) {
  const cfg = IMPACT[item.impact];
  return (
    <div
      id={`diagnosis-${index}`}
      className="diag-card"
      style={{
        background: cfg.cardBg,
        border: `1px solid ${cfg.cardBorder}`,
        borderLeft: `3px solid ${cfg.cardAccent}`,
        borderRadius: 14, padding: "20px 22px",
        animationDelay: `${index * 50}ms`,
        transition: "all 0.18s",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Subtle aura */}
      <div style={{
        position: "absolute", top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at 80% 0%, ${cfg.cardAccent}06 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <Row style={{ justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
        <Row style={{ gap: 10 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7, flexShrink: 0,
            background: `${cfg.cardAccent}18`, border: `1px solid ${cfg.cardAccent}35`,
            color: cfg.cardAccent, fontSize: 10, fontWeight: 700,
            fontFamily: "'Geist Mono', 'DM Mono', monospace",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
            {item.issue}
          </span>
        </Row>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 9px", borderRadius: 999,
          fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.09em",
          background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.dot, flexShrink: 0, boxShadow: `0 0 4px ${cfg.dot}` }} />
          {cfg.label}
        </span>
      </Row>

      <div style={{ marginBottom: 14 }}>
        <Label color="#1E293B" size={9}>Why it matters</Label>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#94A3B8", margin: "6px 0 0" }}>{item.whyItMatters}</p>
      </div>

      {/* Fix block */}
      <div style={{
        borderRadius: 10, padding: "13px 16px",
        background: "rgba(99,102,241,0.06)",
        border: "1px solid rgba(99,102,241,0.16)",
        borderLeft: "2px solid rgba(99,102,241,0.55)",
      }}>
        <Row style={{ gap: 6, marginBottom: 7 }}>
          <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#818CF8", letterSpacing: "0.12em" }}>→ CORRECTION</span>
        </Row>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#C7D2FE", margin: 0 }}>{item.fix}</p>
      </div>
    </div>
  );
}

// ─── Rewrite section ──────────────────────────────────────────────────────────

function RewriteSection({
  originalEmail,
  rewrite,
}: {
  originalEmail: string;
  rewrite: RewriteSection;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <>
      {/* Email comparison */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(99,102,241,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14, padding: "20px 22px", marginBottom: 12,
      }}>
        <Row style={{ justifyContent: "space-between", marginBottom: 16 }}>
          {/* Toggle */}
          <div style={{
            display: "inline-flex",
            background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 9, padding: 3, gap: 2,
          }}>
            {[
              { id: false, label: "Optimized", activeColor: "#34D399", activeBg: "rgba(52,211,153,0.12)" },
              { id: true,  label: "Original",  activeColor: "#F87171", activeBg: "rgba(248,113,113,0.10)" },
            ].map(({ id, label, activeColor, activeBg }) => (
              <button
                key={String(id)}
                onClick={() => setShowOriginal(id)}
                style={{
                  padding: "5px 13px", border: "none", borderRadius: 7,
                  cursor: "pointer", fontSize: 11,
                  fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.05em",
                  background: showOriginal === id ? activeBg : "transparent",
                  color: showOriginal === id ? activeColor : "#475569",
                  transition: "all 0.15s",
                }}
              >{label}</button>
            ))}
          </div>

          {!showOriginal && (
            <CopyBtn text={rewrite.email} id="copy-rewritten-email" label="copy email" />
          )}
        </Row>

        {/* Email body */}
        <p style={{
          margin: 0, fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap",
          color: showOriginal ? "#64748B" : "#CBD5E1",
          fontFamily: "'Geist Mono', 'DM Mono', monospace",
          borderLeft: `2px solid ${showOriginal ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.35)"}`,
          paddingLeft: 16,
        }}>
          {showOriginal ? originalEmail : rewrite.email}
        </p>
      </div>

      {/* Subject lines */}
      {rewrite.subjectLines.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Label color="#334155" size={9}>Subject line variants</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
            {rewrite.subjectLines.map((line, i) => {
              const letter = ["A", "B", "C", "D"][i] ?? String(i + 1);
              const isFirst = i === 0;
              return (
                <div
                  id={`subject-${i}`}
                  key={`${line}-${i}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 14, padding: "11px 16px", borderRadius: 10,
                    background: isFirst ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.02)",
                    border: isFirst ? "1px solid rgba(99,102,241,0.24)" : "1px solid rgba(255,255,255,0.07)",
                    transition: "all 0.15s",
                  }}
                >
                  <Row style={{ gap: 10, flex: 1, minWidth: 0 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: isFirst ? "rgba(99,102,241,0.20)" : "rgba(255,255,255,0.04)",
                      border: isFirst ? "1px solid rgba(99,102,241,0.32)" : "1px solid rgba(255,255,255,0.08)",
                      color: isFirst ? "#818CF8" : "#475569",
                      fontSize: 9, fontWeight: 700, fontFamily: "'Geist Mono', 'DM Mono', monospace",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{letter}</span>
                    <span style={{
                      fontSize: 13, color: isFirst ? "#E0E7FF" : "#CBD5E1",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                    }}>{line}</span>
                    {isFirst && (
                      <span style={{
                        fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace",
                        padding: "2px 8px", borderRadius: 999, flexShrink: 0,
                        background: "rgba(99,102,241,0.15)", color: "#818CF8",
                        border: "1px solid rgba(99,102,241,0.28)", letterSpacing: "0.05em",
                      }}>★ Primary</span>
                    )}
                  </Row>
                  <CopyBtn text={line} id={`copy-subject-${i}`} label={`copy ${letter}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Why this works */}
      {rewrite.whyThisWorks && (
        <div style={{
          padding: "16px 18px",
          background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.14)",
          borderLeft: "2px solid rgba(99,102,241,0.45)", borderRadius: 12,
        }}>
          <Label color="#818CF8" size={9}>Signal rationale</Label>
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.75, color: "#94A3B8" }}>
            {rewrite.whyThisWorks}
          </p>
        </div>
      )}
    </>
  );
}

// ─── Follow-up timeline ───────────────────────────────────────────────────────

function FollowUpSequence({ day3, day7 }: { day3: string; day7: string }) {
  return (
    <div style={{ position: "relative", paddingLeft: 30 }}>
      <div style={{
        position: "absolute", left: 9, top: 22, bottom: 22, width: 2,
        background: "linear-gradient(to bottom, rgba(99,102,241,0.6), rgba(99,102,241,0.08))",
        borderRadius: 999,
      }} />

      {[
        { id: "followup-day3", label: "Sequence 1 of 2", day: "Day 3 · Soft nudge", content: day3, copyId: "copy-followup-day3", copyLabel: "copy D3", dotFull: true },
        { id: "followup-day7", label: "Sequence 2 of 2", day: "Day 7 · Value add",  content: day7, copyId: "copy-followup-day7", copyLabel: "copy D7", dotFull: false },
      ].map(({ id, label, day, content, copyId, copyLabel, dotFull }, idx) => (
        <div key={id} style={{ position: "relative", marginBottom: idx === 0 ? 16 : 0 }}>
          <div style={{
            position: "absolute", left: -26, top: 18,
            width: 18, height: 18, borderRadius: "50%",
            background: dotFull ? "rgba(99,102,241,0.9)" : "rgba(99,102,241,0.3)",
            border: "3px solid #060A0F",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: dotFull ? "0 0 10px rgba(99,102,241,0.5)" : "none",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: dotFull ? "#fff" : "rgba(255,255,255,0.5)" }} />
          </div>
          <div id={id} style={{
            background: dotFull ? "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(99,102,241,0.04) 100%)" : "rgba(255,255,255,0.015)",
            border: `1px solid ${dotFull ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 14, padding: "18px 20px",
          }}>
            <Row style={{ justifyContent: "space-between", gap: 12, marginBottom: 13 }}>
              <div>
                <Label color="#1E293B" size={9}>{label}</Label>
                <div style={{ fontSize: 11, color: dotFull ? "#818CF8" : "rgba(99,102,241,0.6)", marginTop: 4, fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>
                  {day}
                </div>
              </div>
              <CopyBtn text={content} id={copyId} label={copyLabel} />
            </Row>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#94A3B8", whiteSpace: "pre-wrap" }}>{content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Metric bar ───────────────────────────────────────────────────────────────

function MetricBar({ label, score, id }: { label: string; score: number; id: string }) {
  const c = scoreColor(score);
  return (
    <div id={id} style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      <Row style={{ justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 12, color: "#64748B", fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.04em" }}>
          {label}
        </span>
        <Row style={{ gap: 5, alignItems: "baseline" }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: c, letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "'Geist Mono', 'DM Mono', monospace", textShadow: `0 0 16px ${c}50` }}>
            {score}
          </span>
          <span style={{ fontSize: 10, color: "#1E293B", fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>/100</span>
          <span style={{ fontSize: 9, color: c, letterSpacing: "0.07em", marginLeft: 4, fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>
            {scoreLabel(score)}
          </span>
        </Row>
      </Row>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.04)", overflow: "visible", position: "relative" }}>
        {/* Danger zone tint */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "45%",
          background: "rgba(248,113,113,0.09)", borderRadius: "999px 0 0 999px",
        }} />
        {/* Average marker */}
        <div style={{ position: "absolute", left: "55%", top: -3, bottom: -3, width: 1, background: "rgba(255,255,255,0.15)", zIndex: 2 }}>
          <span style={{
            position: "absolute", top: -15, left: "50%", transform: "translateX(-50%)",
            fontSize: 8, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#334155", whiteSpace: "nowrap",
          }}>avg</span>
        </div>
        {/* Filled bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${score}%`, borderRadius: 999,
          background: c, zIndex: 3,
          boxShadow: `0 0 8px ${c}50`,
        }} />
      </div>
    </div>
  );
}

function BreakdownRow({ label, body }: { label: string; body: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "130px 1fr",
      gap: 16, padding: "14px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "start",
    }}>
      <Label color="#1E293B" size={9}>{label}</Label>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#94A3B8" }}>{body}</p>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ n, title, count, id }: {
  n: string; title: string; count?: number; id?: string;
}) {
  return (
    <div id={id} style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
        <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#6366F1", letterSpacing: "0.12em", opacity: 0.8 }}>
          {n}
        </span>
        {count !== undefined && (
          <span style={{
            fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace",
            padding: "1px 7px", borderRadius: 999,
            background: "rgba(99,102,241,0.1)", color: "#6366F1",
            border: "1px solid rgba(99,102,241,0.2)", letterSpacing: "0.05em",
          }}>{count}</span>
        )}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", margin: 0 }}>{title}</h2>
    </div>
  );
}

// ─── Loading / Error / Empty ──────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
      {/* Status text */}
      <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1" }} />
        <span style={{ fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#6366F1", letterSpacing: "0.07em" }}>
          Scanning signal patterns...
        </span>
      </div>
      <div className="skeleton-card" style={{
        height: 108, borderRadius: 16,
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 8,
      }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card" style={{
          background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14, padding: "22px 24px", animationDelay: `${i * 120}ms`,
        }}>
          <div style={{ width: "30%", height: 9, borderRadius: 5, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />
          <div style={{ width: "85%", height: 8, borderRadius: 5, background: "rgba(255,255,255,0.04)", marginBottom: 8 }} />
          <div style={{ width: "60%", height: 8, borderRadius: 5, background: "rgba(255,255,255,0.03)" }} />
        </div>
      ))}
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div id="error-block" style={{
      padding: "16px 18px", borderRadius: 12, marginTop: 8,
      border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.05)",
    }}>
      <Label color="#FCA5A5" size={10}>Signal lost</Label>
      <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.65, marginTop: 7 }}>{message}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: "72px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      {/* Logo mark */}
      <div style={{
        width: 56, height: 56, borderRadius: 16, marginBottom: 28,
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 40px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 40% 30%, rgba(139,92,246,0.35) 0%, transparent 70%)",
        }} />
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ position: "relative", zIndex: 1 }}>
          <circle cx="11" cy="11" r="2.5" fill="#818CF8" />
          <circle cx="11" cy="11" r="6" stroke="rgba(129,140,248,0.5)" strokeWidth="1.2" fill="none" />
          <circle cx="11" cy="11" r="9.5" stroke="rgba(129,140,248,0.2)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#E2E8F0", letterSpacing: "-0.03em", margin: "0 0 10px" }}>
        Awaiting signal input
      </h2>
      <p style={{ fontSize: 13, color: "#475569", maxWidth: 320, lineHeight: 1.75, margin: "0 0 36px" }}>
        Paste your cold email. InboxSignal detects exactly why it isn't getting replies — then rewrites it.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 360, textAlign: "left" }}>
        {[
          ["01", "Signal score + verdict",            "0–100 · Failing / Weak / Average / Strong" ],
          ["02", "Failure diagnosis by severity",     "Critical → High → Medium → Low"            ],
          ["03", "Optimized rewrite + subject lines", "Before/after · 4 variants · copy-ready"    ],
          ["04", "Follow-up sequence",                "Day 3 & Day 7 · deployment-ready"          ],
        ].map(([n, main, sub]) => (
          <div key={n} style={{
            display: "flex", alignItems: "flex-start", gap: 14, padding: "13px 16px", borderRadius: 11,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#6366F1", opacity: 0.75, flexShrink: 0, marginTop: 2, letterSpacing: "0.06em" }}>{n}</span>
            <div>
              <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.45, marginBottom: 3 }}>{main}</div>
              <div style={{ fontSize: 11, color: "#334155", fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sticky mini-nav ──────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: "section-hero",      label: "Score"      },
  { id: "section-diagnosis", label: "Diagnosis"  },
  { id: "section-rewrite",   label: "Rewrite"    },
  { id: "section-followups", label: "Sequence"   },
  { id: "section-metrics",   label: "Signals"    },
];

function StickyNav({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive]   = useState("section-hero");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = () => {
      setShowTop(container.scrollTop > 300);
      const containerTop = container.getBoundingClientRect().top;
      let current = NAV_SECTIONS[0].id;
      for (const { id } of NAV_SECTIONS) {
        const el = container.querySelector(`#${id}`) as HTMLElement | null;
        if (!el) continue;
        if (el.getBoundingClientRect().top - containerTop <= 120) current = id;
      }
      setActive(current);
    };

    container.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => container.removeEventListener("scroll", handler);
  }, [containerRef]);

  const scrollTo = (id: string) => {
    const container = containerRef.current;
    if (!container) return;
    const el = container.querySelector(`#${id}`) as HTMLElement | null;
    if (!el) return;
    const containerTop = container.getBoundingClientRect().top;
    const target = container.scrollTop + (el.getBoundingClientRect().top - containerTop) - 56;
    container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "rgba(6,9,14,0.94)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      height: 42, display: "flex", alignItems: "center",
      gap: 2, marginLeft: -38, marginRight: -38, marginBottom: 26, paddingRight: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, paddingLeft: 10 }}>
        {NAV_SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              padding: "4px 12px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.05em",
              background: active === id ? "rgba(99,102,241,0.14)" : "transparent",
              color: active === id ? "#818CF8" : "#475569",
              transition: "all 0.15s", position: "relative",
            }}
          >
            {label}
            {active === id && (
              <span style={{
                position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)",
                width: 3, height: 3, borderRadius: "50%", background: "#6366F1",
                boxShadow: "0 0 4px rgba(99,102,241,0.8)",
              }} />
            )}
          </button>
        ))}
      </div>
      {showTop && (
        <button
          onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)",
            cursor: "pointer", fontSize: 10, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#334155",
            background: "rgba(255,255,255,0.03)", letterSpacing: "0.05em", transition: "all 0.15s",
          }}
        >↑ top</button>
      )}
    </div>
  );
}

// ─── Platform-aware shortcut hint ─────────────────────────────────────────────

function ShortcutHint() {
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    setIsMac(
      navigator.platform.toUpperCase().includes("MAC") ||
      navigator.userAgent.includes("Mac")
    );
  }, []);
  return (
    <div style={{ textAlign: "center", fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.07em" }}>
      {isMac ? "⌘" : "CTRL"} + ENTER TO TRANSMIT
    </div>
  );
}

// ─── Post-analysis left-panel status ─────────────────────────────────────────

function PanelStatus({ analysis, lastRunAt, onReRun, canSubmit, loading }: {
  analysis: AnalysisResult | null;
  lastRunAt: Date | null;
  onReRun: () => void;
  canSubmit: boolean;
  loading: boolean;
}) {
  if (!analysis || !lastRunAt) return null;
  const avg = Math.round(
    (analysis.signals.clarity + analysis.signals.relevance +
     analysis.signals.credibility + analysis.signals.ctaStrength) / 4
  );
  const c = scoreColor(avg);
  const elapsed = Math.round((Date.now() - lastRunAt.getTime()) / 60000);
  const timeStr = elapsed === 0 ? "just now" : `${elapsed}m ago`;

  return (
    <div style={{
      padding: "13px 15px", borderRadius: 11,
      background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.14)",
    }}>
      <Row style={{ justifyContent: "space-between", gap: 8 }}>
        <Row style={{ gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", flexShrink: 0, boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
          <span style={{ fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#34D399", letterSpacing: "0.05em" }}>
            Signal complete · {timeStr}
          </span>
        </Row>
        <span style={{ fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: c }}>{avg}/100</span>
      </Row>
      <button
        onClick={onReRun}
        disabled={!canSubmit || loading}
        style={{
          marginTop: 10, width: "100%", padding: "8px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 8, color: "#64748B", fontSize: 11,
          fontFamily: "'Geist Mono', 'DM Mono', monospace", cursor: "pointer",
          letterSpacing: "0.05em", transition: "all 0.15s",
        }}
      >Re-transmit →</button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [email,     setEmail]     = useState("");
  const [prospect,  setProspect]  = useState("");
  const [rawResult, setRawResult] = useState("");
  const [analysis,  setAnalysis]  = useState<AnalysisResult | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [rawOpen,   setRawOpen]   = useState(false);
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const resultRef    = useRef<HTMLDivElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);

  const canSubmit = !loading && email.trim().length > 0 && prospect.trim().length > 0;

  const runAudit = useCallback(async () => {
    if (!canSubmit) return;
    setLoading(true); setError(""); setRawResult(""); setAnalysis(null); setRawOpen(false);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prospect }),
      });
      const data: AuditApiResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Audit request failed");
      if (!data.success || !data.data) throw new Error("Audit response was missing structured data");
      setRawResult(JSON.stringify(data.data, null, 2));
      setSubmittedEmail(email);
      setAnalysis(data.data);
      setLastRunAt(new Date());
      setTimeout(() => {
        if (mainPanelRef.current) mainPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [email, prospect, canSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runAudit();
  };

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify({ analysis }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "inboxsignal-report.json"; a.click();
  };

  const sortedDiagnosis = analysis
    ? [...analysis.diagnosis].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact])
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        body {
          background: #06090E !important;
          font-family: 'Syne', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          margin: 0;
        }

        ::selection { background: rgba(99,102,241,0.30); color: #E0E7FF; }
        textarea { resize: vertical; }
        textarea:focus {
          outline: none;
          border-color: rgba(99,102,241,0.50) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08), 0 0 20px rgba(99,102,241,0.06) !important;
        }

        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
        .skeleton-card { animation: skeletonPulse 1.6s ease-in-out infinite; }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }
        .pulse-dot { animation: pulseDot 1.1s ease-in-out infinite; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .report-section { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .diag-card      { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.10);
          border-top-color: rgba(255,255,255,0.85);
          animation: spin 0.75s linear infinite;
          display: inline-block; flex-shrink: 0;
        }

        .run-btn { transition: filter 0.15s, transform 0.12s, box-shadow 0.15s; }
        .run-btn:hover:not(:disabled) {
          filter: brightness(1.14);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.30);
        }
        .run-btn:active:not(:disabled) { transform: scale(0.97) translateY(0); }
        .run-btn:disabled { cursor: not-allowed; opacity: 0.35; }

        .diag-card:hover {
          filter: brightness(1.05);
          border-color: rgba(255,255,255,0.12) !important;
        }

        .empty-capability-row:hover {
          background: rgba(99,102,241,0.05) !important;
          border-color: rgba(99,102,241,0.15) !important;
        }

        details > summary { list-style: none; cursor: pointer; user-select: none; }
        details > summary::-webkit-details-marker { display: none; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }

        /* Noise texture overlay */
        .noise-bg::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.4;
        }
      `}</style>

      <div className="noise-bg" style={{ minHeight: "100vh", background: "#06090E", color: "#F1F5F9", fontFamily: "'Syne', system-ui, sans-serif" }}>

        {/* Ambient background glow */}
        <div style={{
          position: "fixed", top: -200, left: "40%", width: 600, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />
        <div style={{
          position: "fixed", bottom: -100, right: "10%", width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* ── Header ── */}
        <header style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 32px", height: 54,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(6,9,14,0.94)", backdropFilter: "blur(16px)",
        }}>
          <Row style={{ gap: 11 }}>
            <SignalOrb size={28} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#E2E8F0", letterSpacing: "-0.02em", fontFamily: "'Syne', system-ui, sans-serif" }}>
              Inbox<span style={{ color: "#818CF8" }}>Signal</span>
            </span>
          </Row>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.07em" }}>
              cold email intelligence
            </div>
            {/* Status indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.7)" }} />
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.06em" }}>LIVE</span>
            </div>
          </div>
        </header>

        {/* ── Two-column grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "368px 1fr", minHeight: "calc(100vh - 54px)", position: "relative", zIndex: 1 }}>

          {/* ── Left panel ── */}
          <aside id="input-panel" style={{
            borderRight: "1px solid rgba(255,255,255,0.06)",
            padding: "28px 22px",
            display: "flex", flexDirection: "column", gap: 16,
            position: "sticky", top: 54,
            height: "calc(100vh - 54px)", overflowY: "auto",
            background: "rgba(6,9,14,0.5)",
          }}>

            {/* Panel header */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: "#6366F1", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 6 }}>
                Input
              </div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>
                Paste your email and describe the prospect.
              </div>
            </div>

            <div>
              <Row style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <label htmlFor="email-input" style={{
                  fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#334155",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                }}>Cold Email</label>
                {email.length > 0 && (
                  <span style={{
                    fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em",
                    color: email.length > 1400 ? "#F87171" : email.length > 900 ? "#FBBF24" : "#334155",
                  }}>{email.length} chars</span>
                )}
              </Row>
              <textarea
                id="email-input"
                placeholder="Paste your outbound email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={11}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, color: "#CBD5E1",
                  padding: "13px 14px", fontSize: 12, lineHeight: 1.8,
                  fontFamily: "'DM Mono', monospace", transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
            </div>

            <div>
              <label htmlFor="prospect-input" style={{
                display: "block", fontSize: 9, fontFamily: "'DM Mono', monospace",
                color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8,
              }}>Prospect Context</label>
              <textarea
                id="prospect-input"
                placeholder="Role, company, pain point, recent trigger..."
                value={prospect}
                onChange={(e) => setProspect(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={5}
                style={{
                  width: "100%", background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, color: "#CBD5E1",
                  padding: "13px 14px", fontSize: 12, lineHeight: 1.75,
                  fontFamily: "'DM Mono', monospace", transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              />
            </div>

            <button
              id="run-audit-btn"
              className="run-btn"
              onClick={runAudit}
              disabled={!canSubmit}
              style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 60%, #4338CA 100%)",
                color: "#fff", border: "none", borderRadius: 11,
                fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "'Syne', system-ui, sans-serif",
                boxShadow: "0 4px 16px rgba(99,102,241,0.20)",
              }}
            >
              {loading ? <><span className="spinner" />Scanning signals...</> : "Diagnose Email →"}
            </button>

            <ShortcutHint />

            <PanelStatus
              analysis={analysis}
              lastRunAt={lastRunAt}
              onReRun={runAudit}
              canSubmit={canSubmit}
              loading={loading}
            />

            {!analysis && !loading && (
              <div style={{
                padding: "14px 16px", marginTop: 2,
                background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 11,
              }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 10 }}>
                  What gets detected
                </div>
                {[
                  ["01", "Signal score + verdict"],
                  ["02", "Failure points by severity"],
                  ["03", "Optimized rewrite + subjects"],
                  ["04", "Day 3 & Day 7 follow-ups"],
                ].map(([n, text]) => (
                  <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#6366F1", opacity: 0.65, flexShrink: 0, marginTop: 1, letterSpacing: "0.06em" }}>{n}</span>
                    <span style={{ fontSize: 11, color: "#334155", lineHeight: 1.5 }}>{text}</span>
                  </div>
                ))}
              </div>
            )}

            {error && <ErrorBlock message={error} />}
          </aside>

          {/* ── Right panel ── */}
          <main
            ref={mainPanelRef}
            style={{ padding: "32px 40px", overflowY: "auto", position: "relative" }}
          >
            {!loading && !analysis && !error && <EmptyState />}
            {loading && <LoadingSkeleton />}

            {analysis && (
              <div ref={resultRef} style={{ display: "flex", flexDirection: "column", maxWidth: 800 }}>

                {/* Sticky nav */}
                <StickyNav containerRef={mainPanelRef} />

                {/* ── HERO SCORE ── */}
                <div id="section-hero" className="report-section" style={{ animationDelay: "0ms" }}>
                  <HeroScore signals={analysis.signals} />
                </div>

                {/* ── SECTION 01: DIAGNOSIS ── */}
                <section id="section-diagnosis" className="report-section" style={{ animationDelay: "50ms" }}>
                  <SectionHeading n="01" title="Failure Diagnosis" count={sortedDiagnosis.length} id="heading-diagnosis" />
                  <TopPriorityCallout items={sortedDiagnosis} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {sortedDiagnosis.map((item, i) => (
                      <DiagnosisCard key={`${item.issue}-${i}`} item={item} index={i} />
                    ))}
                  </div>
                </section>

                <GradientDivider />

                {/* ── SECTION 02: REWRITE ── */}
                <section id="section-rewrite" className="report-section" style={{ animationDelay: "90ms" }}>
                  <SectionHeading n="02" title="Optimized Version" id="heading-rewrite" />
                  <RewriteSection originalEmail={submittedEmail} rewrite={analysis.rewrite} />
                </section>

                <GradientDivider />

                {/* ── SECTION 03: FOLLOW-UPS ── */}
                <section id="section-followups" className="report-section" style={{ animationDelay: "130ms" }}>
                  <SectionHeading n="03" title="Follow-Up Sequence" id="heading-followups" />
                  <FollowUpSequence day3={analysis.followUps.day3} day7={analysis.followUps.day7} />
                </section>

                <GradientDivider />

                {/* ── SECTION 04: SIGNAL DETAIL ── */}
                <section id="section-metrics" className="report-section" style={{ animationDelay: "170ms" }}>
                  <SectionHeading n="04" title="Signal Detail" id="heading-metrics" />

                  <div style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(99,102,241,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, padding: "22px 24px",
                    display: "flex", flexDirection: "column", gap: 24, marginBottom: 14,
                  }}>
                    <MetricBar id="metric-clarity"     label="Clarity"      score={analysis.signals.clarity}     />
                    <MetricBar id="metric-relevance"   label="Relevance"    score={analysis.signals.relevance}   />
                    <MetricBar id="metric-credibility" label="Credibility"  score={analysis.signals.credibility} />
                    <MetricBar id="metric-cta"         label="CTA Strength" score={analysis.signals.ctaStrength} />
                  </div>

                  <div style={{
                    background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12, padding: "16px 20px",
                  }}>
                    <Label color="#1E293B" size={9}>Email section breakdown</Label>
                    <div style={{ marginTop: 4 }}>
                      <BreakdownRow label="Hook"            body={analysis.emailBreakdown.hook} />
                      <BreakdownRow label="Value Prop"      body={analysis.emailBreakdown.valueProp} />
                      <BreakdownRow label="Personalization" body={analysis.emailBreakdown.personalization} />
                      <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 16, padding: "14px 0 0", alignItems: "start" }}>
                        <Label color="#1E293B" size={9}>CTA</Label>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#94A3B8" }}>
                          {analysis.emailBreakdown.cta}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <GradientDivider />

                {/* ── RAW JSON ── */}
                <section id="section-raw">
                  <details onToggle={(e) => setRawOpen((e.currentTarget as HTMLDetailsElement).open)}>
                    <summary style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "12px 16px",
                      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: rawOpen ? "12px 12px 0 0" : 12,
                    }}>
                      <span style={{
                        fontSize: 9, color: "#334155", display: "inline-block",
                        transform: rawOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.20s",
                      }}>▼</span>
                      <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#334155", letterSpacing: "0.09em", textTransform: "uppercase", flex: 1 }}>
                        Raw payload — debug
                      </span>
                      {rawOpen && (
                        <Row style={{ gap: 6 }}>
                          <CopyBtn text={rawResult} id="copy-raw-json" label="copy json" />
                          <button
                            onClick={(e) => { e.preventDefault(); downloadReport(); }}
                            style={{
                              padding: "4px 10px", fontSize: 9, fontFamily: "'DM Mono', monospace",
                              background: "rgba(255,255,255,0.04)", color: "#475569",
                              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, cursor: "pointer",
                              letterSpacing: "0.07em", textTransform: "uppercase",
                            }}
                          >export</button>
                        </Row>
                      )}
                    </summary>
                    <pre style={{
                      margin: 0, maxHeight: 420, overflowY: "auto", padding: "18px 20px",
                      background: "rgba(0,0,0,0.32)",
                      border: "1px solid rgba(255,255,255,0.06)", borderTop: "none",
                      borderRadius: "0 0 12px 12px",
                      whiteSpace: "pre-wrap", wordBreak: "break-word",
                      fontSize: 11, lineHeight: 1.8, color: "#334155",
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {rawResult}
                    </pre>
                  </details>
                </section>

              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
