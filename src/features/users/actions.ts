"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { requirePermission, validateInput } from "@/lib/action-helpers";
import { contactUserSelect } from "@/lib/prisma-selects";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "SPECIALIST", "RECEPTIONIST", "PATIENT"], "Rol inválido"),
});

export async function getUsersAction() {
  await requirePermission("view:users");

  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      patient: { select: { id: true } },
      specialist: { select: { id: true, specialty: true } },
      _count: { select: { accounts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  await requirePermission("manage:users");
  const parsedData = validateInput(createUserSchema, data);

  if (parsedData.role === "ADMIN") {
    throw new Error("Solo puede existir un administrador");
  }
  if (parsedData.role === "SPECIALIST") {
    throw new Error("Los especialistas deben crearse desde la sección Especialistas");
  }

  const existing = await db.user.findUnique({ where: { email: parsedData.email } });
  if (existing) throw new Error("El email ya está registrado");

  const hashedPassword = await bcrypt.hash(parsedData.password, 12);

  return db.user.create({
    data: {
      name: parsedData.name,
      email: parsedData.email,
      password: hashedPassword,
      role: parsedData.role,
      ...(parsedData.role === "PATIENT" ? { patient: { create: {} } } : {}),
    },
    select: {
      ...contactUserSelect,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUserRoleAction(userId: string, role: string) {
  await requirePermission("manage:users");

  const parsedId = z.string().min(1, "ID requerido").safeParse(userId);
  if (!parsedId.success) throw new Error("ID de usuario inválido");

  const parsedRole = z.enum(["ADMIN", "SPECIALIST", "RECEPTIONIST", "PATIENT"]).safeParse(role);
  if (!parsedRole.success) throw new Error("Rol inválido");

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!targetUser) throw new Error("Usuario no encontrado");
  if (targetUser.role === "ADMIN") {
    throw new Error("No se puede modificar el rol del administrador");
  }
  if (parsedRole.data === "ADMIN") {
    throw new Error("Solo puede existir un administrador");
  }

  return db.user.update({
    where: { id: userId },
    data: { role: parsedRole.data },
  });
}

export async function deleteUserAction(userId: string) {
  await requirePermission("manage:users");

  const existingUser = await db.user.findUnique({
    where: { id: userId },
    include: {
      patient: { select: { id: true } },
      specialist: { select: { id: true } },
      _count: { select: { accounts: true } },
    },
  });

  if (!existingUser) throw new Error("Usuario no encontrado");

  if (existingUser.role === "ADMIN") {
    throw new Error("No se puede eliminar el administrador");
  }

  const relatedAppointments = await db.appointment.count({
    where: {
      OR: [
        ...(existingUser.patient ? [{ patientId: existingUser.patient.id }] : []),
        ...(existingUser.specialist ? [{ specialistId: existingUser.specialist.id }] : []),
      ],
    },
  });

  if (relatedAppointments > 0) {
    throw new Error(
      `No se puede eliminar el usuario porque tiene ${relatedAppointments} cita(s) asociada(s). Desasocie las citas primero.`
    );
  }

  if (existingUser.patient) {
    await db.patient.delete({ where: { id: existingUser.patient.id } });
  }
  if (existingUser.specialist) {
    await db.schedule.deleteMany({ where: { specialistId: existingUser.specialist.id } });
    await db.specialist.delete({ where: { id: existingUser.specialist.id } });
  }

  return db.user.delete({ where: { id: userId } });
}
