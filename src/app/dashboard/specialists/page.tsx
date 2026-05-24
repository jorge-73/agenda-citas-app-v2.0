import { Suspense } from "react";
import { db } from "@/lib/db";
import { LoadingState } from "@/components/shared/loading-state";
import { SpecialistsPageClient } from "./specialists-page-client";

async function getSpecialists() {
  return db.specialist.findMany({
    include: {
      user: true,
      schedules: {
        where: { isActive: true },
      },
      _count: {
        select: { appointments: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });
}

export default async function SpecialistsPage() {
  const specialists = await getSpecialists();

  return (
    <Suspense fallback={<LoadingState type="table" />}>
      <SpecialistsPageClient specialists={specialists} />
    </Suspense>
  );
}
