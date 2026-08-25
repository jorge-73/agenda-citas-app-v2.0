import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilters,
  AppointmentStatus,
} from "../types";
import { MAX_LIMIT } from "@/lib/constants";
import { AR_TZ, formatInTz, getZonedDayRange } from "@/lib/date-utils";
import { contactUserSelect } from "@/lib/prisma-selects";
import { lockAppointmentSlot } from "@/lib/slot-lock";

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "ABSENT", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
  ABSENT: [],
};

const appointmentDetailsInclude = {
  patient: {
    include: {
      user: { select: contactUserSelect },
    },
  },
  specialist: {
    include: {
      user: { select: contactUserSelect },
    },
  },
} as const;

function validateTransition(from: AppointmentStatus, to: AppointmentStatus): void {
  if (from === to) return;
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed?.includes(to)) {
    throw new Error(`No se puede cambiar el estado de "${from}" a "${to}".`);
  }
}

async function syncLinkedBooking(
  tx: Prisma.TransactionClient,
  current: { bookingId: string | null },
  data: {
    patientId?: string;
    specialistId?: string;
    startTime?: Date;
    reason?: string | null;
    status?: AppointmentStatus;
  }
) {
  if (!current.bookingId) return;

  const bookingData: Prisma.BookingUpdateInput = {};
  if (data.patientId !== undefined) bookingData.patientId = data.patientId;
  if (data.reason !== undefined) bookingData.reason = data.reason;
  if (data.startTime) {
    const { start } = getZonedDayRange(data.startTime, AR_TZ);
    bookingData.date = start;
    bookingData.time = formatInTz(data.startTime, "HH:mm", AR_TZ);
  }
  if (data.specialistId) {
    const specialist = await tx.specialist.findUnique({
      where: { id: data.specialistId },
      select: { specialty: true },
    });
    if (!specialist) throw new Error("Especialista no encontrado");
    bookingData.specialistId = data.specialistId;
    bookingData.specialty = specialist.specialty;
  }
  if (data.status === "CANCELLED") bookingData.status = "CANCELLED";
  if (data.status === "CONFIRMED") bookingData.status = "CONFIRMED";

  if (Object.keys(bookingData).length > 0) {
    await tx.booking.update({
      where: { id: current.bookingId },
      data: bookingData,
    });
  }
}

function getOverlapWhere(
  specialistId: string,
  startTime: Date,
  endTime: Date,
  excludeId?: string
): Prisma.AppointmentWhereInput {
  return {
    id: excludeId ? { not: excludeId } : undefined,
    specialistId,
    status: { not: "CANCELLED" },
    startTime: { lt: endTime },
    endTime: { gt: startTime },
  };
}

