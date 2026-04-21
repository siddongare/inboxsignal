import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Rate-limit (Upstash Redis, sliding window) ───────────────────────────────
// Requires env vars: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Falls back gracefully to an in-memory Map if the env vars are absent so the
// app still works in local dev without Redis configured.

export const DAILY_ANALYSIS_LIMIT = 5;

type LimitResult = { allowed: boolean; remaining: number; limit: number };

// ── Upstash path ──────────────────────────────────────────────────────────────
let ratelimit: Ratelimit | null = null;
if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    // 5 requests per 24-hour sliding window, keyed per user ID
    limiter: Ratelimit.slidingWindow(DAILY_ANALYSIS_LIMIT, "24 h"),
    analytics: true,
    prefix: "inboxsignal:ratelimit",
  });
}

// ── In-memory fallback (dev / cold-start safe) ────────────────────────────────
interface UsageEntry {
  count: number;
  date: string; // YYYY-MM-DD
}

const usageStore = new Map<string, UsageEntry>();

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function reserveInMemory(userId: string): LimitResult {
  const today = todayKey();
  const entry = usageStore.get(userId);

  if (!entry || entry.date !== today) {
    usageStore.set(userId, { count: 1, date: today });
    return {
      allowed: true,
      remaining: DAILY_ANALYSIS_LIMIT - 1,
      limit: DAILY_ANALYSIS_LIMIT,
    };
  }

  if (entry.count >= DAILY_ANALYSIS_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_ANALYSIS_LIMIT };
  }

  entry.count += 1;
  usageStore.set(userId, entry);
  return {
    allowed: true,
    remaining: DAILY_ANALYSIS_LIMIT - entry.count,
    limit: DAILY_ANALYSIS_LIMIT,
  };
}

async function checkLimit(userId: string): Promise<LimitResult> {
  if (ratelimit) {
    const { success, remaining, limit } = await ratelimit.limit(userId);
    return { allowed: success, remaining, limit };
  }
  return reserveInMemory(userId);
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

const groqClient = new Groq({
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

  // Guard against the model returning 0–10 instead of 0–100
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

export async function POST(
  req: Request
): Promise<NextResponse<AuditApiResponse>> {
  try {
    // 1. Auth ─────────────────────────────────────────────────────────────────
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<AuditApiResponse>(
        { error: "Login required", remaining: 0, limit: DAILY_ANALYSIS_LIMIT },
        { status: 401 }
      );
    }

    // 2. Rate limit ────────────────────────────────────────────────────────────
    const usage = await checkLimit(userId);

    if (!usage.allowed) {
      return NextResponse.json<AuditApiResponse>(
        {
          error: "Daily limit reached",
          remaining: 0,
          limit: usage.limit,
        },
        { status: 429 }
      );
    }

    // 3. Parse body ────────────────────────────────────────────────────────────
    let body: { email?: unknown; prospect?: unknown };
    try {
      body = (await req.json()) as { email?: unknown; prospect?: unknown };
    } catch {
      return NextResponse.json<AuditApiResponse>(
        {
          error: "Invalid request body",
          remaining: usage.remaining,
          limit: usage.limit,
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    // 4. LLM call ──────────────────────────────────────────────────────────────
    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are InboxSignal — a cold email failure diagnosis system for B2B SaaS outreach.
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
    "whyThisWorks": "structured explanation of the specific changes made"
  },
  "followUps": {
    "day3": "day 3 follow-up email text",
    "day7": "day 7 follow-up email text"
  }
}

SIGNAL SCORING — 0–100 integers ONLY. No decimals.

clarity (0–100): Readability and focus.
  0–30: Confusing structure or too long. 31–50: Readable but unfocused.
  51–70: Clear but some friction. 71–85: Clean and scannable. 86–100: Exceptionally tight.

relevance (0–100): How well-targeted to this specific prospect.
  0–30: Generic. 31–50: Mentions role/industry only. 51–70: Surface-level context.
  71–85: Specific trigger or detail. 86–100: Deeply personalized.

credibility (0–100): Trust signals and proof.
  0–30: Sounds scripted. 31–50: Implied credibility. 51–70: Generic specificity.
  71–85: Concrete evidence. 86–100: Named customers, metrics, or social proof.

ctaStrength (0–100): Ease of next step.
  0–30: No clear ask. 31–50: Vague ("let me know"). 51–70: Clear but friction.
  71–85: Low-friction specific ask. 86–100: Easy, specific, low commitment.

BENCHMARKS:
  Generic cold email: clarity 45–58, relevance 20–35, credibility 15–30, ctaStrength 25–45.
  Well-personalized: clarity 60–72, relevance 55–70, credibility 40–60, ctaStrength 55–70.
  Only 85+ if email demonstrates clear mastery of that dimension.

DIAGNOSIS RULES:
  At least 3 items, ordered critical → low. Issue = short noun phrase (max 8 words).
  whyItMatters = failure mechanism, not just the problem. fix = immediately actionable.
  No hallucinated facts. No invented metrics.

REWRITE RULES:
  120–160 words. Remove filler phrases. One specific hook from provided context.
  No hype. 4 subject line variants with different approaches. Follow-ups add new angles.`,
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
        { status: 502 }
      );
    }

    // 5. Parse & normalise ────────────────────────────────────────────────────
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
        { status: 502 }
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
    // Detect Upstash / Redis rate-limit errors and surface the correct UI copy
    const errMsg = err instanceof Error ? err.message.toLowerCase() : "";
    if (
      errMsg.includes("ratelimit") ||
      errMsg.includes("rate limit") ||
      errMsg.includes("too many") ||
      errMsg.includes("429")
    ) {
      return NextResponse.json<AuditApiResponse>(
        { error: "Daily Limit Reached", remaining: 0, limit: DAILY_ANALYSIS_LIMIT },
        { status: 429 }
      );
    }
    return NextResponse.json<AuditApiResponse>(
      {
        error: "Server error, try again",
        remaining: 0,
        limit: DAILY_ANALYSIS_LIMIT,
      },
      { status: 500 }
    );
  }
}
