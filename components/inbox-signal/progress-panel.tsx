"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { formatDate } from "@/components/inbox-signal/utils";

function getBarColor(score: number) {
  if (score < 45) return "#F43F5E";
  if (score < 68) return "#F59E0B";
  return "#10B981";
}

export function ProgressPanel({ history }: { history: SavedAnalysis[] }) {
  const stats = useMemo(() => {
    const chronological = history
      .slice()
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    const first = chronological[0]?.score ?? 0;
    const latest = chronological.at(-1)?.score ?? 0;
    const best = chronological.reduce(
      (max, item) => Math.max(max, item.score),
      0,
    );

    return {
      total: history.length,
      latest,
      best,
      improvement: chronological.length > 1 ? latest - first : 0,
      series: chronological.slice(-8),
    };
  }, [history]);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#111319]/80 p-4 shadow-sm backdrop-blur-xl">
      <div className="mb-3.5 flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 block">
            Progress Tracking
          </span>
          <h2 className="text-xs font-semibold text-white tracking-tight">
            Signal Velocity
          </h2>
        </div>
        <TrendingUp className="text-[#D4FF00]" size={16} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-xl flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-medium">Total</span>
          <span className="font-mono text-base font-bold text-white mt-0.5">
            {stats.total}
          </span>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-xl flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-medium">Latest</span>
          <span className="font-mono text-base font-bold text-white mt-0.5">
            {stats.latest ? stats.latest : "-"}
          </span>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] p-2.5 rounded-xl flex flex-col items-center">
          <span className="text-[10px] text-slate-400 font-medium">Delta</span>
          <span
            className={`font-mono text-base font-bold mt-0.5 ${
              stats.improvement > 0
                ? "text-emerald-400"
                : stats.improvement < 0
                  ? "text-rose-400"
                  : "text-slate-400"
            }`}
          >
            {stats.improvement > 0
              ? `+${stats.improvement}`
              : String(stats.improvement)}
          </span>
        </div>
      </div>

      <div className="mt-3.5 flex h-24 items-end gap-1.5 rounded-xl border border-white/[0.05] bg-[#090A0F]/60 p-2.5">
        {stats.series.length === 0 ? (
          <p className="self-center text-xs text-slate-500 text-center w-full">
            Histogram populates after running audits
          </p>
        ) : (
          stats.series.map((item) => {
            const barH = Math.max(12, Math.round((item.score / 100) * 65));
            const color = getBarColor(item.score);
            return (
              <div
                key={item.id}
                className="flex flex-1 flex-col items-center justify-end h-full gap-1 group"
                title={`${item.score} score on ${formatDate(item.createdAt)}`}
              >
                <div
                  style={{ height: `${barH}px`, backgroundColor: color }}
                  className="w-full max-w-[14px] rounded-full transition-all opacity-80 group-hover:opacity-100"
                />
                <span className="text-[9px] text-slate-500 font-mono font-medium">
                  {item.score}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
        <span>Best score achieved:</span>
        <span className="font-mono font-semibold text-emerald-400">
          {stats.best || "-"} / 100
        </span>
      </div>
    </section>
  );
}
