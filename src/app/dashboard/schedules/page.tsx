"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Clock, Plus, Trash2 } from "lucide-react";
import { DAY_OF_WEEK_LABELS } from "@/features/appointments/types";
import { ScheduleModal } from "@/features/schedules/components/schedule-modal";
import { getSpecialistsWithSchedules, deleteSchedule } from "@/features/schedules/actions";
import { toast } from "sonner";

interface SpecialistData {
  id: string;
  name: string;
  specialty: string;
  schedules: {
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
}

export default function SchedulesPage() {
  const [specialists, setSpecialists] = useState<SpecialistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekDays = [0, 1, 2, 3, 4, 5, 6];

  function loadData() {
    getSpecialistsWithSchedules().then((data) => {
      setSpecialists(data);
      setIsLoading(false);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId);
      toast.success("Horario eliminado");
      loadData();
    } catch {
      toast.error("Error al eliminar el horario");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horarios"
        description="Configura los horarios de disponibilidad de los especialistas"
        icon={Clock}
        actions={
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Horario
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState type="card" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {specialists.map((specialist) => (
            <div key={specialist.id} className="rounded-2xl border border-border/50 bg-card">
              <div className="p-5 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">{specialist.name || "Especialista"}</h3>
                    <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {specialist.schedules.length} días
                  </Badge>
                </div>
              </div>
              <div className="p-5 pt-2">
                {specialist.schedules.length > 0 ? (
                  <div className="space-y-2">
                    {weekDays.map((day) => {
                      const schedule = specialist.schedules.find(
                        (s) => s.dayOfWeek === day
                      );

                      if (!schedule) return null;

                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between text-sm group"
                        >
                          <span className="text-muted-foreground">
                            {DAY_OF_WEEK_LABELS[day]}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground/60" />
                              <span className="font-medium text-foreground/80">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="opacity-0 group-hover:opacity-100 transition-all text-destructive/60 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-3">
                    Sin horarios configurados
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4 rounded-xl"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Agregar horario
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {specialists.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-border/50 bg-card py-12 text-center">
          <div className="p-6">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin especialistas</h3>
            <p className="text-muted-foreground">
              No hay especialistas registrados en el sistema.
            </p>
          </div>
        </div>
      )}

      <ScheduleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={loadData}
      />
    </div>
  );
}