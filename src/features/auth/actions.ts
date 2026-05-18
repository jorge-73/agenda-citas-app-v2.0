"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(data: { email: string; password: string }) {
  try {
    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      return { error: "Credenciales inválidas" };
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      return { error: "Credenciales inválidas" };
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Error al iniciar sesión" };
  }
}

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "El email ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || "PATIENT",
      },
    });

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Error al registrar usuario" };
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}