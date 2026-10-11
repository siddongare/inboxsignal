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
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

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
        if (signedIn) onAnalyze();
        else onSignInAndAnalyze();
      }
    }
  };

  return (
    <div
      className={
        isSidebar
          ? "flex flex-col gap-3 w-full"
          : "w-full max-w-xl mx-auto flex flex-col gap-3"
      }
    >
      {/* Metrics Bar (Landing Page Only) */}
      {!isSidebar && (
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-[#111113] border border-[#27272A] mb-2 shadow-sm">
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#18181B] border border-[#27272A]/50">
            <span className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
              &lt; 30s
            </span>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              Diagnosis Speed
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#18181B] border border-[#27272A]/50">
            <span className="font-mono text-base sm:text-lg font-bold text-blue-400 tracking-tight">
              0–100
            </span>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              Signal Score
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-[#18181B] border border-[#27272A]/50">
            <span className="font-mono text-base sm:text-lg font-bold text-emerald-400 tracking-tight">
              4 Dims
            </span>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">
              Deep Analysis
            </span>
          </div>
        </div>
      )}

      {/* Cold Email Input */}
      <div className="flex flex-col rounded-xl bg-[#111113] border border-[#27272A] focus-within:border-blue-500/80 focus-within:ring-1 focus-within:ring-blue-500/30 transition shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-1 border-b border-[#27272A]/60">
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-zinc-400" />
            <label
              htmlFor="cold-email-input"
              className="text-xs font-semibold text-zinc-200 tracking-wide"
            >
              Cold Email Copy
            </label>
          </div>

          <div className="flex items-center gap-3">
            {email.length > 0 ? (
              <span className="font-mono text-[10px] text-zinc-500">
                {wordCount} words · {charCount} chars
              </span>
            ) : !isSidebar ? (
              <button
                type="button"
                onClick={onUseDemo}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-400 hover:text-white bg-[#18181B] hover:bg-zinc-800 px-2 py-0.5 rounded border border-[#27272A] transition"
              >
                <RotateCcw size={10} />
                <span>Fill sample</span>
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
          placeholder="Paste your cold email here (subject line and email body)..."
          className="w-full px-3.5 py-2.5 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 resize-none focus:outline-none font-sans leading-relaxed"
        />
      </div>

      {/* Prospect Context Input */}
      <div className="flex flex-col rounded-xl bg-[#111113] border border-[#27272A] focus-within:border-blue-500/80 focus-within:ring-1 focus-within:ring-blue-500/30 transition shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-1 border-b border-[#27272A]/60">
          <div className="flex items-center gap-2">
            <User size={13} className="text-zinc-400" />
            <label
              htmlFor="prospect-context-input"
              className="text-xs font-semibold text-zinc-200 tracking-wide"
            >
              Target Prospect & Context
            </label>
          </div>
          <span className="text-[10px] text-zinc-500 hidden sm:inline">
            Role, company stage, target pain point
          </span>
        </div>

        <textarea
          id="prospect-context-input"
          value={prospect}
          onChange={(e) => onProspectChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={isSidebar ? 3 : 2}
          placeholder="e.g. VP Sales at Series B B2B SaaS. Hiring 3 AEs. Pain: flat outbound response rates."
          className="w-full px-3.5 py-2.5 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 resize-none focus:outline-none font-sans leading-relaxed"
        />
      </div>

      {/* Submit / Action Row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <kbd className="font-mono text-[10px] bg-[#18181B] px-1.5 py-0.5 rounded border border-[#27272A] text-zinc-400">
            {isMac ? "⌘" : "Ctrl"} + Enter
          </kbd>
          <span className="hidden sm:inline">to analyze</span>
        </div>

        {signedIn ? (
          <button
            type="button"
            onClick={onAnalyze}
            disabled={!canSubmit || limitReached}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition shadow-sm ${
              canSubmit && !limitReached
                ? "bg-blue-600 text-white hover:bg-blue-500 active:scale-95"
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Diagnosing email...</span>
              </>
            ) : limitReached ? (
              <span>Daily Limit Reached</span>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Run Signal Diagnosis</span>
              </>
            )}
          </button>
        ) : (
          <SignInButton mode="modal" forceRedirectUrl="/">
            <button
              type="button"
              onClick={onSignInAndAnalyze}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition shadow-sm"
            >
              <span>Analyze Free</span>
              <ArrowRight size={13} />
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}
