import { BookingWizard } from "@/features/booking/components/booking-wizard";

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Reserva tu cita médica</h1>
          <p className="text-muted-foreground">
            Selecciona tu especialidad, profesional y horario disponible
          </p>
        </div>
        <BookingWizard />
      </div>
    </div>
  );
}