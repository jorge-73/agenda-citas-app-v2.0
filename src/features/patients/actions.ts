"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
  const user = await db.user.findUnique({ where: { email: data.email } });
  if (user) {
    await db.user.update({
      where: { id: user.id },
      data: { name: data.name },
    });
  }

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
