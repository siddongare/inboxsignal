"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { formatDate } from "@/components/inbox-signal/utils";
import { CropMarkCorner, RubberStamp } from "./tactile-elements";

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
    <section className="relative rounded-[2px] border-2 border-zinc-800 bg-[#0E0E12] p-4 font-mono shadow-sm">
      <CropMarkCorner position="top-right" />
      <CropMarkCorner position="bottom-left" />

      <div className="mb-3.5 flex items-center justify-between pb-2.5 border-b-2 border-zinc-800">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
            HISTORICAL VELOCITY
          </span>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            SIGNAL PROGRESSION
          </h2>
        </div>
        <TrendingUp className="text-zinc-400" size={15} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#141418] border border-zinc-800 p-2.5 rounded-[2px] flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">[COUNT]</span>
          <span className="text-base font-black text-white mt-0.5">
            {stats.total}
          </span>
        </div>
        <div className="bg-[#141418] border border-zinc-800 p-2.5 rounded-[2px] flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">[LATEST]</span>
          <span className="text-base font-black text-white mt-0.5">
            {stats.latest ? stats.latest : "-"}
          </span>
        </div>
        <div className="bg-[#141418] border border-zinc-800 p-2.5 rounded-[2px] flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase">[DELTA]</span>
          <span
            className={`text-base font-black mt-0.5 ${
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

      <div className="mt-3.5 flex h-24 items-end gap-1.5 rounded-[2px] border border-zinc-800 bg-[#09090C] p-2.5">
        {stats.series.length === 0 ? (
          <p className="self-center text-[10px] text-zinc-500 text-center w-full">
            [HISTOGRAM POPULATES AFTER RUNNING AUDITS]
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
                  style={{ height: `${barH}px`, background: color }}
                  className="w-full max-w-[16px] transition-opacity opacity-85 group-hover:opacity-100"
                />
                <span className="text-[8px] text-zinc-500 font-bold">
                  {item.score}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[10px] text-zinc-500">
        <span>PEAK SCORE ACHIEVED:</span>
        <span className="font-bold text-emerald-400">
          {stats.best || "-"} / 100
        </span>
      </div>
    </section>
  );
}
