"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { SpecialistsTable } from "@/features/specialists/components/specialists-table";
import { SpecialistModal } from "@/features/specialists/components/specialist-modal";
import { Stethoscope, Plus } from "lucide-react";
import type { Specialist } from "@/features/specialists/types";

interface SpecialistsPageClientProps {
  specialists: Specialist[];
}

export function SpecialistsPageClient({ specialists }: SpecialistsPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Especialistas"
        description="Gestiona los especialistas del sistema"
        icon={Stethoscope}
        actions={
          <Button className="rounded-xl" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Especialista
          </Button>
        }
      />
      <SpecialistsTable specialists={specialists} />
      <SpecialistModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
