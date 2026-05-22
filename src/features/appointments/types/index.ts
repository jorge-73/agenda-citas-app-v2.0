export type AppointmentStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "CANCELLED" 
  | "COMPLETED" 
  | "ABSENT";

export interface Appointment {
  id: string;
  patientId: string;
  specialistId: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
  specialist?: Specialist;
}

export interface Patient {
  id: string;
  userId: string;
  phone?: string | null;
  document?: string | null;
  birthDate?: Date | null;
  address?: string | null;
  emergencyContact?: string | null;
  user?: User;
}

export interface Specialist {
  id: string;
  userId: string;
  specialty: string;
  license?: string | null;
  phone?: string | null;
  bio?: string | null;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  image?: string | null;
}

export interface Schedule {
  id: string;
  specialistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BlockedDate {
  id: string;
  date: Date;
  reason?: string | null;
  isRecurring: boolean;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface CreateAppointmentInput {
  patientId: string;
  specialistId: string;
  startTime: Date;
  endTime: Date;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  id: string;
  patientId?: string;
  specialistId?: string;
  startTime?: Date;
  endTime?: Date;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface AppointmentFilters {
  specialistId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  patientName?: string;
  specialistName?: string;
  reason?: string;
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "var(--status-pending)",
  CONFIRMED: "var(--status-confirmed)",
  CANCELLED: "var(--status-cancelled)",
  COMPLETED: "var(--status-completed)",
  ABSENT: "var(--status-absent)",
};

export const APPOINTMENT_STATUS_COLORS_HEX: Record<AppointmentStatus, string> = {
  PENDING: "#fbbf24",
  CONFIRMED: "#22c55e",
  CANCELLED: "#ef4444",
  COMPLETED: "#3b82f6",
  ABSENT: "#6b7280",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Finalizado",
  ABSENT: "Ausente",
};

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const DEFAULT_APPOINTMENT_DURATION = 30; // minutes