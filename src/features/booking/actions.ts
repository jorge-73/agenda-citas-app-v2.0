"use server";

import { db } from "@/lib/db";
import { addDays, startOfDay, endOfDay, format, eachDayOfInterval } from "date-fns";
import { validateInput } from "@/lib/action-helpers";
import { PHONE_REGEX, TIME_REGEX } from "@/lib/constants";
import { z } from "zod";

const createBookingSchema = z.object({
  patientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  patientLastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  patientEmail: z.string().email("Email inválido"),
  patientPhone: z.string().regex(PHONE_REGEX, "Teléfono inválido"),
  specialistId: z.string().min(1, "Especialista requerido"),
  specialty: z.string().min(1, "Especialidad requerida"),
  reason: z.string().optional(),
  date: z.date().refine((d) => d > new Date(), "La fecha debe ser futura"),
  time: z.string().regex(TIME_REGEX, "Formato de hora inválido"),
});

export async function getAvailableSpecialistsAction(specialty?: string) {
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
}

export async function getAvailableDatesAction(specialistId: string) {
  const today = new Date();
  const endDate = addDays(today, 60);

  const schedules = await db.schedule.findMany({
    where: {
      specialistId,
      isActive: true,
    },
  });

  const blockedDates = await db.blockedDate.findMany({
    where: {
      date: {
        gte: startOfDay(today),
        lte: endOfDay(endDate),
      },
    },
  });

  const blockedDatesSet = new Set(
    blockedDates.map((bd) => format(new Date(bd.date), "yyyy-MM-dd"))
  );

  const availableDates: Date[] = [];
  const days = eachDayOfInterval({ start: today, end: endDate });

  for (const day of days) {
    const dayOfWeek = day.getDay();
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);
    
    if (schedule && !blockedDatesSet.has(format(day, "yyyy-MM-dd"))) {
      availableDates.push(day);
    }
  }

  return availableDates;
}

export async function getAvailableTimeSlotsAction(specialistId: string, date: Date) {
  const dayOfWeek = new Date(date).getDay();
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

  const dayStart = startOfDay(new Date(date));
  const dayEnd = endOfDay(new Date(date));

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

  const slots: { time: string; available: boolean }[] = [];
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
}

export async function createBookingAction(data: {
  patientName: string;
  patientLastname: string;
  patientEmail: string;
  patientPhone: string;
  specialistId: string;
  specialty: string;
  reason?: string;
  date: Date;
  time: string;
}) {
  validateInput(createBookingSchema, data);

  const dayStart = startOfDay(new Date(data.date));
  const dayEnd = endOfDay(new Date(data.date));

  const existingAppointment = await db.appointment.findFirst({
    where: {
      specialistId: data.specialistId,
      status: { not: "CANCELLED" },
      startTime: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
  });

  if (existingAppointment) {
    const aptTime = format(new Date(existingAppointment.startTime), "HH:mm");
    if (aptTime === data.time) {
      throw new Error("Ya existe una cita en este horario");
    }
  }

  const existingBooking = await db.booking.findFirst({
    where: {
      specialistId: data.specialistId,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
      time: data.time,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  if (existingBooking) {
    throw new Error("Ya existe una reserva en este horario");
  }

  const booking = await db.booking.create({
    data: {
      patientName: data.patientName,
      patientLastname: data.patientLastname,
      patientEmail: data.patientEmail,
      patientPhone: data.patientPhone,
      specialistId: data.specialistId,
      specialty: data.specialty,
      reason: data.reason,
      date: data.date,
      time: data.time,
      status: "PENDING",
    },
  });

  try {
    const { sendBookingConfirmationEmail } = await import("@/lib/email");
    const specialist = await db.specialist.findUnique({
      where: { id: data.specialistId },
      include: { user: true },
    });

    await sendBookingConfirmationEmail({
      to: data.patientEmail,
      patientName: data.patientName,
      patientLastname: data.patientLastname,
      specialistName: specialist?.user.name || "Especialista",
      specialty: data.specialty,
      date: format(new Date(data.date), "dd/MM/yyyy"),
      time: data.time,
      reason: data.reason,
    });
  } catch (emailError) {
    console.error("Error sending booking confirmation email:", emailError);
  }

  return booking;
}
