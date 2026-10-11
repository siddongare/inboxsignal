import type {
  AnalysisResult,
  DiagnosisItem,
  ImpactLevel,
} from "@/lib/analysis-types";

function coerceText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function coerceSignalScore(value: unknown): number {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(num)) return 0;

  const normalized =
    num <= 10 && num > 0 ? Math.round(num * 10) : Math.round(num);

  return Math.max(0, Math.min(100, normalized));
}

function coerceImpact(value: unknown): ImpactLevel {
  const s = coerceText(value).toLowerCase();
  if (s === "low" || s === "medium" || s === "high" || s === "critical") {
    return s;
  }
  return "medium";
}

function coerceStringArray(value: unknown, maxItems = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => coerceText(item))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function extractJsonObject(content: string): string {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);

  return trimmed;
}

function normalizeDiagnosis(value: unknown): DiagnosisItem[] {
  const items = Array.isArray(value) ? value : [];
  const normalized = items
    .map((item) => {
      const r =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
      return {
        issue: coerceText(r.issue),
        impact: coerceImpact(r.impact),
        whyItMatters: coerceText(r.whyItMatters),
        fix: coerceText(r.fix),
      };
    })
    .filter((i) => i.issue && i.whyItMatters && i.fix)
    .slice(0, 6);

  const fallbacks: DiagnosisItem[] = [
    {
      issue: "No clear personalization",
      impact: "high",
      whyItMatters:
        "Generic outreach signals mass-send. Prospects assume the message is not worth reading.",
      fix: "Reference a specific company detail, role pain point, or recent trigger.",
    },
    {
      issue: "Value proposition is too vague",
      impact: "high",
      whyItMatters:
        "If the benefit is unclear the prospect cannot assess whether to invest time.",
      fix: "State the concrete problem you solve and the measurable outcome in one sentence.",
    },
    {
      issue: "Weak CTA does not create a next step",
      impact: "medium",
      whyItMatters:
        "A weak CTA makes it easy to postpone or ignore because there is no clear action to take.",
      fix: "Ask for one simple next step with a time estimate or specific framing.",
    },
  ];

  for (const fallback of fallbacks) {
    if (normalized.length >= 3) break;
    normalized.push(fallback);
  }

  return normalized;
}

export function normalizeAnalysisResponse(payload: unknown): AnalysisResult {
  const r =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const sig =
    r.signals && typeof r.signals === "object"
      ? (r.signals as Record<string, unknown>)
      : {};
  const bd =
    r.emailBreakdown && typeof r.emailBreakdown === "object"
      ? (r.emailBreakdown as Record<string, unknown>)
      : {};
  const rw =
    r.rewrite && typeof r.rewrite === "object"
      ? (r.rewrite as Record<string, unknown>)
      : {};
  const fu =
    r.followUps && typeof r.followUps === "object"
      ? (r.followUps as Record<string, unknown>)
      : {};

  return {
    diagnosis: normalizeDiagnosis(r.diagnosis),
    signals: {
      clarity: coerceSignalScore(sig.clarity),
      relevance: coerceSignalScore(sig.relevance),
      credibility: coerceSignalScore(sig.credibility),
      ctaStrength: coerceSignalScore(sig.ctaStrength),
    },
    emailBreakdown: {
      hook: coerceText(bd.hook),
      valueProp: coerceText(bd.valueProp),
      personalization: coerceText(bd.personalization),
      cta: coerceText(bd.cta),
    },
    rewrite: {
      email: coerceText(rw.email),
      subjectLines: coerceStringArray(rw.subjectLines, 4),
      whyThisWorks: coerceText(rw.whyThisWorks),
    },
    followUps: {
      day3: coerceText(fu.day3),
      day7: coerceText(fu.day7),
    },
  };
}
