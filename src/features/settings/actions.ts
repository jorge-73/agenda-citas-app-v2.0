"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getProfileAction() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
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

  await db.userPreference.upsert({
    where: { userId: session.user.id },
    update: data,
    create: {
      userId: session.user.id,
      ...data,
    },
  });

  return { success: true };
}