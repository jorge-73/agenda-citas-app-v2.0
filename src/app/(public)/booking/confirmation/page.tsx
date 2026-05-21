import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ConfirmationClient } from "./confirmation-client";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id;
  if (!id) notFound();

  const booking = await db.booking.findUnique({
    where: { id },
  });

  if (!booking) notFound();

  const specialist = await db.specialist.findUnique({
    where: { id: booking.specialistId },
    include: { user: true },
  });

  return <ConfirmationClient booking={{ ...booking, specialist }} />;
}
