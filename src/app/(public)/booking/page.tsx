import Link from "next/link";
import { BookingWizard } from "@/features/booking/components/booking-wizard";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HeartPulse } from "lucide-react";

export default function BookingPage() {
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
              Reserva tu cita médica
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Selecciona tu especialidad, profesional y horario disponible. 
              El proceso solo toma unos minutos.
            </p>
          </div>
          <BookingWizard />
        </div>
      </main>
    </div>
  );
}