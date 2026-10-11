"use client";

import { useState } from "react";
import { History, Trash2, Edit2, Check, X } from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { formatDate } from "@/components/inbox-signal/utils";

function getScoreBadgeClass(score: number) {
  if (score < 45) return "bg-red-500/10 text-red-400 border-red-500/25";
  if (score < 68) return "bg-amber-500/10 text-amber-400 border-amber-500/25";
  return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
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
    <section className="rounded-xl border border-[#27272A] bg-[#111113] p-4 shadow-sm">
      <div className="mb-3.5 flex items-center justify-between pb-3 border-b border-[#27272A]/70">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500">
            Saved Audits
          </span>
          <h2 className="text-sm font-semibold text-white tracking-tight">
            Analysis Timeline
          </h2>
        </div>
        <History className="text-zinc-500" size={16} />
      </div>

      {!props.signedIn ? (
        <p className="rounded-lg border border-[#27272A] bg-[#18181B] p-3 text-xs leading-relaxed text-zinc-400">
          Sign in to turn one-off audits into an account timeline.
        </p>
      ) : props.history.length === 0 ? (
        <p className="rounded-lg border border-[#27272A] bg-[#18181B] p-3 text-xs leading-relaxed text-zinc-400">
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
      className={`rounded-lg border p-3 transition ${
        props.active
          ? "border-blue-500/50 bg-blue-500/10 shadow-sm"
          : "border-[#27272A] bg-[#18181B] hover:border-zinc-700 hover:bg-[#1E1E22]"
      }`}
    >
      <button
        type="button"
        onClick={props.onSelect}
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
                  className="w-full rounded border border-blue-500/60 bg-[#09090B] px-2 py-1 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveTitle}
                  className="text-emerald-400 hover:text-emerald-300 p-1"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <p className="truncate text-xs font-semibold text-zinc-100">
                {props.item.title}
              </p>
            )}
            <p className="mt-0.5 text-[10px] text-zinc-500">
              {formatDate(props.item.createdAt)}
            </p>
          </div>

          <div
            className={`font-mono px-2 py-0.5 text-xs font-bold rounded border shrink-0 ${getScoreBadgeClass(
              props.item.score,
            )}`}
          >
            {props.item.score}
          </div>
        </div>
      </button>

      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#27272A]/50">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 transition hover:text-zinc-200"
        >
          <Edit2 size={10} />
          <span>Rename</span>
        </button>

        <button
          type="button"
          onClick={props.onDelete}
          className="inline-flex h-6 w-6 items-center justify-center rounded text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
          aria-label="Delete analysis"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
