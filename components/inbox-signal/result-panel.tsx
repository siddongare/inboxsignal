"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import type {
  AnalysisResult,
  SavedAnalysis,
  DiagnosisItem,
  Signals,
} from "@/lib/analysis-types";
import { getSignalScore } from "@/lib/analysis-types";

// ─── Design Tokens & Helpers ──────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s < 45) return "#EF4444"; // Red
  if (s < 68) return "#F59E0B"; // Amber
  return "#10B981"; // Emerald
}

function scoreBg(s: number) {
  if (s < 45) return "rgba(239, 68, 68, 0.10)";
  if (s < 68) return "rgba(245, 158, 11, 0.10)";
  return "rgba(16, 185, 129, 0.10)";
}

function scoreBorder(s: number) {
  if (s < 45) return "rgba(239, 68, 68, 0.25)";
  if (s < 68) return "rgba(245, 158, 11, 0.25)";
  return "rgba(16, 185, 129, 0.25)";
}

function scoreLabel(s: number) {
  if (s < 45) return "Low reply odds";
  if (s < 68) return "Needs work";
  if (s < 80) return "Recoverable";
  return "High signal";
}

function verdictLabel(s: number) {
  if (s < 45) return "Failing";
  if (s < 68) return "Suboptimal";
  if (s < 80) return "Average";
  return "Exceptional";
}

const IMPACT = {
  critical: {
    dot: "#EF4444",
    text: "#F87171",
    bg: "rgba(239,68,68,0.10)",
    border: "rgba(239,68,68,0.25)",
    label: "CRITICAL",
  },
  high: {
    dot: "#F97316",
    text: "#FB923C",
    bg: "rgba(249,115,22,0.10)",
    border: "rgba(249,115,22,0.25)",
    label: "HIGH",
  },
  medium: {
    dot: "#F59E0B",
    text: "#FBBF24",
    bg: "rgba(245,158,11,0.10)",
    border: "rgba(245,158,11,0.22)",
    label: "MEDIUM",
  },
  low: {
    dot: "#10B981",
    text: "#34D399",
    bg: "rgba(16,185,129,0.10)",
    border: "rgba(16,185,129,0.22)",
    label: "LOW",
  },
};

