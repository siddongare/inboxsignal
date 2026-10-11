"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import type {
  AnalysisResult,
  SavedAnalysis,
  DiagnosisItem,
  Signals,
} from "@/lib/analysis-types";
import { getSignalScore } from "@/lib/analysis-types";
import { sfx } from "./tactile-audio";

// ─── Luma-Style Score Helpers ─────────────────────────────────────────────────
function getScoreColor(s: number) {
  if (s < 45) return { stroke: "#FF2A55", glow: "rgba(255, 42, 85, 0.22)", text: "text-[#FF2A55]", bg: "bg-[#FF2A55]/10", border: "border-[#FF2A55]/30" };
  if (s < 68) return { stroke: "#F59E0B", glow: "rgba(245, 158, 11, 0.22)", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
  return { stroke: "#D4FF00", glow: "rgba(212, 255, 0, 0.28)", text: "text-[#D4FF00]", bg: "bg-[#D4FF00]/10", border: "border-[#D4FF00]/30" };
}

function getVerdictText(s: number) {
  if (s < 45) return "Fatal Executive Friction";
  if (s < 68) return "Suboptimal Signal-to-Noise";
  if (s < 80) return "Compelling Outreach Angle";
  return "Pristine Executive Signal";
}

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        sfx.click();
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition border cursor-pointer select-none ${
        ok
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : "bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
      <span>{ok ? "Copied" : label}</span>
    </button>
  );
}

function SectionHeading({
  n,
  title,
  count,
}: {
  n: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
          {n}
        </span>
        <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-mono text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/[0.06]">
          {count} findings
        </span>
      )}
    </div>
  );
}

