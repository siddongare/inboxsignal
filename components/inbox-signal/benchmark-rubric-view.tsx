"use client";

import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  Award,
  Layers,
  ArrowRight,
} from "lucide-react";

interface BenchmarkRubricViewProps {
  onGoToStudio: () => void;
}

export function BenchmarkRubricView({ onGoToStudio }: BenchmarkRubricViewProps) {
  const rubrics = [
    {
      dimension: "Clarity & Readability",
      weight: "25%",
      benchmark: "70-85+ points",
      summary:
        "Measures how easily a busy executive can comprehend the core offer within 3 seconds of opening the email on mobile.",
      guidelines: [
        {
          tier: "86-100 (Mastery)",
          desc: "Under 120 words. 1-2 sentence paragraphs. Zero buzzwords. Reads like a note from a peer.",
        },
        {
          tier: "51-70 (Average)",
          desc: "Clear proposition but wordy (160+ words). Too many bullet points or dense paragraphs.",
        },
        {
          tier: "0-30 (Failing)",
          desc: "Wall of text, corporate jargon, unclear who the sender is or what they do.",
        },
      ],
    },
    {
      dimension: "Relevance & Targeting",
      weight: "25%",
      benchmark: "70-85+ points",
      summary:
        "Measures whether the message addresses a specific, urgent priority for the prospect's exact role and business context.",
      guidelines: [
        {
          tier: "86-100 (Mastery)",
          desc: "Tied to a concrete event (hiring surge, recent earnings call, new product launch, tech stack shift).",
        },
        {
          tier: "51-70 (Average)",
          desc: "Mentions company name and generic role responsibilities without a timely trigger.",
        },
        {
          tier: "0-30 (Failing)",
          desc: "Generic spray-and-pray. Could have been sent to an accountant or an engineering VP identically.",
        },
      ],
    },
    {
      dimension: "Credibility & Social Proof",
      weight: "25%",
      benchmark: "65-80+ points",
      summary:
        "Validates claims with verifiable proof, named peer logos, or concrete business impact metrics.",
      guidelines: [
        {
          tier: "86-100 (Mastery)",
          desc: "Specific peer logos and tangible metrics ('helped Ramp boost pipeline 42% in 45 days').",
        },
        {
          tier: "51-70 (Average)",
          desc: "Vague social proof ('we help leading companies') without customer names or verifiable stats.",
        },
        {
          tier: "0-30 (Failing)",
          desc: "Unbacked superlative claims ('the best AI platform in the world') that trigger spam filters.",
        },
      ],
    },
    {
      dimension: "Call to Action (CTA) Friction",
      weight: "25%",
      benchmark: "75-90+ points",
      summary:
        "Measures the cognitive burden and time commitment requested from the prospect in the closing ask.",
      guidelines: [
        {
          tier: "86-100 (Mastery)",
          desc: "Interest-based ask ('Open to seeing the teardown?') requiring a simple 1-word reply.",
        },
        {
          tier: "51-70 (Average)",
          desc: "Specific time ask ('Can we do 15 mins Tuesday at 2pm?') requiring calendar coordination.",
        },
        {
          tier: "0-30 (Failing)",
          desc: "High friction ask ('Book a 30-min demo on my Calendly link') or vague ('Thoughts?').",
        },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#111319]/80 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Standardization Framework
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">Signal Benchmark Rubric</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          The rigorous evaluation standard used by InboxSignal's diagnostic
          engine to grade cold emails. Built on insights from millions of B2B
          executive outbound interactions.
        </p>
      </div>

      {/* Rubric Cards */}
      <div className="space-y-4">
        {rubrics.map((r) => (
          <div
            key={r.dimension}
            className="p-6 rounded-3xl bg-[#111319]/80 border border-white/[0.08] backdrop-blur-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-white/[0.06] gap-2">
              <div>
                <h3 className="text-base font-semibold text-white">
                  {r.dimension}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{r.summary}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  Weight: {r.weight}
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  Target: {r.benchmark}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {r.guidelines.map((g, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <span
                    className={`text-xs font-mono font-semibold block mb-1.5 ${
                      idx === 0
                        ? "text-emerald-400"
                        : idx === 1
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {g.tier}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {g.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Callout */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-white">
            Ready to test your email against the standard?
          </h4>
          <p className="text-xs text-slate-300 mt-1">
            Run a diagnostic audit in the Studio to receive a mathematical
            breakdown across all 4 dimensions.
          </p>
        </div>
        <button
          onClick={onGoToStudio}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-blue-600/25 shrink-0"
        >
          <span>Launch Studio</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
