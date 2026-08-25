"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { addDays, eachDayOfInterval, differenceInCalendarDays, format } from "date-fns";
import { validateInput, requirePermission } from "@/lib/action-helpers";
import { PHONE_REGEX, TIME_REGEX, MAX_LIMIT } from "@/lib/constants";
import {
  AR_TZ,
  formatInTz,
  getDayOfWeekFromDateKey,
  getZonedDayRange,
  zonedDateTimeToUTC,
} from "@/lib/date-utils";
import { checkRateLimit, getRequestRateLimitKey } from "@/lib/rate-limit";
import { publicUserSelect } from "@/lib/prisma-selects";
import { createBookingConfirmationToken } from "@/lib/booking-confirmation-token";
import { lockAppointmentSlot } from "@/lib/slot-lock";
import { z } from "zod";

const BOOKING_SLOT_DURATION_MINUTES = 30;

const createBookingSchema = z.object({
  patientName: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  patientLastname: z.string().trim().min(2, "El apellido debe tener al menos 2 caracteres"),
  patientEmail: z.string().trim().toLowerCase().email("Email inválido"),
  patientPhone: z.string().trim().regex(PHONE_REGEX, "Teléfono inválido"),
  specialistId: z.string().min(1, "Especialista requerido"),
  specialty: z.string().trim().min(1, "Especialidad requerida"),
  reason: z.string().trim().max(500, "El motivo es demasiado largo").optional(),
  date: z.date(),
  time: z.string().regex(TIME_REGEX, "Formato de hora inválido"),
});

async function validateBookingSlot(
  tx: Prisma.TransactionClient,
  specialistId: string,
  specialty: string,
  startTime: Date,
  endTime: Date
) {
  if (startTime <= new Date()) {
    throw new Error("La fecha y hora de la cita deben ser futuras");
  }

  const specialist = await tx.specialist.findUnique({
    where: { id: specialistId },
    select: { isAvailable: true, specialty: true },
  });
  if (!specialist?.isAvailable) throw new Error("El especialista no está disponible");
  if (specialist.specialty !== specialty) {
    throw new Error("La especialidad seleccionada no coincide con el especialista");
  }

  const dateKey = formatInTz(startTime, "yyyy-MM-dd", AR_TZ);
  const schedule = await tx.schedule.findFirst({
    where: {
      specialistId,
      dayOfWeek: getDayOfWeekFromDateKey(dateKey),
      isActive: true,
    },
  });
  if (!schedule) throw new Error("El especialista no atiende en la fecha seleccionada");

  const { start: dayStart, end: dayEnd } = getZonedDayRange(startTime, AR_TZ);
  const blockedDate = await tx.blockedDate.findFirst({
    where: { date: { gte: dayStart, lte: dayEnd } },
    select: { id: true },
  });
  if (blockedDate) throw new Error("La fecha seleccionada está bloqueada");

  const startMinutes = Number(formatInTz(startTime, "H", AR_TZ)) * 60 +
    Number(formatInTz(startTime, "m", AR_TZ));
  const endMinutes = Number(formatInTz(endTime, "H", AR_TZ)) * 60 +
    Number(formatInTz(endTime, "m", AR_TZ));
  const [scheduleStartHour, scheduleStartMin] = schedule.startTime.split(":").map(Number);
  const [scheduleEndHour, scheduleEndMin] = schedule.endTime.split(":").map(Number);
  const scheduleStart = scheduleStartHour * 60 + scheduleStartMin;
  const scheduleEnd = scheduleEndHour * 60 + scheduleEndMin;

  if (
    startMinutes < scheduleStart ||
    endMinutes > scheduleEnd ||
    (startMinutes - scheduleStart) % BOOKING_SLOT_DURATION_MINUTES !== 0
  ) {
    throw new Error("El horario seleccionado no está disponible");
  }
}

