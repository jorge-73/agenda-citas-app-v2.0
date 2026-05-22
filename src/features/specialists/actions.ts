"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
  const user = await db.user.findUnique({ where: { email: data.email } });
  if (user) {
    await db.user.update({
      where: { id: user.id },
      data: { name: data.name },
    });
  }

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
