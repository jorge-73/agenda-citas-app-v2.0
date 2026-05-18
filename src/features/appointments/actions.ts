"use server";

import { db } from "@/lib/db";
import { AppointmentStatus } from "./types";

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
  return db.appointment.create({
    data: {
      patientId: data.patientId,
      specialistId: data.specialistId,
      startTime: data.startTime,
      endTime: data.endTime,
      reason: data.reason,
      notes: data.notes,
      status: "PENDING",
    },
  });
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
  return db.appointment.update({
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
  });
}