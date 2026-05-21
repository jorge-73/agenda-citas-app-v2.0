"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function getUsersAction() {
  return db.user.findMany({
    include: {
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
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("El email ya está registrado");

  const hashedPassword = await bcrypt.hash(data.password, 12);

  return db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });
}

export async function updateUserRoleAction(userId: string, role: string) {
  return db.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function deleteUserAction(userId: string) {
  return db.user.delete({ where: { id: userId } });
}