import type { Prisma } from "@prisma/client";

export async function lockAppointmentSlot(
  tx: Prisma.TransactionClient,
  specialistId: string,
  startTime: Date
): Promise<void> {
  const lockKey = `${specialistId}:${startTime.toISOString()}`;
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;
}
