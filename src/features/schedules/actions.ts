"use server";

import { db } from "@/lib/db";

export async function getSpecialistsWithSchedules() {
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
  await db.schedule.update({
    where: { id },
    data: { isActive: false },
  });
}