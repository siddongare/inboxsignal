"use client";

import { useState, useEffect } from "react";
import { SignUpButton, SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Loader2,
  RotateCcw,
  Mail,
  User,
  Sparkles,
} from "lucide-react";
import { sfx } from "./tactile-audio";
import {
  MaskingTape,
  CropMarkCorner,
  RubberStamp,
} from "./tactile-elements";

interface ComposerProps {
  displayMode: "landing" | "sidebar";
  email: string;
  prospect: string;
  remaining: number;
  limit: number;
  signedIn: boolean;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onProspectChange: (value: string) => void;
  onAnalyze: () => void;
  onSignInAndAnalyze: () => void;
  onUseDemo: () => void;
}

export function Composer({
  displayMode,
  email,
  prospect,
  remaining,
  limit,
  signedIn,
  loading,
  onEmailChange,
  onProspectChange,
  onAnalyze,
  onSignInAndAnalyze,
  onUseDemo,
}: ComposerProps) {
  const [isMac, setIsMac] = useState(false);
  const isSidebar = displayMode === "sidebar";
  const limitReached = remaining <= 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform));
    }
  }, []);

  const wordCount = email.trim() ? email.trim().split(/\s+/).length : 0;
  const charCount = email.length;

  const canSubmit =
    !loading &&
    (!signedIn || !limitReached) &&
    email.trim().length > 0 &&
    prospect.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      if (canSubmit) {
        sfx.stamp();
        if (signedIn) onAnalyze();
        else onSignInAndAnalyze();
      }
    }
  };

  return (
    <div
      className={
        isSidebar
          ? "flex flex-col gap-3.5 w-full relative"
          : "w-full max-w-xl mx-auto flex flex-col gap-3.5 relative"
      }
    >
      {/* Editorial Tape on top corner (Breaks the grid) */}
      {!isSidebar && (
        <MaskingTape
          width={110}
          angle={-2}
          className="absolute -top-3.5 -right-3 hidden sm:block"
        />
      )}

      {/* Metrics Bar (Landing Page Only - Print & Meter Style) */}
      {!isSidebar && (
        <div className="relative p-2 rounded-[2px] bg-[#0E0E11] border border-zinc-800 mb-1 shadow-sm font-mono">
          <CropMarkCorner position="top-left" />
          <CropMarkCorner position="top-right" />
          <CropMarkCorner position="bottom-left" />
          <CropMarkCorner position="bottom-right" />

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center justify-center p-3 bg-[#141418] border border-zinc-800/80">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">
                [LATENCY]
              </span>
              <span className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                &lt; 30s
              </span>
              <span className="text-[9px] text-zinc-500">SPEED</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-[#141418] border border-zinc-800/80">
              <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">
                [RANGE]
              </span>
              <span className="text-base sm:text-lg font-black text-blue-400 mt-0.5 tracking-tight">
                0–100
              </span>
              <span className="text-[9px] text-zinc-500">SCORE</span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-[#141418] border border-zinc-800/80">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                [VECTORS]
              </span>
              <span className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 tracking-tight">
                4 DIMS
              </span>
              <span className="text-[9px] text-zinc-500">DIAGNOSIS</span>
            </div>
          </div>
        </div>
      )}

      {/* Cold Email Input Card (Tactile Paper Dossier) */}
      <div className="relative rounded-[2px] bg-[#0F0F13] border-2 border-zinc-800 focus-within:border-zinc-500 transition shadow-md">
        <CropMarkCorner position="top-left" />
        <CropMarkCorner position="bottom-right" />

        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141418] border-b border-zinc-800 font-mono">
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-zinc-400" />
            <span className="text-[11px] font-bold text-zinc-200 tracking-wider uppercase">
              SPEC // 01 · COLD OUTREACH DRAFT
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {email.length > 0 ? (
              <span className="text-[10px] text-zinc-500 font-mono tracking-tight">
                [{wordCount} WORDS · {charCount} CHARS]
              </span>
            ) : !isSidebar ? (
              <button
                type="button"
                onClick={() => {
                  sfx.click();
                  onUseDemo();
                }}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-300 hover:text-white bg-zinc-800/90 hover:bg-zinc-700 px-2 py-0.5 border border-zinc-700 transition"
              >
                <RotateCcw size={10} />
                <span>[LOAD CASE SAMPLE]</span>
              </button>
            ) : null}
          </div>
        </div>

        <textarea
          id="cold-email-input"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={isSidebar ? 7 : 4}
          placeholder="Paste cold email draft here (subject line and message body)..."
          className="w-full px-3.5 py-3 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 resize-none focus:outline-none font-sans leading-relaxed"
        />
      </div>

      {/* Target Context Input Card */}
      <div className="relative rounded-[2px] bg-[#0F0F13] border-2 border-zinc-800 focus-within:border-zinc-500 transition shadow-md">
        <CropMarkCorner position="top-right" />
        <CropMarkCorner position="bottom-left" />

        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141418] border-b border-zinc-800 font-mono">
          <div className="flex items-center gap-2">
            <User size={12} className="text-zinc-400" />
            <span className="text-[11px] font-bold text-zinc-200 tracking-wider uppercase">
              SPEC // 02 · PROSPECT CONTEXT & ROLE
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 hidden sm:inline uppercase">
            [TITLE · COMPANY STAGE · PAIN]
          </span>
        </div>

        <textarea
          id="prospect-context-input"
          value={prospect}
          onChange={(e) => onProspectChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={isSidebar ? 3 : 2}
          placeholder="e.g. VP of Sales at Series B SaaS. 12 SDRs missing quota. Low cold email response rates."
          className="w-full px-3.5 py-2.5 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 resize-none focus:outline-none font-sans leading-relaxed"
        />
      </div>

      {/* Action Row & Tactile Button */}
      <div className="flex items-center justify-between pt-1 font-mono">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className="bg-zinc-800 px-1.5 py-0.5 border border-zinc-700 text-zinc-300">
            {isMac ? "⌘" : "CTRL"} + ENTER
          </span>
          <span className="hidden sm:inline">[EXECUTE AUTOPSY]</span>
        </div>

        {signedIn ? (
          <button
            type="button"
            onClick={() => {
              sfx.stamp();
              onAnalyze();
            }}
            disabled={!canSubmit || limitReached}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] text-xs font-mono font-bold uppercase tracking-wider transition select-none ${
              canSubmit && !limitReached
                ? "bg-white text-black hover:bg-zinc-200 border-2 border-white shadow-[3px_3px_0px_rgba(255,255,255,0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
                : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>DIAGNOSING SPECS...</span>
              </>
            ) : limitReached ? (
              <span>[QUOTA EXHAUSTED]</span>
            ) : (
              <>
                <Sparkles size={12} />
                <span>STAMP &amp; RUN DIAGNOSIS</span>
              </>
            )}
          </button>
        ) : (
          <SignInButton mode="modal" forceRedirectUrl="/">
            <button
              type="button"
              onClick={() => {
                sfx.click();
                onSignInAndAnalyze();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[2px] text-xs font-mono font-bold uppercase tracking-wider bg-white text-black hover:bg-zinc-200 border-2 border-white shadow-[3px_3px_0px_rgba(255,255,255,0.25)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition cursor-pointer"
            >
              <span>RUN FREE AUTOPSY</span>
              <ArrowRight size={12} />
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}
