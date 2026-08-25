import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { MAX_LIMIT } from "@/lib/constants";
import { contactUserSelect } from "@/lib/prisma-selects";
import { SpecialistFilters, CreateSpecialistInput, UpdateSpecialistInput } from "../types";

export const specialistService = {
  async create(input: CreateSpecialistInput) {
    return db.specialist.create({
      data: {
        ...input,
        consultationDuration: input.consultationDuration || 30,
        isAvailable: input.isAvailable ?? true,
      },
      include: {
        user: { select: contactUserSelect },
        schedules: true,
      },
    });
  },

  async update(input: UpdateSpecialistInput) {
    const { id, ...data } = input;
    return db.specialist.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: { select: contactUserSelect },
        schedules: true,
      },
    });
  },

  async delete(id: string) {
    return db.specialist.delete({
      where: { id },
    });
  },

  async getById(id: string) {
    return db.specialist.findUnique({
      where: { id },
      include: {
        user: { select: contactUserSelect },
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: "asc" },
        },
        appointments: {
          include: {
            patient: {
              include: {
                user: { select: contactUserSelect },
              },
            },
          },
          orderBy: {
            startTime: "desc",
          },
          take: 10,
        },
      },
    });
  },

  async getAll(filters?: SpecialistFilters, page: number = 1, limit: number = 10) {
    const where: Prisma.SpecialistWhereInput = {};

    if (filters?.search) {
      where.OR = [
        { specialty: { contains: filters.search } },
        { user: { name: { contains: filters.search } } },
        { user: { email: { contains: filters.search } } },
      ];
    }

    if (filters?.specialty) {
      where.specialty = filters.specialty;
    }

    if (filters?.isAvailable !== undefined) {
      where.isAvailable = filters.isAvailable;
    }

    const [specialists, total] = await Promise.all([
      db.specialist.findMany({
        where,
        include: {
          user: { select: contactUserSelect },
          schedules: {
            where: { isActive: true },
          },
          _count: {
            select: { appointments: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * Math.min(limit, MAX_LIMIT),
        take: Math.min(limit, MAX_LIMIT),
      }),
      db.specialist.count({ where }),
    ]);

    return {
      specialists,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async search(query: string, limit: number = 10) {
    return db.specialist.findMany({
      where: {
        OR: [
          { specialty: { contains: query } },
          { user: { name: { contains: query } } },
          { user: { email: { contains: query } } },
        ],
      },
      include: {
        user: { select: contactUserSelect },
      },
      take: Math.min(limit, MAX_LIMIT),
    });
  },

  async getByUserId(userId: string) {
    return db.specialist.findUnique({
      where: { userId },
      include: {
        user: { select: contactUserSelect },
        schedules: true,
      },
    });
  },

  async updateSchedule(specialistId: string, schedules: { dayOfWeek: number; startTime: string; endTime: string }[]) {
    await db.schedule.deleteMany({
      where: { specialistId },
    });

    if (schedules.length === 0) return [];

    const scheduleData = schedules.map((s) => ({
      specialistId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isActive: true,
    }));

    return db.schedule.createMany({
      data: scheduleData,
    });
  },

  async toggleAvailability(id: string) {
    const specialist = await db.specialist.findUnique({ where: { id } });
    if (!specialist) throw new Error("Especialista no encontrado");

    return db.specialist.update({
      where: { id },
      data: {
        isAvailable: !specialist.isAvailable,
        updatedAt: new Date(),
      },
      include: {
        user: { select: contactUserSelect },
      },
    });
  },

  async count() {
    return db.specialist.count();
  },

  async getAvailable() {
    return db.specialist.findMany({
      where: { isAvailable: true },
      include: {
        user: { select: contactUserSelect },
        schedules: {
          where: { isActive: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });
  },
};
