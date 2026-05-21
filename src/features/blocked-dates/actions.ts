"use server";

import { db } from "@/lib/db";
import { startOfDay, endOfDay } from "date-fns";

export async function getBlockedDatesAction() {
  return db.blockedDate.findMany({
    orderBy: { date: "desc" },
  });
}

export async function createBlockedDateAction(data: {
  date: Date;
  reason?: string;
  isRecurring?: boolean;
}) {
  const dayStart = startOfDay(new Date(data.date));
  const dayEnd = endOfDay(new Date(data.date));

  const existing = await db.blockedDate.findFirst({
    where: {
      date: { gte: dayStart, lte: dayEnd },
      isRecurring: data.isRecurring ?? false,
    },
  });

  if (existing) {
    throw new Error("Esta fecha ya está bloqueada");
  }

  return db.blockedDate.create({
    data: {
      date: dayStart,
      reason: data.reason,
      isRecurring: data.isRecurring ?? false,
    },
  });
}

export async function unblockDateAction(id: string) {
  return db.blockedDate.delete({ where: { id } });
}