// ─── Luma-Style Radial Score Orb & Metric Breakdown ───────────────────────────
function ScoreSection({ signals }: { signals: Signals }) {
  const avg = getSignalScore(signals);
  const cfg = getScoreColor(avg);
  const metrics = [
    { label: "Clarity", value: signals.clarity },
    { label: "Relevance", value: signals.relevance },
    { label: "Credibility", value: signals.credibility },
    { label: "CTA Friction", value: signals.ctaStrength },
  ];

  return (
    <div className="relative p-6 rounded-3xl bg-[#111319]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Soft Ambient Radial Glow behind score */}
      <div
        style={{ background: cfg.glow }}
        className="absolute top-1/2 left-10 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
        {/* Luma Radial Orb Meter */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0">
            <svg width={96} height={96} className="-rotate-90">
              {/* Outer Track Ring */}
              <circle
                cx={48}
                cy={48}
                r={42}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={6}
              />
              {/* Active Radial Progress Arc */}
              <motion.circle
                cx={48}
                cy={48}
                r={42}
                fill="none"
                stroke={cfg.stroke}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 * (1 - avg / 100) }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-3xl font-bold tracking-tight text-white leading-none">
                {avg}
              </span>
              <span className="font-mono text-[10px] text-slate-400 mt-1">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-bold text-white tracking-tight">
                {getVerdictText(avg)}
              </span>
              <span
                className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
              >
                {avg >= 70 ? "Ready to Send" : avg >= 50 ? "Needs Fix" : "Critical Risk"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-sm">
              Calibrated across four behavioral conversion dimensions to forecast
              executive reply propensity.
            </p>
          </div>
        </div>

        {/* Quick Diagnostic Pill */}
        <div className="flex items-center gap-2 self-start md:self-center bg-white/[0.03] border border-white/[0.06] px-3.5 py-2 rounded-xl">
          <span
            style={{ backgroundColor: cfg.stroke }}
            className="w-2 h-2 rounded-full animate-pulse"
          />
          <span className="text-xs text-slate-300 font-medium">
            {avg >= 70
              ? "All core vectors verified"
              : "Review recommended rewrite before dispatch"}
          </span>
        </div>
      </div>

      {/* 4 Sleek Horizontal Capsule Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
        {metrics.map(({ label, value }) => {
          const mcfg = getScoreColor(value);
          return (
            <div
              key={label}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-400">
                  {label}
                </span>
                <span className={`font-mono text-xs font-bold ${mcfg.text}`}>
                  {value}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{ backgroundColor: mcfg.stroke }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Top Priority Callout ─────────────────────────────────────────────────────
function TopPriorityCallout({ items }: { items: DiagnosisItem[] }) {
  const top = items[0];
  if (!top) return null;

  return (
    <div className="relative p-5 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 shadow-md">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Primary Bottleneck
          </span>
        </div>
        <span className="font-mono text-[10px] font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 uppercase">
          {top.impact}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-white mb-1.5">{top.issue}</h3>
      <p className="text-xs text-slate-300 leading-relaxed mb-3">
        {top.whyItMatters}
      </p>

      <div className="p-3 rounded-xl bg-black/40 border border-rose-500/20 text-xs text-rose-200">
        <span className="font-semibold text-rose-300 block mb-0.5 text-[11px]">
          Recommended Fix:
        </span>
        <span className="text-slate-200">{top.fix}</span>
      </div>
    </div>
  );
}

// ─── Diagnosis Card ───────────────────────────────────────────────────────────
function DiagnosisCard({
  item,
  index,
}: {
  item: DiagnosisItem;
  index: number;
}) {
  const badges: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/25" },
    high: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/25" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25" },
    low: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25" },
  };
  const b = badges[item.impact] ?? badges.medium;

  return (
    <div className="p-4 rounded-2xl bg-[#111319]/90 border border-white/[0.08] hover:border-white/[0.14] transition-all shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-slate-400 bg-white/[0.04] w-6 h-6 rounded-lg flex items-center justify-center border border-white/[0.06]">
            {index + 1}
          </span>
          <h4 className="text-sm font-semibold text-slate-100">{item.issue}</h4>
        </div>

        <span
          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase ${b.bg} ${b.text} ${b.border}`}
        >
          {item.impact}
        </span>
      </div>

      <div className="mb-3">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
          Failure Mechanism
        </span>
        <p className="text-xs text-slate-300 leading-relaxed">{item.whyItMatters}</p>
      </div>

      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-200">
        <span className="text-[11px] font-semibold text-blue-400 block mb-0.5">
          Correction
        </span>
        <p className="text-slate-300">{item.fix}</p>
      </div>
    </div>
  );
}

// ─── Conversion Rewrite Panel ────────────────────────────────────────────────
function RewritePanel({
  originalEmail,
  rewrite,
  onIterateV2,
}: {
  originalEmail: string;
  rewrite: AnalysisResult["rewrite"];
  onIterateV2?: () => void;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Email Body Card */}
      <div className="p-5 rounded-3xl bg-[#111319]/90 border border-white/[0.08] shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06] flex-wrap">
          {/* Toggle pill */}
          <div className="inline-flex p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] gap-1">
            <button
              onClick={() => {
                sfx.click();
                setShowOriginal(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                !showOriginal
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Optimized Rewrite
            </button>
            <button
              onClick={() => {
                sfx.click();
                setShowOriginal(true);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                showOriginal
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Original Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!showOriginal && onIterateV2 && (
              <button
                onClick={() => {
                  sfx.click();
                  onIterateV2();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#D4FF00] text-black hover:bg-[#e2ff33] shadow-[0_0_15px_rgba(212,255,0,0.3)] transition active:scale-95 cursor-pointer"
                title="Transfer this rewrite into the composer to iterate as Version 2"
              >
                <RotateCcw size={12} className="text-black" />
                <span>Iterate V2</span>
              </button>
            )}
            {!showOriginal && <CopyBtn text={rewrite.email} label="Copy Email" />}
          </div>
        </div>

        {/* Email content */}
        <div
          className={`p-4 rounded-2xl bg-[#040507] border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans transition-all ${
            showOriginal
              ? "border-[#FF2A55]/30 text-slate-400"
              : "border-[#D4FF00]/30 text-slate-100"
          }`}
        >
          {showOriginal ? originalEmail : rewrite.email}
        </div>
      </div>

      {/* Subject Line Variations */}
      {rewrite.subjectLines && rewrite.subjectLines.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#0A0C10]/95 border border-white/[0.08] shadow-sm backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Subject Line Hooks
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              4 distinct A/B variations
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {rewrite.subjectLines.map((line, i) => {
              const letter = ["A", "B", "C", "D"][i] ?? String(i + 1);
              const isFirst = i === 0;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition ${
                    isFirst
                      ? "bg-[#D4FF00]/[0.06] border-[#D4FF00]/30"
                      : "bg-white/[0.02] border-white/[0.06]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isFirst
                          ? "bg-[#D4FF00] text-black shadow-[0_0_10px_rgba(212,255,0,0.3)]"
                          : "bg-white/[0.06] text-slate-400"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-200 truncate font-medium">
                      {line}
                    </span>
                    {isFirst && (
                      <span className="hidden sm:inline-block font-mono text-[10px] text-[#D4FF00] bg-[#D4FF00]/10 px-2 py-0.5 rounded-full border border-[#D4FF00]/20 shrink-0 uppercase tracking-wider">
                        Top Pick
                      </span>
                    )}
                  </div>
                  <CopyBtn text={line} label={letter} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rationale Note */}
      {rewrite.whyThisWorks && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
          <span className="text-xs font-semibold text-[#D4FF00] uppercase tracking-wider font-mono block mb-1">
            Conversion Strategy Rationale
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {rewrite.whyThisWorks}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Multi-Touch Cadence Sequence ────────────────────────────────────────────
function FollowUpSequence({
  day3,
  day7,
}: {
  day3: string;
  day7: string;
}) {
  const steps = [
    {
      timing: "Day 3 Cadence",
      tag: "Soft Context Bump",
      content: day3,
    },
    {
      timing: "Day 7 Cadence",
      tag: "Value Pivot & Polite Breakup",
      content: day7,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {steps.map((step) => (
        <div
          key={step.timing}
          className="p-5 rounded-3xl bg-[#111319]/90 border border-white/[0.08] flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {step.timing}
                </span>
                <span className="text-xs font-semibold text-slate-300">
                  {step.tag}
                </span>
              </div>
              <CopyBtn text={step.content} label="Copy" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap p-3.5 bg-[#090A0F] border border-white/[0.06] rounded-xl">
              {step.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Primary Result Panel Export ─────────────────────────────────────────────
interface ResultPanelProps {
  analysis: AnalysisResult | null;
  selected: SavedAnalysis | null;
  originalEmail: string;
  onIterateV2?: () => void;
}

export function ResultPanel({
  analysis,
  selected,
  originalEmail,
  onIterateV2,
}: ResultPanelProps) {
  if (!analysis) {
    return (
      <div className="py-24 px-4 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 shadow-inner">
          <TrendingUp size={24} />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight mb-2">
          Ready for Diagnostic Analysis
        </h2>
        <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
          Paste your cold outreach copy and prospect profile on the left.
          InboxSignal runs full diagnostic scoring, detects rejection drivers,
          and generates conversion-ready rewrites.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* 1. Luma Radial Score Section */}
      <ScoreSection signals={analysis.signals} />

      {/* 2. Failure Diagnosis */}
      <div>
        <SectionHeading
          n="02"
          title="Failure Diagnosis"
          count={analysis.diagnosis.length}
        />
        <div className="flex flex-col gap-3">
          <TopPriorityCallout items={analysis.diagnosis} />
          {analysis.diagnosis.map((item, idx) => (
            <DiagnosisCard key={idx} item={item} index={idx} />
          ))}
        </div>
      </div>

      {/* 3. Conversion Rewrite */}
      <div>
        <SectionHeading n="03" title="Conversion Rewrite & A/B Hooks" />
        <RewritePanel
          originalEmail={originalEmail}
          rewrite={analysis.rewrite}
          onIterateV2={onIterateV2}
        />
      </div>

      {/* 4. Cadence Sequence */}
      <div>
        <SectionHeading n="04" title="Multi-Touch Follow-Up Cadence" />
        <FollowUpSequence
          day3={analysis.followUps.day3}
          day7={analysis.followUps.day7}
        />
      </div>
    </motion.div>
  );
}