export async function getAvailableSpecialistsAction(specialty?: string) {
  return db.specialist.findMany({
    where: {
      isAvailable: true,
      ...(specialty && { specialty }),
    },
    select: {
      id: true,
      specialty: true,
      bio: true,
      price: true,
      user: { select: publicUserSelect },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export async function getAvailableDatesAction(specialistId: string) {
  const today = new Date();
  const todayKey = formatInTz(today, "yyyy-MM-dd", AR_TZ);
  const [todayYear, todayMonth, todayDay] = todayKey.split("-").map(Number);
  const todayCalendar = new Date(todayYear, todayMonth - 1, todayDay);
  const endDate = addDays(todayCalendar, 60);
  const endDateKey = format(endDate, "yyyy-MM-dd");
  const startRange = getZonedDayRange(today, AR_TZ);
  const endRange = getZonedDayRange(endDate, AR_TZ);

  const [specialist, schedules, blockedDates] = await Promise.all([
    db.specialist.findUnique({
      where: { id: specialistId },
      select: { id: true, isAvailable: true },
    }),
    db.schedule.findMany({
      where: {
        specialistId,
        isActive: true,
      },
    }),
    db.blockedDate.findMany({
      where: {
        date: {
          gte: startRange.start,
          lte: endRange.end,
        },
      },
    }),
  ]);

  if (!specialist?.isAvailable) return [];

  const blockedDatesSet = new Set(
    blockedDates.map((blockedDate) =>
      formatInTz(new Date(blockedDate.date), "yyyy-MM-dd", AR_TZ)
    )
  );

  const availableDates: Date[] = [];
  const days = eachDayOfInterval({ start: todayCalendar, end: endDate });

  for (const day of days) {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayOfWeek = getDayOfWeekFromDateKey(dateKey);
    const schedule = schedules.find((item) => item.dayOfWeek === dayOfWeek);

    if (
      schedule &&
      dateKey >= todayKey &&
      dateKey <= endDateKey &&
      !blockedDatesSet.has(dateKey)
    ) {
      availableDates.push(zonedDateTimeToUTC(dateKey, "00:00", AR_TZ));
    }
  }

  return availableDates;
}

export async function getAvailableTimeSlotsAction(specialistId: string, date: Date) {
  const dateKey = formatInTz(new Date(date), "yyyy-MM-dd", AR_TZ);
  const dayOfWeek = getDayOfWeekFromDateKey(dateKey);
  const schedule = await db.schedule.findFirst({
    where: {
      specialistId,
      dayOfWeek,
      isActive: true,
    },
  });

  if (!schedule) return [];

  const { start: dayStart, end: dayEnd } = getZonedDayRange(new Date(date), AR_TZ);
  const blockedDate = await db.blockedDate.findFirst({
    where: { date: { gte: dayStart, lte: dayEnd } },
    select: { id: true },
  });
  if (blockedDate) return [];

  const [existingAppointments, existingBookings] = await Promise.all([
    db.appointment.findMany({
      where: {
        specialistId,
        status: { not: "CANCELLED" },
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
      select: { startTime: true, endTime: true },
    }),
    db.booking.findMany({
      where: {
        specialistId,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { time: true },
    }),
  ]);

  const bookedTimes = new Set(existingBookings.map((booking) => booking.time));

  const slots: { time: string; available: boolean }[] = [];
  const [startHour, startMin] = schedule.startTime.split(":").map(Number);
  const [endHour, endMin] = schedule.endTime.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const now = new Date();

  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    const slotDate = zonedDateTimeToUTC(dateKey, timeString, AR_TZ);
    const slotEnd = new Date(slotDate.getTime() + BOOKING_SLOT_DURATION_MINUTES * 60_000);

    if (slotDate <= now) {
      currentMinutes += BOOKING_SLOT_DURATION_MINUTES;
      continue;
    }

    slots.push({
      time: timeString,
      available:
        !bookedTimes.has(timeString) &&
        !existingAppointments.some(
          (appointment) =>
            new Date(appointment.startTime) < slotEnd &&
            new Date(appointment.endTime) > slotDate
        ),
    });

    currentMinutes += BOOKING_SLOT_DURATION_MINUTES;
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
  const parsedData = validateInput(createBookingSchema, data);
  const rateKey = await getRequestRateLimitKey(parsedData.patientEmail, "booking");
  const rateCheck = await checkRateLimit(rateKey, 3, 300_000);
  if (!rateCheck.allowed) {
    throw new Error("Demasiadas reservas. Intenta de nuevo en 5 minutos.");
  }

  const dateKey = formatInTz(parsedData.date, "yyyy-MM-dd", AR_TZ);
  const todayKey = formatInTz(new Date(), "yyyy-MM-dd", AR_TZ);
  const [todayYear, todayMonth, todayDay] = todayKey.split("-").map(Number);
  const [requestedYear, requestedMonth, requestedDay] = dateKey.split("-").map(Number);
  const todayCalendar = new Date(todayYear, todayMonth - 1, todayDay);
  const requestedCalendar = new Date(requestedYear, requestedMonth - 1, requestedDay);
  const dayDistance = differenceInCalendarDays(requestedCalendar, todayCalendar);

  if (dayDistance < 0 || dayDistance > 60) {
    throw new Error("La fecha seleccionada no está dentro del período disponible");
  }

  const specialist = await db.specialist.findUnique({
    where: { id: parsedData.specialistId },
    select: {
      id: true,
      specialty: true,
      isAvailable: true,
    },
  });
  if (!specialist?.isAvailable) {
    throw new Error("El especialista no está disponible");
  }
  if (specialist.specialty !== parsedData.specialty) {
    throw new Error("La especialidad seleccionada no coincide con el especialista");
  }

  const schedule = await db.schedule.findFirst({
    where: {
      specialistId: parsedData.specialistId,
      dayOfWeek: getDayOfWeekFromDateKey(dateKey),
      isActive: true,
    },
  });
  if (!schedule) {
    throw new Error("El especialista no atiende en la fecha seleccionada");
  }

  const { start: dayStart, end: dayEnd } = getZonedDayRange(parsedData.date, AR_TZ);
  const blockedDate = await db.blockedDate.findFirst({
    where: { date: { gte: dayStart, lte: dayEnd } },
    select: { id: true },
  });
  if (blockedDate) {
    throw new Error("La fecha seleccionada está bloqueada");
  }

  const [hour, min] = parsedData.time.split(":").map(Number);
  const requestedMinutes = hour * 60 + min;
  const [scheduleStartHour, scheduleStartMin] = schedule.startTime.split(":").map(Number);
  const [scheduleEndHour, scheduleEndMin] = schedule.endTime.split(":").map(Number);
  const scheduleStart = scheduleStartHour * 60 + scheduleStartMin;
  const scheduleEnd = scheduleEndHour * 60 + scheduleEndMin;
  if (
    requestedMinutes < scheduleStart ||
    requestedMinutes + BOOKING_SLOT_DURATION_MINUTES > scheduleEnd ||
    (requestedMinutes - scheduleStart) % BOOKING_SLOT_DURATION_MINUTES !== 0
  ) {
    throw new Error("El horario seleccionado no está disponible");
  }

  const utcSlot = zonedDateTimeToUTC(dateKey, parsedData.time, AR_TZ);
  if (utcSlot <= new Date()) {
    throw new Error("La fecha y hora de la cita deben ser futuras");
  }
  const utcEnd = new Date(utcSlot.getTime() + BOOKING_SLOT_DURATION_MINUTES * 60_000);

  const booking = await db.$transaction(async (tx) => {
    await lockAppointmentSlot(tx, parsedData.specialistId, utcSlot);
    await validateBookingSlot(tx, parsedData.specialistId, specialist.specialty, utcSlot, utcEnd);

    const existingAppointment = await tx.appointment.findFirst({
      where: {
        specialistId: parsedData.specialistId,
        status: { not: "CANCELLED" },
        startTime: { lt: utcEnd },
        endTime: { gt: utcSlot },
      },
      select: { id: true },
    });

    if (existingAppointment) {
      throw new Error("Ya existe una cita en este horario");
    }

    const existingBooking = await tx.booking.findFirst({
      where: {
        specialistId: parsedData.specialistId,
        date: { gte: dayStart, lte: dayEnd },
        time: parsedData.time,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: { id: true },
    });

    if (existingBooking) {
      throw new Error("Ya existe una reserva en este horario");
    }

    return tx.booking.create({
      data: {
        patientName: parsedData.patientName,
        patientLastname: parsedData.patientLastname,
        patientEmail: parsedData.patientEmail,
        patientPhone: parsedData.patientPhone,
        // An email from the public form is not proof of account ownership.
        patientId: undefined,
        specialistId: parsedData.specialistId,
        specialty: specialist.specialty,
        reason: parsedData.reason,
        date: dayStart,
        time: parsedData.time,
        status: "PENDING",
      },
    });
  }, { isolationLevel: "Serializable" });

  try {
    const { sendBookingConfirmationEmail } = await import("@/lib/email");
    const specialistDetails = await db.specialist.findUnique({
      where: { id: parsedData.specialistId },
      select: { user: { select: publicUserSelect } },
    });

    await sendBookingConfirmationEmail({
      to: parsedData.patientEmail,
      patientName: parsedData.patientName,
      patientLastname: parsedData.patientLastname,
      specialistName: specialistDetails?.user.name || "Especialista",
      specialty: parsedData.specialty,
      date: formatInTz(booking.date, "dd/MM/yyyy", AR_TZ),
      time: parsedData.time,
      reason: parsedData.reason,
    });
  } catch (emailError) {
    console.error("Error sending booking confirmation email:", emailError);
  }

  return {
    id: booking.id,
    confirmationToken: createBookingConfirmationToken(booking.id),
  };
}

export async function getAllBookingsAction(params?: {
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const user = await requirePermission("view:bookings");
  const specialistScope =
    user.role === "SPECIALIST"
      ? await db.specialist.findUnique({
          where: { userId: user.id },
          select: { id: true },
        })
      : null;
  if (user.role === "SPECIALIST" && !specialistScope) return [];

  const where: Record<string, unknown> = {};
  if (specialistScope) where.specialistId = specialistScope.id;
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
    bookings.map(async (booking) => {
      const specialist = await db.specialist.findUnique({
        where: { id: booking.specialistId },
        select: { user: { select: publicUserSelect } },
      });
      return { ...booking, specialist };
    })
  );
  return enriched;
}

export async function cancelBookingAction(id: string) {
  await requirePermission("manage:bookings");
  await db.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id } });
    if (!booking) throw new Error("Reserva no encontrada");
    if (booking.status === "CANCELLED") throw new Error("La reserva ya está cancelada");

    await tx.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    const appointment = await tx.appointment.findUnique({
      where: { bookingId: id },
      select: { id: true, status: true },
    });
    if (appointment && ["COMPLETED", "ABSENT"].includes(appointment.status)) {
      throw new Error("No se puede cancelar una reserva cuyo turno ya finalizó");
    }
    if (appointment && ["PENDING", "CONFIRMED"].includes(appointment.status)) {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: "CANCELLED" },
      });
    }
  });
  return { success: true };
}

