import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// ─── Usage limit (in-memory, per-process) ─────────────────────────────────────
// NOTE: In a serverless environment each cold start gets a fresh Map. For
// production persistence, replace this with a Redis or KV store. For a
// portfolio / MVP this is sufficient and matches the stated requirement of
// a "simple in-memory store".

export const DAILY_ANALYSIS_LIMIT = 5;

interface UsageEntry {
  count: number;
  date: string; // YYYY-MM-DD
}

const usageStore = new Map<string, UsageEntry>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function reserveDailyUsage(userId: string): {
  allowed: boolean;
  remaining: number;
  limit: number;
} {
  const today = todayKey();
  const entry = usageStore.get(userId);

  // New day or first ever — reset counter
  if (!entry || entry.date !== today) {
    usageStore.set(userId, { count: 1, date: today });
    return { allowed: true, remaining: DAILY_ANALYSIS_LIMIT - 1, limit: DAILY_ANALYSIS_LIMIT };
  }

  // Already at limit
  if (entry.count >= DAILY_ANALYSIS_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_ANALYSIS_LIMIT };
  }

  // Increment
  entry.count += 1;
  usageStore.set(userId, entry);
  return {
    allowed: true,
    remaining: DAILY_ANALYSIS_LIMIT - entry.count,
    limit: DAILY_ANALYSIS_LIMIT,
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface AuditApiResponse {
  success?: boolean;
  data?: AuditResponseData;
  error?: string;
  remaining: number;
  limit: number;
}

// ─── Groq client ──────────────────────────────────────────────────────────────

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Normalisation helpers ────────────────────────────────────────────────────

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

  // Guard against the model accidentally returning 0–10 instead of 0–100
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

function extractJsonObject(content: string): string {
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

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<NextResponse<AuditApiResponse>> {
  // Outer try/catch guarantees we NEVER return HTML — always JSON.
  try {
    // ── 1. Auth check ────────────────────────────────────────────────────────
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<AuditApiResponse>(
        { error: "Login required", remaining: 0, limit: DAILY_ANALYSIS_LIMIT },
        { status: 401 },
      );
    }

    // ── 2. Usage check ───────────────────────────────────────────────────────
    const usage = reserveDailyUsage(userId);

    if (!usage.allowed) {
      return NextResponse.json<AuditApiResponse>(
        { error: "Daily limit reached", remaining: 0, limit: usage.limit },
        { status: 429 },
      );
    }

    // ── 3. Parse request body ─────────────────────────────────────────────────
    let body: { email?: unknown; prospect?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json<AuditApiResponse>(
        {
          error: "Server error, try again",
          remaining: usage.remaining,
          limit: usage.limit,
        },
        { status: 400 },
      );
    }

    const { email, prospect } = body;

    if (!email || !prospect) {
      return NextResponse.json<AuditApiResponse>(
        {
          error: "Missing email or prospect",
          remaining: usage.remaining,
          limit: usage.limit,
        },
        { status: 400 },
      );
    }

    // ── 4. LLM call ───────────────────────────────────────────────────────────
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
  - 0–30: No clear ask, or the ask is too big.
  - 31–50: Vague ask ("let me know if interested").
  - 51–70: Clear ask but framed awkwardly or with friction.
  - 71–85: Low-friction ask with a clear, specific next step.
  - 86–100: Perfect ask — specific, easy to say yes to, low commitment.

BENCHMARKS:
  - Generic cold email: clarity 45–58, relevance 20–35, credibility 15–30, ctaStrength 25–45.
  - Well-personalized email: clarity 60–72, relevance 55–70, credibility 40–60, ctaStrength 55–70.
  - Only achieve 85+ if the email demonstrates clear mastery of that dimension.

DIAGNOSIS RULES:
  - Always return at least 3 diagnosis items, ordered from highest to lowest impact.
  - issue field must be a short noun phrase (max 8 words). Not a sentence.
  - whyItMatters must explain the failure mechanism, not just state the problem.
  - fix must be specific and immediately actionable.
  - Do not hallucinate company facts not provided.
  - Do not exaggerate outcomes or invent metrics.

REWRITE RULES:
  - 120–160 words max.
  - Remove filler: "hope you're doing well", "quick question", "just reaching out", "I wanted to".
  - Include one specific hook grounded only in provided context.
  - No hype language. No marketing copy tone.
  - subjectLines: 4 distinct lines with clearly different approaches.
  - whyThisWorks: explain specific structural changes made.
  - Follow-ups must add a genuinely new angle. Not a repeat.`,
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
      return NextResponse.json<AuditApiResponse>(
        {
          error: "Server error, try again",
          remaining: usage.remaining,
          limit: usage.limit,
        },
        { status: 502 },
      );
    }

    // ── 5. Parse and normalise LLM output ─────────────────────────────────────
    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJsonObject(content));
    } catch {
      return NextResponse.json<AuditApiResponse>(
        {
          error: "Server error, try again",
          remaining: usage.remaining,
          limit: usage.limit,
        },
        { status: 502 },
      );
    }

    const data = normalizeAuditResponse(parsed);

    return NextResponse.json<AuditApiResponse>({
      success: true,
      data,
      remaining: usage.remaining,
      limit: usage.limit,
    });

  } catch (err: unknown) {
    // Last-resort catch — ensures we always return JSON, never an HTML error page.
    const message = err instanceof Error ? err.message : "Server error, try again";
    return NextResponse.json<AuditApiResponse>(
      {
        error: "Server error, try again",
        remaining: 0,
        limit: DAILY_ANALYSIS_LIMIT,
      },
      { status: 500 },
    );
    void message; // suppress unused variable warning
  }
}
