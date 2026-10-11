"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { formatDate } from "@/components/inbox-signal/utils";

function getBarColor(score: number) {
  if (score < 45) return "#EF4444";
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
    <section className="rounded-xl border border-[#27272A] bg-[#111113] p-4 shadow-sm">
      <div className="mb-3.5 flex items-center justify-between pb-3 border-b border-[#27272A]/70">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
            Progress Tracking
          </span>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Signal Velocity
          </h2>
        </div>
        <TrendingUp className="text-blue-400" size={16} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#18181B] border border-[#27272A] p-2.5 rounded-lg flex flex-col items-center">
          <span className="text-[10px] font-medium text-zinc-400">Total</span>
          <span className="font-mono text-base font-bold text-white mt-0.5">
            {stats.total}
          </span>
        </div>
        <div className="bg-[#18181B] border border-[#27272A] p-2.5 rounded-lg flex flex-col items-center">
          <span className="text-[10px] font-medium text-zinc-400">Latest</span>
          <span className="font-mono text-base font-bold text-white mt-0.5">
            {stats.latest ? stats.latest : "-"}
          </span>
        </div>
        <div className="bg-[#18181B] border border-[#27272A] p-2.5 rounded-lg flex flex-col items-center">
          <span className="text-[10px] font-medium text-zinc-400">Delta</span>
          <span
            className={`font-mono text-base font-bold mt-0.5 ${
              stats.improvement > 0
                ? "text-emerald-400"
                : stats.improvement < 0
                  ? "text-red-400"
                  : "text-zinc-400"
            }`}
          >
            {stats.improvement > 0
              ? `+${stats.improvement}`
              : String(stats.improvement)}
          </span>
        </div>
      </div>

      <div className="mt-4 flex h-28 items-end gap-1.5 rounded-lg border border-[#27272A] bg-[#09090B] p-3">
        {stats.series.length === 0 ? (
          <p className="self-center text-xs text-zinc-500 text-center w-full">
            Your score trend appears after your first analysis.
          </p>
        ) : (
          stats.series.map((item) => {
            const barH = Math.max(12, Math.round((item.score / 100) * 80));
            const color = getBarColor(item.score);
            return (
              <div
                key={item.id}
                className="flex flex-1 flex-col items-center justify-end h-full gap-1.5 group"
                title={`${item.score} signal score on ${formatDate(
                  item.createdAt,
                )}`}
              >
                <div
                  style={{ height: `${barH}px`, background: color }}
                  className="w-full max-w-[18px] rounded-t transition-opacity opacity-80 group-hover:opacity-100"
                />
                <span className="font-mono text-[9px] text-zinc-500 group-hover:text-zinc-200">
                  {item.score}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-500">
        <span>Best score achieved:</span>
        <span className="font-mono font-semibold text-emerald-400">
          {stats.best || "-"}
        </span>
      </div>
    </section>
  );
}
