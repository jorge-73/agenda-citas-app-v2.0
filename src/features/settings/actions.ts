"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isValidTimeZone } from "@/lib/date-utils";
import { z } from "zod";

const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  newBookingAlerts: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
  timezone: z.string().refine(isValidTimeZone, "Zona horaria inválida").optional(),
});

export async function getProfileAction() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      patient: true,
      preferences: true,
    },
  });

  return user;
}

export async function updatePreferencesAction(data: {
  emailNotifications?: boolean;
  appointmentReminders?: boolean;
  newBookingAlerts?: boolean;
  weeklyReport?: boolean;
  timezone?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "No autorizado" };
  const parsed = preferencesSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Datos inválidos" };

  await db.userPreference.upsert({
    where: { userId: session.user.id },
    update: parsed.data,
    create: {
      userId: session.user.id,
      ...parsed.data,
    },
  });

  return { success: true };
}
