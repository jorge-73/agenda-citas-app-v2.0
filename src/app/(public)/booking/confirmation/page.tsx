import { Suspense } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, User, Mail, ArrowLeft, Home } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white py-12 px-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">¡Reserva confirmada!</h1>
            <p className="text-muted-foreground mb-6">
              Tu cita ha sido agendada exitosamente. Recibirás un correo de confirmación.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Profesional</p>
                  <p className="font-medium">{booking.specialist?.user?.name || "Especialista"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(booking.date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hora</p>
                  <p className="font-medium">{booking.time}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email de contacto</p>
                  <p className="font-medium">{booking.patientEmail}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> Por favor arrive 15 minutos antes de tu cita.
                Si necesitas cancelar o reprogramar, contactanos con al menos 24 horas de anticipación.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/booking">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Reservar otra cita
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}