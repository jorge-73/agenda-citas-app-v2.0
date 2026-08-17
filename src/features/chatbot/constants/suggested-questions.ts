import type { UserRole } from "@/types";

const ANONYMOUS_QUESTIONS = [
  "¿Cómo saco una cita online?",
  "¿Cómo me registro?",
  "Olvidé mi contraseña, ¿qué hago?",
  "¿Qué es CitasMed?",
];

const ROLE_QUESTIONS: Record<UserRole, string[]> = {
  PATIENT: [
    "¿Cómo veo mis próximas citas?",
    "¿Cómo saco una cita?",
    "¿Cómo cambio mis datos?",
    "¿Cómo funciona la reserva online?",
  ],
  SPECIALIST: [
    "¿Dónde veo mis citas?",
    "¿Cómo configuro mis horarios?",
    "¿Cómo bloqueo un día?",
    "¿Cómo funciona mi calendario?",
  ],
  RECEPTIONIST: [
    "¿Cómo creo una cita para un paciente?",
    "¿Cómo confirmo una reserva?",
    "¿Dónde veo las reservas online?",
    "¿Cómo busco un paciente?",
  ],
  ADMIN: [
    "¿Cómo agrego un especialista?",
    "¿Cómo creo un usuario?",
    "¿Cómo funcionan los permisos?",
    "¿Dónde se configura el sistema?",
  ],
};

const PAGE_QUESTIONS: Record<string, string[]> = {
  "/": ["¿Qué es CitasMed?", "¿Cómo saco una cita online?"],
  "/booking": ["¿Cómo funciona la reserva online?", "¿Qué necesito para reservar?"],
  "/dashboard": ["¿Qué muestran las estadísticas?", "¿Cómo cambio el rango de fechas?"],
  "/dashboard/appointments": [
    "¿Cómo creo una cita?",
    "¿Cómo cambio el estado de una cita?",
  ],
  "/dashboard/patients": ["¿Cómo creo un paciente?", "¿Cómo busco un paciente?"],
  "/dashboard/specialists": ["¿Cómo agrego un especialista?", "¿Cómo cambio la disponibilidad?"],
  "/dashboard/schedules": ["¿Cómo agrego un horario?", "¿Qué días se pueden configurar?"],
  "/dashboard/blocked-dates": [
    "¿Cómo bloqueo una fecha?",
    "¿Qué significa recurrente cada año?",
  ],
  "/dashboard/bookings": ["¿Cómo confirmo una reserva?", "¿Cómo cancelo una reserva?"],
  "/dashboard/users": ["¿Cómo creo un usuario?", "¿Qué roles puedo asignar?"],
  "/dashboard/settings": ["¿Cómo cambio mi contraseña?", "¿Cómo configuro mis preferencias?"],
};

export function getSuggestedQuestions(
  role: UserRole | null | undefined,
  pathname: string
): string[] {
  const pageQuestions = PAGE_QUESTIONS[pathname] ?? [];
  const roleQuestions = role ? (ROLE_QUESTIONS[role] ?? []) : ANONYMOUS_QUESTIONS;

  const result: string[] = [];
  for (const q of [...pageQuestions, ...roleQuestions]) {
    if (!result.includes(q)) {
      result.push(q);
    }
    if (result.length >= 4) {
      break;
    }
  }
  return result;
}