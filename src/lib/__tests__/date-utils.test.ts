import { describe, it, expect } from "vitest";
import {
  toUTC,
  fromUTC,
  formatInTz,
  isSameDayTz,
  zonedDateTimeToUTC,
  getZonedDayRange,
  AR_TZ,
} from "../date-utils";

describe("date-utils (America/Argentina/Buenos_Aires, UTC-3)", () => {
  it("AR_TZ is Buenos Aires", () => {
    expect(AR_TZ).toBe("America/Argentina/Buenos_Aires");
  });

  it("toUTC converts local AR wall-clock to UTC (+3h)", () => {
    const local = new Date(2024, 0, 15, 12, 0);
    const utc = toUTC(local);
    expect(utc.toISOString()).toBe("2024-01-15T15:00:00.000Z");
  });

  it("toUTC at midnight boundary", () => {
    const local = new Date(2024, 0, 16, 0, 30);
    const utc = toUTC(local);
    expect(utc.toISOString()).toBe("2024-01-16T03:30:00.000Z");
  });

  it("fromUTC converts UTC instant to AR wall-clock (-3h)", () => {
    const utc = new Date(Date.UTC(2024, 0, 15, 15, 0));
    const local = fromUTC(utc);
    expect(local.getFullYear()).toBe(2024);
    expect(local.getMonth()).toBe(0);
    expect(local.getDate()).toBe(15);
    expect(local.getHours()).toBe(12);
    expect(local.getMinutes()).toBe(0);
  });

  it("toUTC and fromUTC are inverse operations", () => {
    const utc = new Date(Date.UTC(2024, 5, 10, 8, 45));
    const roundtrip = toUTC(fromUTC(utc));
    expect(roundtrip.getTime()).toBe(utc.getTime());
  });

  it("formatInTz formats wall-clock in AR timezone", () => {
    const utc = new Date(Date.UTC(2024, 0, 15, 15, 0));
    expect(formatInTz(utc, "HH:mm")).toBe("12:00");
    expect(formatInTz(utc, "yyyy-MM-dd")).toBe("2024-01-15");
  });

  it("formatInTz uses Spanish locale", () => {
    const utc = new Date(Date.UTC(2024, 0, 15, 15, 0));
    expect(formatInTz(utc, "d 'de' MMMM")).toBe("15 de enero");
    expect(formatInTz(utc, "EEEE")).toBe("lunes");
  });

  it("formatInTz across day boundary differs from UTC", () => {
    const utc = new Date(Date.UTC(2024, 0, 15, 2, 0));
    expect(formatInTz(utc, "dd/MM/yyyy")).toBe("14/01/2024");
  });

  it("isSameDayTz considers AR day, not UTC day", () => {
    const a = new Date(Date.UTC(2024, 0, 15, 2, 0));
    const b = new Date(Date.UTC(2024, 0, 15, 1, 0));
    expect(isSameDayTz(a, b)).toBe(true);
    expect(a.toISOString().slice(0, 10)).toBe(b.toISOString().slice(0, 10));
  });

  it("isSameDayTz returns false for different AR days", () => {
    const a = new Date(Date.UTC(2024, 0, 15, 2, 0));
    const b = new Date(Date.UTC(2024, 0, 16, 2, 0));
    expect(isSameDayTz(a, b)).toBe(false);
  });

  it("isSameDayTz handles the Argentina midnight boundary", () => {
    const beforeMidnight = new Date(Date.UTC(2024, 0, 15, 2, 59));
    const afterMidnight = new Date(Date.UTC(2024, 0, 15, 3, 1));

    expect(isSameDayTz(beforeMidnight, afterMidnight)).toBe(false);
  });

  it("converts explicit wall-clock booking times without depending on server timezone", () => {
    const utc = zonedDateTimeToUTC("2024-01-15", "10:30");
    expect(utc.toISOString()).toBe("2024-01-15T13:30:00.000Z");
  });

  it("builds UTC day boundaries from an Argentina calendar day", () => {
    const { start, end } = getZonedDayRange(new Date(Date.UTC(2024, 0, 15, 13, 30)));

    expect(start.toISOString()).toBe("2024-01-15T03:00:00.000Z");
    expect(end.toISOString()).toBe("2024-01-16T02:59:59.999Z");
  });

  it("toUTC with explicit timezone param", () => {
    const local = new Date(2024, 0, 15, 12, 0);
    const utc = toUTC(local, "America/Santiago");
    expect(utc.toISOString()).toBe("2024-01-15T15:00:00.000Z");
  });
});
