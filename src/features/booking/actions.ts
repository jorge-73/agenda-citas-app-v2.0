"use server";

import { db } from "@/lib/db";
import { addDays, startOfDay, endOfDay, format, eachDayOfInterval, isSameDay } from "date-fns";
import { validateInput, requirePermission } from "@/lib/action-helpers";
import { PHONE_REGEX, TIME_REGEX, MAX_LIMIT } from "@/lib/constants";
import { toUTC, AR_TZ } from "@/lib/date-utils";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { z } from "zod";

const createBookingSchema = z.object({
  patientName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  patientLastname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  patientEmail: z.string().email("Email inválido"),
  patientPhone: z.string().regex(PHONE_REGEX, "Teléfono inválido"),
  specialistId: z.string().min(1, "Especialista requerido"),
  specialty: z.string().min(1, "Especialidad requerida"),
  reason: z.string().optional(),
  date: z.date(),
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
    const arMidnight = toUTC(startOfDay(day), AR_TZ);
    const dayOfWeek = arMidnight.getDay();
    const schedule = schedules.find((s) => s.dayOfWeek === dayOfWeek);

    if (schedule && !blockedDatesSet.has(format(arMidnight, "yyyy-MM-dd"))) {
      availableDates.push(arMidnight);
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

  const now = new Date();

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

    if (isSameDay(date, now)) {
      const [slotHour, slotMin] = timeString.split(":").map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(slotHour, slotMin, 0, 0);
      if (slotDate <= now) {
        currentMinutes += slotDuration;
        continue;
      }
    }

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
  const rateKey = getRateLimitKey(data.patientEmail, "booking");
  const rateCheck = checkRateLimit(rateKey, 3, 300_000);
  if (!rateCheck.allowed) {
    throw new Error("Demasiadas reservas. Intenta de nuevo en 5 minutos.");
  }

  validateInput(createBookingSchema, data);

  const [hour, min] = data.time.split(":").map(Number);
  const slotDate = new Date(data.date);
  slotDate.setHours(hour, min, 0, 0);
  const utcSlot = toUTC(slotDate, AR_TZ);
  if (utcSlot <= new Date()) {
    throw new Error("La fecha y hora de la cita deben ser futuras");
  }

  const dayStart = startOfDay(data.date);
  const dayEnd = endOfDay(data.date);

  const booking = await db.$transaction(async (tx) => {
    const existingAppointment = await tx.appointment.findFirst({
      where: {
        specialistId: data.specialistId,
        status: { not: "CANCELLED" },
        startTime: { gte: dayStart, lte: dayEnd },
      },
    });

    if (existingAppointment) {
      const aptTime = format(new Date(existingAppointment.startTime), "HH:mm");
      if (aptTime === data.time) {
        throw new Error("Ya existe una cita en este horario");
      }
    }

    const existingBooking = await tx.booking.findFirst({
      where: {
        specialistId: data.specialistId,
        date: { gte: dayStart, lte: dayEnd },
        time: data.time,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (existingBooking) {
      throw new Error("Ya existe una reserva en este horario");
    }

    return tx.booking.create({
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
  }, { isolationLevel: "Serializable" });

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
      date: format(data.date, "dd/MM/yyyy"),
      time: data.time,
      reason: data.reason,
    });
  } catch (emailError) {
    console.error("Error sending booking confirmation email:", emailError);
  }

  return booking;
}

export async function getAllBookingsAction(params?: {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  await requirePermission("view:bookings");

  const where: Record<string, unknown> = {};
  if (params?.status) where.status = params.status;
  if (params?.dateFrom || params?.dateTo) {
    where.date = {
      ...(params?.dateFrom && { gte: params.dateFrom }),
      ...(params?.dateTo && { lte: params.dateTo }),
    };
  }
  const bookings = await db.booking.findMany({
    where,
    orderBy: { date: "desc" },
    take: MAX_LIMIT,
  });
  const enriched = await Promise.all(
    bookings.map(async (b) => {
      const specialist = await db.specialist.findUnique({
        where: { id: b.specialistId },
        include: { user: true },
      });
      return { ...b, specialist };
    })
  );
  return enriched;
}

export async function cancelBookingAction(id: string) {
  await requirePermission("manage:bookings");
  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Reserva no encontrada");
  if (booking.status === "CANCELLED") throw new Error("La reserva ya está cancelada");
  await db.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  return { success: true };
}

export async function confirmBookingAction(id: string) {
  await requirePermission("manage:bookings");
  const booking = await db.booking.findUnique({ where: { id } });
  if (!booking) throw new Error("Reserva no encontrada");
  if (booking.status !== "PENDING") throw new Error("Solo se pueden confirmar reservas pendientes");
  await db.booking.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });

  const user = await db.user.findUnique({
    where: { email: booking.patientEmail },
    include: { patient: true },
  });

  if (user?.patient) {
    const [hours, minutes] = booking.time.split(":").map(Number);
    const slotDate = new Date(booking.date);
    slotDate.setHours(hours, minutes, 0, 0);
    const startTime = toUTC(slotDate, AR_TZ);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);

    await db.appointment.create({
      data: {
        patientId: user.patient.id,
        specialistId: booking.specialistId,
        startTime,
        endTime,
        reason: booking.reason || `Consulta - ${booking.specialty}`,
        status: "PENDING",
      },
    });
  }

  return { success: true, appointmentCreated: !!user?.patient };
}
