"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { sfx } from "./tactile-audio";

// ─── 1. Rubber Stamp ──────────────────────────────────────────────────────────
export function RubberStamp({
  text,
  variant = "critical",
  angle = -3,
  className = "",
}: {
  text: string;
  variant?: "critical" | "high" | "low" | "neutral" | "caution";
  angle?: number;
  className?: string;
}) {
  const [stamped, setStamped] = useState(false);

  const colors = {
    critical: "border-red-500/90 text-red-500 bg-red-950/20",
    high: "border-orange-500/90 text-orange-500 bg-orange-950/20",
    caution: "border-yellow-400/90 text-yellow-400 bg-yellow-950/20",
    low: "border-emerald-500/90 text-emerald-400 bg-emerald-950/20",
    neutral: "border-zinc-400/90 text-zinc-300 bg-zinc-900/30",
  };

  return (
    <span
      onClick={() => {
        sfx.stamp();
        setStamped(true);
        setTimeout(() => setStamped(false), 300);
      }}
      style={{
        transform: `rotate(${angle}deg) scale(${stamped ? 0.95 : 1})`,
        transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      className={`inline-block select-none cursor-pointer uppercase font-mono font-black tracking-widest text-[11px] px-2.5 py-1 border-2 rounded-[2px] shadow-sm backdrop-blur-[1px] hover:brightness-125 ${colors[variant]} ${className}`}
      title="Click to stamp"
    >
      <span className="opacity-95">{text}</span>
    </span>
  );
}

// ─── 2. Masking Tape Strip ───────────────────────────────────────────────────
export function MaskingTape({
  width = 90,
  angle = -1.5,
  className = "",
  style = {},
}: {
  width?: number;
  angle?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: `${width}px`,
        height: "18px",
        transform: `rotate(${angle}deg)`,
        background: "rgba(235, 226, 208, 0.18)",
        backdropFilter: "blur(2px)",
        borderLeft: "2px dashed rgba(255, 255, 255, 0.2)",
        borderRight: "2px dashed rgba(255, 255, 255, 0.2)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
        ...style,
      }}
      className={`pointer-events-none z-20 ${className}`}
    />
  );
}

// ─── 3. Physical Sticky Critique Note ─────────────────────────────────────────
export function StickyCritique({
  title = "AUTOPSY NOTE",
  content,
  angle = 1.8,
  author = "SDR LAB // NO. 09",
  onDismiss,
}: {
  title?: string;
  content: string;
  angle?: number;
  author?: string;
  onDismiss?: () => void;
}) {
  const [ripped, setRipped] = useState(false);

  if (ripped) return null;

  return (
    <div
      style={{
        transform: `rotate(${angle}deg)`,
        transition: "transform 0.2s ease, opacity 0.2s ease",
      }}
      className="relative z-20 max-w-xs p-4 bg-[#FEF08A] text-zinc-900 border border-yellow-300 shadow-xl rounded-[2px] font-mono select-none hover:rotate-0"
    >
      {/* Tape on top */}
      <div
        style={{
          position: "absolute",
          top: -9,
          left: "50%",
          transform: "translateX(-50%) rotate(-1deg)",
          width: 70,
          height: 16,
          background: "rgba(255, 255, 255, 0.55)",
          borderLeft: "2px dashed rgba(0,0,0,0.15)",
          borderRight: "2px dashed rgba(0,0,0,0.15)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
        }}
      />

      <div className="flex items-center justify-between pb-1.5 border-b border-yellow-400/80 mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-yellow-900">
          📌 {title}
        </span>
        <button
          onClick={() => {
            sfx.paper();
            setRipped(true);
            onDismiss?.();
          }}
          className="text-[9px] text-yellow-800 hover:text-black uppercase underline font-bold"
          title="Peel note"
        >
          [peel]
        </button>
      </div>

      <p className="text-[11px] leading-relaxed text-zinc-800 font-sans font-medium">
        {content}
      </p>

      <div className="mt-2.5 pt-1.5 border-t border-yellow-300/80 flex items-center justify-between text-[9px] text-yellow-900 font-mono">
        <span>{author}</span>
        <span>REC-02</span>
      </div>
    </div>
  );
}

// ─── 4. Barcode & Print Ticket Header ────────────────────────────────────────
export function BarcodeTicket({
  code = "IS-902847-B2B",
  edition = "VOL. 04 / ED. 2026",
}: {
  code?: string;
  edition?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-y border-zinc-800 font-mono text-[10px] text-zinc-500 uppercase tracking-widest select-none">
      <div className="flex items-center gap-3">
        <span className="text-zinc-400 font-bold">✛ {code}</span>
        <span className="hidden sm:inline text-zinc-600">//</span>
        <span className="hidden sm:inline text-zinc-400">OUTREACH DECODER</span>
      </div>

      {/* SVG Barcode Graphic */}
      <div className="flex items-center gap-2">
        <svg
          width="80"
          height="14"
          viewBox="0 0 80 14"
          fill="currentColor"
          className="text-zinc-600"
        >
          <rect x="0" y="0" width="2" height="14" />
          <rect x="4" y="0" width="1" height="14" />
          <rect x="7" y="0" width="3" height="14" />
          <rect x="12" y="0" width="1" height="14" />
          <rect x="15" y="0" width="4" height="14" />
          <rect x="21" y="0" width="2" height="14" />
          <rect x="25" y="0" width="1" height="14" />
          <rect x="28" y="0" width="3" height="14" />
          <rect x="33" y="0" width="2" height="14" />
          <rect x="37" y="0" width="1" height="14" />
          <rect x="40" y="0" width="4" height="14" />
          <rect x="46" y="0" width="1" height="14" />
          <rect x="49" y="0" width="3" height="14" />
          <rect x="54" y="0" width="2" height="14" />
          <rect x="58" y="0" width="1" height="14" />
          <rect x="61" y="0" width="4" height="14" />
          <rect x="67" y="0" width="2" height="14" />
          <rect x="71" y="0" width="1" height="14" />
          <rect x="74" y="0" width="3" height="14" />
          <rect x="79" y="0" width="1" height="14" />
        </svg>
        <span className="text-zinc-500 font-semibold">{edition}</span>
      </div>
    </div>
  );
}

// ─── 5. Editorial Crop Marks ──────────────────────────────────────────────────
export function CropMarkCorner({
  position = "top-left",
}: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const glyphs = {
    "top-left": "⌜",
    "top-right": "⌝",
    "bottom-left": "⌞",
    "bottom-right": "⌟",
  };

  const posClasses = {
    "top-left": "-top-2.5 -left-2.5",
    "top-right": "-top-2.5 -right-2.5",
    "bottom-left": "-bottom-2.5 -left-2.5",
    "bottom-right": "-bottom-2.5 -right-2.5",
  };

  return (
    <span
      aria-hidden="true"
      className={`absolute ${posClasses[position]} font-mono text-zinc-600 text-xs select-none pointer-events-none`}
    >
      {glyphs[position]}
    </span>
  );
}

// ─── 6. Japanese / Brutalist Vertical Label ──────────────────────────────────
export function VerticalEditorialLabel({
  text = "INBOXSIGNAL // 受信箱のシグナル",
}: {
  text?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:flex fixed left-3 top-1/2 -translate-y-1/2 -rotate-90 origin-left items-center gap-3 text-[9px] font-mono tracking-[0.25em] text-zinc-600 uppercase pointer-events-none select-none z-10"
    >
      <span className="w-8 h-[1px] bg-zinc-800" />
      <span>{text}</span>
      <span className="w-8 h-[1px] bg-zinc-800" />
    </div>
  );
}
