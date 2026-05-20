"use client";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { motion } from "framer-motion";
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
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/home">
                <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
              </Link>
              <div className="hidden sm:flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20"
                >
                  <HeartPulse className="h-5 w-5 text-primary-foreground" />
                </motion.div>
                <span className="text-lg font-semibold text-foreground">CitasMed</span>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border/50 bg-card shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-primary/10 to-primary/3 p-8 pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25"
              >
                <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-center text-foreground mb-2"
              >
                ¡Reserva confirmada!
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-center"
              >
                Tu cita ha sido agendada exitosamente. 
                Recibirás un correo de confirmación.
              </motion.p>
            </div>
            
            <div className="p-6">
              {/* Booking Details */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: User, label: "Profesional", value: booking.specialist?.user?.name || "Especialista", sub: booking.specialist?.specialty },
                  { icon: Calendar, label: "Fecha", value: format(new Date(booking.date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es }) },
                  { icon: Clock, label: "Hora", value: booking.time },
                  { icon: Mail, label: "Email de contacto", value: booking.patientEmail, sub: booking.patientPhone },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold text-foreground capitalize">{item.value}</p>
                      {item.sub && <p className="text-sm text-muted-foreground">{item.sub}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Important Note */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6"
              >
                <div className="flex gap-3">
                  <Stethoscope className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-foreground">Información importante</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Por favor llega 15 minutos antes de tu cita</li>
                      <li>• Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
                      <li>• Trae tu identificación y cualquier documento médico relevante</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col gap-3"
              >
                <Button asChild size="lg" className="w-full rounded-xl">
                  <Link href="/home">
                    <Home className="w-4 h-4 mr-2" />
                    Volver al inicio
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg" className="w-full rounded-xl">
                  <Link href="/booking">
                    <Calendar className="w-4 h-4 mr-2" />
                    Reservar otra cita
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Confirmation ID */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground">
              ID de reserva: <span className="font-mono font-medium text-foreground">{booking.id.slice(0, 12)}...</span>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}