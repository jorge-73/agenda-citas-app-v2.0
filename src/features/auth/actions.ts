"use server";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/schemas/auth-schema";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function loginAction(data: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Datos inválidos", details: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    return { error: "Email o contraseña incorrectos" };
  }
}

export async function registerAction(data: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Datos inválidos", details: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password, role } = validatedFields.data;

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "El email ya está registrado" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
      ...(role === "PATIENT" && {
        patient: {
          create: {},
        },
      }),
      ...(role === "SPECIALIST" && {
        specialist: {
          create: {
            specialty: "General",
          },
        },
      }),
    },
  });

  if (!user) {
    return { error: "Error al crear el usuario" };
  }

  await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  return { success: true };
}

export async function logoutAction() {
  redirect("/login");
}