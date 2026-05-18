import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { 
  Calendar, 
  Users, 
  Clock, 
  Shield, 
  Stethoscope, 
  Heart, 
  Brain, 
  Eye, 
  Baby, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  CheckCircle2,
  ArrowRight,
  HeartPulse,
  Activity,
  ClipboardList,
  Award,
  Building2
} from "lucide-react";

const SPECIALTIES = [
  { name: "Medicina General", icon: Stethoscope, description: "Atención primaria" },
  { name: "Cardiología", icon: Heart, description: "Corazón y circulación" },
  { name: "Neurología", icon: Brain, description: "Sistema nervioso" },
  { name: "Oftalmología", icon: Eye, description: "Salud visual" },
  { name: "Pediatría", icon: Baby, description: "Niños y adolescentes" },
  { name: "Dermatología", icon: Activity, description: "Piel y cabello" },
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
  {
    icon: ClipboardList,
    title: "Historial Digital",
    description: "Accede a tu historial médico en cualquier momento",
  },
];

const STATS = [
  { value: "15+", label: "Especialistas", icon: Users },
  { value: "10K+", label: "Pacientes", icon: HeartPulse },
  { value: "98%", label: "Satisfacción", icon: Star },
  { value: "24/7", label: "Disponibilidad", icon: Clock },
];

const TESTIMONIALS = [
  {
    name: "María García",
    role: "Paciente",
    content: "Excelente atención. Pude reservar mi cita en minutos y el especialista fue muy profesional.",
    rating: 5,
    avatar: "MG"
  },
  {
    name: "Carlos Rodríguez",
    role: "Paciente",
    content: "Sistema muy intuitivo. Me encantó poder elegir el horario que más me convenía.",
    rating: 5,
    avatar: "CR"
  },
  {
    name: "Ana Martínez",
    role: "Paciente",
    content: "La mejor experiencia en atención médica. Todo el proceso fue rápido y sin complicaciones.",
    rating: 5,
    avatar: "AM"
  },
];

const CONTACT_INFO = [
  { icon: Phone, label: "Teléfono", value: "+52 (55) 1234-5678" },
  { icon: Mail, label: "Email", value: "contacto@citamed.com" },
  { icon: MapPin, label: "Dirección", value: "Av. Principal 123, Ciudad de México" },
];

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/home" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                <HeartPulse className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">CitasMed</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#specialties" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Especialidades
              </Link>
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Servicios
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonios
              </Link>
              <Link href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button size="sm" className="text-sm">
                    Reservar Cita
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6">
                <Star className="w-3 h-3 mr-1 text-amber-500" />
                Sistema de gestión médica líder
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Tu salud,{' '}
                <span className="text-primary">a un clic de distancia</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Reserva citas médicas con los mejores especialistas de forma rápida, 
                segura y sin filas de espera. Tu bienestar es nuestra prioridad.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/booking">
                  <Button size="lg" className="w-full sm:w-auto px-8 text-base">
                    <Calendar className="w-5 h-5 mr-2" />
                    Reservar Cita
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="#specialties">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-base">
                    Ver Especialistas
                  </Button>
                </Link>
              </div>
              
              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Sin filas de espera</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Confirmación inmediata</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>100% seguro</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border/50 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialties Section */}
        <section id="specialties" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Especialidades Disponibles
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Contamos con un equipo de profesionales especializados en diversas áreas de la medicina
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {SPECIALTIES.map((specialty) => (
                <Card 
                  key={specialty.name} 
                  className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border-border/50"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <specialty.icon className="w-7 h-7 text-primary" />
                    </div>
                    <p className="font-semibold text-sm mb-1">{specialty.name}</p>
                    <p className="text-xs text-muted-foreground">{specialty.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                ¿Por qué elegirnos?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Nuestra plataforma está diseñada para brindarte la mejor experiencia en gestión de citas médicas
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => (
                <Card key={feature.title} className="border-border/50 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Lo que dicen nuestros pacientes
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Miles de pacientes confían en nosotros para su atención médica
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial) => (
                <Card key={testimonial.name} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                  ¿Necesitas una cita médica?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Reserva ahora y recibe atención médica de calidad. 
                  Nuestro equipo está listo para atenderte.
                </p>
                <Link href="/booking">
                  <Button size="lg" className="px-10 text-base">
                    <Calendar className="w-5 h-5 mr-2" />
                    Reservar Ahora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Contáctanos
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {CONTACT_INFO.map((contact) => (
                <Card key={contact.label} className="border-border/50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <contact.icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{contact.label}</p>
                    <p className="font-medium">{contact.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                    <HeartPulse className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-semibold text-foreground">CitasMed</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Sistema de gestión de citas médicas moderno y eficiente. 
                  Tu salud a un clic de distancia.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/booking" className="hover:text-foreground transition-colors">Reservar Cita</Link></li>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link></li>
                  <li><Link href="#specialties" className="hover:text-foreground transition-colors">Especialidades</Link></li>
                  <li><Link href="#contact" className="hover:text-foreground transition-colors">Contacto</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground transition-colors">Términos de uso</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Política de privacidad</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Aviso legal</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 CitasMed. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>Hecho con profesionalismo</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}