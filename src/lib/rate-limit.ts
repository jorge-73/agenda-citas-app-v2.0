interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

const CLEANUP_INTERVAL = 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 60_000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}

export function getRateLimitKey(email: string, action: string): string {
  return `${action}:${email.toLowerCase().trim()}`;
}
