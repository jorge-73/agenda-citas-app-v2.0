import { PrismaClient } from "@prisma/client";
import { AR_TZ, formatInTz, zonedDateTimeToUTC } from "../src/lib/date-utils";
import { lockAppointmentSlot } from "../src/lib/slot-lock";

const prisma = new PrismaClient();
const applyChanges = process.argv.includes("--apply");

async function main() {
  const bookings = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      patientId: { not: null },
      appointment: { is: null },
    },
    select: {
      id: true,
      patientId: true,
      specialistId: true,
      specialty: true,
      reason: true,
      date: true,
      time: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(
    `${applyChanges ? "Aplicando" : "Simulando"} backfill de ${bookings.length} booking(s) confirmada(s).`
  );

  let created = 0;
  let skipped = 0;

  for (const booking of bookings) {
    const result = await prisma.$transaction(async (tx) => {
      const startTime = zonedDateTimeToUTC(
        formatInTz(booking.date, "yyyy-MM-dd", AR_TZ),
        booking.time,
        AR_TZ
      );
      const endTime = new Date(startTime.getTime() + 30 * 60_000);

      await lockAppointmentSlot(tx, booking.specialistId, startTime);

      const current = await tx.booking.findUnique({
        where: { id: booking.id },
        select: { patientId: true, appointment: { select: { id: true } } },
      });
      if (!current || current.appointment || !current.patientId) {
        return { status: "skipped", reason: "ya reparada o sin paciente" } as const;
      }

      const patient = await tx.patient.findUnique({
        where: { id: current.patientId },
        select: { id: true },
      });
      if (!patient) return { status: "skipped", reason: "paciente inexistente" } as const;

      const conflict = await tx.appointment.findFirst({
        where: {
          specialistId: booking.specialistId,
          status: { not: "CANCELLED" },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { id: true },
      });
      if (conflict) return { status: "skipped", reason: "slot ocupado" } as const;

      if (applyChanges) {
        await tx.appointment.create({
          data: {
            bookingId: booking.id,
            patientId: patient.id,
            specialistId: booking.specialistId,
            startTime,
            endTime,
            reason: booking.reason || `Consulta - ${booking.specialty}`,
            status: "CONFIRMED",
          },
        });
      }

      return { status: "created" } as const;
    }, { isolationLevel: "Serializable" });

    if (result.status === "created") {
      created++;
      console.log(`  ${applyChanges ? "Creada" : "Se crearía"}: ${booking.id}`);
    } else {
      skipped++;
      console.log(`  Omitida: ${booking.id} (${result.reason})`);
    }
  }

  console.log(
    `Resultado: ${created} ${applyChanges ? "creada(s)" : "detectada(s)"}, ${skipped} omitida(s).`
  );
}

main()
  .catch((error) => {
    console.error("Backfill fallido:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
