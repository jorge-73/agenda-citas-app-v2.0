import { db } from "@/lib/db";
import { addDays, startOfDay, endOfDay, format, isBefore, isSameDay, parseISO, eachDayOfInterval } from "date-fns";
import { CreateBookingInput, TimeSlot } from "../types";

export const bookingService = {
  async getAvailableSpecialists(specialty?: string) {
    return db.specialist.findMany({
      where: {
        isAvailable: true,
        ...(specialty && { specialty }),
      },
      include: {
        user: true,
        schedules: {
          where: { isActive: true },
        },
      },
      orderBy: { user: { name: "asc" } },
    });
  },

  async getAvailableDates(specialistId: string, startDate: Date, endDate: Date) {
    const schedules = await db.schedule.findMany({
      where: {
        specialistId,
        isActive: true,
      },
    });

    const blockedDates = await db.blockedDate.findMany({
      where: {
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
    });

    const blockedDatesSet = new Set(
      blockedDates.map((bd) => format(new Date(bd.date), "yyyy-MM-dd"))
    );

    const availableDates: Date[] = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    for (const day of days) {
      const dayOfWeek = day.getDay();
      const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
      
      if (schedule && !blockedDatesSet.has(format(day, "yyyy-MM-dd"))) {
        if (!isBefore(day, startOfDay(new Date()))) {
          availableDates.push(day);
        }
      }
    }

    return availableDates;
  },

  async getAvailableTimeSlots(specialistId: string, date: Date) {
    const dayOfWeek = date.getDay();
    const schedule = await db.schedule.findFirst({
      where: {
        specialistId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!schedule) {
      return [];
    }

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const existingAppointments = await db.appointment.findMany({
      where: {
        specialistId,
        status: { not: "CANCELLED" },
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const existingBookings = await db.booking.findMany({
      where: {
        specialistId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        time: true,
      },
    });

    const bookedTimes = new Set([
      ...existingAppointments.map((a) => format(new Date(a.startTime), "HH:mm")),
      ...existingBookings.map((b) => b.time),
    ]);

    const slots: TimeSlot[] = [];
    const [startHour, startMin] = schedule.startTime.split(":").map(Number);
    const [endHour, endMin] = schedule.endTime.split(":").map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const slotDuration = 30;

    while (currentMinutes < endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
      
      slots.push({
        time: timeString,
        available: !bookedTimes.has(timeString),
      });
      
      currentMinutes += slotDuration;
    }

    return slots;
  },

  async checkAvailability(specialistId: string, date: Date, time: string) {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const existingAppointment = await db.appointment.findFirst({
      where: {
        specialistId,
        status: { not: "CANCELLED" },
        startTime: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    if (existingAppointment) {
      const aptTime = format(new Date(existingAppointment.startTime), "HH:mm");
      if (aptTime === time) {
        return { available: false, reason: "Cita existente en este horario" };
      }
    }

    const existingBooking = await db.booking.findFirst({
      where: {
        specialistId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        time,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      return { available: false, reason: "Reserva existente en este horario" };
    }

    return { available: true };
  },

  async createBooking(input: CreateBookingInput) {
    const availability = await this.checkAvailability(
      input.specialistId,
      input.date,
      input.time
    );

    if (!availability.available) {
      throw new Error(availability.reason);
    }

    const specialist = await db.specialist.findUnique({
      where: { id: input.specialistId },
      include: { user: true },
    });

    return db.booking.create({
      data: {
        patientName: input.patientName,
        patientLastname: input.patientLastname,
        patientEmail: input.patientEmail,
        patientPhone: input.patientPhone,
        patientId: input.patientId,
        specialistId: input.specialistId,
        specialty: input.specialty,
        reason: input.reason,
        date: input.date,
        time: input.time,
        status: "PENDING",
      },
    });
  },

  async getBookingById(id: string) {
    const booking = await db.booking.findUnique({
      where: { id },
    });
    
    if (!booking) return null;
    
    const specialist = await db.specialist.findUnique({
      where: { id: booking.specialistId },
      include: { user: true },
    });
    
    return { ...booking, specialist };
  },

  async cancelBooking(id: string) {
    return db.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  },

  async getUpcomingBookings(limit: number = 10) {
    const now = new Date();
    const bookings = await db.booking.findMany({
      where: {
        date: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      orderBy: { date: "asc" },
      take: limit,
    });
    
    const bookingsWithSpecialist = await Promise.all(
      bookings.map(async (booking) => {
        const specialist = await db.specialist.findUnique({
          where: { id: booking.specialistId },
          include: { user: true },
        });
        return { ...booking, specialist };
      })
    );
    
    return bookingsWithSpecialist;
  },
};