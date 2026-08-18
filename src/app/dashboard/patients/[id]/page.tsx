import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ArrowLeft, User, Phone, Calendar, FileText, Activity, Stethoscope, Clock, Building2, HeartPulse } from "lucide-react";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await db.patient.findUnique({
    where: { id },
    include: {
      user: true,
      appointments: {
        include: {
          specialist: {
            include: { user: true },
          },
        },
        orderBy: { startTime: "desc" },
        take: 20,
      },
    },
  });

  if (!patient) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${patient.user.name || "Paciente"}`}
        description={`Paciente desde ${formatDate(patient.createdAt)}`}
        icon={User}
        breadcrumbs={[
          { label: "Pacientes", href: "/dashboard/patients" },
          { label: patient.user.name || "Detalle" },
        ]}
        actions={
          <Link href="/dashboard/patients">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-bold">{patient.user.name || "Sin nombre"}</h2>
              <p className="text-sm text-muted-foreground">{patient.user.email}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium">{patient.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Documento</p>
                  <p className="text-sm font-medium">{patient.document || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                  <p className="text-sm font-medium">{patient.birthDate ? formatDate(patient.birthDate) : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="text-sm font-medium">{patient.address || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contacto de emergencia</p>
                  <p className="text-sm font-medium">{patient.emergencyContact || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-primary" />
              Información médica
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Tipo de sangre</span>
                <span className="font-medium">{patient.bloodType || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Alergias</span>
                <span className="font-medium">{patient.allergies || "Ninguna"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Condiciones médicas</span>
                <span className="font-medium">{patient.medicalConditions || "Ninguna"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="text-muted-foreground">Seguro</span>
                <span className="font-medium">{patient.insurance || "—"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Núm. seguro</span>
                <span className="font-medium">{patient.insuranceNumber || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border/50 bg-card">
            <div className="p-5 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Historial de citas
              </h3>
              <span className="text-xs text-muted-foreground">
                {patient.appointments.length} citas registradas
              </span>
            </div>
            {patient.appointments.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground">No hay citas registradas</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {patient.appointments.map((apt) => (
                  <div key={apt.id} className="p-4 sm:p-5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                          <Stethoscope className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {apt.specialist.user.name || "Especialista"}
                          </p>
                          <p className="text-xs text-muted-foreground">{apt.specialist.specialty}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(apt.startTime)} - {new Date(apt.startTime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {apt.reason && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {apt.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={apt.status} />
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