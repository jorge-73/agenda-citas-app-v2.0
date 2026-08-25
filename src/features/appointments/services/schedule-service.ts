import { db } from "@/lib/db";
import { Schedule } from "../types";
import { startOfDay, endOfDay } from "date-fns";
import { publicUserSelect } from "@/lib/prisma-selects";

export const scheduleService = {
  async create(specialistId: string, dayOfWeek: number, startTime: string, endTime: string) {
    return db.schedule.upsert({
      where: {
        specialistId_dayOfWeek: {
          specialistId,
          dayOfWeek,
        },
      },
      update: {
        startTime,
        endTime,
        isActive: true,
      },
      create: {
        specialistId,
        dayOfWeek,
        startTime,
        endTime,
        isActive: true,
      },
    });
  },

  async update(id: string, data: Partial<Schedule>) {
    return db.schedule.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return db.schedule.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async getSpecialistSchedule(specialistId: string) {
    return db.schedule.findMany({
      where: {
        specialistId,
        isActive: true,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });
  },

  async getAllSchedules() {
    return db.schedule.findMany({
      where: { isActive: true },
      include: {
        specialist: {
          include: {
            user: { select: publicUserSelect },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }],
    });
  },

  async isWorkingDay(specialistId: string, date: Date): Promise<boolean> {
    const dayOfWeek = date.getDay();
    const schedule = await db.schedule.findFirst({
      where: {
        specialistId,
        dayOfWeek,
        isActive: true,
      },
    });
    return schedule !== null;
  },

  async isDateBlocked(date: Date): Promise<boolean> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const blocked = await db.blockedDate.findFirst({
      where: {
        isRecurring: false,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    return blocked !== null;
  },

  async blockDate(date: Date, reason?: string, isRecurring: boolean = false) {
    return db.blockedDate.create({
      data: {
        date,
        reason,
        isRecurring,
      },
    });
  },

  async getBlockedDates(startDate: Date, endDate: Date) {
    return db.blockedDate.findMany({
      where: {
        OR: [
          {
            isRecurring: false,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            isRecurring: true,
          },
        ],
      },
    });
  },

  async getWorkingHours(specialistId: string, date: Date): Promise<{ start: string; end: string } | null> {
    const dayOfWeek = date.getDay();
    const schedule = await db.schedule.findFirst({
      where: {
        specialistId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) return null;

    return {
      start: schedule.startTime,
      end: schedule.endTime,
    };
  },
};
