"use server";

import { db } from "@/lib/db";
import { formatInTz, getZonedDayRange, zonedDateTimeToUTC, AR_TZ } from "@/lib/date-utils";
import { requirePermission, validateInput } from "@/lib/action-helpers";
import { z } from "zod";

const blockedDateSchema = z.object({
  date: z.date().refine(
    (d) => getZonedDayRange(d, AR_TZ).end > new Date(),
    "La fecha debe ser futura"
  ),
  reason: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

export async function getBlockedDatesAction() {
  await requirePermission("view:blocked-dates");
  return db.blockedDate.findMany({
    orderBy: { date: "desc" },
  });
}

export async function createBlockedDateAction(data: {
  date: Date;
  reason?: string;
  isRecurring?: boolean;
}) {
  await requirePermission("manage:blocked-dates");
  validateInput(blockedDateSchema, data);

  const dateKey = formatInTz(data.date, "yyyy-MM-dd", AR_TZ);
  const utcDate = zonedDateTimeToUTC(dateKey, "00:00", AR_TZ);
  const { end: dayEnd } = getZonedDayRange(data.date, AR_TZ);
  const dayStart = utcDate;

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
      date: utcDate,
      reason: data.reason,
      isRecurring: data.isRecurring ?? false,
    },
  });
}

export async function unblockDateAction(id: string) {
  await requirePermission("manage:blocked-dates");
  const parsed = z.string().min(1, "ID requerido").safeParse(id);
  if (!parsed.success) throw new Error("ID de fecha inválido");

  return db.blockedDate.delete({ where: { id } });
}
