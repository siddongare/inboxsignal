import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import type { AuditApiResponse } from "@/lib/analysis-types";
import {
  extractJsonObject,
  normalizeAnalysisResponse,
} from "@/lib/analysis-normalizer";
import { saveAnalysis } from "@/lib/history";
import { DAILY_ANALYSIS_LIMIT, reserveDailyUsage } from "@/lib/usage";

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const ipRateMap = new Map<string, { count: number; expiresAt: number }>();

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || now > entry.expiresAt) {
    ipRateMap.set(ip, { count: 1, expiresAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 15; // Max 15 requests per 60 seconds per IP to stop bot floods
}

function jsonResponse(body: AuditApiResponse, status = 200, cookieToken?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (cookieToken) {
    headers.set(
      "Set-Cookie",
      `inboxsignal_quota=${cookieToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
    );
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function coerceText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const SYSTEM_PROMPT = `You are InboxSignal, an executive B2B cold email failure diagnosis engine.
Your diagnostic scoring MUST be mathematically consistent and deterministic. If the same email and prospect are evaluated, your output scores must be identical.

You MUST output a single, valid JSON object. Do not wrap it in markdown code blocks. Do not add conversational text. Start your response with { and end with }.

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

SCORING RULES (0-100 integers ONLY):
Evaluate each dimension objectively according to these exact guidelines:

clarity (0-100):
- 85-95: Crisp, scannable in <5 seconds. Under 120 words. 1-2 sentence paragraphs. Zero jargon.
- 68-84: Readable but wordy (120-160 words).
- 40-67: Unfocused, dense paragraph, or slightly confusing flow.
- 0-39: Wall of text (>180 words), impenetrable corporate speak.

relevance (0-100):
- 88-96: Directly connects a specific trigger or acute pain point from the prospect profile to the core solution.
- 65-87: References prospect company stage, role, or industry, but the pain bridge is somewhat loose.
- 40-64: Surface-level mention of company name only; no clear problem alignment.
- 0-39: Generic spray-and-pray blast.

credibility (0-100):
- 88-96: Verifiable proof, concrete impact metrics, or named peer customers ("helped Ramp boost reply rate 42%").
- 60-87: Implied specificity or plausible case study narrative.
- 35-59: Vague claims without metrics ("we help sales teams scale outbound").
- 0-34: Unverified superlatives ("the #1 AI platform in the world").

ctaStrength (0-100):
- 88-98: Frictionless, interest-based ask requiring a 1-word reply ("Open to seeing the teardown?", "Worth exploring?").
- 50-70: Calendar time ask with friction ("Can we do 15 mins Tuesday at 2pm?").
- 0-49: High friction ask ("Book a 30-min demo on my Calendly link" or vague "Thoughts?").

REWRITE MANDATE:
When you write the rewrite:
1. Keep it under 110 words.
2. Directly hook the prospect's acute pain.
3. Include specific peer social proof and a verified quantitative metric.
4. End with a zero-friction interest ask.
Because this rewrite adheres to all high-signal best practices, if this exact rewrite is fed back into your diagnostic engine, it will legitimately score 88-96 across all dimensions.`;

export async function POST(req: Request): Promise<Response> {
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  if (isIpRateLimited(clientIp)) {
    return jsonResponse(
      {
        error: "Too many requests. Please wait a moment before running another diagnostic.",
        remaining: 0,
        limit: DAILY_ANALYSIS_LIMIT,
      },
      429,
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return jsonResponse(
      { error: "Login required", remaining: 0, limit: DAILY_ANALYSIS_LIMIT },
      401,
    );
  }

  let body: { email?: unknown; prospect?: unknown };
  try {
    body = (await req.json()) as { email?: unknown; prospect?: unknown };
  } catch {
    return jsonResponse(
      {
        error: "Invalid request body",
        remaining: 0,
        limit: DAILY_ANALYSIS_LIMIT,
      },
      400,
    );
  }

  const email = coerceText(body.email);
  const prospect = coerceText(body.prospect);

  if (!email || !prospect) {
    return jsonResponse(
      {
        error: "Missing email or prospect",
        remaining: 0,
        limit: DAILY_ANALYSIS_LIMIT,
      },
      400,
    );
  }

  // Military-grade input constraints to prevent token-depletion attacks
  if (email.length > 5000 || prospect.length > 2000) {
    return jsonResponse(
      {
        error: "Specimen exceeds maximum allowed character limit (5,000 for email, 2,000 for prospect)",
        remaining: 0,
        limit: DAILY_ANALYSIS_LIMIT,
      },
      400,
    );
  }

  const usage = await reserveDailyUsage(userId);

  if (!usage.allowed) {
    return jsonResponse(
      {
        error: "Daily limit reached (5 analyses per day). Quota resets at 00:00 UTC.",
        remaining: 0,
        limit: usage.limit,
      },
      429,
      usage.token,
    );
  }

  try {
    let completion;
    try {
      completion = await groqClient.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ email, prospect }) },
        ],
        temperature: 0,
        seed: 42,
        response_format: { type: "json_object" },
      });
    } catch (modelErr) {
      console.warn("Retrying with backup model openai/gpt-oss-20b", modelErr);
      completion = await groqClient.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify({ email, prospect }) },
        ],
        temperature: 0,
        seed: 42,
        response_format: { type: "json_object" },
      });
    }

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return jsonResponse(
        {
          error: "Server error, try again",
          remaining: usage.remaining,
          limit: usage.limit,
        },
        502,
      );
    }

    const parsed = JSON.parse(extractJsonObject(content));
    const data = normalizeAnalysisResponse(parsed);
    const savedAnalysis = await saveAnalysis({ userId, email, prospect, result: data });

    return jsonResponse(
      {
        success: true,
        data,
        savedAnalysis,
        remaining: usage.remaining,
        limit: usage.limit,
      },
      200,
      usage.token,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message.toLowerCase() : "";
    const isRateLimit =
      message.includes("ratelimit") ||
      message.includes("rate limit") ||
      message.includes("too many") ||
      message.includes("429");

    return jsonResponse(
      {
        error: isRateLimit ? "Service temporarily busy, please try again in a moment" : "Server error, try again",
        remaining: isRateLimit ? 0 : usage.remaining,
        limit: usage.limit,
      },
      isRateLimit ? 429 : 500,
    );
  }
}
