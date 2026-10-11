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

function jsonResponse(body: AuditApiResponse, status = 200) {
  return Response.json(body, { status });
}

function coerceText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

const SYSTEM_PROMPT = `You are InboxSignal, a cold email failure diagnosis system for B2B SaaS outreach.
Your job is to diagnose WHY an email fails before suggesting any improvements.

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

SIGNAL SCORING: 0-100 integers ONLY. No decimals.

clarity (0-100): Readability and focus.
  0-30: Confusing structure or too long. 31-50: Readable but unfocused.
  51-70: Clear but some friction. 71-85: Clean and scannable. 86-100: Exceptionally tight.

relevance (0-100): How well-targeted to this specific prospect.
  0-30: Generic. 31-50: Mentions role/industry only. 51-70: Surface-level context.
  71-85: Specific trigger or detail. 86-100: Deeply personalized.

credibility (0-100): Trust signals and proof.
  0-30: Sounds scripted. 31-50: Implied credibility. 51-70: Generic specificity.
  71-85: Concrete evidence. 86-100: Named customers, metrics, or social proof.

ctaStrength (0-100): Ease of next step.
  0-30: No clear ask. 31-50: Vague ("let me know"). 51-70: Clear but friction.
  71-85: Low-friction specific ask. 86-100: Easy, specific, low commitment.

BENCHMARKS:
  Generic cold email: clarity 45-58, relevance 20-35, credibility 15-30, ctaStrength 25-45.
  Well-personalized: clarity 60-72, relevance 55-70, credibility 40-60, ctaStrength 55-70.
  Only 85+ if email demonstrates clear mastery of that dimension.
  SCORING ANCHOR: Start every dimension at 50 points. Add or subtract points strictly based on the rubric above. Do not guess. Calculate.

DIAGNOSIS RULES:
  At least 3 items, ordered critical to low. Issue = short noun phrase (max 8 words).
  whyItMatters = failure mechanism, not just the problem. fix = immediately actionable.
  No hallucinated facts. No invented metrics.

REWRITE RULES:
  120-160 words. Remove filler phrases. One specific hook from provided context.
  No hype. 4 subject line variants with different approaches. Follow-ups add new angles.`;

export async function POST(req: Request): Promise<Response> {
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

  const usage = await reserveDailyUsage(userId);

  if (!usage.allowed) {
    return jsonResponse(
      {
        error: "Daily limit reached",
        remaining: 0,
        limit: usage.limit,
      },
      429,
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
        temperature: 0.1,
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
        temperature: 0.1,
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

    return jsonResponse({
      success: true,
      data,
      savedAnalysis,
      remaining: usage.remaining,
      limit: usage.limit,
    });
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
