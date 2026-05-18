export interface Specialist {
  id: string;
  userId: string;
  specialty: string;
  license?: string | null;
  phone?: string | null;
  bio?: string | null;
  consultationDuration: number;
  price?: number | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  schedules?: Schedule[];
  appointments?: any[];
}

export interface Schedule {
  id: string;
  specialistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface CreateSpecialistInput {
  userId: string;
  specialty: string;
  license?: string;
  phone?: string;
  bio?: string;
  consultationDuration?: number;
  price?: number;
  isAvailable?: boolean;
}

export interface UpdateSpecialistInput {
  id: string;
  specialty?: string;
  license?: string;
  phone?: string;
  bio?: string;
  consultationDuration?: number;
  price?: number;
  isAvailable?: boolean;
}

export interface SpecialistFilters {
  search?: string;
  specialty?: string;
  isAvailable?: boolean;
}

export const SPECIALTIES = [
  "Medicina General",
  "Cardiología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Geriatría",
  "Ginecología",
  "Hematología",
  "Infectología",
  "Nefrología",
  "Neonatología",
  "Neumología",
  "Neurología",
  "Oftalmología",
  "Oncología",
  "Ortopedia",
  "Otorrinolaringología",
  "Pediatría",
  "Psiquiatría",
  "Reumatología",
  "Urología",
] as const;