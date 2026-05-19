import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CheckCircle2, Calendar, Clock, User, Mail, Phone, ArrowLeft, Home, HeartPulse, Stethoscope } from "lucide-react";
import Link from "next/link";

async function getBooking(id: string) {
  const booking = await db.booking.findUnique({
    where: { id },
  });
  
  if (!booking) return null;
  
  const specialist = await db.specialist.findUnique({
    where: { id: booking.specialistId },
    include: { user: true },
  });
  
  return { ...booking, specialist };
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const id = params.id;

  if (!id) {
    notFound();
  }

  const booking = await getBooking(id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/home">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                  <HeartPulse className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground">CitasMed</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="py-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* Success Card */}
          <div className="rounded-2xl border border-border/50 bg-card shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 pb-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
              </div>
              
              <h1 className="text-2xl font-bold text-center text-foreground mb-2">
                ¡Reserva confirmada!
              </h1>
              <p className="text-muted-foreground text-center">
                Tu cita ha sido agendada exitosamente. 
                Recibirás un correo de confirmación.
              </p>
            </div>
            
            <div className="p-6">
              {/* Booking Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Profesional</p>
                    <p className="font-semibold text-foreground">{booking.specialist?.user?.name || "Especialista"}</p>
                    <p className="text-sm text-muted-foreground">{booking.specialist?.specialty}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-semibold text-foreground capitalize">
                      {format(new Date(booking.date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hora</p>
                    <p className="font-semibold text-foreground">{booking.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email de contacto</p>
                    <p className="font-semibold text-foreground">{booking.patientEmail}</p>
                    <p className="text-sm text-muted-foreground">{booking.patientPhone}</p>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <Stethoscope className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                    <p className="font-semibold">Información importante</p>
                    <ul className="space-y-1 text-blue-700 dark:text-blue-400">
                      <li>• Por favor llega 15 minutos antes de tu cita</li>
                      <li>• Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
                      <li>• Trae tu identificación y cualquier documento médico relevante</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button asChild size="lg" className="w-full">
                  <Link href="/home">
                    <Home className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="w-full">
                  <Link href="/booking">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar otra cita
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Confirmation ID */}
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              ID de reserva: <span className="font-mono font-medium text-foreground">{booking.id.slice(0, 12)}...</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}