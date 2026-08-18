// ─── User Roles ────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  SPECIALIST: "Especialista",
  RECEPTIONIST: "Recepcionista",
  PATIENT: "Paciente",
};

export const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-primary/15 text-primary border border-primary/25",
  SPECIALIST: "bg-info/15 text-info border border-info/25",
  RECEPTIONIST: "bg-warning/15 text-warning border border-warning/25",
  PATIENT: "bg-success/15 text-success border border-success/25",
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