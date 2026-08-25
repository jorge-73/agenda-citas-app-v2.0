"use server";

import { db } from "@/lib/db";
import type { AppointmentStatus } from "./types";
import { addMinutes } from "date-fns";
import { requirePermission, validateInput } from "@/lib/action-helpers";
import { APPOINTMENT_STATUSES, TIME_REGEX } from "@/lib/constants";
import {
  AR_TZ,
  formatInTz,
  getDayOfWeekFromDateKey,
  getZonedDayRange,
  getZonedMonthRange,
  zonedDateTimeToUTC,
} from "@/lib/date-utils";
import { contactUserSelect, publicUserSelect } from "@/lib/prisma-selects";
import { appointmentService } from "./services/appointment-service";
import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente requerido"),
  specialistId: z.string().min(1, "Especialista requerido"),
  date: z.string().regex(DATE_REGEX, "La fecha no es válida"),
  time: z.string().regex(TIME_REGEX, "La hora no es válida"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente requerido").optional(),
  specialistId: z.string().min(1, "Especialista requerido").optional(),
  date: z.string().regex(DATE_REGEX, "La fecha no es válida").optional(),
  time: z.string().regex(TIME_REGEX, "La hora no es válida").optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
}).refine((d) => {
  return Boolean(d.date) === Boolean(d.time);
}, {
  message: "La fecha y la hora deben enviarse juntas",
  path: ["time"],
});

async function getSpecialistScope(user: { id: string; role?: string }): Promise<string | undefined> {
  if (user.role !== "SPECIALIST") return undefined;
  const specialist = await db.specialist.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!specialist) throw new Error("El perfil de especialista no está configurado");
  return specialist.id;
}

