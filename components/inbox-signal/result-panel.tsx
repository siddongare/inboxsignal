"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Flame,
  FileText,
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
import { sfx } from "./tactile-audio";
import {
  RubberStamp,
  MaskingTape,
  CropMarkCorner,
  BarcodeTicket,
} from "./tactile-elements";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(s: number) {
  if (s < 45) return "#EF4444";
  if (s < 68) return "#F59E0B";
  return "#10B981";
}

function scoreVerdict(s: number) {
  if (s < 45) return "FATAL // LOW ODDS";
  if (s < 68) return "SUBOPTIMAL FRICTION";
  if (s < 80) return "ACCEPTABLE SIGNAL";
  return "HIGH CONVERSION SIGNAL";
}

function CopyBtn({ text, label = "COPY" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        sfx.click();
        navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-[2px] transition border cursor-pointer select-none ${
        ok
          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500"
          : "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white"
      }`}
    >
      {ok ? <Check size={11} /> : <Copy size={11} />}
      <span>{ok ? "[COPIED]" : `[${label}]`}</span>
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
    <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-zinc-800 font-mono">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-white bg-zinc-800 px-2 py-0.5 border border-zinc-700">
          {n}
        </span>
        <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
          {title}
        </h2>
      </div>
      {count !== undefined && (
        <span className="text-[10px] text-zinc-500 font-bold uppercase">
          [{count} ITEMS DIAGNOSED]
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
    { label: "CLARITY", value: signals.clarity },
    { label: "RELEVANCE", value: signals.relevance },
    { label: "CREDIBILITY", value: signals.credibility },
    { label: "CTA STRENGTH", value: signals.ctaStrength },
  ];

  return (
    <div className="relative p-5 rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 font-mono shadow-md overflow-hidden">
      <CropMarkCorner position="top-left" />
      <CropMarkCorner position="top-right" />
      <CropMarkCorner position="bottom-left" />
      <CropMarkCorner position="bottom-right" />

      {/* Top Dossier Barcode */}
      <div className="pb-3 mb-4 border-b border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
        <span className="font-bold text-zinc-400">
          AUTOPSY SPECIMEN NO. 4892 // FORENSIC READOUT
        </span>
        <span className="text-zinc-600">// METRIC AUDIT</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-zinc-800">
        {/* Score Ring & Summary */}
        <div className="flex items-center gap-5">
          <div className="relative w-22 h-22 shrink-0">
            <svg width={88} height={88} className="-rotate-90">
              <circle
                cx={44}
                cy={44}
                r={39}
                fill="none"
                stroke="#1F1F24"
                strokeWidth={6}
              />
              <motion.circle
                cx={44}
                cy={44}
                r={39}
                fill="none"
                stroke={c}
                strokeWidth={6}
                strokeLinecap="square"
                strokeDasharray={245}
                initial={{ strokeDashoffset: 245 }}
                animate={{ strokeDashoffset: 245 * (1 - avg / 100) }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                {avg}
              </span>
              <span className="text-[9px] text-zinc-500 uppercase mt-0.5 font-bold">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <RubberStamp
                text={scoreVerdict(avg)}
                variant={avg >= 70 ? "low" : avg >= 50 ? "caution" : "critical"}
                angle={-1.5}
              />
            </div>
            <p className="text-xs text-zinc-400 font-sans mt-2 max-w-sm leading-relaxed">
              Mathematical composite calibrated against verified B2B outbound
              conversion benchmarks.
            </p>
          </div>
        </div>

        {/* Status Callout Stamp */}
        <div className="sm:self-center">
          <RubberStamp
            text={avg >= 70 ? "CLEARED // DISPATCHABLE" : "HOLD // ACTION REQUIRED"}
            variant={avg >= 70 ? "low" : "critical"}
            angle={2}
          />
        </div>
      </div>

      {/* 4 Vector Readouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
        {metrics.map(({ label, value }) => {
          const sc = scoreColor(value);
          return (
            <div
              key={label}
              className="bg-[#141418] border border-zinc-800 p-2.5 rounded-[2px]"
            >
              <div className="flex justify-between items-center mb-1.5 text-[10px]">
                <span className="font-bold text-zinc-400">{label}</span>
                <span style={{ color: sc }} className="font-black">
                  {value}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 overflow-hidden rounded-[1px]">
                <div
                  style={{ width: `${value}%`, background: sc }}
                  className="h-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Top Priority Threat Callout ──────────────────────────────────────────────
function TopPriorityCallout({ items }: { items: DiagnosisItem[] }) {
  const top = items[0];
  if (!top) return null;

  return (
    <div className="relative p-4 rounded-[2px] border-2 border-red-500/80 bg-red-950/20 font-mono shadow-sm">
      <MaskingTape width={70} angle={-1} className="absolute -top-2.5 right-6" />

      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <RubberStamp text="[CRITICAL OUTREACH KILLER]" variant="critical" angle={-1} />
        <span className="text-[10px] text-red-400 uppercase font-bold">
          SEVERITY: HIGHEST THREAT
        </span>
      </div>

      <h3 className="text-sm font-bold text-white mb-1.5 font-sans">
        {top.issue}
      </h3>
      <p className="text-xs text-red-200/90 leading-relaxed font-sans mb-3">
        {top.whyItMatters}
      </p>

      <div className="p-2.5 bg-black/60 border border-red-500/40 text-xs text-red-300 font-mono">
        <span className="text-red-400 font-bold block mb-0.5 text-[10px] uppercase">
          → SURGICAL FIX:
        </span>
        <span className="font-sans text-xs">{top.fix}</span>
      </div>
    </div>
  );
}

// ─── Forensic Diagnosis Card ──────────────────────────────────────────────────
function DiagnosisCard({
  item,
  index,
}: {
  item: DiagnosisItem;
  index: number;
}) {
  const impactVariants: Record<
    string,
    "critical" | "high" | "caution" | "low"
  > = {
    critical: "critical",
    high: "high",
    medium: "caution",
    low: "low",
  };

  return (
    <div className="relative p-4 rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 hover:border-zinc-600 transition shadow-sm font-mono">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center text-[10px] font-black">
            {index + 1}
          </span>
          <h4 className="text-sm font-bold text-zinc-100 font-sans tracking-tight">
            {item.issue}
          </h4>
        </div>

        <RubberStamp
          text={item.impact.toUpperCase()}
          variant={impactVariants[item.impact] ?? "neutral"}
          angle={index % 2 === 0 ? -1.5 : 1.5}
        />
      </div>

      <div className="mb-3 font-sans">
        <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold block mb-0.5">
          FAILURE MECHANISM:
        </span>
        <p className="text-xs text-zinc-300 leading-relaxed">{item.whyItMatters}</p>
      </div>

      <div className="p-2.5 bg-[#141418] border border-zinc-800 text-xs text-zinc-200 font-mono">
        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block mb-0.5">
          [ACTIONABLE CORRECTION]
        </span>
        <p className="font-sans text-xs text-zinc-300">{item.fix}</p>
      </div>
    </div>
  );
}

// ─── Rewrite Panel (Editorial Side-by-Side) ──────────────────────────────────
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
      {/* Email Rewrite Box */}
      <div className="relative p-5 rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 font-mono shadow-md">
        <MaskingTape width={90} angle={1.5} className="absolute -top-2.5 -right-3" />

        <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800 flex-wrap">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sfx.click();
                setShowOriginal(false);
              }}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-[2px] transition border cursor-pointer ${
                !showOriginal
                  ? "bg-white text-black border-white shadow-[2px_2px_0px_rgba(255,255,255,0.2)]"
                  : "bg-transparent text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              [OPTIMIZED REWRITE]
            </button>
            <button
              onClick={() => {
                sfx.click();
                setShowOriginal(true);
              }}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded-[2px] transition border cursor-pointer ${
                showOriginal
                  ? "bg-red-500 text-white border-red-500 shadow-[2px_2px_0px_rgba(239,68,68,0.3)]"
                  : "bg-transparent text-zinc-400 border-zinc-800 hover:text-white"
              }`}
            >
              [ORIGINAL DRAFT]
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!showOriginal && onIterateV2 && (
              <button
                onClick={() => {
                  sfx.stamp();
                  onIterateV2();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider bg-blue-600 text-white hover:bg-blue-500 border border-blue-400 shadow-[2px_2px_0px_rgba(59,130,246,0.3)] active:translate-x-[1px] active:translate-y-[1px] rounded-[2px] transition cursor-pointer"
                title="Transfer this rewrite to the editor for Version 2 testing"
              >
                <RotateCcw size={11} />
                <span>[ITERATE V2 →]</span>
              </button>
            )}
            {!showOriginal && <CopyBtn text={rewrite.email} label="COPY EMAIL" />}
          </div>
        </div>

        {/* Email Body */}
        <div
          className={`p-4 rounded-[2px] bg-[#141418] border text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans transition ${
            showOriginal
              ? "border-red-500/50 text-zinc-400"
              : "border-emerald-500/60 text-zinc-100"
          }`}
        >
          {showOriginal ? originalEmail : rewrite.email}
        </div>
      </div>

      {/* Subject Line Variants */}
      {rewrite.subjectLines && rewrite.subjectLines.length > 0 && (
        <div className="p-4 rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 font-mono shadow-sm">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
              SUBJECT LINE VARIATIONS // 4 A/B HOOKS
            </span>
            <span className="text-[10px] text-zinc-500">[TEST SUITE]</span>
          </div>

          <div className="flex flex-col gap-2">
            {rewrite.subjectLines.map((line, i) => {
              const letter = ["A", "B", "C", "D"][i] ?? String(i + 1);
              const isFirst = i === 0;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between gap-3 p-2.5 rounded-[2px] border transition ${
                    isFirst
                      ? "bg-[#14141A] border-blue-500/50"
                      : "bg-[#141418] border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-[2px] flex items-center justify-center text-[10px] font-black shrink-0 ${
                        isFirst
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-200 truncate font-sans font-medium">
                      {line}
                    </span>
                    {isFirst && (
                      <span className="hidden sm:inline-block text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 border border-blue-500/30 uppercase font-bold shrink-0">
                        TOP PICK
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

      {/* Rationale Dossier */}
      {rewrite.whyThisWorks && (
        <div className="p-4 rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 font-mono shadow-sm">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
            [PSYCHOLOGICAL RATIONALE]
          </span>
          <p className="text-xs text-zinc-300 font-sans leading-relaxed">
            {rewrite.whyThisWorks}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Cadence Timeline ─────────────────────────────────────────────────────────
function FollowUpSequence({
  day3,
  day7,
}: {
  day3: string;
  day7: string;
}) {
  const steps = [
    {
      day: "TOUCH // 02",
      timing: "DAY 3",
      tag: "SOFT CONTEXT BUMP",
      content: day3,
    },
    {
      day: "TOUCH // 03",
      timing: "DAY 7",
      tag: "PIVOT / VALUE TAKEAWAY",
      content: day7,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono">
      {steps.map((step) => (
        <div
          key={step.timing}
          className="p-4 rounded-[2px] bg-[#0E0E12] border-2 border-zinc-800 flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-zinc-800 text-white px-2 py-0.5">
                  {step.timing}
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  {step.tag}
                </span>
              </div>
              <CopyBtn text={step.content} label="COPY" />
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap p-3 bg-[#141418] border border-zinc-800 rounded-[2px]">
              {step.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Primary Result Panel Component ──────────────────────────────────────────
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
      <div className="py-20 px-4 flex flex-col items-center text-center font-mono">
        <RubberStamp text="SPECIMEN QUEUE EMPTY" variant="neutral" angle={-1} className="mb-4 text-xs" />
        <h2 className="text-base font-bold text-white uppercase tracking-wider mb-2">
          [AWAITING INPUT DOSSIER]
        </h2>
        <p className="text-xs text-zinc-500 font-sans max-w-sm leading-relaxed mb-6">
          Paste cold outreach copy on the left panel. InboxSignal performs a
          forensic autopsy across 4 signal vectors and compiles conversion rewrites.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6"
    >
      {/* 1. Score Readout */}
      <ScoreSection signals={analysis.signals} />

      {/* 2. Failure Diagnosis */}
      <div>
        <SectionHeading
          n="SECTION // 02"
          title="FORENSIC FAILURE DIAGNOSIS"
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
        <SectionHeading
          n="SECTION // 03"
          title="CONVERSION REWRITE & A/B HOOKS"
        />
        <RewritePanel
          originalEmail={originalEmail}
          rewrite={analysis.rewrite}
          onIterateV2={onIterateV2}
        />
      </div>

      {/* 4. Follow-Up Sequence */}
      <div>
        <SectionHeading
          n="SECTION // 04"
          title="MULTI-TOUCH CADENCE SPEC"
        />
        <FollowUpSequence
          day3={analysis.followUps.day3}
          day7={analysis.followUps.day7}
        />
      </div>
    </motion.div>
  );
}
