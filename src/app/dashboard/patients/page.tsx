import { Suspense } from "react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PatientsTable } from "@/features/patients/components/patients-table";
import { PatientModal } from "@/features/patients/components/patient-modal";
import { LoadingState } from "@/components/shared/loading-state";
import { Users, Plus } from "lucide-react";

async function getPatients() {
  return db.patient.findMany({
    include: {
      user: true,
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
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Gestiona los pacientes del sistema"
        icon={Users}
        actions={
          <Button className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        }
      />

      <Suspense fallback={<LoadingState type="table" />}>
        <PatientsTable patients={patients} />
      </Suspense>
    </div>
  );
}