async function validateAppointmentSlot(
  specialistId: string,
  startTime: Date,
  endTime: Date
): Promise<void> {
  const specialist = await db.specialist.findUnique({
    where: { id: specialistId },
    select: { id: true, isAvailable: true },
  });
  if (!specialist?.isAvailable) throw new Error("El especialista no está disponible");

  const dateKey = formatInTz(startTime, "yyyy-MM-dd", AR_TZ);
  const schedule = await db.schedule.findFirst({
    where: {
      specialistId,
      dayOfWeek: getDayOfWeekFromDateKey(dateKey),
      isActive: true,
    },
  });
  if (!schedule) throw new Error("El especialista no atiende en la fecha seleccionada");

  const { start: dayStart, end: dayEnd } = getZonedDayRange(startTime, AR_TZ);
  const blockedDate = await db.blockedDate.findFirst({
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
    (startMinutes - scheduleStart) % 30 !== 0
  ) {
    throw new Error("El horario seleccionado no está disponible");
  }
}

export async function getFilteredAppointmentsAction(filters: {
  specialistId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  const user = await requirePermission("view:appointments");
  let scopedPatientId: string | undefined = filters.patientId;
  const scopedSpecialistId = await getSpecialistScope(user);
  if (user.role === "PATIENT") {
    const patient = await db.patient.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!patient) return [];
    scopedPatientId = patient.id;
  }
  if (user.role === "SPECIALIST" && !scopedSpecialistId) return [];
  const appointments = await db.appointment.findMany({
    where: {
      ...((scopedSpecialistId || filters.specialistId) && {
        specialistId: scopedSpecialistId || filters.specialistId,
      }),
      ...(scopedPatientId && { patientId: scopedPatientId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate || filters.endDate
        ? {
            startTime: {
              ...(filters.startDate && { gte: filters.startDate }),
              ...(filters.endDate && { lte: filters.endDate }),
            },
          }
        : {}),
    },
    include: {
      patient: { include: { user: { select: contactUserSelect } } },
      specialist: { include: { user: { select: contactUserSelect } } },
    },
    orderBy: { startTime: "desc" },
  });

  return appointments.map((apt) => ({
    ...apt,
    status: apt.status as AppointmentStatus,
  }));
}

export async function getAppointmentsByMonth(year: number, month: number) {
  const user = await requirePermission("view:appointments");
  let scopedPatientId: string | undefined;
  const scopedSpecialistId = await getSpecialistScope(user);
  if (user.role === "PATIENT") {
    const patient = await db.patient.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!patient) return [];
    scopedPatientId = patient.id;
  }
  if (user.role === "SPECIALIST" && !scopedSpecialistId) return [];
  const { start: startOfMonth, end: endOfMonth } = getZonedMonthRange(year, month, AR_TZ);
  
  const appointments = await db.appointment.findMany({
    where: {
      ...(scopedPatientId && { patientId: scopedPatientId }),
      ...(scopedSpecialistId && { specialistId: scopedSpecialistId }),
      startTime: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      patient: {
        include: {
          user: { select: contactUserSelect },
        },
      },
      specialist: {
        include: {
          user: { select: contactUserSelect },
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });
  
  return appointments.map((apt) => ({
    ...apt,
    status: apt.status as AppointmentStatus,
  }));
}

export async function getAllAppointments() {
  const user = await requirePermission("view:appointments");
  let scopedPatientId: string | undefined;
  const scopedSpecialistId = await getSpecialistScope(user);
  if (user.role === "PATIENT") {
    const patient = await db.patient.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!patient) return [];
    scopedPatientId = patient.id;
  }
  if (user.role === "SPECIALIST" && !scopedSpecialistId) return [];
  const appointments = await db.appointment.findMany({
    where: scopedPatientId || scopedSpecialistId
      ? {
          ...(scopedPatientId && { patientId: scopedPatientId }),
          ...(scopedSpecialistId && { specialistId: scopedSpecialistId }),
        }
      : undefined,
    include: {
      patient: {
        include: {
          user: { select: contactUserSelect },
        },
      },
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
  
  return appointments.map((apt) => ({
    ...apt,
    status: apt.status as AppointmentStatus,
  }));
}

export async function getPatientsList() {
  const user = await requirePermission("view:appointments");
  if (user.role === "PATIENT") {
    throw new Error("No tienes permisos para realizar esta acción");
  }
  const patients = await db.patient.findMany({
    include: {
      user: { select: contactUserSelect },
    },
    orderBy: {
      user: { name: "asc" },
    },
  });

  return patients.map((p) => ({
    id: p.id,
    name: p.user.name || "",
    email: p.user.email,
    phone: p.phone,
  }));
}

export async function getSpecialistsList() {
  const user = await requirePermission("view:appointments");
  if (user.role === "PATIENT") {
    throw new Error("No tienes permisos para realizar esta acción");
  }
  const specialists = await db.specialist.findMany({
    where: {
      isAvailable: true,
    },
    include: {
      user: { select: publicUserSelect },
    },
    orderBy: {
      user: { name: "asc" },
    },
  });

  return specialists.map((s) => ({
    id: s.id,
    name: s.user.name || "",
    specialty: s.specialty,
    price: s.price,
  }));
}

export async function createAppointment(data: {
  patientId: string;
  specialistId: string;
  date: string;
  time: string;
  reason?: string;
  notes?: string;
}) {
  const user = await requirePermission("manage:appointments");
  const parsedData = validateInput(createAppointmentSchema, data);
  const ownedSpecialistId = await getSpecialistScope(user);
  if (ownedSpecialistId && ownedSpecialistId !== parsedData.specialistId) {
    throw new Error("No puedes crear una cita para otro especialista");
  }
  const startTime = zonedDateTimeToUTC(parsedData.date, parsedData.time, AR_TZ);
  if (startTime <= new Date()) {
    throw new Error("La fecha de inicio debe ser futura");
  }
  const endTime = addMinutes(startTime, 30);
  await validateAppointmentSlot(parsedData.specialistId, startTime, endTime);

  const appointment = await appointmentService.create({
    patientId: parsedData.patientId,
    specialistId: parsedData.specialistId,
    startTime,
    endTime,
    reason: parsedData.reason,
    notes: parsedData.notes,
  });

  try {
    const { sendBookingConfirmationEmail } = await import("@/lib/email");
    await sendBookingConfirmationEmail({
      to: appointment.patient.user.email,
      patientName: appointment.patient.user.name || "Paciente",
      patientLastname: "",
      specialistName: appointment.specialist.user.name || "Especialista",
      specialty: appointment.specialist.specialty,
      date: formatInTz(new Date(appointment.startTime), "dd/MM/yyyy", AR_TZ),
      time: formatInTz(new Date(appointment.startTime), "HH:mm", AR_TZ),
      reason: appointment.reason || undefined,
    });
  } catch (emailError) {
    console.error("Error sending appointment confirmation email:", emailError);
  }

  return appointment;
}

export async function deleteAppointment(id: string) {
  const user = await requirePermission("manage:appointments");
  const parsed = z.string().min(1, "ID requerido").safeParse(id);
  if (!parsed.success) throw new Error("ID de cita inválido");

  const appointment = await db.appointment.findUnique({
    where: { id },
    select: { specialistId: true, bookingId: true },
  });
  if (!appointment) throw new Error("Cita no encontrada");
  const ownedSpecialistId = await getSpecialistScope(user);
  if (ownedSpecialistId && ownedSpecialistId !== appointment.specialistId) {
    throw new Error("No puedes eliminar una cita de otro especialista");
  }

  if (appointment.bookingId) {
    return appointmentService.cancel(id);
  }

  return db.appointment.delete({ where: { id } });
}

export async function cancelOwnAppointmentAction(appointmentId: string) {
  const user = await requirePermission("manage:own-appointments");

  const parsedId = z.string().min(1, "ID requerido").safeParse(appointmentId);
  if (!parsedId.success) throw new Error("ID de cita inválido");

  const patient = await db.patient.findUnique({ where: { userId: user.id } });
  if (!patient) throw new Error("Paciente no encontrado");

  const appointment = await db.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: { select: contactUserSelect } } },
      specialist: { include: { user: { select: contactUserSelect } } },
    },
  });

  if (!appointment) throw new Error("Turno no encontrado");
  if (appointment.patientId !== patient.id) {
    throw new Error("No puedes cancelar el turno de otro paciente");
  }
  if (appointment.status === "CANCELLED") {
    throw new Error("El turno ya está cancelado");
  }
  if (appointment.status === "COMPLETED" || appointment.status === "ABSENT") {
    throw new Error("El turno ya finalizó");
  }
  if (new Date(appointment.startTime) <= new Date()) {
    throw new Error("Solo se pueden cancelar turnos futuros");
  }

  const updated = await appointmentService.cancel(appointmentId);

  try {
    const { sendAppointmentStatusEmail } = await import("@/lib/email");
    await sendAppointmentStatusEmail({
       to: updated.patient.user.email,
      patientName: updated.patient.user.name || "Paciente",
      specialistName: updated.specialist.user.name || "Especialista",
      specialty: updated.specialist.specialty,
      date: formatInTz(new Date(updated.startTime), "dd/MM/yyyy", AR_TZ),
      time: formatInTz(new Date(updated.startTime), "HH:mm", AR_TZ),
      status: "CANCELLED",
    });
  } catch (emailError) {
    console.error("Error sending cancellation email:", emailError);
  }

  return updated;
}

export async function updateAppointment(id: string, data: {
  patientId?: string;
  specialistId?: string;
  date?: string;
  time?: string;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}) {
  const user = await requirePermission("manage:appointments");
  const parsedData = validateInput(updateAppointmentSchema, data);

  const previous = await db.appointment.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: contactUserSelect } } },
      specialist: { include: { user: { select: contactUserSelect } } },
    },
  });

  if (!previous) {
    throw new Error("Cita no encontrada");
  }
  const ownedSpecialistId = await getSpecialistScope(user);
  if (ownedSpecialistId && previous.specialistId !== ownedSpecialistId) {
    throw new Error("No puedes modificar una cita de otro especialista");
  }
  if (ownedSpecialistId && parsedData.specialistId && parsedData.specialistId !== ownedSpecialistId) {
    throw new Error("No puedes asignar una cita a otro especialista");
  }
  if (parsedData.date && parsedData.time) {
    const startTime = zonedDateTimeToUTC(parsedData.date, parsedData.time, AR_TZ);
    if (startTime <= new Date()) throw new Error("La fecha de inicio debe ser futura");
    await validateAppointmentSlot(parsedData.specialistId || previous.specialistId, startTime, addMinutes(startTime, 30));
  }

  const appointment = await appointmentService.update({
    id,
    ...(parsedData.patientId && { patientId: parsedData.patientId }),
    ...(parsedData.specialistId && { specialistId: parsedData.specialistId }),
    ...(parsedData.date && parsedData.time
      ? {
          startTime: zonedDateTimeToUTC(parsedData.date, parsedData.time, AR_TZ),
          endTime: addMinutes(
            zonedDateTimeToUTC(parsedData.date, parsedData.time, AR_TZ),
            30
          ),
        }
      : {}),
    ...(parsedData.reason !== undefined && { reason: parsedData.reason }),
    ...(parsedData.notes !== undefined && { notes: parsedData.notes }),
    ...(parsedData.status && { status: parsedData.status }),
  });

  if (parsedData.status && parsedData.status !== previous?.status) {
    try {
      const { sendAppointmentStatusEmail } = await import("@/lib/email");
      await sendAppointmentStatusEmail({
        to: appointment.patient.user.email,
        patientName: appointment.patient.user.name || "Paciente",
        specialistName: appointment.specialist.user.name || "Especialista",
        specialty: appointment.specialist.specialty,
        date: formatInTz(new Date(appointment.startTime), "dd/MM/yyyy", AR_TZ),
        time: formatInTz(new Date(appointment.startTime), "HH:mm", AR_TZ),
        status: parsedData.status,
      });
    } catch (emailError) {
      console.error("Error sending status change email:", emailError);
    }
  }

  return appointment;
}
