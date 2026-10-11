"use client";

import { useState } from "react";
import {
  FileText,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Compass,
} from "lucide-react";
import { sfx } from "./tactile-audio";

export interface SwipeTemplate {
  id: string;
  category: "enterprise" | "series-b" | "founder" | "rip-and-replace" | "trigger";
  title: string;
  targetPersona: string;
  hookAngle: string;
  email: string;
  subjectLines: string[];
  benchmarkedScore: number;
}

export const SWIPE_TEMPLATES: SwipeTemplate[] = [
  {
    id: "ramp-rip-replace",
    category: "rip-and-replace",
    title: "Competitor Rip & Replace (The Tech-Stack Teardown)",
    targetPersona: "VP of Sales / RevOps at Mid-Market SaaS (50-200 reps)",
    hookAngle: "Noticing tech stack overlap + hidden per-seat licensing drag",
    benchmarkedScore: 88,
    subjectLines: [
      "quick question on your outbound stack",
      "ramp vs zoominfo consolidation?",
      "noticed your team is scaling SDRs",
      "outbound deliverability teardown",
    ],
    email: `Hi Sarah,

Noticed you recently added 8 account executives to the team on LinkedIn.

Usually when revenue orgs scale this quickly, SDR reply rates drop because reps default to broad sequence templates while seat costs multiply.

We worked with Ramp to audit their outbound signals, lifting reply rates by 42% while pruning 2 redundant data vendors.

Would you be opposed to seeing a 3-minute teardown of what we discovered?`,
  },
  {
    id: "founder-to-founder",
    category: "founder",
    title: "Founder-to-Founder (Zero Fluff, High Context)",
    targetPersona: "B2B SaaS Founder / CEO ($1M - $10M ARR)",
    hookAngle: "Shared stage context + hyper-focused problem articulation",
    benchmarkedScore: 92,
    subjectLines: [
      "founder question on your churn delta",
      "from one founder to another: retention",
      "saw your Product Hunt launch today",
      "quick note on onboarding bottleneck",
    ],
    email: `Alex,

Loved the Product Hunt release this morning—the UI polish on the workspace view is great.

Saw you crossed 2,000 active teams. At that threshold, most founders find user drop-off spikes during the day 2-to-day 5 onboarding loop because notifications get buried.

We built an asynchronous diagnostic that caught a 19% drop-off leak for Retool during their Series A.

Open to taking a look if I send over the 2-page teardown?`,
  },
  {
    id: "hiring-trigger",
    category: "trigger",
    title: "Hiring Signal Trigger (Specific Problem Window)",
    targetPersona: "Chief Technology Officer / Head of Engineering",
    hookAngle: "Open job posting indicates immediate budget and priority",
    benchmarkedScore: 86,
    subjectLines: [
      "noticed your senior security engineer req",
      "SOC 2 compliance roadmap",
      "question on your AWS infra hire",
      "security audit ahead of your launch?",
    ],
    email: `Hey David,

Saw you just posted an opening for a Lead Infrastructure Security Engineer on Ashby.

That usually means SOC 2 Type II or enterprise procurement audits are on your Q3 roadmap, which often pulls senior engineers off core product sprints for 6+ weeks.

We helped Brex automate compliance evidence collection with zero developer interruption.

Worth a brief look at how we handled it?`,
  },
  {
    id: "enterprise-roi",
    category: "enterprise",
    title: "Enterprise Risk Mitigation (Executive Pain Framing)",
    targetPersona: "CFO / VP Finance at $50M+ Enterprise",
    hookAngle: "Budget consolidation + concrete ROI proof",
    benchmarkedScore: 89,
    subjectLines: [
      "unallocated software spend in Q4",
      "contract renewals: finance audit",
      "saving 14% on multi-cloud egress",
      "brief note on SaaS renewal drift",
    ],
    email: `Hi Marcus,

Heading into annual budget reviews, most finance leaders find that 12-18% of SaaS license expenditure goes entirely unused across remote teams.

We ran an automated audit for Snowflake that reclaimed $340k in underutilized contractor seats across 3 departments within 45 days.

Would it make sense to share the calculation framework we used?`,
  },
];

interface TemplateSwipeFileProps {
  onLoadIntoStudio: (template: SwipeTemplate) => void;
}

export function TemplateSwipeFile({ onLoadIntoStudio }: TemplateSwipeFileProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Formats" },
    { id: "rip-and-replace", label: "Rip & Replace" },
    { id: "founder", label: "Founder-to-Founder" },
    { id: "trigger", label: "Hiring Triggers" },
    { id: "enterprise", label: "Enterprise ROI" },
  ];

  const filtered =
    selectedCategory === "all"
      ? SWIPE_TEMPLATES
      : SWIPE_TEMPLATES.filter((t) => t.category === selectedCategory);

  function handleCopy(id: string, text: string) {
    sfx.click();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-[#0D0F14]/95 border border-white/[0.08] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00] shadow-[0_0_8px_#D4FF00] animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            High-Signal Outbound Vault
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Outbound Swipe File & Templates</h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xl">
          Curated battle-tested outreach frameworks benchmarked at 85+ Signal
          Scores. Load directly into the Diagnostic Studio to adapt for your
          prospects.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-5">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                sfx.click();
                setSelectedCategory(c.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-[#D4FF00] text-black shadow-[0_0_15px_rgba(212,255,0,0.3)]"
                  : "bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.06]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isCopied = copiedId === item.id;
          return (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-[#0D0F14]/95 border border-white/[0.08] hover:border-white/[0.15] transition-all backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase text-slate-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#D4FF00] bg-[#D4FF00]/10 border border-[#D4FF00]/25 px-2.5 py-0.5 rounded-full">
                    Score {item.benchmarkedScore}/100
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  <strong className="text-slate-300">Target:</strong>{" "}
                  {item.targetPersona}
                </p>

                {/* Email Body preview */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-4">
                  <p className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {item.email}
                  </p>
                </div>

                {/* Subject line chips */}
                <div className="mb-4">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1.5 uppercase">
                    Subject Angles
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.subjectLines.slice(0, 2).map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]"
                      >
                        "{s}"
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    sfx.click();
                    onLoadIntoStudio(item);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#D4FF00] hover:bg-[#e2ff33] text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_18px_rgba(212,255,0,0.25)] transition active:scale-98 cursor-pointer"
                >
                  <Sparkles size={13} />
                  <span>Load into Studio</span>
                </button>
                <button
                  onClick={() => handleCopy(item.id, item.email)}
                  className="py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-medium border border-white/[0.08] transition cursor-pointer"
                >
                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
