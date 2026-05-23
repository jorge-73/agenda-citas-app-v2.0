import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilters,
  AppointmentStatus
} from "../types";
import { MAX_LIMIT } from "@/lib/constants";

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "ABSENT", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
  ABSENT: [],
};

function validateTransition(from: AppointmentStatus, to: AppointmentStatus): void {
  if (from === to) return;
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed?.includes(to)) {
    throw new Error(`No se puede cambiar el estado de "${from}" a "${to}".`);
  }
}

export const appointmentService = {
  async create(input: CreateAppointmentInput) {
    return db.$transaction(async (tx) => {
      const conflict = await this.checkConflictTx(
        tx,
        input.specialistId,
        input.startTime,
        input.endTime
      );

      if (conflict) {
        throw new Error("Ya existe una cita en este horario");
      }

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
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          specialist: {
            include: {
              user: true,
            },
          },
        },
      });
    }, { isolationLevel: "Serializable" });
  },

  async update(input: UpdateAppointmentInput) {
    return db.$transaction(async (tx) => {
      const { id, ...data } = input;
      const current = await tx.appointment.findUnique({ where: { id } });
      if (!current) throw new Error("Cita no encontrada");

      if (data.startTime || data.endTime) {
        const conflict = await this.checkConflictTx(
          tx,
          data.specialistId || current.specialistId,
          data.startTime || current.startTime,
          data.endTime || current.endTime,
          id
        );

        if (conflict) {
          throw new Error("Ya existe una cita en este horario");
        }
      }

      if (data.status) {
        validateTransition(current.status as AppointmentStatus, data.status);
      }

      return tx.appointment.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          specialist: {
            include: {
              user: true,
            },
          },
        },
      });
    }, { isolationLevel: "Serializable" });
  },

  async cancel(id: string) {
    return db.$transaction(async (tx) => {
      const current = await tx.appointment.findUnique({ where: { id } });
      if (!current) throw new Error("Cita no encontrada");

      validateTransition(current.status as AppointmentStatus, "CANCELLED");

      return tx.appointment.update({
        where: { id },
        data: {
          status: "CANCELLED",
          updatedAt: new Date(),
        },
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

      const conflict = await this.checkConflictTx(
        tx,
        current.specialistId,
        startTime,
        endTime,
        id
      );

      if (conflict) {
        throw new Error("Ya existe una cita en este horario");
      }

      return tx.appointment.update({
        where: { id },
        data: {
          startTime,
          endTime,
          updatedAt: new Date(),
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          specialist: {
            include: {
              user: true,
            },
          },
        },
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
    const overlapping = await tx.appointment.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        specialistId,
        status: { not: "CANCELLED" },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    return overlapping !== null;
  },

  async checkConflict(
    specialistId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string
  ) {
    const overlapping = await db.appointment.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        specialistId,
        status: { not: "CANCELLED" },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    return overlapping !== null;
  },

  async getById(id: string) {
    return db.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        specialist: {
          include: {
            user: true,
          },
        },
      },
    });
  },

  async getByDateRange(startDate: Date, endDate: Date, filters?: AppointmentFilters) {
    const where: Prisma.AppointmentWhereInput = {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (filters?.specialistId) {
      where.specialistId = filters.specialistId;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return db.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        specialist: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: MAX_LIMIT,
    });
  },

  async getAll(filters?: AppointmentFilters) {
    const where: Prisma.AppointmentWhereInput = {};

    if (filters?.specialistId) {
      where.specialistId = filters.specialistId;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      };
    }

    return db.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        specialist: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
      take: MAX_LIMIT,
    });
  },

  async getUpcoming(limit: number = 10) {
    const now = new Date();
    return db.appointment.findMany({
      where: {
        startTime: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        specialist: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: Math.min(limit, MAX_LIMIT),
    });
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    return db.$transaction(async (tx) => {
      const current = await tx.appointment.findUnique({ where: { id } });
      if (!current) throw new Error("Cita no encontrada");

      validateTransition(current.status as AppointmentStatus, status);

      return tx.appointment.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
    }, { isolationLevel: "Serializable" });
  },
};
