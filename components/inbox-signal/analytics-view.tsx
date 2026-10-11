"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  Award,
  Zap,
  Target,
  AlertOctagon,
  ArrowUpRight,
  ShieldAlert,
  Compass,
} from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { getSignalScore } from "@/lib/analysis-types";
import { GsapTiltCard } from "@/components/gsap/gsap-tilt-card";
import { GsapCounter } from "@/components/gsap/gsap-counter";
import { GsapMagnetic } from "@/components/gsap/gsap-magnetic";

interface AnalyticsViewProps {
  history: SavedAnalysis[];
  onSelectAudit: (item: SavedAnalysis) => void;
  onGoToStudio: () => void;
}

export function AnalyticsView({
  history,
  onSelectAudit,
  onGoToStudio,
}: AnalyticsViewProps) {
  const stats = useMemo(() => {
    if (history.length === 0) return null;

    const scores = history.map((h) => getSignalScore(h.result.signals));
    const avgScore = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Dimension averages
    const avgClarity = Math.round(
      history.reduce((a, b) => a + b.result.signals.clarity, 0) /
        history.length,
    );
    const avgRelevance = Math.round(
      history.reduce((a, b) => a + b.result.signals.relevance, 0) /
        history.length,
    );
    const avgCredibility = Math.round(
      history.reduce((a, b) => a + b.result.signals.credibility, 0) /
        history.length,
    );
    const avgCta = Math.round(
      history.reduce((a, b) => a + b.result.signals.ctaStrength, 0) /
        history.length,
    );

    // Common issues frequency
    const issueCounts: Record<string, number> = {};
    history.forEach((h) => {
      h.result.diagnosis.forEach((d) => {
        const key = d.issue.trim();
        issueCounts[key] = (issueCounts[key] || 0) + 1;
      });
    });

    const topIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Score trajectory (chronological)
    const chronological = [...history].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return {
      totalAudits: history.length,
      avgScore,
      highestScore,
      lowestScore,
      avgClarity,
      avgRelevance,
      avgCredibility,
      avgCta,
      topIssues,
      chronological,
    };
  }, [history]);

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#D4FF00]/10 border border-[#D4FF00]/20 text-[#D4FF00] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(212,255,0,0.12)]">
          <TrendingUp size={26} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Audits Run Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
          Your Analytics Dashboard aggregates signal scores, cognitive failure
          frequencies, and velocity over time. Run your first audit to unlock
          benchmarks.
        </p>
        <button
          onClick={onGoToStudio}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4FF00] hover:bg-[#e2ff33] text-black font-bold text-xs shadow-[0_0_20px_rgba(212,255,0,0.3)] transition active:scale-98 cursor-pointer"
        >
          <span>Open Diagnostic Studio</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0A0C10]/95 border border-white/[0.08] backdrop-blur-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Pipeline Intelligence Lab
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Outbound Velocity &amp; Forensics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated diagnostics across {stats.totalAudits} audited campaigns
          </p>
        </div>

        <GsapMagnetic strength={0.25}>
          <button
            onClick={onGoToStudio}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4.5 py-2 rounded-xl bg-[#D4FF00] text-black hover:bg-[#e2ff33] font-bold text-xs shadow-[0_0_15px_rgba(212,255,0,0.25)] transition cursor-pointer"
          >
            <span>+ Dissect New Vector</span>
            <ArrowUpRight size={13} />
          </button>
        </GsapMagnetic>
      </div>

      {/* Primary KPI Bento with GSAP 3D Tilt & Smooth Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <GsapTiltCard maxTilt={5} className="p-5 rounded-2xl bg-[#0A0C10]/90 border border-white/[0.08] backdrop-blur-xl h-full">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Avg Signal Score</span>
            <Target size={14} className="text-[#D4FF00]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              <GsapCounter value={stats.avgScore} />
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {stats.avgScore >= 65
              ? "Strong conversion probability"
              : "Friction in outreach angle"}
          </p>
        </GsapTiltCard>

        <GsapTiltCard maxTilt={5} className="p-5 rounded-2xl bg-[#0A0C10]/90 border border-white/[0.08] backdrop-blur-xl h-full">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Top High-Water Mark</span>
            <Award size={14} className="text-[#D4FF00]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-[#D4FF00] tracking-tight">
              <GsapCounter value={stats.highestScore} />
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Best audited variation</p>
        </GsapTiltCard>

        <GsapTiltCard maxTilt={5} className="p-5 rounded-2xl bg-[#111319]/60 border border-white/[0.08] backdrop-blur-xl h-full">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Audits Recorded</span>
            <Compass size={14} className="text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white tracking-tight">
              <GsapCounter value={stats.totalAudits} />
            </span>
            <span className="text-xs text-slate-500 font-mono">drafts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Persistent history</p>
        </GsapTiltCard>

        <GsapTiltCard maxTilt={5} className="p-5 rounded-2xl bg-[#111319]/60 border border-white/[0.08] backdrop-blur-xl h-full">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Rejection Delta</span>
            <Zap size={14} className="text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-amber-300 tracking-tight">
              +<GsapCounter value={stats.highestScore - stats.lowestScore} />
            </span>
            <span className="text-xs text-slate-500 font-mono">pts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Improvement span</p>
        </GsapTiltCard>
      </div>

      {/* Dimensions & Failure Anatomy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dimension Radar / Bars */}
        <div className="p-6 rounded-3xl bg-[#111319]/80 border border-white/[0.08] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Signal Dimension Breakdown
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Avg Across All Drafts
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                label: "Clarity & Readability",
                score: stats.avgClarity,
                color: "bg-[#D4FF00]",
                desc: "Focus, length, and executive scannability",
              },
              {
                label: "Prospect Relevance",
                score: stats.avgRelevance,
                color: "bg-indigo-500",
                desc: "Context alignment with target persona & pain points",
              },
              {
                label: "Proof & Credibility",
                score: stats.avgCredibility,
                color: "bg-amber-500",
                desc: "Tangible social proof vs unverified claims",
              },
              {
                label: "CTA Friction",
                score: stats.avgCta,
                color: "bg-emerald-500",
                desc: "Low-commitment vs calendar-friction asks",
              },
            ].map((dim) => (
              <div key={dim.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{dim.label}</span>
                  <span className="font-mono font-bold text-white">
                    {dim.score}%
                  </span>
                </div>
                <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className={`h-full ${dim.color} transition-all duration-500`}
                    style={{ width: `${Math.max(5, dim.score)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block">
                  {dim.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Frequent Failure Points */}
        <div className="p-6 rounded-3xl bg-[#111319]/80 border border-white/[0.08] backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                Frequent Failure Mechanisms
              </h3>
              <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Top Rejection Traps
              </span>
            </div>

            {stats.topIssues.length > 0 ? (
              <div className="space-y-3">
                {stats.topIssues.map(([issue, count], i) => (
                  <div
                    key={issue}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-400 flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {issue}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0 bg-white/[0.04] px-2 py-0.5 rounded-md">
                      Flagged {count}×
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No repeated issues detected yet.
              </p>
            )}
          </div>

          <div className="mt-4 p-3.5 rounded-2xl bg-[#D4FF00]/[0.06] border border-[#D4FF00]/20 text-xs text-slate-200 flex items-center gap-3">
            <ShieldAlert size={18} className="text-[#D4FF00] shrink-0" />
            <span>
              Executive buyers reject emails primarily due to vague credibility
              and high-friction initial asks.
            </span>
          </div>
        </div>
      </div>

      {/* Historical Trajectory Feed */}
      <div className="p-6 rounded-3xl bg-[#111319]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">
            Audit Timeline & Historical Index
          </h3>
          <span className="text-xs text-slate-400">
            Click any entry to open in Studio
          </span>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {history.map((item) => {
            const score = getSignalScore(item.result.signals);
            return (
              <div
                key={item.id}
                onClick={() => onSelectAudit(item)}
                className="py-3 px-2 flex items-center justify-between gap-4 hover:bg-white/[0.03] rounded-xl transition cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white group-hover:text-[#D4FF00] transition truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.prospect}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg border ${
                      score >= 68
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : score >= 45
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                    }`}
                  >
                    {score}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
