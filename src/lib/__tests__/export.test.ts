import { describe, it, expect } from "vitest";
import { formatDateForExport, formatTimeForExport } from "../export";

describe("formatDateForExport", () => {
  it("formats a Date object to localized date", () => {
    const date = new Date(2025, 5, 15);
    const result = formatDateForExport(date);
    expect(result).toContain("2025");
    expect(result.length).toBeGreaterThan(0);
  });

  it("formats a date string", () => {
    const result = formatDateForExport("2025-06-15");
    expect(result).toContain("2025");
  });
});

describe("formatTimeForExport", () => {
  it("formats time in 24h format", () => {
    const date = new Date(2025, 0, 1, 14, 30);
    expect(formatTimeForExport(date)).toBe("14:30");
  });

  it("pads single digit hours and minutes", () => {
    const date = new Date(2025, 0, 1, 9, 5);
    expect(formatTimeForExport(date)).toBe("09:05");
  });
});
