import { describe, it, expect } from "vitest";
import { setHours, setMinutes, startOfDay } from "date-fns";
import { timeSlotGenerator } from "../services/time-slot-generator";
import type { Schedule } from "../types";

function makeSchedule(overrides?: Partial<Schedule>): Schedule {
  return {
    id: "1",
    specialistId: "s1",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    isActive: true,
    ...overrides,
  };
}

describe("timeSlotGenerator.generateTimeSlots", () => {
  it("generates slots within schedule hours", () => {
    const date = new Date(2025, 0, 6);
    const slots = timeSlotGenerator.generateTimeSlots(date, makeSchedule(), []);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].start.getHours()).toBe(9);
    expect(slots[slots.length - 1].end.getHours()).toBe(17);
  });

  it("generates 30-minute slots by default", () => {
    const date = new Date(2025, 0, 6);
    const schedule = makeSchedule({ startTime: "09:00", endTime: "10:00" });
    const slots = timeSlotGenerator.generateTimeSlots(date, schedule, []);

    expect(slots.length).toBe(2);
    expect(slots[0].start.getMinutes()).toBe(0);
    expect(slots[1].start.getMinutes()).toBe(30);
  });

  it("marks slots as unavailable when they conflict", () => {
    const date = new Date(2025, 0, 6);
    const dayStart = startOfDay(date);
    const existing = [
      {
        startTime: setMinutes(setHours(dayStart, 9), 30),
        endTime: setMinutes(setHours(dayStart, 10), 0),
      },
    ];
    const schedule = makeSchedule({ startTime: "09:00", endTime: "11:00" });
    const slots = timeSlotGenerator.generateTimeSlots(date, schedule, existing);

    const conflictingSlot = slots.find(
      (s) => s.start.getHours() === 9 && s.start.getMinutes() === 30
    );
    expect(conflictingSlot?.available).toBe(false);

    const freeSlot = slots.find(
      (s) => s.start.getHours() === 9 && s.start.getMinutes() === 0
    );
    expect(freeSlot?.available).toBe(true);
  });
});

describe("timeSlotGenerator.hasConflict", () => {
  it("detects overlapping appointments", () => {
    const start = new Date(2025, 0, 1, 10, 0);
    const end = new Date(2025, 0, 1, 10, 30);
    const appointments = [
      { startTime: new Date(2025, 0, 1, 10, 15), endTime: new Date(2025, 0, 1, 10, 45) },
    ];

    expect(timeSlotGenerator.hasConflict(start, end, appointments)).toBe(true);
  });

  it("detects exact match conflict", () => {
    const start = new Date(2025, 0, 1, 10, 0);
    const end = new Date(2025, 0, 1, 10, 30);
    const appointments = [
      { startTime: new Date(2025, 0, 1, 10, 0), endTime: new Date(2025, 0, 1, 10, 30) },
    ];

    expect(timeSlotGenerator.hasConflict(start, end, appointments)).toBe(true);
  });

  it("returns false for non-overlapping appointments", () => {
    const start = new Date(2025, 0, 1, 10, 0);
    const end = new Date(2025, 0, 1, 10, 30);
    const appointments = [
      { startTime: new Date(2025, 0, 1, 11, 0), endTime: new Date(2025, 0, 1, 11, 30) },
    ];

    expect(timeSlotGenerator.hasConflict(start, end, appointments)).toBe(false);
  });
});

describe("timeSlotGenerator.getTimeOptions", () => {
  it("generates time options with 30-min intervals", () => {
    const options = timeSlotGenerator.getTimeOptions("09:00", "12:00", 30);
    expect(options).toEqual([
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    ]);
  });

  it("excludes the end time", () => {
    const options = timeSlotGenerator.getTimeOptions("09:00", "10:00", 30);
    expect(options).toEqual(["09:00", "09:30"]);
  });
});

describe("timeSlotGenerator.roundToNearestSlot", () => {
  it("rounds down to nearest 30 min", () => {
    const date = new Date(2025, 0, 1, 10, 14);
    const rounded = timeSlotGenerator.roundToNearestSlot(date, 30);
    expect(rounded.getMinutes()).toBe(0);
  });

  it("rounds up to nearest 30 min", () => {
    const date = new Date(2025, 0, 1, 10, 20);
    const rounded = timeSlotGenerator.roundToNearestSlot(date, 30);
    expect(rounded.getMinutes()).toBe(30);
  });

  it("leaves exact slots unchanged", () => {
    const date = new Date(2025, 0, 1, 10, 30);
    const rounded = timeSlotGenerator.roundToNearestSlot(date, 30);
    expect(rounded.getMinutes()).toBe(30);
  });
});
