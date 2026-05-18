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