"use client";

import { useState } from "react";
import { History, Trash2, Edit2, Check, X, FileText } from "lucide-react";
import type { SavedAnalysis } from "@/lib/analysis-types";
import { formatDate } from "@/components/inbox-signal/utils";
import { sfx } from "./tactile-audio";
import { RubberStamp, CropMarkCorner } from "./tactile-elements";

function getScoreBadge(score: number) {
  if (score < 45) return { text: "FATAL", variant: "critical" as const };
  if (score < 68) return { text: "WARN", variant: "caution" as const };
  return { text: "PASS", variant: "low" as const };
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
    <section className="relative rounded-[2px] border-2 border-zinc-800 bg-[#0E0E12] p-4 font-mono shadow-sm">
      <CropMarkCorner position="top-left" />
      <CropMarkCorner position="bottom-right" />

      <div className="mb-3.5 flex items-center justify-between pb-2.5 border-b-2 border-zinc-800">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block">
            ARCHIVAL DOSSIER
          </span>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            CASE HISTORY LOG
          </h2>
        </div>
        <History className="text-zinc-500" size={15} />
      </div>

      {!props.signedIn ? (
        <p className="border border-zinc-800 bg-[#141418] p-3 text-xs leading-relaxed text-zinc-400">
          [AUTHENTICATION REQUIRED TO ARCHIVE DOSSIERS]
        </p>
      ) : props.history.length === 0 ? (
        <p className="border border-zinc-800 bg-[#141418] p-3 text-xs leading-relaxed text-zinc-400">
          [NO CASE FILES STORED · RUN YOUR FIRST SPECIMEN]
        </p>
      ) : (
        <div className="grid max-h-[440px] gap-2 overflow-y-auto pr-1">
          {props.history.map((item, idx) => (
            <HistoryItem
              key={item.id}
              item={item}
              index={idx}
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
  index: number;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(props.item.title);
  const badge = getScoreBadge(props.item.score);

  function saveTitle() {
    setEditing(false);
    if (title.trim() && title.trim() !== props.item.title) {
      props.onRename(title);
    }
  }

  return (
    <div
      className={`rounded-[2px] border-2 p-2.5 transition ${
        props.active
          ? "border-white bg-[#181820] shadow-[2px_2px_0px_rgba(255,255,255,0.2)]"
          : "border-zinc-800 bg-[#141418] hover:border-zinc-600"
      }`}
    >
      <button
        type="button"
        onClick={() => {
          sfx.paper();
          props.onSelect();
        }}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-zinc-500 font-mono block">
              CASE #{String(props.index + 1).padStart(3, "0")} ·{" "}
              {formatDate(props.item.createdAt)}
            </span>
            {editing ? (
              <div
                className="flex items-center gap-1.5 mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveTitle();
                    if (event.key === "Escape") setEditing(false);
                  }}
                  className="w-full rounded-[1px] border border-white bg-black px-2 py-0.5 text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={saveTitle}
                  className="text-emerald-400 p-0.5"
                >
                  <Check size={12} />
                </button>
              </div>
            ) : (
              <p className="truncate text-xs font-bold text-zinc-100 font-sans mt-0.5">
                {props.item.title}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end shrink-0 gap-1">
            <span className="text-sm font-black text-white font-mono">
              {props.item.score}
            </span>
            <RubberStamp text={badge.text} variant={badge.variant} angle={0} className="text-[8px] px-1 py-0.2" />
          </div>
        </div>
      </button>

      <div className="mt-2 pt-1.5 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <button
          type="button"
          onClick={() => {
            sfx.click();
            setEditing(true);
          }}
          className="hover:text-zinc-200 uppercase"
        >
          [RENAME]
        </button>

        <button
          type="button"
          onClick={() => {
            sfx.click();
            props.onDelete();
          }}
          className="hover:text-red-400 uppercase"
          title="Delete case file"
        >
          [PURGE]
        </button>
      </div>
    </div>
  );
}