export const appointmentService = {
  async create(input: CreateAppointmentInput) {
    return db.$transaction(async (tx) => {
      await lockAppointmentSlot(tx, input.specialistId, input.startTime);

      const conflict = await this.checkConflictTx(
        tx,
        input.specialistId,
        input.startTime,
        input.endTime
      );
      if (conflict) throw new Error("Ya existe una cita en este horario");

      const bookingConflict = await this.checkBookingConflictTx(
        tx,
        input.specialistId,
        input.startTime
      );
      if (bookingConflict) throw new Error("Ya existe una reserva en este horario");

      return tx.appointment.create({
        data: {
          patientId: input.patientId,
          specialistId: input.specialistId,
          startTime: input.startTime,
          endTime: input.endTime,
          reason: input.reason,
          notes: input.notes,
          status: "PENDING",
        },
        include: appointmentDetailsInclude,
      });
    }, { isolationLevel: "Serializable" });
  },

  async update(input: UpdateAppointmentInput) {
    return db.$transaction(async (tx) => {
      const { id, ...data } = input;
      const current = await tx.appointment.findUnique({ where: { id } });
      if (!current) throw new Error("Cita no encontrada");

      if (data.startTime || data.endTime || data.specialistId) {
        const nextStartTime = data.startTime || current.startTime;
        const nextEndTime = data.endTime || current.endTime;
        const nextSpecialistId = data.specialistId || current.specialistId;
        if (nextEndTime <= nextStartTime) {
          throw new Error("La fecha de fin debe ser posterior a la de inicio");
        }

        await lockAppointmentSlot(tx, nextSpecialistId, nextStartTime);

        const conflict = await this.checkConflictTx(
          tx,
          nextSpecialistId,
          nextStartTime,
          nextEndTime,
          id
        );
        if (conflict) throw new Error("Ya existe una cita en este horario");

        const bookingConflict = await this.checkBookingConflictTx(
          tx,
          nextSpecialistId,
          nextStartTime,
          current.bookingId || undefined
        );
        if (bookingConflict) throw new Error("Ya existe una reserva en este horario");
      }

      if (data.status) {
        validateTransition(current.status as AppointmentStatus, data.status);
      }

      await syncLinkedBooking(tx, current, data);

      return tx.appointment.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: appointmentDetailsInclude,
      });
    }, { isolationLevel: "Serializable" });
  },

  async cancel(id: string) {
    return db.$transaction(async (tx) => {
      const current = await tx.appointment.findUnique({ where: { id } });
      if (!current) throw new Error("Cita no encontrada");

      validateTransition(current.status as AppointmentStatus, "CANCELLED");

      await syncLinkedBooking(tx, current, { status: "CANCELLED" });

      return tx.appointment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
        include: appointmentDetailsInclude,
      });
    }, { isolationLevel: "Serializable" });
  },

  async reschedule(id: string, startTime: Date, endTime: Date) {
    return db.$transaction(async (tx) => {
      const current = await tx.appointment.findUnique({ where: { id } });
      if (!current) throw new Error("Cita no encontrada");

      const nonReschedulable: AppointmentStatus[] = ["CANCELLED", "COMPLETED", "ABSENT"];
      if (nonReschedulable.includes(current.status as AppointmentStatus)) {
        throw new Error("No se puede reagendar una cita cancelada, finalizada o con ausencia");
      }
      if (endTime <= startTime) {
        throw new Error("La fecha de fin debe ser posterior a la de inicio");
      }

      await lockAppointmentSlot(tx, current.specialistId, startTime);
      const conflict = await this.checkConflictTx(
        tx,
        current.specialistId,
        startTime,
        endTime,
        id
      );
      if (conflict) throw new Error("Ya existe una cita en este horario");

      const bookingConflict = await this.checkBookingConflictTx(
        tx,
        current.specialistId,
        startTime,
        current.bookingId || undefined
      );
      if (bookingConflict) throw new Error("Ya existe una reserva en este horario");

      await syncLinkedBooking(tx, current, { startTime });

      return tx.appointment.update({
        where: { id },
        data: {
          startTime,
          endTime,
          updatedAt: new Date(),
        },
        include: appointmentDetailsInclude,
      });
    }, { isolationLevel: "Serializable" });
  },

  async checkConflictTx(
    tx: Prisma.TransactionClient,
    specialistId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) {
    return tx.appointment.findFirst({
      where: getOverlapWhere(specialistId, startTime, endTime, excludeId),
      select: { id: true },
    });
  },

  async checkBookingConflictTx(
    tx: Prisma.TransactionClient,
    specialistId: string,
    startTime: Date,
    excludeBookingId?: string
  ) {
    const { start, end } = getZonedDayRange(startTime, AR_TZ);
    return tx.booking.findFirst({
      where: {
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        specialistId,
        date: { gte: start, lte: end },
        time: formatInTz(startTime, "HH:mm", AR_TZ),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { id: true },
    });
  },

  async checkConflict(
    specialistId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) {
    const overlapping = await db.appointment.findFirst({
      where: getOverlapWhere(specialistId, startTime, endTime, excludeId),
      select: { id: true },
    });

    return overlapping !== null;
  },

  async getById(id: string) {
    return db.appointment.findUnique({
      where: { id },
      include: appointmentDetailsInclude,
    });
  },

  async getByDateRange(startDate: Date, endDate: Date, filters?: AppointmentFilters) {
    const where: Prisma.AppointmentWhereInput = {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters?.specialistId) where.specialistId = filters.specialistId;
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.status) where.status = filters.status;

    return db.appointment.findMany({
      where,
      include: appointmentDetailsInclude,
      orderBy: { startTime: "asc" },
      take: MAX_LIMIT,
    });
  },

  async getAll(filters?: AppointmentFilters) {
    const where: Prisma.AppointmentWhereInput = {};

    if (filters?.specialistId) where.specialistId = filters.specialistId;
    if (filters?.patientId) where.patientId = filters.patientId;
    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
      where.startTime = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }

    return db.appointment.findMany({
      where,
      include: appointmentDetailsInclude,
      orderBy: { startTime: "desc" },
      take: MAX_LIMIT,
    });
  },

  async getUpcoming(limit: number = 10) {
    return db.appointment.findMany({
      where: {
        startTime: { gte: new Date() },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: appointmentDetailsInclude,
      orderBy: { startTime: "asc" },
      take: Math.min(limit, MAX_LIMIT),
    });
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    return db.$transaction(async (tx) => {
      const current = await tx.appointment.findUnique({ where: { id } });
      if (!current) throw new Error("Cita no encontrada");

      validateTransition(current.status as AppointmentStatus, status);

      await syncLinkedBooking(tx, current, { status });

      return tx.appointment.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: appointmentDetailsInclude,
      });
    }, { isolationLevel: "Serializable" });
  },
};
