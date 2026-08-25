import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { MAX_LIMIT } from "@/lib/constants";
import { contactUserSelect } from "@/lib/prisma-selects";
import { PatientFilters, CreatePatientInput, UpdatePatientInput } from "../types";

export const patientService = {
  async create(input: CreatePatientInput) {
    return db.patient.create({
      data: input,
      include: {
        user: { select: contactUserSelect },
      },
    });
  },

  async update(input: UpdatePatientInput) {
    const { id, ...data } = input;
    return db.patient.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        user: { select: contactUserSelect },
      },
    });
  },

  async delete(id: string) {
    return db.patient.delete({
      where: { id },
    });
  },

  async getById(id: string) {
    return db.patient.findUnique({
      where: { id },
      include: {
        user: { select: contactUserSelect },
        appointments: {
          include: {
            specialist: {
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

  async getAll(filters?: PatientFilters, page: number = 1, limit: number = 10) {
    const where: Prisma.PatientWhereInput = {};

    if (filters?.search) {
      where.user = {
        OR: [
          { name: { contains: filters.search } },
          { email: { contains: filters.search } },
        ],
      };
    }

    if (filters?.document) {
      where.document = { contains: filters.document };
    }

    if (filters?.insurance) {
      where.insurance = { contains: filters.insurance };
    }

    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where,
        include: {
          user: { select: contactUserSelect },
          appointments: {
            select: { id: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * Math.min(limit, MAX_LIMIT),
        take: Math.min(limit, MAX_LIMIT),
      }),
      db.patient.count({ where }),
    ]);

    return {
      patients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async search(query: string, limit: number = 10) {
    return db.patient.findMany({
      where: {
        OR: [
          { document: { contains: query } },
          { phone: { contains: query } },
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
    return db.patient.findUnique({
      where: { userId },
      include: {
        user: { select: contactUserSelect },
      },
    });
  },

  async getAppointmentHistory(patientId: string) {
    return db.appointment.findMany({
      where: { patientId },
      include: {
        specialist: {
          include: {
            user: { select: contactUserSelect },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });
  },

  async count() {
    return db.patient.count();
  },
};
