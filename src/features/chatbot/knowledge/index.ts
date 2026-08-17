import type { UserRole } from "@/types";
import { GENERAL_KB, DASHBOARD_KB, APPOINTMENTS_KB, PATIENTS_KB, SPECIALISTS_KB, SCHEDULES_KB, BLOCKED_DATES_KB, BOOKINGS_KB, USERS_KB, SETTINGS_KB, EXPORTS_KB } from "./general";

export const ROLE_DOCS: Record<UserRole, string> = {
  ADMIN: `
## Capacidades del rol ADMIN
El administrador tiene acceso a todas las secciones del dashboard y a la gestión de usuarios. Puede crear y editar especialistas, pacientes, citas, horarios, días bloqueados y reservas, además de exportar datos y administrar usuarios.
`,
  SPECIALIST: `
## Capacidades del rol SPECIALIST (especialista)
El especialista accede a: dashboard, citas (ver y gestionar), pacientes (ver), horarios (ver y gestionar), reservas online (ver) y configuración. No gestiona usuarios, días bloqueados ni especialistas.
`,
  RECEPTIONIST: `
## Capacidades del rol RECEPTIONIST (recepcionista)
La recepcionista accede a: dashboard, citas, pacientes, especialistas, horarios, días bloqueados y reservas online, con capacidad de gestionar citas, pacientes, especialistas, horarios, días bloqueados y reservas. No gestiona usuarios.
`,
  PATIENT: `
## Capacidades del rol PATIENT (paciente)
El paciente accede únicamente a: dashboard (estadísticas), citas (vista de la sección) y configuración de su cuenta. No tiene acceso a la gestión de citas, pacientes, especialistas, horarios, días bloqueados, reservas ni usuarios. Si necesita gestionar citas debe contactar a la recepción.
`,
};

export const PAGE_DOCS: Record<string, string> = {
  "/": GENERAL_KB,
  "/booking": GENERAL_KB,
  "/booking/confirmation": GENERAL_KB,
  "/dashboard": DASHBOARD_KB,
  "/dashboard/appointments": APPOINTMENTS_KB,
  "/dashboard/patients": PATIENTS_KB,
  "/dashboard/patients/[id]": PATIENTS_KB,
  "/dashboard/specialists": SPECIALISTS_KB,
  "/dashboard/specialists/[id]": SPECIALISTS_KB,
  "/dashboard/schedules": SCHEDULES_KB,
  "/dashboard/blocked-dates": BLOCKED_DATES_KB,
  "/dashboard/bookings": BOOKINGS_KB,
  "/dashboard/users": USERS_KB,
  "/dashboard/settings": SETTINGS_KB,
};

export function getKnowledgeForPage(pathname: string): string {
  return PAGE_DOCS[pathname] ?? GENERAL_KB;
}

export function getKnowledgeForRole(role: UserRole | null): string {
  return role ? ROLE_DOCS[role] : "";
}

export { GENERAL_KB, EXPORTS_KB };