import { Suspense } from "react";
import { db } from "@/lib/db";
import { LoadingState } from "@/components/shared/loading-state";
import { SpecialistsPageClient } from "./specialists-page-client";
import { contactUserSelect } from "@/lib/prisma-selects";

async function getSpecialists() {
  return db.specialist.findMany({
    include: {
      user: { select: contactUserSelect },
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
