export interface Booking {
  id: string;
  patientName: string;
  patientLastname: string;
  patientEmail: string;
  patientPhone: string;
  patientId?: string | null;
  specialistId: string;
  specialty: string;
  reason?: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  date: Date;
  time: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  patientName: string;
  patientLastname: string;
  patientEmail: string;
  patientPhone: string;
  patientId?: string;
  specialistId: string;
  specialty: string;
  reason?: string;
  date: Date;
  time: string;
}

export interface BookingStep {
  specialty?: string;
  specialistId?: string;
  date?: Date;
  time?: string;
  patientName?: string;
  patientLastname?: string;
  patientEmail?: string;
  patientPhone?: string;
  reason?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface SpecialistAvailability {
  specialistId: string;
  date: Date;
  slots: TimeSlot[];
}

export const BOOKING_STEPS = [
  { id: 1, name: "Especialidad", key: "specialty" },
  { id: 2, name: "Profesional", key: "specialistId" },
  { id: 3, name: "Fecha", key: "date" },
  { id: 4, name: "Horario", key: "time" },
  { id: 5, name: "Datos", key: "patient" },
  { id: 6, name: "Confirmar", key: "confirm" },
] as const;

export const SPECIALTY_ICONS: Record<string, string> = {
  "Medicina General": "🏥",
  "Cardiología": "❤️",
  "Dermatología": "🧴",
  "Endocrinología": "🧬",
  "Gastroenterología": "🫁",
  "Ginecología": "👩",
  "Neurología": "🧠",
  "Oftalmología": "👁️",
  "Ortopedia": "🦴",
  "Pediatría": "👶",
  "Psiquiatría": "🧘",
  "Urología": "🔬",
  "Oncología": "🎗️",
  "Neumología": "💨",
  "Nefrología": "🫘",
};