"use client";

import { useState, useEffect, Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    getSpecialistsWithSchedules().then((data) => {
      setSpecialists(data);
      setIsLoading(false);
    });
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await deleteSchedule(scheduleId);
      toast.success("Horario eliminado");
      loadData();
    } catch (error) {
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
          <Button onClick={() => setIsModalOpen(true)}>
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
            <Card key={specialist.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{specialist.name || "Especialista"}</CardTitle>
                    <CardDescription>{specialist.specialty}</CardDescription>
                  </div>
                  <Badge variant="outline">
                    {specialist.schedules.length} días
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
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
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">
                                {schedule.startTime} - {schedule.endTime}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Sin horarios configurados
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar horario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {specialists.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sin especialistas</h3>
            <p className="text-muted-foreground">
              No hay especialistas registrados en el sistema.
            </p>
          </CardContent>
        </Card>
      )}

      <ScheduleModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={loadData}
      />
    </div>
  );
}