"use client";

import { formatInTz, AR_TZ } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Clock, User, Mail, ArrowLeft, Home, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/public/logo";

interface ConfirmationClientProps {
  booking: {
    id: string;
    date: Date;
    time: string;
    patientEmail: string;
    patientPhone: string;
    specialist: {
      specialty: string;
      user: {
        name: string | null;
      } | null;
    } | null;
  };
}

export function ConfirmationClient({ booking }: ConfirmationClientProps) {
  const maskEmail = (email: string) => {
    const [user, domain] = email.split("@");
    if (!domain) return email;
    const visible = user.slice(0, 3);
    return `${visible}${"*".repeat(Math.max(user.length - 3, 3))}@${domain}`;
  };

  const maskPhone = (phone: string) => {
    if (phone.length < 6) return phone;
    return `${phone.slice(0, 3)}${"*".repeat(Math.max(phone.length - 6, 3))}${phone.slice(-3)}`;
  };

  const details = [
    { icon: User, label: "Profesional", value: booking.specialist?.user?.name || "Especialista", sub: booking.specialist?.specialty },
    { icon: Calendar, label: "Fecha", value: formatInTz(new Date(booking.date), "EEEE d 'de' MMMM 'de' yyyy", AR_TZ) },
    { icon: Clock, label: "Hora", value: booking.time },
    { icon: Mail, label: "Email de contacto", value: maskEmail(booking.patientEmail), sub: maskPhone(booking.patientPhone) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Volver
                </Button>
              </Link>
              <div className="hidden sm:flex items-center">
                <Logo href="/" size="sm" />
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
                Tu cita ha sido agendada exitosamente. Recibirás un correo de confirmación.
              </motion.p>
            </div>

            <div className="p-6">
              <div className="space-y-3 mb-6">
                {details.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-semibold text-foreground capitalize">{item.value}</p>
                        {item.sub && <p className="text-sm text-muted-foreground">{item.sub}</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

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
                      <li>{"•"} Por favor llega 15 minutos antes de tu cita</li>
                      <li>{"•"} Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
                      <li>{"•"} Trae tu identificación y cualquier documento médico relevante</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col gap-3"
              >
                <Button asChild size="lg" className="w-full rounded-xl">
                  <Link href="/">
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
