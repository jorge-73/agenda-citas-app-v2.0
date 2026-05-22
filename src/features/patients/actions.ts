"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth, validateInput } from "@/lib/action-helpers";
import { z } from "zod";

const patientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^[\d\s\-+()]{6,20}$/, "Teléfono inválido").optional().or(z.literal("")),
  document: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  insurance: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

export async function createPatientAction(data: {
  name: string;
  email: string;
  phone?: string;
  document?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  insurance?: string;
  insuranceNumber?: string;
}) {
  await requireAuth();
  validateInput(patientSchema, data);

  const existingUser = await db.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    const existingPatient = await db.patient.findUnique({ where: { userId: existingUser.id } });
    if (existingPatient) {
      throw new Error("El paciente ya existe");
    }
    await db.patient.create({
      data: {
        userId: existingUser.id,
        phone: data.phone || null,
        document: data.document || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        address: data.address || null,
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        allergies: data.allergies || null,
        medicalConditions: data.medicalConditions || null,
        insurance: data.insurance || null,
        insuranceNumber: data.insuranceNumber || null,
      },
    });
  } else {
    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: "changeme123",
        role: "PATIENT",
      },
    });
    await db.patient.create({
      data: {
        userId: user.id,
        phone: data.phone || null,
        document: data.document || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        address: data.address || null,
        emergencyContact: data.emergencyContact || null,
        bloodType: data.bloodType || null,
        allergies: data.allergies || null,
        medicalConditions: data.medicalConditions || null,
        insurance: data.insurance || null,
        insuranceNumber: data.insuranceNumber || null,
      },
    });
  }

  revalidatePath("/dashboard/patients");
}

export async function updatePatientAction(
  id: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
    birthDate?: string;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
    allergies?: string;
    medicalConditions?: string;
    insurance?: string;
    insuranceNumber?: string;
  }
) {
  await requireAuth();
  validateInput(patientSchema, data);

  const patient = await db.patient.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!patient) throw new Error("Paciente no encontrado");

  await db.user.update({
    where: { id: patient.userId },
    data: { name: data.name },
  });

  await db.patient.update({
    where: { id },
    data: {
      phone: data.phone || null,
      document: data.document || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      address: data.address || null,
      emergencyContact: data.emergencyContact || null,
      bloodType: data.bloodType || null,
      allergies: data.allergies || null,
      medicalConditions: data.medicalConditions || null,
      insurance: data.insurance || null,
      insuranceNumber: data.insuranceNumber || null,
    },
  });

  revalidatePath("/dashboard/patients");
}
