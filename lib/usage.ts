import { kv } from "@vercel/kv";

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

function hasKvConfig() {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN,
  );
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

async function readUsageCount(userId: string, date: string) {
  const key = getUsageKey(userId, date);

  if (hasKvConfig()) {
    const value = await kv.get<number>(key);
    return typeof value === "number" ? value : 0;
  }

  return memoryUsage.get(key) ?? 0;
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

  if (hasKvConfig()) {
    const nextCount = await kv.incr(key);

    if (nextCount === 1) {
      await kv.expire(key, getSecondsUntilNextUtcDay());
    }

    if (nextCount > DAILY_ANALYSIS_LIMIT) {
      await kv.decr(key);

      return {
        allowed: false,
        userId,
        date,
        count: DAILY_ANALYSIS_LIMIT,
        remaining: 0,
        limit: DAILY_ANALYSIS_LIMIT,
      };
    }

    return {
      allowed: true,
      userId,
      date,
      count: nextCount,
      remaining: DAILY_ANALYSIS_LIMIT - nextCount,
      limit: DAILY_ANALYSIS_LIMIT,
    };
  }

  const currentCount = memoryUsage.get(key) ?? 0;

  if (currentCount >= DAILY_ANALYSIS_LIMIT) {
    return {
      allowed: false,
      userId,
      date,
      count: currentCount,
      remaining: 0,
      limit: DAILY_ANALYSIS_LIMIT,
    };
  }

  const nextCount = currentCount + 1;
  memoryUsage.set(key, nextCount);

  return {
    allowed: true,
    userId,
    date,
    count: nextCount,
    remaining: DAILY_ANALYSIS_LIMIT - nextCount,
    limit: DAILY_ANALYSIS_LIMIT,
  };
}
