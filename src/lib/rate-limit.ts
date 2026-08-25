import { headers } from "next/headers";
import { db } from "@/lib/db";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

function checkMemoryRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}

export async function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return checkMemoryRateLimit(key, maxAttempts, windowMs);
  }

  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const rows = await db.$queryRaw<Array<{ count: number; resetAt: Date }>>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt", "updatedAt")
      VALUES (${key}, 1, ${resetAt}, ${now})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."resetAt" <= ${now} THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt}
          ELSE "RateLimit"."resetAt"
        END,
        "updatedAt" = ${now}
      RETURNING "count", "resetAt"
    `;

    const record = rows[0];
    if (!record) {
      return { allowed: false, remaining: 0, resetAt: resetAt.getTime() };
    }

    const count = Number(record.count);
    const recordResetAt = new Date(record.resetAt).getTime();
    return {
      allowed: count <= maxAttempts,
      remaining: Math.max(maxAttempts - count, 0),
      resetAt: recordResetAt,
    };
  } catch (error) {
    // Fail closed when the persistent limiter is unavailable.
    console.error("Rate limit persistence error:", error);
    return { allowed: false, remaining: 0, resetAt: resetAt.getTime() };
  }
}

export function getRateLimitKey(identifier: string, action: string): string {
  return `${action}:${identifier.toLowerCase().trim()}`;
}

export async function getRequestRateLimitKey(
  identifier: string,
  action: string
): Promise<string> {
  let ip = "unknown";
  try {
    const requestHeaders = await headers();
    const forwarded = requestHeaders.get("x-forwarded-for");
    ip = forwarded?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || ip;
  } catch {
    // Server-side jobs may not have request headers; the identifier still scopes the key.
  }

  return `${getRateLimitKey(identifier, action)}:ip:${ip}`;
}

export function clearRateLimitStore(): void {
  memoryStore.clear();
}
