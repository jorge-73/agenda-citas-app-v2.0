"use server";

import { db } from "@/lib/db";
import { requirePermission, validateInput } from "@/lib/action-helpers";
import { TIME_REGEX } from "@/lib/constants";
import { z } from "zod";

const createScheduleSchema = z.object({
  specialistId: z.string().min(1, "Especialista requerido"),
  dayOfWeek: z.number().min(0).max(6, "Día de semana inválido"),
  startTime: z.string().regex(TIME_REGEX, "Formato de hora inválido"),
  endTime: z.string().regex(TIME_REGEX, "Formato de hora inválido"),
}).refine((d) => d.endTime > d.startTime, {
  message: "La hora de fin debe ser posterior a la de inicio",
  path: ["endTime"],
});

export async function getSpecialistsWithSchedules() {
  await requirePermission("view:schedules");
  const specialists = await db.specialist.findMany({
    include: {
      user: true,
    },
    orderBy: {
      user: { name: "asc" },
    },
  });

  const schedules = await db.schedule.findMany({
    where: {
      isActive: true,
    },
  });

  return specialists.map((s) => ({
    id: s.id,
    name: s.user.name || "",
    specialty: s.specialty,
    schedules: schedules.filter((sch) => sch.specialistId === s.id),
  }));
}

export async function createSchedule(data: {
  specialistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  await requirePermission("manage:schedules");
  validateInput(createScheduleSchema, data);

  const existing = await db.schedule.findFirst({
    where: {
      specialistId: data.specialistId,
      dayOfWeek: data.dayOfWeek,
    },
  });

  if (existing) {
    await db.schedule.update({
      where: { id: existing.id },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: true,
      },
    });
  } else {
    await db.schedule.create({
      data: {
        specialistId: data.specialistId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: true,
      },
    });
  }
}

export async function deleteSchedule(id: string) {
  await requirePermission("manage:schedules");
  const parsed = z.string().min(1, "ID requerido").safeParse(id);
  if (!parsed.success) throw new Error("ID de horario inválido");

  await db.schedule.update({
    where: { id },
    data: { isActive: false },
  });
}
