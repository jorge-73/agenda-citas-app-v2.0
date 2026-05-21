// ─── Appointment Status ────────────────────────────────────────────

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "ABSENT";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Finalizado",
  ABSENT: "Ausente",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
  CONFIRMED: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
  CANCELLED: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30",
  COMPLETED: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30",
  ABSENT: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/30",
};

export const APPOINTMENT_STATUS_BADGE: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  ABSENT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

// ─── User Roles ────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "SPECIALIST" | "RECEPTIONIST" | "PATIENT";

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  SPECIALIST: "Especialista",
  RECEPTIONIST: "Recepcionista",
  PATIENT: "Paciente",
};

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  SPECIALIST: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RECEPTIONIST: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  PATIENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

// ─── Days of Week ──────────────────────────────────────────────────

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

export const DAY_OF_WEEK_SHORT: Record<number, string> = {
  0: "Dom",
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
};

// ─── Booking Status ────────────────────────────────────────────────

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30",
  CONFIRMED: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30",
  CANCELLED: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30",
};

// ─── Specialist ────────────────────────────────────────────────────

export const SPECIALTY_GRADIENTS: Record<string, string> = {
  "Medicina General": "from-emerald-500/20 to-emerald-600/5",
  "Cardiología": "from-rose-500/20 to-rose-600/5",
  "Neurología": "from-violet-500/20 to-violet-600/5",
  "Oftalmología": "from-sky-500/20 to-sky-600/5",
  "Pediatría": "from-amber-500/20 to-amber-600/5",
  "Dermatología": "from-teal-500/20 to-teal-600/5",
  "Ginecología": "from-pink-500/20 to-pink-600/5",
  "Ortopedia": "from-indigo-500/20 to-indigo-600/5",
  "Endocrinología": "from-orange-500/20 to-orange-600/5",
  "Gastroenterología": "from-lime-500/20 to-lime-600/5",
  "Psiquiatría": "from-purple-500/20 to-purple-600/5",
  "Urología": "from-cyan-500/20 to-cyan-600/5",
  "Oncología": "from-red-500/20 to-red-600/5",
  "Neumología": "from-blue-500/20 to-blue-600/5",
  "Nefrología": "from-yellow-500/20 to-yellow-600/5",
};