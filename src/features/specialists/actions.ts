"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requireAuth, validateInput } from "@/lib/action-helpers";
import { PHONE_REGEX } from "@/lib/constants";
import { z } from "zod";

const specialistSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  specialty: z.string().min(3, "La especialidad es requerida"),
  license: z.string().optional(),
  phone: z.string().regex(PHONE_REGEX, "Teléfono inválido").optional().or(z.literal("")),
  bio: z.string().optional(),
  consultationDuration: z.number().positive("La duración debe ser positiva").optional(),
  price: z.string().refine(
    (v) => v === "" || (!isNaN(parseFloat(v)) && parseFloat(v) > 0),
    "El precio debe ser un número positivo"
  ).optional(),
  isAvailable: z.boolean().optional(),
});

export async function createSpecialistAction(data: {
  name: string;
  email: string;
  specialty: string;
  license?: string;
  phone?: string;
  bio?: string;
  consultationDuration?: number;
  price?: string;
  isAvailable?: boolean;
}) {
  await requireAuth();
  validateInput(specialistSchema, data);

  const existingUser = await db.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    const existingSpecialist = await db.specialist.findUnique({ where: { userId: existingUser.id } });
    if (existingSpecialist) {
      throw new Error("El especialista ya existe");
    }
    await db.specialist.create({
      data: {
        userId: existingUser.id,
        specialty: data.specialty,
        license: data.license || null,
        phone: data.phone || null,
        bio: data.bio || null,
        consultationDuration: data.consultationDuration || 30,
        price: data.price ? parseFloat(data.price) : null,
        isAvailable: data.isAvailable ?? true,
      },
    });
  } else {
    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: "changeme123",
        role: "SPECIALIST",
      },
    });
    await db.specialist.create({
      data: {
        userId: user.id,
        specialty: data.specialty,
        license: data.license || null,
        phone: data.phone || null,
        bio: data.bio || null,
        consultationDuration: data.consultationDuration || 30,
        price: data.price ? parseFloat(data.price) : null,
        isAvailable: data.isAvailable ?? true,
      },
    });
  }

  revalidatePath("/dashboard/specialists");
}

export async function updateSpecialistAction(
  id: string,
  data: {
    name: string;
    email: string;
    specialty: string;
    license?: string;
    phone?: string;
    bio?: string;
    consultationDuration?: number;
    price?: string;
    isAvailable?: boolean;
  }
) {
  await requireAuth();
  validateInput(specialistSchema, data);

  const specialist = await db.specialist.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!specialist) throw new Error("Especialista no encontrado");

  await db.user.update({
    where: { id: specialist.userId },
    data: { name: data.name },
  });

  await db.specialist.update({
    where: { id },
    data: {
      specialty: data.specialty,
      license: data.license || null,
      phone: data.phone || null,
      bio: data.bio || null,
      consultationDuration: data.consultationDuration || 30,
      price: data.price ? parseFloat(data.price) : null,
      isAvailable: data.isAvailable ?? true,
    },
  });

  revalidatePath("/dashboard/specialists");
}
