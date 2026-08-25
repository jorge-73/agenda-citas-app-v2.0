import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, getRateLimitKey, clearRateLimitStore } from "../rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
    clearRateLimitStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first attempt", async () => {
    const result = await checkRateLimit("booking:test@example.com", 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.resetAt).toBe(Date.now() + 60_000);
  });

  it("decrements remaining on each attempt", async () => {
    await checkRateLimit("booking:a@b.com", 3, 60_000);
    const second = await checkRateLimit("booking:a@b.com", 3, 60_000);
    const third = await checkRateLimit("booking:a@b.com", 3, 60_000);
    expect(second.remaining).toBe(1);
    expect(third.remaining).toBe(0);
    expect(third.allowed).toBe(true);
  });

  it("blocks once max attempts is reached", async () => {
    const key = "booking:a@b.com";
    await checkRateLimit(key, 2, 60_000);
    await checkRateLimit(key, 2, 60_000);
    const blocked = await checkRateLimit(key, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    const key = "booking:a@b.com";
    await checkRateLimit(key, 2, 60_000);
    await checkRateLimit(key, 2, 60_000);
    expect((await checkRateLimit(key, 2, 60_000)).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);
    const after = await checkRateLimit(key, 2, 60_000);
    expect(after.allowed).toBe(true);
    expect(after.remaining).toBe(1);
  });

  it("keeps keys independent", async () => {
    await checkRateLimit("booking:a@b.com", 1, 60_000);
    expect((await checkRateLimit("booking:other@b.com", 1, 60_000)).allowed).toBe(true);
  });
});

describe("getRateLimitKey", () => {
  it("lowercases and trims the email", () => {
    expect(getRateLimitKey("  Juan@Example.COM ", "booking")).toBe(
      "booking:juan@example.com"
    );
  });
});
