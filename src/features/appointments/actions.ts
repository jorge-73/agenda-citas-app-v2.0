"use server";

import { db } from "@/lib/db";
import type { AppointmentStatus } from "./types";
import { format } from "date-fns";
import { requireAuth, validateInput } from "@/lib/action-helpers";
import { APPOINTMENT_STATUSES } from "@/lib/constants";
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
  const appointments = await db.appointment.findMany({
    where: {
      ...(filters.specialistId && { specialistId: filters.specialistId }),
      ...(filters.patientId && { patientId: filters.patientId }),
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
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  
  const appointments = await db.appointment.findMany({
    where: {
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
  const appointments = await db.appointment.findMany({
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
  await requireAuth();
  validateInput(createAppointmentSchema, data);

  const appointment = await db.appointment.create({
    data: {
      patientId: data.patientId,
      specialistId: data.specialistId,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
      notes: data.notes,
      status: "PENDING",
    },
    include: {
      patient: { include: { user: true } },
      specialist: { include: { user: true } },
    },
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
  await requireAuth();
  const parsed = z.string().min(1, "ID requerido").safeParse(id);
  if (!parsed.success) throw new Error("ID de cita inválido");

  return db.appointment.delete({ where: { id } });
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
  await requireAuth();
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

  const appointment = await db.appointment.update({
    where: { id },
    data: {
      ...(data.patientId && { patientId: data.patientId }),
      ...(data.specialistId && { specialistId: data.specialistId }),
      ...(data.startTime && { startTime: data.startTime }),
      ...(data.endTime && { endTime: data.endTime }),
      ...(data.reason !== undefined && { reason: data.reason }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.status && { status: data.status }),
    },
    include: {
      patient: { include: { user: true } },
      specialist: { include: { user: true } },
    },
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
