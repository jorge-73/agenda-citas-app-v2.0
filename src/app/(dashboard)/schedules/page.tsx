import { Suspense } from "react";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { Clock, Plus, Save } from "lucide-react";
import { DAY_OF_WEEK_LABELS } from "@/features/appointments/types";

async function getSpecialistsWithSchedules() {
  return db.specialist.findMany({
    include: {
      user: true,
      schedules: {
        where: { isActive: true },
        orderBy: { dayOfWeek: "asc" },
      },
    },
    orderBy: { user: { name: "asc" } },
  });
}

export default async function SchedulesPage() {
  const specialists = await getSpecialistsWithSchedules();
  
  const weekDays = [0, 1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Horarios"
        description="Configura los horarios de disponibilidad de los especialistas"
        icon={Clock}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Horario
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {specialists.map((specialist) => (
          <Card key={specialist.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{specialist.user?.name || "Especialista"}</CardTitle>
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
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">
                          {DAY_OF_WEEK_LABELS[day]}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {schedule.startTime} - {schedule.endTime}
                          </span>
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
              
              <Button variant="outline" className="w-full mt-4" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar horario
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {specialists.length === 0 && (
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
    </div>
  );
}