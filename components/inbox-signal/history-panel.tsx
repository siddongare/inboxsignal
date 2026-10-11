"use client";

import { useState } from "react";
import { History, Trash2, Edit2, Check, X } from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { formatDate } from "@/components/inbox-signal/utils";
import { sfx } from "./tactile-audio";

function getScoreBadge(score: number) {
  if (score < 45) return "text-rose-400 bg-rose-500/10 border-rose-500/25";
  if (score < 68) return "text-amber-400 bg-amber-500/10 border-amber-500/25";
  return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
}

interface HistoryPanelProps {
  history: SavedAnalysis[];
  activeId: string | null;
  signedIn: boolean;
  onSelect: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export function HistoryPanel(props: HistoryPanelProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#111319]/80 p-4 shadow-sm backdrop-blur-xl">
      <div className="mb-3.5 flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
        <div>
          <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-500 block">
            Saved Audits
          </span>
          <h2 className="text-xs font-semibold text-white tracking-tight">
            Analysis Timeline
          </h2>
        </div>
        <History className="text-slate-500" size={15} />
      </div>

      {!props.signedIn ? (
        <p className="border border-white/[0.06] bg-white/[0.02] p-3 rounded-xl text-xs leading-relaxed text-slate-400">
          Sign in to turn one-off audits into an account timeline.
        </p>
      ) : props.history.length === 0 ? (
        <p className="border border-white/[0.06] bg-white/[0.02] p-3 rounded-xl text-xs leading-relaxed text-slate-400">
          No saved analyses yet. Your first audit will appear here.
        </p>
      ) : (
        <div className="grid max-h-[440px] gap-2 overflow-y-auto pr-1">
          {props.history.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              active={item.id === props.activeId}
              onSelect={() => props.onSelect(item)}
              onDelete={() => props.onDelete(item.id)}
              onRename={(title) => props.onRename(item.id, title)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HistoryItem(props: {
  item: SavedAnalysis;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(props.item.title);

  function saveTitle() {
    setEditing(false);
    if (title.trim() && title.trim() !== props.item.title) {
      props.onRename(title);
    }
  }

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        props.active
          ? "border-blue-500/40 bg-blue-500/[0.06] shadow-sm"
          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          sfx.click();
          props.onSelect();
        }}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0 flex-1">
            {editing ? (
              <div
                className="flex items-center gap-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveTitle();
                    if (event.key === "Escape") setEditing(false);
                  }}
                  className="w-full rounded-lg border border-blue-500/60 bg-[#090A0F] px-2.5 py-1 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveTitle}
                  className="text-emerald-400 p-0.5 cursor-pointer"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-slate-400 p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <p className="truncate text-xs font-medium text-slate-200">
                {props.item.title}
              </p>
            )}
            <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
              {formatDate(props.item.createdAt)}
            </p>
          </div>

          <div
            className={`font-mono px-2 py-0.5 text-xs font-bold rounded-full border shrink-0 ${getScoreBadge(
              props.item.score,
            )}`}
          >
            {props.item.score}
          </div>
        </div>
      </button>

      <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500">
        <button
          type="button"
          onClick={() => {
            sfx.click();
            setEditing(true);
          }}
          className="hover:text-slate-300 transition cursor-pointer"
        >
          Rename
        </button>

        <button
          type="button"
          onClick={() => {
            sfx.click();
            props.onDelete();
          }}
          className="hover:text-rose-400 transition cursor-pointer"
          title="Delete analysis"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
