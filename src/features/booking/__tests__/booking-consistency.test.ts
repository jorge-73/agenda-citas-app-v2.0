import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: mocks.transaction,
  },
}));

vi.mock("@/lib/action-helpers", () => ({
  requirePermission: mocks.requirePermission,
  validateInput: (schema: { parse: (value: unknown) => unknown }, value: unknown) => schema.parse(value),
}));

import { cancelBookingAction, confirmBookingAction } from "../actions";

describe("booking and appointment consistency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ id: "admin-1", role: "ADMIN" });
  });

  it("creates a linked appointment before confirming a booking", async () => {
    const booking = {
      id: "booking-1",
      patientId: "patient-1",
      patientEmail: "patient@example.com",
      specialistId: "specialist-1",
      date: new Date("2026-09-01T03:00:00.000Z"),
      time: "10:00",
      reason: "Control",
      specialty: "Medicina General",
      status: "PENDING",
    };
    const tx = {
      $executeRaw: vi.fn(),
      booking: {
        findUnique: vi.fn().mockResolvedValue(booking),
        update: vi.fn().mockResolvedValue({}),
      },
      patient: {
        findUnique: vi.fn().mockResolvedValue({ id: "patient-1" }),
        findFirst: vi.fn(),
      },
      specialist: {
        findUnique: vi.fn().mockResolvedValue({ isAvailable: true, specialty: "Medicina General" }),
      },
      schedule: {
        findFirst: vi.fn().mockResolvedValue({ startTime: "09:00", endTime: "17:00" }),
      },
      blockedDate: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      appointment: {
        findUnique: vi.fn().mockResolvedValue(null),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "appointment-1" }),
      },
    };
    mocks.transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));

    const result = await confirmBookingAction("booking-1");

    expect(result).toEqual({ success: true, appointmentCreated: true });
    expect(tx.appointment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingId: "booking-1",
        patientId: "patient-1",
        specialistId: "specialist-1",
        startTime: new Date("2026-09-01T13:00:00.000Z"),
        endTime: new Date("2026-09-01T13:30:00.000Z"),
      }),
    });
    expect(tx.booking.update).toHaveBeenCalledWith({
      where: { id: "booking-1" },
      data: { status: "CONFIRMED", patientId: "patient-1" },
    });
  });

  it("cancels the linked appointment when cancelling its booking", async () => {
    const tx = {
      booking: {
        findUnique: vi.fn().mockResolvedValue({ id: "booking-1", status: "CONFIRMED" }),
        update: vi.fn().mockResolvedValue({}),
      },
      appointment: {
        findUnique: vi.fn().mockResolvedValue({ id: "appointment-1", status: "PENDING" }),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    mocks.transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));

    await expect(cancelBookingAction("booking-1")).resolves.toEqual({ success: true });
    expect(tx.appointment.update).toHaveBeenCalledWith({
      where: { id: "appointment-1" },
      data: { status: "CANCELLED" },
    });
  });
});
