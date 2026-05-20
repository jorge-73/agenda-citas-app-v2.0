"use client";

import { useState, useEffect, Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AppointmentCalendar } from "@/features/appointments/components/appointment-calendar";
import { AppointmentFilters } from "@/features/appointments/components/appointment-filters";
import { LoadingState } from "@/components/shared/loading-state";
import { Calendar, Plus } from "lucide-react";
import { Appointment } from "@/features/appointments/types";
import { getAppointmentsByMonth } from "@/features/appointments/actions";

interface AppointmentFiltersState {
  status?: string;
  specialistId?: string;
  patientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AppointmentFiltersState>({});

  useEffect(() => {
    const now = new Date();
    getAppointmentsByMonth(now.getFullYear(), now.getMonth()).then((data) => {
      setAppointments(data);
      setIsLoading(false);
    });
  }, []);

  const handleFilterChange = (newFilters: AppointmentFiltersState) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citas"
        description="Gestiona las citas médicas del sistema"
        icon={Calendar}
        actions={
          <Button className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cita
          </Button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <AppointmentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {isLoading ? (
        <LoadingState type="card" />
      ) : (
        <Suspense fallback={<LoadingState type="card" />}>
          <AppointmentCalendar
            appointments={appointments}
            onAppointmentClick={(appointment) => console.log("Click:", appointment)}
          />
        </Suspense>
      )}
    </div>
  );
}