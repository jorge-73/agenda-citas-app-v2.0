import { 
  addMinutes, 
  setHours, 
  setMinutes, 
  startOfDay, 
  endOfDay,
  eachDayOfInterval,
  isBefore,
  isAfter
} from "date-fns";
import { db } from "@/lib/db";
import type { TimeSlot, Schedule } from "../types";

const DEFAULT_SLOT_DURATION = 30; // minutes

export const timeSlotGenerator = {
  generateTimeSlots(
    date: Date,
    schedule: Schedule,
    existingAppointments: { startTime: Date; endTime: Date }[],
    slotDuration: number = DEFAULT_SLOT_DURATION
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const dayStart = startOfDay(date);
    
    const [startHour, startMin] = schedule.startTime.split(":").map(Number);
    const [endHour, endMin] = schedule.endTime.split(":").map(Number);
    
    const workStart = setMinutes(setHours(dayStart, startHour), startMin);
    const workEnd = setMinutes(setHours(dayStart, endHour), endMin);
    
    let currentTime = workStart;
    
    while (isBefore(currentTime, workEnd)) {
      const slotEnd = addMinutes(currentTime, slotDuration);
      
      if (isAfter(slotEnd, workEnd)) break;
      
      const isAvailable = !this.hasConflict(
        currentTime,
        slotEnd,
        existingAppointments
      );
      
      slots.push({
        start: currentTime,
        end: slotEnd,
        available: isAvailable,
      });
      
      currentTime = slotEnd;
    }
    
    return slots;
  },

  hasConflict(
    start: Date,
    end: Date,
    appointments: { startTime: Date; endTime: Date }[]
  ): boolean {
    return appointments.some((apt) => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      
      return (
        (start >= aptStart && start < aptEnd) ||
        (end > aptStart && end <= aptEnd) ||
        (start <= aptStart && end >= aptEnd)
      );
    });
  },

  async getAvailableSlots(
    specialistId: string,
    date: Date,
    slotDuration: number = DEFAULT_SLOT_DURATION
  ): Promise<TimeSlot[]> {
    const isBlocked = await this.isDateBlocked(date);
    if (isBlocked) return [];

    const schedule = await db.schedule.findFirst({
      where: {
        specialistId,
        dayOfWeek: date.getDay(),
        isActive: true,
      },
    });

    if (!schedule) return [];

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const existingAppointments = await db.appointment.findMany({
      where: {
        specialistId,
        status: { not: "CANCELLED" },
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    return this.generateTimeSlots(
      date,
      schedule,
      existingAppointments,
      slotDuration
    );
  },

  async getAvailableSlotsForRange(
    specialistId: string,
    startDate: Date,
    endDate: Date,
    slotDuration: number = DEFAULT_SLOT_DURATION
  ): Promise<{ date: Date; slots: TimeSlot[] }[]> {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const result: { date: Date; slots: TimeSlot[] }[] = [];

    for (const day of days) {
      const slots = await this.getAvailableSlots(specialistId, day, slotDuration);
      result.push({ date: day, slots });
    }

    return result;
  },

  async isDateBlocked(date: Date): Promise<boolean> {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const blocked = await db.blockedDate.findFirst({
      where: {
        OR: [
          {
            isRecurring: false,
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        ],
      },
    });

    return blocked !== null;
  },

  async getBlockedDatesInRange(startDate: Date, endDate: Date): Promise<Date[]> {
    const blockedDates = await db.blockedDate.findMany({
      where: {
        OR: [
          {
            isRecurring: false,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
    });

    return blockedDates.map((bd) => new Date(bd.date));
  },

  getTimeOptions(
    startTime: string,
    endTime: string,
    intervalMinutes: number = 30
  ): string[] {
    const options: string[] = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      options.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
      currentMinutes += intervalMinutes;
    }
    
    return options;
  },

  roundToNearestSlot(date: Date, slotMinutes: number = 30): Date {
    const minutes = date.getMinutes();
    const remainder = minutes % slotMinutes;
    const roundedMinutes = remainder < slotMinutes / 2 ? minutes - remainder : minutes + (slotMinutes - remainder);
    return new Date(date.setMinutes(roundedMinutes, 0, 0));
  },
};