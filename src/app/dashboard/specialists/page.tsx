import { Suspense } from "react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SpecialistsTable } from "@/features/specialists/components/specialists-table";
import { LoadingState } from "@/components/shared/loading-state";
import { Stethoscope, Plus } from "lucide-react";

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
    <div className="space-y-6">
      <PageHeader
        title="Especialistas"
        description="Gestiona los especialistas del sistema"
        icon={Stethoscope}
        actions={
          <Button className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Especialista
          </Button>
        }
      />

      <Suspense fallback={<LoadingState type="table" />}>
        <SpecialistsTable specialists={specialists} />
      </Suspense>
    </div>
  );
}