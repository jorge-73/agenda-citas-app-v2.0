import type { UserRole } from "@/types";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  SPECIALIST: "Especialista",
  RECEPTIONIST: "Recepcionista",
  PATIENT: "Paciente",
};