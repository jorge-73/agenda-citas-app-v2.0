import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Clock, Shield, Stethoscope, Heart, Brain, Eye, Baby } from "lucide-react";

const SPECIALTIES = [
  { name: "Medicina General", icon: Stethoscope, color: "bg-blue-100 text-blue-600" },
  { name: "Cardiología", icon: Heart, color: "bg-red-100 text-red-600" },
  { name: "Neurología", icon: Brain, color: "bg-purple-100 text-purple-600" },
  { name: "Oftalmología", icon: Eye, color: "bg-amber-100 text-amber-600" },
  { name: "Pediatría", icon: Baby, color: "bg-pink-100 text-pink-600" },
  { name: "Medicina General", icon: Stethoscope, color: "bg-blue-100 text-blue-600" },
];

const FEATURES = [
  {
    icon: Calendar,
    title: "Reserva Online 24/7",
    description: "Agenda tu cita en cualquier momento, desde cualquier dispositivo",
  },
  {
    icon: Clock,
    title: "Horarios Flexibles",
    description: "Encuentra horarios disponibles que se adapten a tu agenda",
  },
  {
    icon: Shield,
    title: "Confirmación Inmediata",
    description: "Recibe confirmación instantánea de tu reserva",
  },
];

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            <span className="text-xl font-bold">CitasMed</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/booking">
              <Button>Reservar Cita</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 bg-gradient-to-b from-zinc-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Tu salud,{' '}
              <span className="text-primary">a un clic de distancia</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Reserva citas médicas con los mejores especialistas de forma rápida,
              segura y sin filas de espera.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/booking">
                <Button size="lg" className="px-8">
                  <Calendar className="w-5 h-5 mr-2" />
                  Reservar Cita
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8">
                Ver Especialistas
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">
              Especialidades Disponibles
            </h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {SPECIALTIES.map((specialty) => (
                <Card key={specialty.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 rounded-full ${specialty.color} flex items-center justify-center mx-auto mb-3`}>
                      <specialty.icon className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-sm">{specialty.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8">
              {FEATURES.map((feature) => (
                <div key={feature.title} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">
              ¿Necesitas una cita médica?
            </h2>
            <p className="text-muted-foreground mb-6">
              Reserva ahora y recibe atención médica de calidad
            </p>
            <Link href="/booking">
              <Button size="lg" className="px-8">
                <Calendar className="w-5 h-5 mr-2" />
                Reservar Ahora
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CitasMed. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}