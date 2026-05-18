import { Suspense } from "react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AppointmentCalendar } from "@/features/appointments/components/appointment-calendar";
import { AppointmentFilters } from "@/features/appointments/components/appointment-filters";
import { LoadingState } from "@/components/shared/loading-state";
import { Calendar, Plus, List } from "lucide-react";
import { AppointmentStatus } from "@/features/appointments/types";

async function getAppointments() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const appointments = await db.appointment.findMany({
    where: {
      startTime: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      patient: {
        include: {
          user: true,
        },
      },
      specialist: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });
  
  return appointments.map((apt) => ({
    ...apt,
    status: apt.status as AppointmentStatus,
  }));
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Citas"
        description="Gestiona las citas médicas del sistema"
        icon={Calendar}
        actions={
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <AppointmentFilters
          filters={{}}
          onFilterChange={(filters) => console.log("Filters:", filters)}
        />
      </div>

      <Suspense fallback={<LoadingState type="card" />}>
        <AppointmentCalendar
          appointments={appointments}
          onAppointmentClick={(appointment) => console.log("Click:", appointment)}
        />
      </Suspense>
    </div>
  );
}