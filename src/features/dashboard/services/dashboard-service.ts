"use server";

import { db } from "@/lib/db";
import { MAX_LIMIT } from "@/lib/constants";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  startOfDay, 
  endOfDay,
  subMonths,
  eachDayOfInterval,
  format,
  isWithinInterval,
  subWeeks,
  subDays
} from "date-fns";

export interface DashboardStats {
  totalAppointments: number;
  totalRevenue: number;
  cancelledAppointments: number;
  newPatients: number;
  newBookings: number;
  activeSpecialists: number;
}

export interface ChartDataPoint {
  date: string;
  label: string;
  value: number;
}

export interface SpecialistRevenue {
  specialistName: string;
  revenue: number;
  appointmentCount: number;
}

export interface AppointmentWithDetails {
  id: string;
  startTime: Date;
  status: string;
  patientName: string;
  patientLastname: string;
  specialistName: string;
  specialty: string;
  reason?: string | null;
}

export interface RecentPatient {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: Date;
}

export interface ActivityItem {
  id: string;
  type: "appointment" | "patient" | "booking" | "specialist";
  action: string;
  description: string;
  timestamp: Date;
}

export async function getDashboardStats(startDate: Date, endDate: Date): Promise<DashboardStats> {
  const [
    totalAppointments,
    cancelledAppointments,
    newPatients,
    newBookings,
    activeSpecialists,
    appointmentsWithPrice
  ] = await Promise.all([
    db.appointment.count({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    db.appointment.count({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        },
        status: "CANCELLED"
      }
    }),
    db.patient.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    db.booking.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    db.specialist.count({
      where: {
        isAvailable: true
      }
    }),
    db.appointment.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        },
        status: { not: "CANCELLED" }
      },
      include: {
        specialist: {
          include: {
            user: true
          }
        }
      }
    })
  ]);

  const totalRevenue = appointmentsWithPrice.reduce((sum, apt) => {
    return sum + (apt.specialist.price || 0);
  }, 0);

  return {
    totalAppointments,
    totalRevenue,
    cancelledAppointments,
    newPatients,
    newBookings,
    activeSpecialists
  };
}

export async function getAppointmentsByDay(startDate: Date, endDate: Date): Promise<ChartDataPoint[]> {
  const appointments = await db.appointment.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      startTime: true
    }
  });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const count = appointments.filter(apt => 
      isWithinInterval(new Date(apt.startTime), { start: dayStart, end: dayEnd })
    ).length;

    return {
      date: format(day, "yyyy-MM-dd"),
      label: format(day, "d MMM"),
      value: count
    };
  });
}

export async function getBookingsByDay(startDate: Date, endDate: Date): Promise<ChartDataPoint[]> {
  const bookings = await db.booking.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      },
      status: { in: ["PENDING", "CONFIRMED"] }
    },
    select: {
      date: true
    }
  });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  return days.map(day => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const count = bookings.filter(booking => 
      isWithinInterval(new Date(booking.date), { start: dayStart, end: dayEnd })
    ).length;

    return {
      date: format(day, "yyyy-MM-dd"),
      label: format(day, "d MMM"),
      value: count
    };
  });
}

export async function getRevenueBySpecialist(startDate: Date, endDate: Date): Promise<SpecialistRevenue[]> {
  const appointments = await db.appointment.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate
      },
      status: { not: "CANCELLED" }
    },
    include: {
      specialist: {
        include: {
          user: true
        }
      }
    }
  });

  const specialistMap = new Map<string, SpecialistRevenue>();

  appointments.forEach(apt => {
    const specialistName = apt.specialist.user.name || "Sin nombre";
    const existing = specialistMap.get(specialistName) || {
      specialistName,
      revenue: 0,
      appointmentCount: 0
    };

    specialistMap.set(specialistName, {
      specialistName,
      revenue: existing.revenue + (apt.specialist.price || 0),
      appointmentCount: existing.appointmentCount + 1
    });
  });

  return Array.from(specialistMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

export async function getAppointmentsBySpecialty(startDate: Date, endDate: Date): Promise<ChartDataPoint[]> {
  const appointments = await db.appointment.findMany({
    where: {
      startTime: {
        gte: startDate,
        lte: endDate
      },
      status: { not: "CANCELLED" }
    },
    include: {
      specialist: true
    }
  });

  const specialtyMap = new Map<string, number>();

  appointments.forEach(apt => {
    const count = specialtyMap.get(apt.specialist.specialty) || 0;
    specialtyMap.set(apt.specialist.specialty, count + 1);
  });

  return Array.from(specialtyMap.entries()).map(([specialty, count]) => ({
    date: specialty,
    label: specialty,
    value: count
  })).sort((a, b) => b.value - a.value);
}

export async function getTodayAppointments(): Promise<AppointmentWithDetails[]> {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const appointments = await db.appointment.findMany({
    where: {
      startTime: {
        gte: dayStart,
        lte: dayEnd
      }
    },
    include: {
      patient: {
        include: {
          user: true
        }
      },
      specialist: {
        include: {
          user: true
        }
      }
    },
    orderBy: {
      startTime: "asc"
    }
  });

  return appointments.map(apt => ({
    id: apt.id,
    startTime: apt.startTime,
    status: apt.status,
    patientName: apt.patient.user.name || "",
    patientLastname: "",
    specialistName: apt.specialist.user.name || "",
    specialty: apt.specialist.specialty,
    reason: apt.reason
  }));
}

export async function getRecentPatients(limit: number = 10): Promise<RecentPatient[]> {
  const patients = await db.patient.findMany({
    include: {
      user: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: Math.min(limit, MAX_LIMIT)
  });

  return patients.map(p => ({
    id: p.id,
    name: p.user.name || "",
    email: p.user.email,
    phone: p.phone,
    createdAt: p.createdAt
  }));
}

export async function getRecentActivity(limit: number = 20): Promise<ActivityItem[]> {
  const [
    recentAppointments,
    recentPatients,
    recentBookings
  ] = await Promise.all([
    db.appointment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { include: { user: true } },
        specialist: { include: { user: true } }
      }
    }),
    db.patient.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    }),
    db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const activities: ActivityItem[] = [];

  recentAppointments.forEach(apt => {
    activities.push({
      id: `apt-${apt.id}`,
      type: "appointment",
      action: apt.status === "CANCELLED" ? "cancelled" : "scheduled",
      description: `Cita ${apt.status === "CANCELLED" ? "cancelada" : "programada"}: ${apt.patient.user.name} con ${apt.specialist.user.name}`,
      timestamp: apt.createdAt
    });
  });

  recentPatients.forEach(pat => {
    activities.push({
      id: `pat-${pat.id}`,
      type: "patient",
      action: "created",
      description: `Nuevo paciente registrado: ${pat.user.name}`,
      timestamp: pat.createdAt
    });
  });

  recentBookings.forEach(booking => {
    activities.push({
      id: `book-${booking.id}`,
      type: "booking",
      action: "created",
      description: `Reserva online: ${booking.patientName} - ${booking.specialty}`,
      timestamp: booking.createdAt
    });
  });

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, Math.min(limit, MAX_LIMIT));
}