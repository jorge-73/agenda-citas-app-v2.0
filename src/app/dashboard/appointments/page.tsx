"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentCalendar } from "@/features/appointments/components/appointment-calendar";
import { AppointmentFilters } from "@/features/appointments/components/appointment-filters";
import { AppointmentModal } from "@/features/appointments/components/appointment-modal";
import { Calendar, Plus, Download } from "lucide-react";
import { Appointment } from "@/features/appointments/types";
import { getAppointmentsByMonth, deleteAppointment } from "@/features/appointments/actions";
import { toast } from "sonner";
import { exportToCSV, formatDateForExport, formatTimeForExport } from "@/lib/export";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(() => {
    const now = new Date();
    getAppointmentsByMonth(now.getFullYear(), now.getMonth()).then((data) => {
      setAppointments(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleFilterChange = (newFilters: AppointmentFiltersState) => {
    setFilters(newFilters);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const handleNewAppointment = () => {
    setSelectedAppointment(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAppointment(id);
      toast.success("Cita eliminada correctamente");
      setModalOpen(false);
      fetchAppointments();
    } catch {
      toast.error("Error al eliminar la cita");
    }
  };

  const handleSuccess = () => {
    setModalOpen(false);
    fetchAppointments();
  };

  const handleExport = () => {
    const data = appointments.map((a) => ({
      Paciente: a.patient?.user?.name || "—",
      Email: a.patient?.user?.email || "—",
      Especialista: a.specialist?.user?.name || "—",
      Especialidad: a.specialist?.specialty || "—",
      Fecha: formatDateForExport(a.startTime),
      Hora: formatTimeForExport(a.startTime),
      Estado: a.status,
      Motivo: a.reason || "",
    }));
    exportToCSV(data, `citas-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citas"
        description="Gestiona las citas médicas del sistema"
        icon={Calendar}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleExport} variant="outline" className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleNewAppointment} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <AppointmentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-border/40 bg-card/70 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <AppointmentCalendar
              appointments={appointments}
              onAppointmentClick={handleAppointmentClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={handleSuccess}
        onDelete={handleDelete}
        initialData={
          selectedAppointment
            ? {
                id: selectedAppointment.id,
                patientId: selectedAppointment.patientId,
                specialistId: selectedAppointment.specialistId,
                startTime: selectedAppointment.startTime,
                endTime: selectedAppointment.endTime,
                reason: selectedAppointment.reason || undefined,
                notes: selectedAppointment.notes || undefined,
                status: selectedAppointment.status,
              }
            : undefined
        }
        isEdit={!!selectedAppointment}
      />
    </div>
  );
}