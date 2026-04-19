"use client";

import { UserButton } from "@clerk/nextjs";
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
  remaining?: number;
  limit?: number;
}

interface InboxSignalAppProps {
  initialLimit: number;
  initialRemaining: number;
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

function MonoLabel({ children, color = "#334155", size = 9 }: {
  children: React.ReactNode; color?: string; size?: number;
}) {
  return (
    <div style={{
      fontSize: size,
      fontFamily: "'Geist Mono', 'DM Mono', monospace",
      color,
      letterSpacing: "0.10em",
      textTransform: "uppercase",
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
        padding: "7px 12px", minHeight: 36,
        fontSize: 10,
        fontFamily: "'Geist Mono', 'DM Mono', monospace",
        background: ok ? "rgba(52,211,153,0.10)" : "rgba(255,255,255,0.04)",
        color: ok ? "#6EE7B7" : "#475569",
        border: `1px solid ${ok ? "rgba(52,211,153,0.22)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 7, cursor: "pointer", transition: "all 0.15s",
        whiteSpace: "nowrap", flexShrink: 0,
        letterSpacing: "0.06em", textTransform: "uppercase",
        WebkitTapHighlightColor: "transparent",
      }}
    >{ok ? "✓ captured" : label}</button>
  );
}

function GradientDivider() {
  return (
    <div style={{
      height: 1,
      background: "linear-gradient(to right, transparent, rgba(99,102,241,0.12) 20%, rgba(99,102,241,0.12) 80%, transparent)",
      margin: "36px 0",
    }} />
  );
}

// ─── Signal Orb logo mark ─────────────────────────────────────────────────────

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
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 35%, rgba(139,92,246,0.4) 0%, transparent 65%)" }} />
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
  const avg = Math.round((signals.clarity + signals.relevance + signals.credibility + signals.ctaStrength) / 4);
  const c = scoreColor(avg);
  const sparkBars = [
    { label: "Clarity",     value: signals.clarity     },
    { label: "Relevance",   value: signals.relevance   },
    { label: "Credibility", value: signals.credibility },
    { label: "CTA",         value: signals.ctaStrength },
  ];

  return (
    <div style={{
      padding: "var(--card-p)",
      background: `linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(99,102,241,0.04) 100%)`,
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: `3px solid ${c}`,
      borderRadius: 14, marginBottom: 24,
      boxShadow: `0 0 40px ${c}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: `radial-gradient(circle, ${c}08 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <div style={{ flexShrink: 0, textAlign: "center", minWidth: 72 }}>
          <div style={{
            fontSize: "clamp(44px, 11vw, 60px)", fontWeight: 900, color: c,
            lineHeight: 1, letterSpacing: "-0.06em",
            fontFamily: "'Geist Mono', 'DM Mono', monospace",
          }}>{avg}</div>
          <div style={{ fontSize: 9, color: "#1E293B", fontFamily: "'Geist Mono', 'DM Mono', monospace", marginTop: 2, letterSpacing: "0.08em" }}>/ 100</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <MonoLabel color="#1E293B" size={9}>Signal score</MonoLabel>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, marginBottom: 5, flexWrap: "wrap" }}>
            <span style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: c, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>
              {verdictLabel(avg)}
            </span>
            <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", padding: "3px 9px", borderRadius: 999, background: `${c}18`, color: c, border: `1px solid ${c}40`, letterSpacing: "0.08em" }}>
              {scoreLabel(avg)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "#334155", fontFamily: "'Geist Mono', 'DM Mono', monospace", lineHeight: 1.4 }}>
            4 diagnostic signals · see detail ↓
          </p>
        </div>
      </div>

      <div className="spark-grid">
        {sparkBars.map(({ label, value }) => {
          const sc = scoreColor(value);
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#334155", width: 58, flexShrink: 0, letterSpacing: "0.04em" }}>{label}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                <div style={{ width: `${value}%`, height: "100%", background: sc, borderRadius: 999, boxShadow: `0 0 6px ${sc}60` }} />
              </div>
              <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: sc, width: 20, textAlign: "right", flexShrink: 0 }}>{value}</span>
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
      padding: "14px 16px", borderRadius: 12, marginBottom: 14,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      display: "flex", alignItems: "flex-start", gap: 12,
      boxShadow: `0 0 20px ${cfg.dot}08`,
    }}>
      <div style={{ flexShrink: 0, marginTop: 5 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}80` }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <MonoLabel color={cfg.dot} size={9}>Primary threat</MonoLabel>
          <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", padding: "1px 7px", borderRadius: 999, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`, letterSpacing: "0.08em" }}>{cfg.label}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.45, marginBottom: 5 }}>{top.issue}</div>
        <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.65 }}>{top.whyItMatters}</div>
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
        borderRadius: 12, padding: "var(--card-p)",
        animationDelay: `${index * 50}ms`,
        transition: "all 0.18s",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 80% 0%, ${cfg.cardAccent}06 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1,
            background: `${cfg.cardAccent}18`, border: `1px solid ${cfg.cardAccent}35`,
            color: cfg.cardAccent, fontSize: 10, fontWeight: 700,
            fontFamily: "'Geist Mono', 'DM Mono', monospace",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9", letterSpacing: "-0.01em", lineHeight: 1.4 }}>
            {item.issue}
          </span>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 8px", borderRadius: 999,
          fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.09em",
          background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
          whiteSpace: "nowrap", flexShrink: 0, marginTop: 2,
        }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.dot, flexShrink: 0, boxShadow: `0 0 4px ${cfg.dot}` }} />
          {cfg.label}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <MonoLabel color="#1E293B" size={9}>Why it matters</MonoLabel>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#94A3B8", margin: "5px 0 0" }}>{item.whyItMatters}</p>
      </div>

      <div style={{ borderRadius: 9, padding: "12px 14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.16)", borderLeft: "2px solid rgba(99,102,241,0.55)" }}>
        <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#818CF8", letterSpacing: "0.12em", display: "block", marginBottom: 6 }}>
          → CORRECTION
        </span>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#C7D2FE", margin: 0 }}>{item.fix}</p>
      </div>
    </div>
  );
}

