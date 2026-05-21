import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Stethoscope, Phone, Calendar, FileText, Clock, DollarSign, Award, Activity, User, BadgeCheck, BadgeX } from "lucide-react";

const DAY_LABELS: Record<number, string> = {
  0: "Domingo", 1: "Lunes", 2: "Martes", 3: "Miércoles",
  4: "Jueves", 5: "Viernes", 6: "Sábado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ABSENT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};
const statusLabels: Record<string, string> = {
  PENDING: "Pendiente", CONFIRMED: "Confirmada", CANCELLED: "Cancelada",
  COMPLETED: "Finalizada", ABSENT: "Ausente",
};

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const specialist = await db.specialist.findUnique({
    where: { id },
    include: {
      user: true,
      schedules: {
        where: { isActive: true },
        orderBy: { dayOfWeek: "asc" },
      },
      appointments: {
        include: {
          patient: {
            include: { user: true },
          },
        },
        orderBy: { startTime: "desc" },
        take: 20,
      },
    },
  });

  if (!specialist) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={specialist.user.name || "Especialista"}
        description={`${specialist.specialty} · ${specialist.appointments.length} citas`}
        icon={Stethoscope}
        breadcrumbs={[
          { label: "Especialistas", href: "/dashboard/specialists" },
          { label: specialist.user.name || "Detalle" },
        ]}
        actions={
          <Link href="/dashboard/specialists">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{specialist.user.name || "Sin nombre"}</h2>
              <p className="text-sm text-muted-foreground">{specialist.user.email}</p>
              <div className="mt-3">
                {specialist.isAvailable ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 px-3 py-1 rounded-full">
                    <BadgeCheck className="h-3 w-3" />
                    Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 px-3 py-1 rounded-full">
                    <BadgeX className="h-3 w-3" />
                    No disponible
                  </span>
                )}
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Award className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Especialidad</p>
                  <p className="text-sm font-medium">{specialist.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Licencia</p>
                  <p className="text-sm font-medium">{specialist.license || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium">{specialist.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precio consulta</p>
                  <p className="text-sm font-medium">
                    {specialist.price ? `$${specialist.price.toLocaleString("es-CL")}` : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duración consulta</p>
                  <p className="text-sm font-medium">{specialist.consultationDuration} min</p>
                </div>
              </div>
            </div>
          </div>

          {specialist.bio && (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Biografía</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{specialist.bio}</p>
            </div>
          )}

          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Horario
            </h3>
            {specialist.schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin horario configurado</p>
            ) : (
              <div className="space-y-2">
                {specialist.schedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-border/20 last:border-0">
                    <span className="font-medium">{DAY_LABELS[s.dayOfWeek]}</span>
                    <span className="text-muted-foreground">{s.startTime} - {s.endTime}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Historial de citas
              </h3>
              <span className="text-xs text-muted-foreground">
                {specialist.appointments.length} citas
              </span>
            </div>
            {specialist.appointments.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground">No hay citas registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {specialist.appointments.map((apt) => (
                  <div key={apt.id} className="p-4 sm:p-5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {apt.patient.user.name || "Paciente"}
                          </p>
                          <p className="text-xs text-muted-foreground">{apt.patient.user.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(apt.startTime)} - {new Date(apt.startTime).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {apt.reason && (
                            <p className="text-xs text-muted-foreground mt-1">{apt.reason}</p>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[apt.status] || ""}`}>
                        {statusLabels[apt.status] || apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}