import { describe, it, expect } from "vitest";
import {
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_COLORS_HEX,
  APPOINTMENT_STATUS_LABELS,
  DAY_OF_WEEK_LABELS,
  DEFAULT_APPOINTMENT_DURATION,
} from "../types";

describe("APPOINTMENT_STATUS_COLORS", () => {
  it("covers all statuses", () => {
    expect(Object.keys(APPOINTMENT_STATUS_COLORS)).toEqual([
      "PENDING",
      "CONFIRMED",
      "CANCELLED",
      "COMPLETED",
      "ABSENT",
    ]);
  });

  it("uses CSS variable format", () => {
    for (const color of Object.values(APPOINTMENT_STATUS_COLORS)) {
      expect(color).toMatch(/^var\(--status-/);
    }
  });

  it("all hex colors are valid in the HEX variant", () => {
    for (const color of Object.values(APPOINTMENT_STATUS_COLORS_HEX)) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});

describe("APPOINTMENT_STATUS_LABELS", () => {
  it("covers all statuses", () => {
    expect(Object.keys(APPOINTMENT_STATUS_LABELS).length).toBe(5);
  });

  it("all labels are non-empty strings", () => {
    for (const label of Object.values(APPOINTMENT_STATUS_LABELS)) {
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe("DAY_OF_WEEK_LABELS", () => {
  it("covers all 7 days (0-6)", () => {
    expect(Object.keys(DAY_OF_WEEK_LABELS).length).toBe(7);
  });

  it("starts with Domingo", () => {
    expect(DAY_OF_WEEK_LABELS[0]).toBe("Domingo");
  });

  it("ends with Sábado", () => {
    expect(DAY_OF_WEEK_LABELS[6]).toBe("Sábado");
  });
});

describe("DEFAULT_APPOINTMENT_DURATION", () => {
  it("is 30 minutes", () => {
    expect(DEFAULT_APPOINTMENT_DURATION).toBe(30);
  });
});
