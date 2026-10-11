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
        sfx.click();
        if (signedIn) onAnalyze();
        else onSignInAndAnalyze();
      }
    }
  };

  return (
    <div
      className={
        isSidebar
          ? "flex flex-col gap-3.5 w-full"
          : "w-full max-w-xl mx-auto flex flex-col gap-3.5"
      }
    >
      {/* Haute Architecture Metrics Bar (Electric Acid Lime & Carbon Glass) */}
      {!isSidebar && (
        <div className="grid grid-cols-3 gap-2.5 p-1.5 rounded-2xl bg-[#0D0F14]/95 border border-white/[0.08] backdrop-blur-2xl mb-1 shadow-2xl">
          <div className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
              &lt; 30s
            </span>
            <span className="text-[10px] font-mono font-medium text-slate-400 tracking-wider mt-0.5 uppercase">
              Latency
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-[#D4FF00]/[0.08] border border-[#D4FF00]/[0.25]">
            <span className="font-mono text-base sm:text-lg font-bold text-[#D4FF00] tracking-tight">
              0–100
            </span>
            <span className="text-[10px] font-mono font-medium text-[#D4FF00]/80 tracking-wider mt-0.5 uppercase">
              Signal Index
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="font-mono text-base sm:text-lg font-bold text-emerald-300 tracking-tight">
              4 Vectors
            </span>
            <span className="text-[10px] font-mono font-medium text-emerald-200/80 tracking-wider mt-0.5 uppercase">
              Forensics
            </span>
          </div>
        </div>
      )}

      {/* Cold Email Input Card (Refined Glassmorphism) */}
      <div className="relative rounded-2xl bg-[#0D0F14]/95 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-[#D4FF00]/60 focus-within:ring-2 focus-within:ring-[#D4FF00]/15 transition-all shadow-xl overflow-hidden backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Mail size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-200 tracking-tight">
              Cold Email Draft
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {email.length > 0 ? (
              <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.06]">
                {wordCount} words · {charCount} chars
              </span>
            ) : !isSidebar ? (
              <button
                type="button"
                onPointerDown={() => sfx.click()}
                onClick={onUseDemo}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] px-2.5 py-1 rounded-full border border-white/[0.08] transition active:scale-[0.96] cursor-pointer"
              >
                <RotateCcw size={11} />
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
          placeholder="Paste your cold outreach copy here (subject line and message body)..."
          className="w-full px-4 py-3 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none font-sans leading-relaxed"
        />
      </div>

      {/* Target Prospect & Context Input Card */}
      <div className="relative rounded-2xl bg-[#0D0F14]/95 border border-white/[0.08] hover:border-white/[0.14] focus-within:border-[#D4FF00]/60 focus-within:ring-2 focus-within:ring-[#D4FF00]/15 transition-all shadow-xl overflow-hidden backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <User size={13} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-200 tracking-tight">
              Target Prospect Profile
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Role, company stage &amp; acute pain
          </span>
        </div>

        <textarea
          id="prospect-context-input"
          value={prospect}
          onChange={(e) => onProspectChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={isSidebar ? 3 : 2}
          placeholder="e.g. VP Sales at Series B SaaS. 12 SDRs missing quota. Low cold email response rates."
          className="w-full px-4 py-3 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 resize-none focus:outline-none font-sans leading-relaxed"
        />
      </div>

      {/* Action Row & Electric Acid Lime Primary Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <kbd className="font-mono text-[10px] bg-white/[0.05] px-2 py-0.5 rounded-md border border-white/[0.08] text-slate-300">
            {isMac ? "⌘" : "Ctrl"} + Enter
          </kbd>
          <span className="hidden sm:inline">to diagnose</span>
        </div>

        {signedIn ? (
          <button
            type="button"
            onPointerDown={() => {
              if (canSubmit && !limitReached) sfx.click();
            }}
            onClick={onAnalyze}
            disabled={!canSubmit || limitReached}
            className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md select-none ${
              canSubmit && !limitReached
                ? "bg-[#D4FF00] text-black hover:bg-[#e2ff33] shadow-[0_0_22px_rgba(212,255,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(212,255,0,0.45)] active:scale-[0.96] cursor-pointer"
                : "bg-[#141720] text-slate-500 border border-white/[0.06] cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin text-black" />
                <span>Dissecting vector...</span>
              </>
            ) : limitReached ? (
              <span>Daily Limit Reached</span>
            ) : (
              <>
                <Sparkles size={13} className="text-black" />
                <span>Run Diagnostic Dissection</span>
              </>
            )}
          </button>
        ) : (
          <SignInButton mode="modal" forceRedirectUrl="/">
            <button
              type="button"
              onPointerDown={() => sfx.click()}
              onClick={onSignInAndAnalyze}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#D4FF00] text-black hover:bg-[#e2ff33] shadow-[0_0_22px_rgba(212,255,0,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(212,255,0,0.45)] active:scale-[0.96] transition-all cursor-pointer"
            >
              <span>Dissect Specimen Free</span>
              <ArrowRight size={13} />
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}