// ─── Rewrite section ──────────────────────────────────────────────────────────

function RewriteSection({ originalEmail, rewrite }: { originalEmail: string; rewrite: RewriteSection }) {
  const [showOriginal, setShowOriginal] = useState(false);
  return (
    <>
      <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(99,102,241,0.03) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "var(--card-p)", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: 3, gap: 2 }}>
            {[
              { id: false, label: "Optimized", activeColor: "#34D399", activeBg: "rgba(52,211,153,0.12)" },
              { id: true,  label: "Original",  activeColor: "#F87171", activeBg: "rgba(248,113,113,0.10)" },
            ].map(({ id, label, activeColor, activeBg }) => (
              <button
                key={String(id)}
                onClick={() => setShowOriginal(id)}
                style={{
                  padding: "6px 14px", border: "none", borderRadius: 7, cursor: "pointer",
                  fontSize: 11, minHeight: 36,
                  fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.05em",
                  background: showOriginal === id ? activeBg : "transparent",
                  color: showOriginal === id ? activeColor : "#475569",
                  transition: "all 0.15s", WebkitTapHighlightColor: "transparent",
                }}
              >{label}</button>
            ))}
          </div>
          {!showOriginal && <CopyBtn text={rewrite.email} id="copy-rewritten-email" label="copy email" />}
        </div>
        <p style={{
          margin: 0, fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap",
          color: showOriginal ? "#64748B" : "#CBD5E1",
          fontFamily: "'Geist Mono', 'DM Mono', monospace",
          borderLeft: `2px solid ${showOriginal ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.35)"}`,
          paddingLeft: 14, wordBreak: "break-word",
        }}>
          {showOriginal ? originalEmail : rewrite.email}
        </p>
      </div>

      {rewrite.subjectLines.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <MonoLabel color="#334155" size={9}>Subject line variants</MonoLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
            {rewrite.subjectLines.map((line, i) => {
              const letter = ["A", "B", "C", "D"][i] ?? String(i + 1);
              const isFirst = i === 0;
              return (
                <div key={`${line}-${i}`} id={`subject-${i}`} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: isFirst ? "rgba(99,102,241,0.07)" : "rgba(255,255,255,0.02)",
                  border: isFirst ? "1px solid rgba(99,102,241,0.24)" : "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: isFirst ? "rgba(99,102,241,0.20)" : "rgba(255,255,255,0.04)",
                      border: isFirst ? "1px solid rgba(99,102,241,0.32)" : "1px solid rgba(255,255,255,0.08)",
                      color: isFirst ? "#818CF8" : "#475569",
                      fontSize: 9, fontWeight: 700, fontFamily: "'Geist Mono', 'DM Mono', monospace",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{letter}</span>
                    {isFirst && (
                      <span className="subject-primary-badge" style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,0.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.28)", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                        ★ Primary
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: 13, color: isFirst ? "#E0E7FF" : "#CBD5E1", lineHeight: 1.5, flex: 1, wordBreak: "break-word" }}>{line}</span>
                    <CopyBtn text={line} id={`copy-subject-${i}`} label={letter} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rewrite.whyThisWorks && (
        <div style={{ padding: "14px 16px", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.14)", borderLeft: "2px solid rgba(99,102,241,0.45)", borderRadius: 12 }}>
          <MonoLabel color="#818CF8" size={9}>Signal rationale</MonoLabel>
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.75, color: "#94A3B8" }}>{rewrite.whyThisWorks}</p>
        </div>
      )}
    </>
  );
}

// ─── Follow-up timeline ───────────────────────────────────────────────────────

