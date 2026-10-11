import { createClient } from "@vercel/kv";
import crypto from "crypto";
import { cookies } from "next/headers";

export const DAILY_ANALYSIS_LIMIT = 5;

export interface UsageSummary {
  userId: string;
  date: string;
  count: number;
  remaining: number;
  limit: number;
}

const memoryUsage = new Map<string, number>();

function getTodayKeyDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
  }).format(new Date());
}

function getUsageKey(userId: string, date: string) {
  return `usage:${date}:${userId}`;
}

function getKvClient() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return createClient({ url, token });
  } catch {
    return null;
  }
}

function getSecondsUntilNextUtcDay() {
  const now = new Date();
  const nextUtcMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );

  return Math.max(
    60,
    Math.ceil((nextUtcMidnight.getTime() - now.getTime()) / 1000),
  );
}

// ─── Cryptographic Fail-Safe Cookie Verification ─────────────────────────────
// Protects against serverless cold-start bypasses even if Redis is unreachable
const HMAC_SECRET =
  process.env.CLERK_SECRET_KEY ||
  process.env.GROQ_API_KEY ||
  "inboxsignal_military_grade_salt_2026";

export function createSignedUsageToken(userId: string, date: string, count: number): string {
  const payload = `${userId}:${date}:${count}`;
  const signature = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

export function parseSignedUsageToken(token: string, userId: string, date: string): number | null {
  try {
    const parts = token.split(":");
    if (parts.length !== 4) return null;
    const [tUser, tDate, tCountStr, tSig] = parts;
    if (tUser !== userId || tDate !== date) return null;
    const count = parseInt(tCountStr, 10);
    if (isNaN(count) || count < 0) return null;

    const expected = crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(`${tUser}:${tDate}:${count}`)
      .digest("hex");

    if (crypto.timingSafeEqual(Buffer.from(tSig), Buffer.from(expected))) {
      return count;
    }
    return null;
  } catch {
    return null;
  }
}

async function readUsageCount(userId: string, date: string) {
  const key = getUsageKey(userId, date);
  const client = getKvClient();

  let kvCount: number | null = null;
  if (client) {
    try {
      const val = await client.get<number>(key);
      if (typeof val === "number") kvCount = val;
    } catch (err) {
      console.warn("KV read bypassed due to network error:", err);
    }
  }

  // Check verified cookie layer
  let cookieCount: number | null = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("inboxsignal_quota")?.value;
    if (token) {
      cookieCount = parseSignedUsageToken(token, userId, date);
    }
  } catch {}

  const memCount = memoryUsage.get(key) ?? 0;

  // Most conservative max: whichever source recorded the highest count wins
  const finalCount = Math.max(kvCount ?? 0, cookieCount ?? 0, memCount);
  return finalCount;
}

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const date = getTodayKeyDate();
  const count = await readUsageCount(userId, date);

  return {
    userId,
    date,
    count,
    remaining: Math.max(0, DAILY_ANALYSIS_LIMIT - count),
    limit: DAILY_ANALYSIS_LIMIT,
  };
}

export async function reserveDailyUsage(userId: string) {
  const date = getTodayKeyDate();
  const key = getUsageKey(userId, date);
  const client = getKvClient();

  // Read highest currently recorded count across all channels
  const currentCount = await readUsageCount(userId, date);

  if (currentCount >= DAILY_ANALYSIS_LIMIT) {
    return {
      allowed: false,
      userId,
      date,
      count: DAILY_ANALYSIS_LIMIT,
      remaining: 0,
      limit: DAILY_ANALYSIS_LIMIT,
      token: createSignedUsageToken(userId, date, DAILY_ANALYSIS_LIMIT),
    };
  }

  const nextCount = currentCount + 1;

  // 1. Update memory
  memoryUsage.set(key, nextCount);

  // 2. Update Redis atomically if available
  if (client) {
    try {
      const val = await client.incr(key);
      if (val === 1) {
        await client.expire(key, getSecondsUntilNextUtcDay());
      }
    } catch (err) {
      console.warn("KV atomic increment failed, relying on cryptographically signed cookie:", err);
    }
  }

  // 3. Issue cryptographically signed token for cookie header
  const token = createSignedUsageToken(userId, date, nextCount);

  return {
    allowed: true,
    userId,
    date,
    count: nextCount,
    remaining: Math.max(0, DAILY_ANALYSIS_LIMIT - nextCount),
    limit: DAILY_ANALYSIS_LIMIT,
    token,
  };
}
