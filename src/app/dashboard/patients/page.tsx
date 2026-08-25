import { Suspense } from "react";
import { db } from "@/lib/db";
import { LoadingState } from "@/components/shared/loading-state";
import { PatientsPageClient } from "./patients-page-client";
import { contactUserSelect } from "@/lib/prisma-selects";

async function getPatients() {
  return db.patient.findMany({
    include: {
      user: { select: contactUserSelect },
      appointments: {
        select: { id: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

export default async function PatientsPage() {
  const patients = await getPatients();

  return (
    <Suspense fallback={<LoadingState type="table" />}>
      <PatientsPageClient patients={patients} />
    </Suspense>
  );
}