function FollowUpSequence({ day3, day7 }: { day3: string; day7: string }) {
  return (
    <div style={{ position: "relative", paddingLeft: 26 }}>
      <div style={{ position: "absolute", left: 7, top: 22, bottom: 22, width: 2, background: "linear-gradient(to bottom, rgba(99,102,241,0.6), rgba(99,102,241,0.08))", borderRadius: 999 }} />
      {[
        { id: "followup-day3", label: "Sequence 1 of 2", day: "Day 3 · Soft nudge", content: day3, copyId: "copy-followup-day3", copyLabel: "D3", dotFull: true  },
        { id: "followup-day7", label: "Sequence 2 of 2", day: "Day 7 · Value add",  content: day7, copyId: "copy-followup-day7", copyLabel: "D7", dotFull: false },
      ].map(({ id, label, day, content, copyId, copyLabel, dotFull }, idx) => (
        <div key={id} style={{ position: "relative", marginBottom: idx === 0 ? 14 : 0 }}>
          <div style={{
            position: "absolute", left: -22, top: 16,
            width: 16, height: 16, borderRadius: "50%",
            background: dotFull ? "rgba(99,102,241,0.9)" : "rgba(99,102,241,0.3)",
            border: "3px solid #06090E",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: dotFull ? "0 0 10px rgba(99,102,241,0.5)" : "none",
          }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: dotFull ? "#fff" : "rgba(255,255,255,0.5)" }} />
          </div>
          <div id={id} style={{
            background: dotFull ? "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(99,102,241,0.04) 100%)" : "rgba(255,255,255,0.015)",
            border: `1px solid ${dotFull ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.07)"}`,
            borderRadius: 12, padding: "var(--card-p)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div>
                <MonoLabel color="#1E293B" size={9}>{label}</MonoLabel>
                <div style={{ fontSize: 11, color: dotFull ? "#818CF8" : "rgba(99,102,241,0.6)", marginTop: 4, fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>{day}</div>
              </div>
              <CopyBtn text={content} id={copyId} label={`copy ${copyLabel}`} />
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#94A3B8", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{content}</p>
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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#64748B", fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.04em" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: c, letterSpacing: "-0.02em", lineHeight: 1, fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>{score}</span>
          <span style={{ fontSize: 10, color: "#1E293B", fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>/100</span>
          <span style={{ fontSize: 9, color: c, letterSpacing: "0.07em", marginLeft: 2, fontFamily: "'Geist Mono', 'DM Mono', monospace" }}>{scoreLabel(score)}</span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.04)", position: "relative", overflow: "visible" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "45%", background: "rgba(248,113,113,0.09)", borderRadius: "999px 0 0 999px" }} />
        <div style={{ position: "absolute", left: "55%", top: -3, bottom: -3, width: 1, background: "rgba(255,255,255,0.15)", zIndex: 2 }}>
          <span style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", fontSize: 8, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#334155", whiteSpace: "nowrap" }}>avg</span>
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${score}%`, borderRadius: 999, background: c, zIndex: 3, boxShadow: `0 0 8px ${c}50` }} />
      </div>
    </div>
  );
}

// ─── Breakdown row ────────────────────────────────────────────────────────────

function BreakdownRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="breakdown-row">
      <MonoLabel color="#1E293B" size={9}>{label}</MonoLabel>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#94A3B8" }}>{body}</p>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ n, title, count, id }: { n: string; title: string; count?: number; id?: string }) {
  return (
    <div id={id} style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#6366F1", letterSpacing: "0.12em", opacity: 0.8 }}>{n}</span>
        {count !== undefined && (
          <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", padding: "1px 7px", borderRadius: 999, background: "rgba(99,102,241,0.1)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.2)", letterSpacing: "0.05em" }}>{count}</span>
        )}
      </div>
      <h2 style={{ fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.03em", margin: 0 }}>{title}</h2>
    </div>
  );
}

// ─── Loading / Error / Empty ──────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "8px 0" }}>
      <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1", flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#6366F1", letterSpacing: "0.07em" }}>Scanning signal patterns...</span>
      </div>
      <div className="skeleton-card" style={{ height: 100, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card" style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "20px", animationDelay: `${i * 120}ms` }}>
          <div style={{ width: "30%", height: 9, borderRadius: 5, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />
          <div style={{ width: "85%", height: 8, borderRadius: 5, background: "rgba(255,255,255,0.04)", marginBottom: 8 }} />
          <div style={{ width: "60%", height: 8, borderRadius: 5, background: "rgba(255,255,255,0.03)" }} />
        </div>
      ))}
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div id="error-block" style={{ padding: "16px", borderRadius: 12, marginTop: 8, border: "1px solid rgba(239,68,68,0.22)", background: "rgba(239,68,68,0.05)" }}>
      <MonoLabel color="#FCA5A5" size={10}>Signal lost</MonoLabel>
      <div style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.65, marginTop: 7 }}>{message}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ padding: "56px 16px 40px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{
        width: 52, height: 52, borderRadius: 15, marginBottom: 24,
        background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)",
        border: "1px solid rgba(99,102,241,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 40px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 40% 30%, rgba(139,92,246,0.35) 0%, transparent 70%)" }} />
        <svg width="20" height="20" viewBox="0 0 22 22" fill="none" style={{ position: "relative", zIndex: 1 }}>
          <circle cx="11" cy="11" r="2.5" fill="#818CF8" />
          <circle cx="11" cy="11" r="6" stroke="rgba(129,140,248,0.5)" strokeWidth="1.2" fill="none" />
          <circle cx="11" cy="11" r="9.5" stroke="rgba(129,140,248,0.2)" strokeWidth="1" fill="none" />
        </svg>
      </div>
      <h2 style={{ fontSize: "clamp(17px, 4.5vw, 20px)", fontWeight: 700, color: "#E2E8F0", letterSpacing: "-0.03em", margin: "0 0 10px" }}>Awaiting signal input</h2>
      <p style={{ fontSize: 13, color: "#475569", maxWidth: 300, lineHeight: 1.75, margin: "0 0 32px" }}>
        Paste your cold email. InboxSignal detects exactly why it&apos;s not getting replies — then rewrites it.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, width: "100%", maxWidth: 380, textAlign: "left" }}>
        {[
          ["01", "Signal score + verdict",            "0–100 · Failing / Weak / Average / Strong"],
          ["02", "Failure diagnosis by severity",     "Critical → High → Medium → Low"          ],
          ["03", "Optimized rewrite + subject lines", "Before/after · 4 variants · copy-ready"  ],
          ["04", "Follow-up sequence",                "Day 3 & Day 7 · deployment-ready"        ],
        ].map(([n, main, sub]) => (
          <div key={n} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#6366F1", opacity: 0.75, flexShrink: 0, marginTop: 2, letterSpacing: "0.06em" }}>{n}</span>
            <div>
              <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.45, marginBottom: 2 }}>{main}</div>
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
  { id: "section-hero",      label: "Score"     },
  { id: "section-diagnosis", label: "Diagnosis" },
  { id: "section-rewrite",   label: "Rewrite"   },
  { id: "section-followups", label: "Sequence"  },
  { id: "section-metrics",   label: "Signals"   },
];

function StickyNav({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [active, setActive]   = useState("section-hero");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    const container = isMobile ? null : containerRef.current;

    const getScrollTop = () => container ? container.scrollTop : window.scrollY;
    const getBoundingTop = () => container ? container.getBoundingClientRect().top : 0;

    const handler = () => {
      setShowTop(getScrollTop() > 300);
      const containerTop = getBoundingTop();
      let current = NAV_SECTIONS[0].id;
      for (const { id } of NAV_SECTIONS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - containerTop <= 80) current = id;
      }
      setActive(current);
    };

    const target = container || window;
    target.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => target.removeEventListener("scroll", handler);
  }, [containerRef]);

  const scrollTo = (id: string) => {
    const isMobile = window.innerWidth < 1024;
    const el = document.getElementById(id);
    if (!el) return;
    if (isMobile) {
      const top = window.scrollY + el.getBoundingClientRect().top - 54;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    } else {
      const container = containerRef.current;
      if (!container) return;
      const containerTop = container.getBoundingClientRect().top;
      const target = container.scrollTop + (el.getBoundingClientRect().top - containerTop) - 50;
      container.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  };

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 20,
      background: "rgba(6,9,14,0.96)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      marginLeft: "calc(-1 * var(--panel-px))",
      marginRight: "calc(-1 * var(--panel-px))",
      marginBottom: 22,
      height: 44,
      display: "flex", alignItems: "center",
      overflowX: "auto", scrollbarWidth: "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, paddingLeft: 8, paddingRight: 8, flexShrink: 0 }}>
        {NAV_SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            style={{
              padding: "5px 10px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.05em",
              background: active === id ? "rgba(99,102,241,0.14)" : "transparent",
              color: active === id ? "#818CF8" : "#475569",
              transition: "all 0.15s", position: "relative",
              whiteSpace: "nowrap", minHeight: 36,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {label}
            {active === id && <span style={{ position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: "#6366F1", boxShadow: "0 0 4px rgba(99,102,241,0.8)" }} />}
          </button>
        ))}
        {showTop && (
          <button
            onClick={() => {
              if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: "smooth" });
              else containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            }}
            style={{
              padding: "5px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer", fontSize: 10, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#334155",
              background: "rgba(255,255,255,0.03)", letterSpacing: "0.05em", transition: "all 0.15s",
              minHeight: 36, whiteSpace: "nowrap", marginLeft: 4,
              WebkitTapHighlightColor: "transparent",
            }}
          >↑ top</button>
        )}
      </div>
    </div>
  );
}

// ─── Shortcut hint ────────────────────────────────────────────────────────────

function ShortcutHint() {
  return (
    <div style={{ textAlign: "center", fontSize: 9, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.07em" }}>
      CTRL / CMD + ENTER TO TRANSMIT
    </div>
  );
}

// ─── Post-analysis panel status ───────────────────────────────────────────────

function PanelStatus({ analysis, lastRunAt, onReRun, canSubmit, loading }: {
  analysis: AnalysisResult | null;
  lastRunAt: Date | null;
  onReRun: () => void;
  canSubmit: boolean;
  loading: boolean;
}) {
  if (!analysis || !lastRunAt) return null;
  const avg = Math.round((analysis.signals.clarity + analysis.signals.relevance + analysis.signals.credibility + analysis.signals.ctaStrength) / 4);
  const c = scoreColor(avg);
  const timeStr = lastRunAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div style={{ padding: "13px 15px", borderRadius: 11, background: "rgba(52,211,153,0.04)", border: "1px solid rgba(52,211,153,0.14)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", flexShrink: 0, boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
          <span style={{ fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: "#34D399", letterSpacing: "0.05em" }}>Signal complete · {timeStr}</span>
        </div>
        <span style={{ fontSize: 11, fontFamily: "'Geist Mono', 'DM Mono', monospace", color: c }}>{avg}/100</span>
      </div>
      <button
        onClick={onReRun}
        disabled={!canSubmit || loading}
        style={{
          marginTop: 10, width: "100%", padding: "10px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 8, color: "#64748B", fontSize: 11,
          fontFamily: "'Geist Mono', 'DM Mono', monospace", cursor: "pointer",
          letterSpacing: "0.05em", transition: "all 0.15s", minHeight: 42,
          WebkitTapHighlightColor: "transparent",
        }}
      >Re-transmit →</button>
    </div>
  );
}

// ─── Mobile "View Results" sticky banner ──────────────────────────────────────

function MobileResultsBanner({ onView }: { onView: () => void }) {
  return (
    <div className="mobile-results-banner">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px rgba(52,211,153,0.7)" }} />
        <span style={{ fontSize: 12, color: "#34D399", fontFamily: "'Geist Mono', 'DM Mono', monospace", letterSpacing: "0.05em" }}>Signal complete</span>
      </div>
      <button
        onClick={onView}
        style={{
          padding: "10px 22px", borderRadius: 9,
          background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
          color: "#fff", border: "none", fontSize: 13, fontWeight: 700,
          fontFamily: "'Syne', system-ui, sans-serif",
          cursor: "pointer", letterSpacing: "-0.01em",
          minHeight: 44, boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
          WebkitTapHighlightColor: "transparent",
        }}
      >View Results →</button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InboxSignalApp({
  initialLimit,
  initialRemaining,
}: InboxSignalAppProps) {
  const [email,          setEmail]          = useState("");
  const [prospect,       setProspect]       = useState("");
  const [rawResult,      setRawResult]      = useState("");
  const [analysis,       setAnalysis]       = useState<AnalysisResult | null>(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [rawOpen,        setRawOpen]        = useState(false);
  const [lastRunAt,      setLastRunAt]      = useState<Date | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [remaining,      setRemaining]      = useState(initialRemaining);
  const [limit,          setLimit]          = useState(initialLimit);

  const resultRef        = useRef<HTMLDivElement>(null);
  const mainPanelRef     = useRef<HTMLDivElement>(null);
  const resultsAnchorRef = useRef<HTMLDivElement>(null);

  const canSubmit =
    !loading &&
    remaining > 0 &&
    email.trim().length > 0 &&
    prospect.trim().length > 0;

  const runAudit = useCallback(async () => {
    if (!canSubmit) return;
    setLoading(true); setError(""); setRawResult(""); setAnalysis(null); setRawOpen(false);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prospect }),
      });

      // Safe parsing: never call res.json() directly.
      // If the server returns an HTML error page (e.g. a cold-start 500,
      // a Vercel edge error, or an auth redirect) res.json() throws
      // "Unexpected token '<'" which crashes the component.
      // Using text() + JSON.parse() lets us catch that gracefully.
      let data: AuditApiResponse;
      const rawText = await res.text();
      try {
        data = JSON.parse(rawText) as AuditApiResponse;
      } catch {
        // The server returned non-JSON (HTML error page or similar)
        throw new Error("Server error, try again");
      }

      // Update usage counters from every response (success or error)
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      if (typeof data.limit    === "number") setLimit(data.limit);

      if (!res.ok || data.error) {
        // Map API error strings to user-friendly messages
        const apiError = data.error ?? "";
        if (res.status === 401 || apiError.toLowerCase().includes("login") || apiError.toLowerCase().includes("unauthorized")) {
          throw new Error("Login required");
        }
        if (res.status === 429 || apiError.toLowerCase().includes("limit")) {
          throw new Error("Daily limit reached");
        }
        throw new Error("Server error, try again");
      }

      if (!data.success || !data.data) {
        throw new Error("Server error, try again");
      }

      setRawResult(JSON.stringify(data.data, null, 2));
      setSubmittedEmail(email);
      setAnalysis(data.data);
      setLastRunAt(new Date());
      setTimeout(() => {
        if (window.innerWidth >= 1024 && mainPanelRef.current) {
          mainPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Server error, try again";
      setError(msg);
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

  const scrollToResults = () => {
    resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sortedDiagnosis = analysis
    ? [...analysis.diagnosis].sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact])
    : [];
  const limitReached = remaining <= 0;
  const usedToday = Math.max(0, limit - remaining);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        html, body { overflow-x: hidden; max-width: 100vw; }

        body {
          background: #06090E !important;
          font-family: 'Syne', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          margin: 0;
        }

        ::selection { background: rgba(99,102,241,0.30); color: #E0E7FF; }

        textarea {
          resize: vertical;
          /* Prevents iOS auto-zoom on focus — font-size must be >= 16px */
          font-size: 16px !important;
        }
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
        .run-btn:hover:not(:disabled) { filter: brightness(1.14); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,102,241,0.30); }
        .run-btn:active:not(:disabled) { transform: scale(0.98) translateY(0); }
        .run-btn:disabled { cursor: not-allowed; opacity: 0.35; }

        .diag-card:hover { filter: brightness(1.05); }

        details > summary { list-style: none; cursor: pointer; user-select: none; }
        details > summary::-webkit-details-marker { display: none; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }

        /* Noise texture */
        .noise-bg::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 999; opacity: 0.4;
        }

        /* ── CSS TOKENS ──────────────────────────────────────────────────── */
        :root {
          --header-h: 48px;
          --panel-px: 16px;
          --panel-py: 20px;
          --card-p: 14px;
          --gap: 12px;
        }
        @media (min-width: 480px) {
          :root { --panel-px: 20px; }
        }
        @media (min-width: 640px) {
          :root {
            --header-h: 52px;
            --panel-px: 28px;
            --panel-py: 26px;
            --card-p: 18px;
            --gap: 14px;
          }
        }
        @media (min-width: 960px) {
          :root {
            --header-h: 54px;
            --panel-px: 40px;
            --panel-py: 32px;
            --card-p: 20px;
            --gap: 16px;
          }
        }

        /* ── LAYOUT ──────────────────────────────────────────────────────── */

        .app-grid {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - var(--header-h));
        }
        @media (min-width: 960px) {
          .app-grid {
            display: grid;
            grid-template-columns: minmax(320px, 360px) minmax(0, 1fr);
            align-items: start;
          }
        }

        .input-panel {
          padding: var(--panel-py) var(--panel-px);
          display: flex;
          flex-direction: column;
          gap: var(--gap);
          background: rgba(6,9,14,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          width: 100%;
          order: 1;
        }
        @media (min-width: 960px) {
          .input-panel {
            border-bottom: none;
            border-right: 1px solid rgba(255,255,255,0.06);
            position: sticky;
            top: var(--header-h);
            height: calc(100vh - var(--header-h));
            overflow-y: auto;
            width: auto;
            order: 0;
          }
        }

        .results-panel {
          padding: var(--panel-py) var(--panel-px);
          width: 100%;
          overflow-x: hidden;
          min-width: 0;
          order: 2;
        }
        @media (min-width: 960px) {
          .results-panel {
            display: flex;
            justify-content: center;
            overflow-y: auto;
            height: calc(100vh - var(--header-h));
            position: relative;
            width: auto;
            order: 0;
          }
        }

        .results-inner {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
        }
        @media (min-width: 960px) {
          .results-inner {
            max-width: 1040px;
            min-width: 0;
            width: min(100%, 1040px);
          }
        }

        /* ── SPARK BARS ──────────────────────────────────────────────────── */
        .spark-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        @media (min-width: 640px) {
          .spark-grid { grid-template-columns: 1fr; gap: 8px; }
        }

        /* ── BREAKDOWN ROW ───────────────────────────────────────────────── */
        .breakdown-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        @media (min-width: 640px) {
          .breakdown-row {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 16px;
            align-items: start;
          }
        }

        /* ── MOBILE RESULTS BANNER ───────────────────────────────────────── */
        .mobile-results-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(6,9,14,0.97);
          border-top: 1px solid rgba(52,211,153,0.18);
          position: sticky;
          bottom: 0;
          z-index: 50;
          backdrop-filter: blur(12px);
        }
        @media (min-width: 960px) {
          .mobile-results-banner { display: none; }
        }

        /* ── MOBILE BOTTOM SPACER ────────────────────────────────────────── */
        .mobile-bottom-spacer { height: 80px; }
        @media (min-width: 960px) {
          .mobile-bottom-spacer { display: none; }
        }

        @media (max-width: 959px) {
          .results-anchor {
            width: 100%;
            height: 1px;
          }
        }

        .header-tagline { display: none; }
        @media (min-width: 480px) {
          .header-tagline { display: block; }
        }

        @media (max-width: 359px) {
          .subject-primary-badge { display: none !important; }
        }

        .results-anchor {
          scroll-margin-top: calc(var(--header-h) + 8px);
          display: none;
        }
        @media (max-width: 959px) {
          .results-anchor {
            display: block;
            width: 100%;
            height: 1px;
            order: 2;
          }
          .results-panel {
            order: 3;
          }
        }
      `}</style>

      <div className="noise-bg" style={{ minHeight: "100vh", background: "#06090E", color: "#F1F5F9", fontFamily: "'Syne', system-ui, sans-serif", overflowX: "hidden" }}>

        {/* Ambient glows */}
        <div style={{ position: "fixed", top: -200, left: "40%", width: 600, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: -100, right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* ── Header ── */}
        <header style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 var(--panel-px)",
          height: "var(--header-h)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(6,9,14,0.94)", backdropFilter: "blur(16px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SignalOrb size={26} />
            <span style={{ fontWeight: 800, fontSize: "clamp(13px, 3.5vw, 15px)", color: "#E2E8F0", letterSpacing: "-0.02em", fontFamily: "'Syne', system-ui, sans-serif" }}>
              Inbox<span style={{ color: "#818CF8" }}>Signal</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Usage counter + Clerk UserButton */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: limitReached ? "#FCA5A5" : "#C7D2FE", letterSpacing: "0.05em" }}>
                {remaining}/{limit} left today
              </span>
              {/* UserButton renders nothing on server, mounts on client — safe with suppressHydrationWarning on body */}
              <UserButton />
            </div>
            <div className="header-tagline" style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.07em" }}>
              cold email intelligence
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px rgba(16,185,129,0.7)" }} />
              <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.06em" }}>LIVE</span>
            </div>
          </div>
        </header>

        {/* ── App grid ── */}
        <div className="app-grid" style={{ position: "relative", zIndex: 1 }}>

          {/* ── Input panel ── */}
          <aside className="input-panel" id="input-panel">

            <div>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "#6366F1", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 5 }}>Input</div>
              <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>Paste your email and describe the prospect.</div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <label htmlFor="email-input" style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase" }}>Cold Email</label>
                {email.length > 0 && (
                  <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em", color: email.length > 1400 ? "#F87171" : email.length > 900 ? "#FBBF24" : "#334155" }}>{email.length} chars</span>
                )}
              </div>
              <textarea
                id="email-input"
                placeholder="Paste your outbound email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={10}
                style={{
                  width: "100%", maxWidth: "100%",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, color: "#CBD5E1",
                  padding: "12px 14px",
                  lineHeight: 1.75,
                  fontFamily: "'DM Mono', monospace",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  display: "block",
                }}
              />
            </div>

            <div>
              <label htmlFor="prospect-input" style={{ display: "block", fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Prospect Context
              </label>
              <textarea
                id="prospect-input"
                placeholder="Role, company, pain point, recent trigger..."
                value={prospect}
                onChange={(e) => setProspect(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={4}
                style={{
                  width: "100%", maxWidth: "100%",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, color: "#CBD5E1",
                  padding: "12px 14px",
                  lineHeight: 1.75,
                  fontFamily: "'DM Mono', monospace",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  display: "block",
                }}
              />
            </div>

            {/* Usage status block */}
            <div style={{
              padding: "12px 14px", borderRadius: 10,
              background: limitReached ? "rgba(239,68,68,0.08)" : "rgba(99,102,241,0.08)",
              border: limitReached ? "1px solid rgba(239,68,68,0.16)" : "1px solid rgba(99,102,241,0.16)",
            }}>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: limitReached ? "#FCA5A5" : "#C7D2FE", letterSpacing: "0.06em" }}>
                You have {remaining}/{limit} analyses left today
              </div>
              {limitReached ? (
                <div style={{ marginTop: 6, fontSize: 12, color: "#FCA5A5", lineHeight: 1.6 }}>
                  You&apos;ve reached your daily limit. Come back tomorrow.
                </div>
              ) : (
                <div style={{ marginTop: 6, fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>
                  Used today: {usedToday}/{limit}
                </div>
              )}
            </div>

            <button
              id="run-audit-btn"
              className="run-btn"
              onClick={runAudit}
              disabled={!canSubmit}
              style={{
                width: "100%", padding: "15px",
                minHeight: 52,
                background: limitReached
                  ? "rgba(71,85,105,0.35)"
                  : "linear-gradient(135deg, #6366F1 0%, #4F46E5 60%, #4338CA 100%)",
                color: "#fff", border: "none", borderRadius: 11,
                fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.72,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "'Syne', system-ui, sans-serif",
                boxShadow: "0 4px 16px rgba(99,102,241,0.20)",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {loading ? (
                <><span className="spinner" />Scanning signals...</>
              ) : limitReached ? (
                "Daily limit reached"
              ) : (
                "Diagnose Email →"
              )}
            </button>

            <ShortcutHint />

            <PanelStatus analysis={analysis} lastRunAt={lastRunAt} onReRun={runAudit} canSubmit={canSubmit} loading={loading} />

            {!analysis && !loading && (
              <div style={{ padding: "14px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10 }}>
                <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#1E293B", letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 10 }}>What gets detected</div>
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

          {/* Mobile scroll anchor */}
          <div ref={resultsAnchorRef} className="results-anchor" />

          {/* ── Results panel ── */}
          <main className="results-panel" ref={mainPanelRef}>
            {!loading && !analysis && !error && <EmptyState />}
            {loading && <LoadingSkeleton />}

            {analysis && (
              <div ref={resultRef} className="results-inner">

                <StickyNav containerRef={mainPanelRef} />

                <div id="section-hero" className="report-section" style={{ animationDelay: "0ms" }}>
                  <HeroScore signals={analysis.signals} />
                </div>

                <section id="section-diagnosis" className="report-section" style={{ animationDelay: "50ms" }}>
                  <SectionHeading n="01" title="Failure Diagnosis" count={sortedDiagnosis.length} id="heading-diagnosis" />
                  <TopPriorityCallout items={sortedDiagnosis} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {sortedDiagnosis.map((item, i) => <DiagnosisCard key={`${item.issue}-${i}`} item={item} index={i} />)}
                  </div>
                </section>

                <GradientDivider />

                <section id="section-rewrite" className="report-section" style={{ animationDelay: "90ms" }}>
                  <SectionHeading n="02" title="Optimized Version" id="heading-rewrite" />
                  <RewriteSection originalEmail={submittedEmail} rewrite={analysis.rewrite} />
                </section>

                <GradientDivider />

                <section id="section-followups" className="report-section" style={{ animationDelay: "130ms" }}>
                  <SectionHeading n="03" title="Follow-Up Sequence" id="heading-followups" />
                  <FollowUpSequence day3={analysis.followUps.day3} day7={analysis.followUps.day7} />
                </section>

                <GradientDivider />

                <section id="section-metrics" className="report-section" style={{ animationDelay: "170ms" }}>
                  <SectionHeading n="04" title="Signal Detail" id="heading-metrics" />
                  <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(99,102,241,0.03) 100%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "var(--card-p)", display: "flex", flexDirection: "column", gap: 22, marginBottom: 14 }}>
                    <MetricBar id="metric-clarity"     label="Clarity"      score={analysis.signals.clarity}     />
                    <MetricBar id="metric-relevance"   label="Relevance"    score={analysis.signals.relevance}   />
                    <MetricBar id="metric-credibility" label="Credibility"  score={analysis.signals.credibility} />
                    <MetricBar id="metric-cta"         label="CTA Strength" score={analysis.signals.ctaStrength} />
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "var(--card-p)" }}>
                    <MonoLabel color="#1E293B" size={9}>Email section breakdown</MonoLabel>
                    <div style={{ marginTop: 4 }}>
                      <BreakdownRow label="Hook"            body={analysis.emailBreakdown.hook} />
                      <BreakdownRow label="Value Prop"      body={analysis.emailBreakdown.valueProp} />
                      <BreakdownRow label="Personalization" body={analysis.emailBreakdown.personalization} />
                      <BreakdownRow label="CTA"             body={analysis.emailBreakdown.cta} />
                    </div>
                  </div>
                </section>

                <GradientDivider />

                <section id="section-raw">
                  <details onToggle={(e) => setRawOpen((e.currentTarget as HTMLDetailsElement).open)}>
                    <summary style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: rawOpen ? "12px 12px 0 0" : 12, minHeight: 44 }}>
                      <span style={{ fontSize: 9, color: "#334155", display: "inline-block", transform: rawOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.20s" }}>▼</span>
                      <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", color: "#334155", letterSpacing: "0.09em", textTransform: "uppercase", flex: 1 }}>Raw payload — debug</span>
                      {rawOpen && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <CopyBtn text={rawResult} id="copy-raw-json" label="copy json" />
                          <button
                            onClick={(e) => { e.preventDefault(); downloadReport(); }}
                            style={{ padding: "5px 10px", fontSize: 9, fontFamily: "'DM Mono', monospace", background: "rgba(255,255,255,0.04)", color: "#475569", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, cursor: "pointer", letterSpacing: "0.07em", textTransform: "uppercase", minHeight: 36 }}
                          >export</button>
                        </div>
                      )}
                    </summary>
                    <pre style={{
                      margin: 0, maxHeight: 340, overflowY: "auto", overflowX: "hidden",
                      padding: "16px", background: "rgba(0,0,0,0.32)",
                      border: "1px solid rgba(255,255,255,0.06)", borderTop: "none",
                      borderRadius: "0 0 12px 12px",
                      whiteSpace: "pre-wrap", wordBreak: "break-all",
                      fontSize: 11, lineHeight: 1.75, color: "#334155",
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {rawResult}
                    </pre>
                  </details>
                </section>

                <div className="mobile-bottom-spacer" />
              </div>
            )}
          </main>
        </div>

        {/* Mobile sticky results banner */}
        {analysis && !loading && <MobileResultsBanner onView={scrollToResults} />}
      </div>
    </>
  );
}
