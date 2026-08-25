import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  appointmentFindFirst: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    appointment: {
      findFirst: mocks.appointmentFindFirst,
    },
    $transaction: mocks.transaction,
  },
}));

import { appointmentService } from "../appointment-service";

describe("appointmentService conflict protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects any overlapping appointment interval", async () => {
    mocks.appointmentFindFirst.mockResolvedValue({ id: "existing" });
    const start = new Date("2026-09-01T13:00:00.000Z");
    const end = new Date("2026-09-01T13:30:00.000Z");

    await expect(appointmentService.checkConflict("specialist-1", start, end)).resolves.toBe(true);
    expect(mocks.appointmentFindFirst).toHaveBeenCalledWith({
      where: {
        id: undefined,
        specialistId: "specialist-1",
        status: { not: "CANCELLED" },
        startTime: { lt: end },
        endTime: { gt: start },
      },
      select: { id: true },
    });
  });

  it("rejects a new appointment when the slot is already occupied", async () => {
    const tx = {
      $executeRaw: vi.fn(),
      appointment: {
        findFirst: vi.fn().mockResolvedValue({ id: "existing" }),
        create: vi.fn(),
      },
      booking: {
        findFirst: vi.fn(),
      },
    };
    mocks.transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));

    await expect(
      appointmentService.create({
        patientId: "patient-1",
        specialistId: "specialist-1",
        startTime: new Date("2026-09-01T13:00:00.000Z"),
        endTime: new Date("2026-09-01T13:30:00.000Z"),
      })
    ).rejects.toThrow("Ya existe una cita en este horario");
    expect(tx.appointment.create).not.toHaveBeenCalled();
  });

  it("rejects a new appointment when a pending booking owns the slot", async () => {
    const tx = {
      $executeRaw: vi.fn(),
      appointment: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
      },
      booking: {
        findFirst: vi.fn().mockResolvedValue({ id: "booking-1" }),
      },
    };
    mocks.transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));

    await expect(
      appointmentService.create({
        patientId: "patient-1",
        specialistId: "specialist-1",
        startTime: new Date("2026-09-01T13:00:00.000Z"),
        endTime: new Date("2026-09-01T13:30:00.000Z"),
      })
    ).rejects.toThrow("Ya existe una reserva en este horario");
    expect(tx.appointment.create).not.toHaveBeenCalled();
  });

  it("cancels the linked booking with a linked appointment", async () => {
    const tx = {
      appointment: {
        findUnique: vi.fn().mockResolvedValue({
          id: "appointment-1",
          bookingId: "booking-1",
          status: "CONFIRMED",
        }),
        update: vi.fn().mockResolvedValue({ id: "appointment-1", status: "CANCELLED" }),
      },
      booking: {
        update: vi.fn().mockResolvedValue({}),
      },
    };
    mocks.transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));

    await appointmentService.cancel("appointment-1");

    expect(tx.booking.update).toHaveBeenCalledWith({
      where: { id: "booking-1" },
      data: { status: "CANCELLED" },
    });
  });
});