// ─── Shared UI Helpers ───────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition border ${
        ok
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : "bg-[#18181B] text-zinc-300 border-[#27272A] hover:bg-zinc-800 hover:text-white"
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
    <div className="flex items-center gap-2.5 mb-3">
      <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
        {n}
      </span>
      <h2 className="text-sm font-semibold text-zinc-100 tracking-tight">
        {title}
      </h2>
      {count !== undefined && (
        <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700/50">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Score Radial Ring & Metrics Panel ───────────────────────────────────────
function ScoreSection({ signals }: { signals: Signals }) {
  const avg = getSignalScore(signals);
  const c = scoreColor(avg);
  const metrics = [
    { label: "Clarity", value: signals.clarity },
    { label: "Relevance", value: signals.relevance },
    { label: "Credibility", value: signals.credibility },
    { label: "CTA Strength", value: signals.ctaStrength },
  ];

  return (
    <div className="p-5 rounded-xl bg-[#111113] border border-[#27272A] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-[#27272A]">
        {/* Score Ring & Summary */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg width={80} height={80} className="-rotate-90">
              <circle
                cx={40}
                cy={40}
                r={36}
                fill="none"
                stroke="#27272A"
                strokeWidth={5}
              />
              <motion.circle
                cx={40}
                cy={40}
                r={36}
                fill="none"
                stroke={c}
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray={226}
                initial={{ strokeDashoffset: 226 }}
                animate={{ strokeDashoffset: 226 * (1 - avg / 100) }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-2xl font-bold tracking-tight text-white leading-none">
                {avg}
              </span>
              <span className="font-mono text-[9px] text-zinc-500 uppercase mt-0.5">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">
                {verdictLabel(avg)}
              </span>
              <span
                style={{
                  color: c,
                  background: scoreBg(avg),
                  borderColor: scoreBorder(avg),
                }}
                className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full border"
              >
                {scoreLabel(avg)}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Composite signal across 4 B2B outbound dimensions.
            </p>
          </div>
        </div>

        {/* Quick health tag */}
        <div className="flex items-center gap-2 sm:self-center">
          <div
            style={{ background: c }}
            className="w-2.5 h-2.5 rounded-full animate-pulse"
          />
          <span className="text-xs font-medium text-zinc-300">
            {avg >= 70
              ? "Ready for outreach"
              : avg >= 50
                ? "Fix primary threat before sending"
                : "High spam / rejection risk"}
          </span>
        </div>
      </div>

      {/* Metric Breakdown Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {metrics.map(({ label, value }) => {
          const sc = scoreColor(value);
          return (
            <div
              key={label}
              className="bg-[#18181B] border border-[#27272A] p-3 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-zinc-400">
                  {label}
                </span>
                <span
                  style={{ color: sc }}
                  className="font-mono text-xs font-bold"
                >
                  {value}
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{ background: sc }}
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
  const cfg = IMPACT[top.impact];

  return (
    <div
      style={{
        background: cfg.bg,
        borderColor: cfg.border,
      }}
      className="p-4 rounded-xl border flex items-start gap-3.5 shadow-sm"
    >
      <div
        style={{ background: cfg.dot }}
        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            style={{ color: cfg.text }}
            className="text-xs font-semibold uppercase tracking-wider"
          >
            Primary Threat
          </span>
          <span
            style={{
              color: cfg.text,
              borderColor: cfg.border,
              background: cfg.bg,
            }}
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
          >
            {cfg.label}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">{top.issue}</h3>
        <p className="text-xs text-zinc-300 leading-relaxed mb-2.5">
          {top.whyItMatters}
        </p>
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
          <Sparkles size={12} className="shrink-0 text-blue-400" />
          <span>Recommended Fix: {top.fix}</span>
        </div>
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
  const cfg = IMPACT[item.impact];

  return (
    <div className="bg-[#111113] border border-[#27272A] rounded-xl p-4 shadow-sm transition hover:border-[#3F3F46]">
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs font-bold text-zinc-400 bg-[#18181B] w-6 h-6 rounded flex items-center justify-center border border-[#27272A]">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="text-sm font-semibold text-zinc-100">{item.issue}</h4>
        </div>
        <span
          style={{
            color: cfg.text,
            background: cfg.bg,
            borderColor: cfg.border,
          }}
          className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 flex items-center gap-1.5"
        >
          <span
            style={{ background: cfg.dot }}
            className="w-1.5 h-1.5 rounded-full"
          />
          {cfg.label}
        </span>
      </div>

      <div className="mb-3">
        <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">
          Failure Mechanism
        </span>
        <p className="text-xs text-zinc-300 leading-relaxed mt-0.5">
          {item.whyItMatters}
        </p>
      </div>

      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15 border-l-2 border-l-blue-500">
        <span className="text-[10px] font-mono font-semibold text-blue-400 uppercase tracking-wider block mb-0.5">
          Actionable Correction
        </span>
        <p className="text-xs text-blue-200 leading-relaxed">{item.fix}</p>
      </div>
    </div>
  );
}

// ─── Rewrite Section ──────────────────────────────────────────────────────────
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
      {/* Rewrite card */}
      <div className="bg-[#111113] border border-[#27272A] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="inline-flex bg-[#18181B] border border-[#27272A] rounded-lg p-1 gap-1">
            <button
              onClick={() => setShowOriginal(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                !showOriginal
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              Optimized Rewrite
            </button>
            <button
              onClick={() => setShowOriginal(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                showOriginal
                  ? "bg-red-500/15 text-red-400 border border-red-500/25"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              Original Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!showOriginal && onIterateV2 && (
              <button
                onClick={onIterateV2}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-500 transition shadow-sm active:scale-95"
                title="Load this optimized copy into the editor to test or refine as Version 2"
              >
                <RotateCcw size={12} />
                <span>Iterate V2</span>
              </button>
            )}
            {!showOriginal && (
              <CopyBtn text={rewrite.email} label="Copy Email" />
            )}
          </div>
        </div>

        {/* Email content */}
        <div
          className={`p-4 rounded-lg bg-[#09090B] border border-[#27272A] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans transition border-l-2 ${
            showOriginal
              ? "border-l-red-500 text-zinc-400"
              : "border-l-emerald-500 text-zinc-100"
          }`}
        >
          {showOriginal ? originalEmail : rewrite.email}
        </div>
      </div>

      {/* Subject Line Variants */}
      {rewrite.subjectLines && rewrite.subjectLines.length > 0 && (
        <div className="bg-[#111113] border border-[#27272A] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-zinc-300 uppercase tracking-wide">
              Subject Line Variations
            </h3>
            <span className="text-[11px] text-zinc-500">
              4 distinct hooks for A/B testing
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {rewrite.subjectLines.map((line, i) => {
              const letter = ["A", "B", "C", "D"][i] ?? String(i + 1);
              const isFirst = i === 0;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition ${
                    isFirst
                      ? "bg-blue-500/5 border-blue-500/25"
                      : "bg-[#18181B] border-[#27272A]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`font-mono text-xs font-bold w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                        isFirst
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-200 truncate">
                      {line}
                    </span>
                    {isFirst && (
                      <span className="hidden sm:inline-block font-mono text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0">
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

      {/* Signal Rationale */}
      {rewrite.whyThisWorks && (
        <div className="bg-[#111113] border border-[#27272A] rounded-xl p-5 shadow-sm border-l-2 border-l-blue-500">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider block mb-1">
            Why This Rewrite Converts
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {rewrite.whyThisWorks}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Follow-Up Timeline ───────────────────────────────────────────────────────
function FollowUpSequence({
  day3,
  day7,
}: {
  day3: string;
  day7: string;
}) {
  const steps = [
    {
      day: "Day 3",
      tag: "Soft Context Bump",
      content: day3,
      badge: "Touch 2",
    },
    {
      day: "Day 7",
      tag: "Angle Pivot & Frictionless Breakup",
      content: day7,
      badge: "Touch 3",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {steps.map((step) => (
        <div
          key={step.day}
          className="bg-[#111113] border border-[#27272A] rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  {step.day}
                </span>
                <span className="text-xs font-semibold text-zinc-300">
                  {step.tag}
                </span>
              </div>
              <CopyBtn text={step.content} label="Copy" />
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
              {step.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Breakdown Section ────────────────────────────────────────────────────────
function BreakdownSection({
  breakdown,
}: {
  breakdown: AnalysisResult["emailBreakdown"];
}) {
  const items = [
    { label: "Hook & Opening Context", val: breakdown.hook },
    { label: "Value Proposition Mapping", val: breakdown.valueProp },
    { label: "Personalization Depth", val: breakdown.personalization },
    { label: "Call-To-Action Friction", val: breakdown.cta },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {items.map(({ label, val }) => (
        <div
          key={label}
          className="bg-[#111113] border border-[#27272A] p-3.5 rounded-xl"
        >
          <span className="text-xs font-semibold text-zinc-400 block mb-1">
            {label}
          </span>
          <p className="text-xs text-zinc-200 leading-relaxed">{val}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Primary Result Panel ────────────────────────────────────────────────────
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
      <div className="py-20 px-4 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-5 shadow-inner">
          <TrendingUp size={24} />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight mb-2">
          Ready for Email Diagnosis
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm leading-relaxed mb-6">
          Paste your cold outreach copy and prospect profile on the left.
          InboxSignal runs full diagnostic scoring, detects rejection drivers,
          and generates conversion-ready rewrites.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* 1. Score Summary */}
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

      {/* 3. Optimized Rewrite */}
      <div>
        <SectionHeading n="03" title="Conversion Rewrite & Subject Lines" />
        <RewritePanel
          originalEmail={originalEmail}
          rewrite={analysis.rewrite}
          onIterateV2={onIterateV2}
        />
      </div>

      {/* 4. Follow-Up Sequence */}
      <div>
        <SectionHeading n="04" title="Multi-Touch Follow-Up Cadence" />
        <FollowUpSequence
          day3={analysis.followUps.day3}
          day7={analysis.followUps.day7}
        />
      </div>

      {/* 5. Structural Breakdown */}
      <div>
        <SectionHeading n="05" title="Copy Component Breakdown" />
        <BreakdownSection breakdown={analysis.emailBreakdown} />
      </div>
    </motion.div>
  );
}
