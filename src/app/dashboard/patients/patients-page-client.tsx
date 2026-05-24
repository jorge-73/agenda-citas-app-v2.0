"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PatientsTable } from "@/features/patients/components/patients-table";
import { PatientModal } from "@/features/patients/components/patient-modal";
import { Users, Plus } from "lucide-react";
import type { Patient } from "@/features/patients/types";

interface PatientsPageClientProps {
  patients: Patient[];
}

export function PatientsPageClient({ patients }: PatientsPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description="Gestiona los pacientes del sistema"
        icon={Users}
        actions={
          <Button className="rounded-xl" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        }
      />
      <PatientsTable patients={patients} />
      <PatientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
