"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function loginAction(data: { email: string; password: string; rememberMe?: boolean }) {
  const rateKey = getRateLimitKey(data.email, "login");
  const rateCheck = checkRateLimit(rateKey, 5, 60_000);
  if (!rateCheck.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." };
  }

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
      rememberMe: data.rememberMe ? "true" : "false",
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
  const rateKey = getRateLimitKey(data.email, "register");
  const rateCheck = checkRateLimit(rateKey, 3, 60_000);
  if (!rateCheck.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." };
  }

  try {
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: "El email ya está registrado" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    await db.user.create({
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

export async function requestPasswordResetAction(email: string) {
  const rateKey = getRateLimitKey(email, "reset-request");
  const rateCheck = checkRateLimit(rateKey, 3, 300_000);
  if (!rateCheck.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en 5 minutos." };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user) {
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await db.passwordResetToken.create({
      data: { email, token, expires },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetLink);

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Error al procesar la solicitud" };
  }
}

export async function resetPasswordAction(token: string, password: string) {
  const rateKey = getRateLimitKey(token, "reset-password");
  const rateCheck = checkRateLimit(rateKey, 5, 60_000);
  if (!rateCheck.allowed) {
    return { error: "Demasiados intentos. Intenta de nuevo en 1 minuto." };
  }

  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { error: "Token inválido o expirado" };
    }

    if (new Date() > resetToken.expires) {
      await db.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { error: "El token ha expirado. Solicita un nuevo restablecimiento." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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
  try {
    const session = await import("@/lib/auth").then((m) => m.auth());
    if (!session?.user?.id) return { error: "No autorizado" };

    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
      },
    });

    if (data.timezone) {
      await db.userPreference.upsert({
        where: { userId: session.user.id },
        update: { timezone: data.timezone },
        create: { userId: session.user.id, timezone: data.timezone },
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
  try {
    const session = await import("@/lib/auth").then((m) => m.auth());
    if (!session?.user?.id) return { error: "No autorizado" };

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { error: "Usuario no encontrado" };

    const isValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValid) return { error: "La contraseña actual es incorrecta" };

    const hashedPassword = await bcrypt.hash(data.newPassword, 12);
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