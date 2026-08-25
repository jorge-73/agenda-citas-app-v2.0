import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { verifyBookingConfirmationToken } from "@/lib/booking-confirmation-token";
import { publicUserSelect } from "@/lib/prisma-selects";
import { ConfirmationClient } from "./confirmation-client";

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  const visible = user.slice(0, 3);
  return `${visible}${"*".repeat(Math.max(user.length - 3, 3))}@${domain}`;
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return "***";
  return `${phone.slice(0, 3)}${"*".repeat(Math.max(phone.length - 6, 3))}${phone.slice(-3)}`;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const id = params.token ? verifyBookingConfirmationToken(params.token) : null;
  if (!id) notFound();

  const booking = await db.booking.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      time: true,
      patientEmail: true,
      patientPhone: true,
      specialistId: true,
    },
  });

  if (!booking) notFound();

  const specialist = await db.specialist.findUnique({
    where: { id: booking.specialistId },
    select: {
      specialty: true,
      user: { select: publicUserSelect },
    },
  });

  return (
    <ConfirmationClient
      booking={{
        id: booking.id,
        date: booking.date,
        time: booking.time,
        patientEmail: maskEmail(booking.patientEmail),
        patientPhone: maskPhone(booking.patientPhone),
        specialist,
      }}
    />
  );
}
