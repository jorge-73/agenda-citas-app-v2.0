import { db } from "@/lib/db";
import { 
  CreateAppointmentInput, 
  UpdateAppointmentInput, 
  AppointmentFilters,
  AppointmentStatus 
} from "../types";

export const appointmentService = {
  async create(input: CreateAppointmentInput) {
    const conflict = await this.checkConflict(
      input.specialistId,
      input.startTime,
      input.endTime
    );
    
    if (conflict) {
      throw new Error("Ya existe una cita en este horario");
    }

    return db.appointment.create({
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
  },

  async update(input: UpdateAppointmentInput) {
    const { id, ...data } = input;
    
    if (data.startTime || data.endTime) {
      const appointment = await db.appointment.findUnique({ where: { id } });
      if (!appointment) throw new Error("Cita no encontrada");
      
      const conflict = await this.checkConflict(
        data.specialistId || appointment.specialistId,
        data.startTime || appointment.startTime,
        data.endTime || appointment.endTime,
        id
      );
      
      if (conflict) {
        throw new Error("Ya existe una cita en este horario");
      }
    }

    return db.appointment.update({
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
  },

  async cancel(id: string) {
    return db.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
      },
    });
  },

  async reschedule(id: string, startTime: Date, endTime: Date) {
    const appointment = await db.appointment.findUnique({ where: { id } });
    if (!appointment) throw new Error("Cita no encontrada");

    const conflict = await this.checkConflict(
      appointment.specialistId,
      startTime,
      endTime,
      id
    );

    if (conflict) {
      throw new Error("Ya existe una cita en este horario");
    }

    return db.appointment.update({
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
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
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
    const where: any = {
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
    });
  },

  async getAll(filters?: AppointmentFilters) {
    const where: any = {};

    if (filters?.specialistId) {
      where.specialistId = filters.specialistId;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate) {
      where.startTime = { ...where.startTime, gte: filters.startDate };
    }

    if (filters?.endDate) {
      where.startTime = { ...where.startTime, lte: filters.endDate };
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
      take: limit,
    });
  },

  async updateStatus(id: string, status: AppointmentStatus) {
    return db.appointment.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
  },
};