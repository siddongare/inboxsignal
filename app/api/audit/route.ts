import { NextResponse } from "next/server";
import Groq from "groq-sdk";

type ImpactLevel = "low" | "medium" | "high" | "critical";

interface DiagnosisItem {
  issue: string;
  impact: ImpactLevel;
  whyItMatters: string;
  fix: string;
}

interface Signals {
  clarity: number;
  relevance: number;
  credibility: number;
  ctaStrength: number;
}

interface EmailBreakdown {
  hook: string;
  valueProp: string;
  personalization: string;
  cta: string;
}

interface RewriteSection {
  email: string;
  subjectLines: string[];
  whyThisWorks: string;
}

interface FollowUps {
  day3: string;
  day7: string;
}

interface AuditResponseData {
  diagnosis: DiagnosisItem[];
  signals: Signals;
  emailBreakdown: EmailBreakdown;
  rewrite: RewriteSection;
  followUps: FollowUps;
}

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function coerceText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Coerce a signal score to an integer in the range 0–100.
 * The AI is prompted to return 0–100, but we guard against
 * legacy 0–10 floats and out-of-range values.
 */
function coerceSignalScore(value: unknown): number {
  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  if (!Number.isFinite(num)) return 0;

  // If the model returned a 0–10 value by mistake, scale it up.
  const normalized =
    num <= 10 && num > 0 ? Math.round(num * 10) : Math.round(num);

  return Math.max(0, Math.min(100, normalized));
}

function coerceImpact(value: unknown): ImpactLevel {
  const normalized = coerceText(value).toLowerCase();
  if (
    normalized === "low" ||
    normalized === "medium" ||
    normalized === "high" ||
    normalized === "critical"
  ) {
    return normalized;
  }
  return "medium";
}

function coerceStringArray(value: unknown, maxItems = 4) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => coerceText(item))
    .filter(Boolean)
    .slice(0, maxItems);
}

function extractJsonObject(content: string) {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) return fencedMatch[1].trim();

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }
  return trimmed;
}

function normalizeDiagnosis(value: unknown): DiagnosisItem[] {
  const items = Array.isArray(value) ? value : [];
  const normalized = items
    .map((item) => {
      const record =
        item && typeof item === "object"
          ? (item as Record<string, unknown>)
          : {};
      return {
        issue: coerceText(record.issue),
        impact: coerceImpact(record.impact),
        whyItMatters: coerceText(record.whyItMatters),
        fix: coerceText(record.fix),
      };
    })
    .filter((item) => item.issue && item.whyItMatters && item.fix)
    .slice(0, 6);

  const fallbacks: DiagnosisItem[] = [
    {
      issue: "No clear personalization",
      impact: "high",
      whyItMatters:
        "Generic outreach signals mass-send. Prospects assume the message is not worth reading.",
      fix: "Reference a specific company detail, role pain point, or recent trigger from the provided context.",
    },
    {
      issue: "Value proposition is too vague",
      impact: "high",
      whyItMatters:
        "If the benefit is unclear the prospect cannot assess whether to invest time evaluating it.",
      fix: "State the concrete problem you solve and the measurable outcome in one tight sentence.",
    },
    {
      issue: "Weak CTA does not create a next step",
      impact: "medium",
      whyItMatters:
        "A weak CTA makes it easy to postpone or ignore — no clear action to take.",
      fix: "Ask for one simple next step with a time estimate or specific framing.",
    },
  ];

  for (const fallback of fallbacks) {
    if (normalized.length >= 3) break;
    normalized.push(fallback);
  }

  return normalized;
}