export async function confirmBookingAction(id: string) {
  await requirePermission("manage:bookings");
  return db.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id } });
    if (!booking) throw new Error("Reserva no encontrada");
    if (booking.status !== "PENDING") throw new Error("Solo se pueden confirmar reservas pendientes");

    const dateKey = formatInTz(booking.date, "yyyy-MM-dd", AR_TZ);
    const startTime = zonedDateTimeToUTC(dateKey, booking.time, AR_TZ);
    const endTime = new Date(startTime.getTime() + BOOKING_SLOT_DURATION_MINUTES * 60_000);
    await lockAppointmentSlot(tx, booking.specialistId, startTime);
    await validateBookingSlot(tx, booking.specialistId, booking.specialty, startTime, endTime);

    const patient = booking.patientId
      ? await tx.patient.findUnique({ where: { id: booking.patientId }, select: { id: true } })
      : null;

    const existingAppointment = await tx.appointment.findUnique({
      where: { bookingId: booking.id },
      select: { id: true },
    });
    if (existingAppointment) {
      await tx.booking.update({
        where: { id },
        data: { status: "CONFIRMED", patientId: patient?.id ?? booking.patientId },
      });
      return { success: true, appointmentCreated: true };
    }

    if (patient) {
      const conflict = await tx.appointment.findFirst({
        where: {
          specialistId: booking.specialistId,
          status: { not: "CANCELLED" },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { id: true },
      });
      if (conflict) throw new Error("Ya existe una cita en este horario");

      await tx.appointment.create({
        data: {
          bookingId: booking.id,
          patientId: patient.id,
          specialistId: booking.specialistId,
          startTime,
          endTime,
          reason: booking.reason || `Consulta - ${booking.specialty}`,
          status: "PENDING",
        },
      });
    }

    await tx.booking.update({
      where: { id },
      data: { status: "CONFIRMED", patientId: patient?.id ?? booking.patientId },
    });

    return { success: true, appointmentCreated: !!patient };
  }, { isolationLevel: "Serializable" });
}
