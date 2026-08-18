// ─── User Roles ────────────────────────────────────────────────────

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