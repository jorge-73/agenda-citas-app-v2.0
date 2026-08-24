"use server";

import { db } from "@/lib/db";
import type { AppointmentStatus } from "./types";
import { format, endOfDay } from "date-fns";
import { requirePermission, validateInput } from "@/lib/action-helpers";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
import { toUTC, AR_TZ } from "@/lib/date-utils";
import { appointmentService } from "./services/appointment-service";
import { z } from "zod";

const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente requerido"),
  specialistId: z.string().min(1, "Especialista requerido"),
  startTime: z.date().refine((d) => d > new Date(), "La fecha de inicio debe ser futura"),
  endTime: z.date().refine((d) => d > new Date(), "La fecha de fin debe ser futura"),
  reason: z.string().optional(),
  notes: z.string().optional(),
}).refine((d) => d.endTime > d.startTime, {
  message: "La fecha de fin debe ser posterior a la de inicio",
  path: ["endTime"],
});

const updateAppointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente requerido").optional(),
  specialistId: z.string().min(1, "Especialista requerido").optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(APPOINTMENT_STATUSES).optional(),
}).refine((d) => {
  if (d.startTime && d.endTime) return d.endTime > d.startTime;
  return true;
}, {
  message: "La fecha de fin debe ser posterior a la de inicio",
  path: ["endTime"],
});

export async function getFilteredAppointmentsAction(filters: {
  specialistId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}) {
  const user = await requirePermission("view:appointments");
  let scopedPatientId: string | undefined = filters.patientId;
  if (user.role === "PATIENT") {
    const patient = await db.patient.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!patient) return [];
    scopedPatientId = patient.id;
  }
  const appointments = await db.appointment.findMany({
    where: {
      ...(filters.specialistId && { specialistId: filters.specialistId }),
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
      patient: { include: { user: true } },
      specialist: { include: { user: true } },
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
  if (user.role === "PATIENT") {
    const patient = await db.patient.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!patient) return [];
    scopedPatientId = patient.id;
  }
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = endOfDay(new Date(year, month + 1, 0));
  
  const appointments = await db.appointment.findMany({
    where: {
      ...(scopedPatientId && { patientId: scopedPatientId }),
      startTime: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
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
  });
  
  return appointments.map((apt) => ({
    ...apt,
    status: apt.status as AppointmentStatus,
  }));
}

export async function getAllAppointments() {
  const user = await requirePermission("view:appointments");
  let scopedPatientId: string | undefined;
  if (user.role === "PATIENT") {
    const patient = await db.patient.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!patient) return [];
    scopedPatientId = patient.id;
  }
  const appointments = await db.appointment.findMany({
    where: scopedPatientId ? { patientId: scopedPatientId } : undefined,
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
      user: true,
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
      user: true,
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
  startTime: Date;
  endTime: Date;
  reason?: string;
  notes?: string;
}) {
  await requirePermission("manage:appointments");
  validateInput(createAppointmentSchema, data);

  const appointment = await appointmentService.create({
    patientId: data.patientId,
    specialistId: data.specialistId,
    startTime: toUTC(data.startTime, AR_TZ),
    endTime: toUTC(data.endTime, AR_TZ),
    reason: data.reason,
    notes: data.notes,
  });

  try {
    const { sendBookingConfirmationEmail } = await import("@/lib/email");
    await sendBookingConfirmationEmail({
      to: appointment.patient.user.email,
      patientName: appointment.patient.user.name || "Paciente",
      patientLastname: "",
      specialistName: appointment.specialist.user.name || "Especialista",
      specialty: appointment.specialist.specialty,
      date: format(new Date(appointment.startTime), "dd/MM/yyyy"),
      time: format(new Date(appointment.startTime), "HH:mm"),
      reason: appointment.reason || undefined,
    });
  } catch (emailError) {
    console.error("Error sending appointment confirmation email:", emailError);
  }

  return appointment;
}

export async function deleteAppointment(id: string) {
  await requirePermission("manage:appointments");
  const parsed = z.string().min(1, "ID requerido").safeParse(id);
  if (!parsed.success) throw new Error("ID de cita inválido");

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
      patient: { include: { user: true } },
      specialist: { include: { user: true } },
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

  const updated = await db.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
    include: {
      patient: { include: { user: true } },
      specialist: { include: { user: true } },
    },
  });

  try {
    const { sendAppointmentStatusEmail } = await import("@/lib/email");
    await sendAppointmentStatusEmail({
      to: updated.patient.user.email,
      patientName: updated.patient.user.name || "Paciente",
      specialistName: updated.specialist.user.name || "Especialista",
      specialty: updated.specialist.specialty,
      date: format(new Date(updated.startTime), "dd/MM/yyyy"),
      time: format(new Date(updated.startTime), "HH:mm"),
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
  startTime?: Date;
  endTime?: Date;
  reason?: string;
  notes?: string;
  status?: AppointmentStatus;
}) {
  await requirePermission("manage:appointments");
  validateInput(updateAppointmentSchema, data);

  const previous = await db.appointment.findUnique({
    where: { id },
    include: {
      patient: { include: { user: true } },
      specialist: { include: { user: true } },
    },
  });

  if (!previous) {
    throw new Error("Cita no encontrada");
  }

  const appointment = await appointmentService.update({
    id,
    ...(data.patientId && { patientId: data.patientId }),
    ...(data.specialistId && { specialistId: data.specialistId }),
    ...(data.startTime && { startTime: toUTC(data.startTime, AR_TZ) }),
    ...(data.endTime && { endTime: toUTC(data.endTime, AR_TZ) }),
    ...(data.reason !== undefined && { reason: data.reason }),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.status && { status: data.status }),
  });

  if (data.status && data.status !== previous?.status) {
    try {
      const { sendAppointmentStatusEmail } = await import("@/lib/email");
      await sendAppointmentStatusEmail({
        to: appointment.patient.user.email,
        patientName: appointment.patient.user.name || "Paciente",
        specialistName: appointment.specialist.user.name || "Especialista",
        specialty: appointment.specialist.specialty,
        date: format(new Date(appointment.startTime), "dd/MM/yyyy"),
        time: format(new Date(appointment.startTime), "HH:mm"),
        status: data.status,
      });
    } catch (emailError) {
      console.error("Error sending status change email:", emailError);
    }
  }

  return appointment;
}