function normalizeAuditResponse(payload: unknown): AuditResponseData {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  const signalsRecord =
    record.signals && typeof record.signals === "object"
      ? (record.signals as Record<string, unknown>)
      : {};

  const breakdownRecord =
    record.emailBreakdown && typeof record.emailBreakdown === "object"
      ? (record.emailBreakdown as Record<string, unknown>)
      : {};

  const rewriteRecord =
    record.rewrite && typeof record.rewrite === "object"
      ? (record.rewrite as Record<string, unknown>)
      : {};

  const followUpsRecord =
    record.followUps && typeof record.followUps === "object"
      ? (record.followUps as Record<string, unknown>)
      : {};

  return {
    diagnosis: normalizeDiagnosis(record.diagnosis),
    signals: {
      clarity: coerceSignalScore(signalsRecord.clarity),
      relevance: coerceSignalScore(signalsRecord.relevance),
      credibility: coerceSignalScore(signalsRecord.credibility),
      ctaStrength: coerceSignalScore(signalsRecord.ctaStrength),
    },
    emailBreakdown: {
      hook: coerceText(breakdownRecord.hook),
      valueProp: coerceText(breakdownRecord.valueProp),
      personalization: coerceText(breakdownRecord.personalization),
      cta: coerceText(breakdownRecord.cta),
    },
    rewrite: {
      email: coerceText(rewriteRecord.email),
      subjectLines: coerceStringArray(rewriteRecord.subjectLines, 4),
      whyThisWorks: coerceText(rewriteRecord.whyThisWorks),
    },
    followUps: {
      day3: coerceText(followUpsRecord.day3),
      day7: coerceText(followUpsRecord.day7),
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, prospect } = body;

    if (!email || !prospect) {
      return NextResponse.json(
        { error: "Missing email or prospect" },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Rejection Decoder — a cold email failure diagnosis system for B2B SaaS outreach.
Your job is to diagnose WHY an email fails before suggesting any improvements.

Return ONLY valid JSON. No markdown. No commentary. No extra text.

Return this exact shape:
{
  "diagnosis": [
    {
      "issue": "short issue title",
      "impact": "low | medium | high | critical",
      "whyItMatters": "max 2 sentences explaining the failure mechanism",
      "fix": "one specific, actionable next step"
    }
  ],
  "signals": {
    "clarity": 0,
    "relevance": 0,
    "credibility": 0,
    "ctaStrength": 0
  },
  "emailBreakdown": {
    "hook": "assessment of the opening hook",
    "valueProp": "assessment of the value proposition",
    "personalization": "assessment of personalization level",
    "cta": "assessment of the call to action"
  },
  "rewrite": {
    "email": "improved email text",
    "subjectLines": ["option 1", "option 2", "option 3", "option 4"],
    "whyThisWorks": "structured explanation of the specific changes made and why each one improves reply likelihood"
  },
  "followUps": {
    "day3": "day 3 follow-up email text",
    "day7": "day 7 follow-up email text"
  }
}

SIGNAL SCORING — use a 0–100 integer scale ONLY. Never return decimals. Never return /10 values.

Score each signal according to its specific definition:

clarity (0–100): How readable and focused is the email?
  - 0–30: Confusing structure, buried message, or too long to scan.
  - 31–50: Readable but unfocused — multiple competing ideas.
  - 51–70: Clear main point but some friction in delivery.
  - 71–85: Clean, focused, easy to scan in under 10 seconds.
  - 86–100: Exceptionally tight. One clear message, zero friction.

relevance (0–100): How well does the email address this specific prospect?
  - 0–30: Entirely generic. Could be sent to anyone.
  - 31–50: Mentions role or industry but no specific context.
  - 51–70: Uses some provided context but surface-level.
  - 71–85: Clearly researched. Mentions a specific trigger or detail.
  - 86–100: Deeply personalized to a specific problem or moment.

credibility (0–100): Does the sender come across as trustworthy and worth a reply?
  - 0–30: No evidence, no specifics, sounds like a script.
  - 31–50: Credibility implied but not supported.
  - 51–70: Some specificity but claims feel generic.
  - 71–85: Concrete evidence, outcome, or reference point.
  - 86–100: Highly specific proof — named customers, metrics, or social proof.

ctaStrength (0–100): How easy is it for the prospect to take the next step?
  - 0–30: No clear ask, or the ask is too big ("let's hop on a 30-min call").
  - 31–50: Vague ask ("let me know if interested").
  - 51–70: Clear ask but framed awkwardly or with friction.
  - 71–85: Low-friction ask with a clear, specific next step.
  - 86–100: Perfect ask — specific, easy to say yes to, low commitment.

BENCHMARKS for realistic scoring:
  - Generic cold email (no personalization): clarity 45–58, relevance 20–35, credibility 15–30, ctaStrength 25–45.
  - Well-personalized email (uses context): clarity 60–72, relevance 55–70, credibility 40–60, ctaStrength 55–70.
  - Only achieve 85+ on a signal if the email demonstrates clear mastery of that dimension.

DIAGNOSIS RULES:
  - Always return at least 3 diagnosis items, ordered from highest to lowest impact.
  - Prioritize: personalization failure, value clarity, CTA weakness, credibility issues.
  - issue field must be a short noun phrase (max 8 words). Not a sentence.
  - whyItMatters must explain the failure mechanism, not just state the problem.
  - fix must be specific and immediately actionable — not "improve your CTA" but "ask for a 15-minute call on a specific day".
  - Do not hallucinate company facts not provided.
  - Do not exaggerate outcomes or invent metrics.

REWRITE RULES:
  - Rewrite must be 120–160 words max.
  - Remove filler phrases: "hope you're doing well", "quick question", "just reaching out", "I wanted to".
  - Include one specific hook grounded only in provided context.
  - No hype language. No marketing copy tone.
  - subjectLines: write 4 distinct subject lines. Each must take a clearly different approach — vary length, style, and angle. Do not write 4 versions of the same idea.
  - whyThisWorks: explain the specific structural changes made, not generic copywriting advice.
  - Follow-ups must add a genuinely new angle or piece of value. Not a repeat of the original.
  - If context is missing, acknowledge what is missing rather than fabricating.`,
        },
        {
          role: "user",
          content: JSON.stringify({ email, prospect }),
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "The audit model returned an empty response." },
        { status: 502 }
      );
    }

    const data = normalizeAuditResponse(
      JSON.parse(extractJsonObject(content))
    );

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        {
          error:
            "The audit model returned invalid JSON and could not be normalized.",
        },
        { status: 502 }
      );
    }

    const message =
      err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
