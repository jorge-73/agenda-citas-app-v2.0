export interface Patient {
  id: string;
  userId: string;
  phone?: string | null;
  document?: string | null;
  birthDate?: Date | null;
  address?: string | null;
  emergencyContact?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  medicalConditions?: string | null;
  insurance?: string | null;
  insuranceNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  appointments?: { id: string; startTime: Date; status: string }[];
}

export interface CreatePatientInput {
  userId: string;
  phone?: string;
  document?: string;
  birthDate?: Date;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  insurance?: string;
  insuranceNumber?: string;
}

export interface UpdatePatientInput {
  id: string;
  phone?: string;
  document?: string;
  birthDate?: Date;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  insurance?: string;
  insuranceNumber?: string;
}

export interface PatientFilters {
  search?: string;
  document?: string;
  insurance?: string;
}

export const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;