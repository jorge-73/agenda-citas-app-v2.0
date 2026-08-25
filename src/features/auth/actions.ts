"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getRequestRateLimitKey } from "@/lib/rate-limit";
import { isValidTimeZone } from "@/lib/date-utils";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/schemas/auth-schema";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
  email: z.string().trim().toLowerCase().email("Email inválido").optional(),
  phone: z.string().trim().optional(),
  timezone: z.string().refine(isValidTimeZone, "Zona horaria inválida").optional(),
});

export async function loginAction(data: { email: string; password: string; rememberMe?: boolean }) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: parsed.data.rememberMe ? "true" : "false",
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
}) {
  const parsed = registerSchema.safeParse({ ...data, confirmPassword: data.password });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const rateKey = await getRequestRateLimitKey(parsed.data.email, "register");
  const rateCheck = await checkRateLimit(rateKey, 3, 60_000);
  if (!rateCheck.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser) {
      return { error: "El email ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashedPassword,
        role: "PATIENT",
        patient: { create: {} },
      },
    });

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
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

export async function requestPasswordResetAction(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const parsed = forgotPasswordSchema.safeParse({ email: normalizedEmail });
  if (!parsed.success) return { error: "Email inválido" };
  const rateKey = await getRequestRateLimitKey(parsed.data.email, "reset-request");
  const rateCheck = await checkRateLimit(rateKey, 3, 300_000);
  if (!rateCheck.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en 5 minutos." };
  }

  try {
    const user = await db.user.findUnique({ where: { email: parsed.data.email } });

    if (!user) {
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await db.passwordResetToken.create({
      data: { email: parsed.data.email, token, expires },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(parsed.data.email, resetLink);

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Error al procesar la solicitud" };
  }
}

export async function resetPasswordAction(token: string, password: string) {
  const parsed = resetPasswordSchema.pick({ token: true, password: true }).safeParse({ token, password });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  const rateKey = await getRequestRateLimitKey(parsed.data.token, "reset-password");
  const rateCheck = await checkRateLimit(rateKey, 5, 60_000);
  if (!rateCheck.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." };
  }

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
    });

    if (!resetToken) {
      return { error: "Token inválido o expirado" };
    }

    if (new Date() > resetToken.expires) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { error: "El token ha expirado. Solicita un nuevo restablecimiento." };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({ where: { id: resetToken.id } });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Error al restablecer la contraseña" };
  }
}

export async function updateProfileAction(data: {
  name?: string;
  email?: string;
  phone?: string;
  timezone?: string;
}) {
  const parsed = updateProfileSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  try {
    const session = await import("@/lib/auth").then((m) => m.auth());
    if (!session?.user?.id) return { error: "No autorizado" };

    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.email && { email: parsed.data.email }),
      },
    });

    if (parsed.data.phone !== undefined) {
      const existingPatient = await db.patient.findUnique({
        where: { userId: session.user.id },
      });
      if (existingPatient) {
        await db.patient.update({
          where: { userId: session.user.id },
          data: { phone: parsed.data.phone },
        });
      } else {
        await db.patient.create({
          data: { userId: session.user.id, phone: parsed.data.phone },
        });
      }
    }

    if (parsed.data.timezone) {
      await db.userPreference.upsert({
        where: { userId: session.user.id },
        update: { timezone: parsed.data.timezone },
        create: { userId: session.user.id, timezone: parsed.data.timezone },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Error al actualizar el perfil" };
  }
}

export async function changePasswordAction(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const parsed = changePasswordSchema.pick({ currentPassword: true, newPassword: true })
    .safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  try {
    const session = await import("@/lib/auth").then((m) => m.auth());
    if (!session?.user?.id) return { error: "No autorizado" };

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "Usuario no encontrado" };

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isValid) return { error: "La contraseña actual es incorrecta" };

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Error al cambiar la contraseña" };
  }
}
