import { createClient } from "@vercel/kv";
import type { AnalysisResult, SavedAnalysis } from "@/lib/analysis-types";
import { getSignalScore } from "@/lib/analysis-types";

const MAX_HISTORY_ITEMS = 50;
const memoryHistory = new Map<string, SavedAnalysis[]>();

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

function getHistoryKey(userId: string) {
  return `analysis-history:${userId}`;
}

function getTitle(email: string, prospect: string) {
  const firstLine =
    email
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean) ?? "Untitled email";
  const prospectHint = prospect.split(/[.\n]/)[0]?.trim();
  const base = firstLine.replace(/^subject:\s*/i, "").slice(0, 58);

  return prospectHint ? `${base} -> ${prospectHint.slice(0, 34)}` : base;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function readRawHistory(userId: string): Promise<SavedAnalysis[]> {
  const client = getKvClient();
  if (client) {
    try {
      const value = await client.get<SavedAnalysis[]>(getHistoryKey(userId));
      if (Array.isArray(value)) return value;
    } catch (err) {
      console.warn("History KV read failed, using memory fallback:", err);
    }
  }

  return memoryHistory.get(userId) ?? [];
}

async function writeRawHistory(userId: string, history: SavedAnalysis[]) {
  const nextHistory = history
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, MAX_HISTORY_ITEMS);

  const client = getKvClient();
  if (client) {
    try {
      await client.set(getHistoryKey(userId), nextHistory);
      return;
    } catch (err) {
      console.warn("History KV write failed, using memory fallback:", err);
    }
  }

  memoryHistory.set(userId, nextHistory);
}

export async function getAnalysisHistory(userId: string) {
  return readRawHistory(userId);
}

export async function saveAnalysis(input: {
  userId: string;
  email: string;
  prospect: string;
  result: AnalysisResult;
}) {
  const now = new Date().toISOString();
  const saved: SavedAnalysis = {
    id: createId(),
    userId: input.userId,
    title: getTitle(input.email, input.prospect),
    email: input.email,
    prospect: input.prospect,
    result: input.result,
    score: getSignalScore(input.result.signals),
    createdAt: now,
    updatedAt: now,
  };

  const history = await readRawHistory(input.userId);
  await writeRawHistory(input.userId, [saved, ...history]);

  return saved;
}

export async function updateAnalysisTitle(
  userId: string,
  analysisId: string,
  title: string,
) {
  const history = await readRawHistory(userId);
  const cleanTitle = title.trim().slice(0, 100);
  const nextHistory = history.map((item) =>
    item.id === analysisId
      ? { ...item, title: cleanTitle, updatedAt: new Date().toISOString() }
      : item,
  );

  await writeRawHistory(userId, nextHistory);
  return nextHistory.find((item) => item.id === analysisId) ?? null;
}

export async function removeAnalysis(userId: string, analysisId: string) {
  const history = await readRawHistory(userId);
  const nextHistory = history.filter((item) => item.id !== analysisId);
  await writeRawHistory(userId, nextHistory);
  return true;
}

export { removeAnalysis as deleteAnalysis };

