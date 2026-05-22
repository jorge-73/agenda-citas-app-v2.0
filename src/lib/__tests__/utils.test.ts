import { describe, it, expect } from "vitest";
import { cn, getInitials, formatDate, formatTime, formatDateTime } from "../utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toContain("px-4");
    expect(cn("px-4", "py-2")).toContain("py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden")).toBe("base");
  });

  it("handles undefined values", () => {
    expect(cn("px-4", undefined)).toBe("px-4");
  });

  it("resolves tailwind conflicts", () => {
    const result = cn("px-4", "px-6");
    expect(result).toBe("px-6");
  });
});

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("Juan Pérez")).toBe("JP");
  });

  it("returns single initial for one word", () => {
    expect(getInitials("Admin")).toBe("A");
  });

  it("returns first two initials for multiple names", () => {
    expect(getInitials("María José García")).toBe("MJ");
  });

  it("handles lowercase input", () => {
    expect(getInitials("juan perez")).toBe("JP");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date(2025, 0, 15);
    expect(formatDate(date)).toContain("2025");
  });

  it("formats a date string", () => {
    expect(formatDate("2025-06-15")).toContain("2025");
  });
});

describe("formatTime", () => {
  it("formats time from Date", () => {
    const date = new Date(2025, 0, 1, 14, 30);
    const result = formatTime(date);
    expect(result).toContain("30");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("formatDateTime", () => {
  it("combines date and time", () => {
    const date = new Date(2025, 0, 1, 9, 0);
    const result = formatDateTime(date);
    expect(result).toContain("2025");
    expect(result).toContain("09");
  });
});
