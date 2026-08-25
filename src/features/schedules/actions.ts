"use server";

import { db } from "@/lib/db";
import { requirePermission, validateInput } from "@/lib/action-helpers";
import { TIME_REGEX } from "@/lib/constants";
import { publicUserSelect } from "@/lib/prisma-selects";
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
  const user = await requirePermission("view:schedules");
  const specialistScope =
    user.role === "SPECIALIST"
      ? await db.specialist.findUnique({ where: { userId: user.id }, select: { id: true } })
      : null;
  if (user.role === "SPECIALIST" && !specialistScope) return [];
  const specialists = await db.specialist.findMany({
    where: specialistScope ? { id: specialistScope.id } : undefined,
    include: {
      user: { select: publicUserSelect },
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
  const user = await requirePermission("manage:schedules");
  const parsedData = validateInput(createScheduleSchema, data);
  if (user.role === "SPECIALIST") {
    const specialist = await db.specialist.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!specialist || specialist.id !== parsedData.specialistId) {
      throw new Error("No puedes modificar el horario de otro especialista");
    }
  }

  const existing = await db.schedule.findFirst({
    where: {
      specialistId: parsedData.specialistId,
      dayOfWeek: parsedData.dayOfWeek,
    },
  });

  if (existing) {
    await db.schedule.update({
      where: { id: existing.id },
      data: {
        startTime: parsedData.startTime,
        endTime: parsedData.endTime,
        isActive: true,
      },
    });
  } else {
    await db.schedule.create({
      data: {
        specialistId: parsedData.specialistId,
        dayOfWeek: parsedData.dayOfWeek,
        startTime: parsedData.startTime,
        endTime: parsedData.endTime,
        isActive: true,
      },
    });
  }
}

export async function deleteSchedule(id: string) {
  const user = await requirePermission("manage:schedules");
  const parsed = z.string().min(1, "ID requerido").safeParse(id);
  if (!parsed.success) throw new Error("ID de horario inválido");

  if (user.role === "SPECIALIST") {
    const schedule = await db.schedule.findUnique({
      where: { id },
      select: { specialist: { select: { userId: true } } },
    });
    if (!schedule || schedule.specialist.userId !== user.id) {
      throw new Error("No puedes eliminar el horario de otro especialista");
    }
  }

  await db.schedule.update({
    where: { id },
    data: { isActive: false },
  });
}
