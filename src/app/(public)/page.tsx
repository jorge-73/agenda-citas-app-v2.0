"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/public/header";
import { Logo } from "@/components/public/logo";
import { cn } from "@/lib/utils";
import {
  Calendar,
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
  Building2,
  Sparkles,
  Users,
  Plus,
  Video,
} from "lucide-react";

const SPECIALTIES = [
  { name: "Medicina General", icon: Stethoscope, description: "Atención primaria y preventiva" },
  { name: "Cardiología", icon: Heart, description: "Enfermedades cardiovasculares" },
  { name: "Neurología", icon: Brain, description: "Trastornos del sistema nervioso" },
  { name: "Oftalmología", icon: Eye, description: "Cirugías oculares y visión" },
  { name: "Pediatría", icon: Baby, description: "Atención para niños" },
  { name: "Dermatología", icon: Activity, description: "Tratamientos de piel" },
  { name: "Ginecología", icon: HeartPulse, description: "Salud femenina" },
  { name: "Ortopedia", icon: Award, description: "Lesiones óseas" },
];

const FEATURES = [
  { icon: Calendar, title: "Reserva Online 24/7", description: "Agenda tu cita desde cualquier dispositivo, sin llamadas ni filas." },
  { icon: Clock, title: "Horarios Flexibles", description: "Disponibilidad de 8AM a 8PM, incluyendo fines de semana." },
  { icon: Shield, title: "Confirmación Inmediata", description: "Recibe tu comprobante al instante por email y recordatorios." },
  { icon: ClipboardList, title: "Historial Digital", description: "Accede a tu expediente médico completo en cualquier momento." },
];

const STATS = [
  { value: "15+", label: "Especialistas", icon: Users },
  { value: "10K+", label: "Pacientes", icon: HeartPulse },
  { value: "98%", label: "Satisfacción", icon: Star },
  { value: "24/7", label: "Disponibilidad", icon: Clock },
];

const TESTIMONIALS = [
  { name: "María García", role: "Paciente", content: "Excelente plataforma. Pude agendar una cita en menos de 10 minutos. Totalmente recomendado.", rating: 5, avatar: "MG" },
  { name: "Carlos Rodríguez", role: "Paciente", content: "Como padre de tres niños, esta app me permite agendar citas para toda la familia en un solo lugar.", rating: 5, avatar: "CR" },
  { name: "Ana Martínez", role: "Paciente", content: "El proceso de reserva es intuitivo, los doctores son profesionales de primer nivel.", rating: 5, avatar: "AM" },
  { name: "Roberto Sánchez", role: "Paciente", content: "Gracias a la disponibilidad de horarios pude conseguir una cita el mismo día. Experiencia 10/10.", rating: 5, avatar: "RS" },
];

const CONTACT_INFO = [
{ icon: Phone, label: "Teléfono", value: "+54 11 5555-1234" },
  { icon: Mail, label: "Email", value: "contacto@citasmed.com.ar" },
  { icon: MapPin, label: "Dirección", value: "Av. Corrientes 1234, Buenos Aires" },
  { icon: Clock, label: "Horario", value: "Lun-Vie: 8AM-8PM | Sáb-Dom: 9AM-5PM" },
];

function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={cn("absolute rounded-full blur-3xl pointer-events-none", className)}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.1, 0.95, 1],
        opacity: [0.3, 0.5, 0.3, 0.3],
      }}
      transition={{
        duration: 12 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 -z-20 overflow-x-hidden pointer-events-none">
        <FloatingOrb className="top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/8" delay={0} />
        <FloatingOrb className="top-[40%] left-[-10%] w-[500px] h-[500px] bg-accent/6" delay={2} />
        <FloatingOrb className="bottom-[-5%] right-[20%] w-[600px] h-[600px] bg-primary/5" delay={4} />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.04] pointer-events-none -z-10" />

      <PublicHeader />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="mx-auto max-w-4xl text-center"
              >
                <motion.div variants={itemVariants}>
                  <Badge variant="secondary" className="mb-6 py-1.5 px-4 bg-primary/5 text-primary border-primary/20 rounded-full font-medium inline-flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    Sistema de gestión médica premium
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight"
                >
                  Tu salud,{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/75 to-info">
                    a un clic de distancia
                  </span>
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                >
                  Agenda citas médicas al instante con especialistas certificados.
                  Optimiza tus tiempos de espera y gestiona tu salud de forma digital y sin esfuerzo.
                </motion.p>

                <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button size="lg" className="w-full sm:w-auto px-8 text-base bg-gradient-to-br from-primary to-primary/95 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]" asChild>
                      <Link href="/booking">
                        <Calendar className="w-5 h-5" />
                        Reservar Cita
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </motion.div>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-base border-border/80 hover:bg-muted/50" asChild>
                    <Link href="#specialties">Ver Especialistas</Link>
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                  {["Sin filas de espera", "Confirmación inmediata", "100% seguro"].map((text) => (
                    <div key={text} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                      <span className="font-medium">{text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Product preview */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
                className="mt-20 max-w-5xl mx-auto"
              >
                <div className="relative rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.04)] p-6 sm:p-8 text-left">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Resumen de tu agenda
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        Tus próximas citas en un vistazo
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 text-primary border border-primary/25 px-3 py-1 text-xs font-medium">
                        Confirmada
                      </span>
                      <span className="rounded-full bg-muted text-muted-foreground border border-border px-3 py-1 text-xs font-medium">
                        Pendiente
                      </span>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border/60 bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Dr. Martín Pérez</p>
                            <p className="text-xs text-muted-foreground">Cardiología · Hoy 09:30</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-success/15 text-success px-2.5 py-0.5 text-xs font-medium">
                          Confirmada
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <span className="text-xs text-muted-foreground">Control cardiovascular</span>
                        <Button size="sm" variant="soft" className="h-8 px-3 text-xs">
                          <Video className="h-3.5 w-3.5 mr-1.5" />
                          Unirme
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/60 bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-info/10 flex items-center justify-center">
                            <Plus className="h-5 w-5 text-info" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">Nueva consulta</p>
                            <p className="text-xs text-muted-foreground">Elegí especialista y horario</p>
                          </div>
                        </div>
                        <Button size="sm" className="h-8 px-3 text-xs" asChild>
                          <Link href="/booking">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            Reservar
                          </Link>
                        </Button>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border/40">
                        <span className="text-xs text-muted-foreground">8 especialidades disponibles</span>
                        <span className="text-xs font-medium text-primary">Sin esperas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border/20 bg-muted/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} variants={itemVariants} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1.5">
                      <Icon className="w-5.5 h-5.5 text-primary" />
                      <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">{stat.value}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Specialties Section */}
        <section id="specialties" className="py-24 scroll-mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Especialidades Disponibles
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Contamos con profesionales experimentados en múltiples ramas médicas para asegurar una atención integral y especializada.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {SPECIALTIES.map((specialty) => {
                const Icon = specialty.icon;
                return (
                  <motion.div
                    key={specialty.name}
                    custom={SPECIALTIES.indexOf(specialty)}
                    variants={cardVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={cn(
                      "rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 text-center cursor-pointer transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] group relative overflow-hidden",
                      "hover:border-primary/20"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-bold text-base mb-1.5 text-foreground">{specialty.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{specialty.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/20 relative overflow-hidden scroll-mt-16">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/4 rounded-full blur-[120px] pointer-events-none -z-10" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                ¿Por qué elegir CitasMed?
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                Hemos desarrollado una plataforma enfocada en la comodidad del paciente y la eficiencia del especialista.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition-all duration-300 hover:border-primary/20"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 scroll-mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Voces de nuestros pacientes
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-4 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                La opinión de quienes confían su salud en nosotros es nuestro mayor respaldo.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {TESTIMONIALS.map((testimonial) => (
                <motion.div
                  key={testimonial.name}
                  variants={itemVariants}
                  className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                >
                  <div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#F4B400] text-[#F4B400]" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed italic">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh" />
          <div className="absolute inset-0">
            <FloatingOrb className="top-[-20%] left-[30%] w-[500px] h-[500px] bg-primary/10" delay={1} />
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="rounded-2xl border border-border/20 shadow-[0_4px_16px_rgba(0,0,0,0.04)] bg-card/50 backdrop-blur-xl p-8 md:p-16 text-center max-w-4xl mx-auto"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                ¿Listo para agendar tu cita?
              </motion.h2>
              <motion.p variants={itemVariants} className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Selecciona la fecha y hora que más te convenga de forma online.
                Sin papeleos y con confirmación garantizada.
              </motion.p>
              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="px-10 text-base shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]" asChild>
                    <Link href="/booking">
                      <Calendar className="w-5 h-5" />
                      Reservar Ahora
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 scroll-mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Estamos a tu disposición
              </motion.h2>
              <motion.p variants={itemVariants} className="mt-4 text-muted-foreground text-base max-w-2xl mx-auto">
                ¿Tienes dudas o necesitas soporte? Contáctanos y nuestro equipo de atención te responderá lo antes posible.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto"
            >
              {CONTACT_INFO.map((contact) => {
                const Icon = contact.icon;
                return (
                  <motion.div
                    key={contact.label}
                    variants={itemVariants}
                    className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] transition-all duration-300 hover:border-primary/20"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-5.5 h-5.5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">{contact.label}</p>
                    <p className="font-bold text-sm text-foreground break-words">{contact.value}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 bg-muted/10 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              <div className="md:col-span-2">
                <Logo href="/" size="sm" className="mb-5" />
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Plataforma médica de última generación para la organización de consultas, especialidades y expedientes de pacientes.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-foreground">Enlaces rápidos</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="/booking" className="hover:text-foreground transition-colors">Reservar Cita</Link></li>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link></li>
                  <li><Link href="#specialties" className="hover:text-foreground transition-colors">Especialidades</Link></li>
                  <li><Link href="#contact" className="hover:text-foreground transition-colors">Contacto</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-foreground">Legal</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground transition-colors">Términos de uso</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Política de privacidad</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Aviso legal</Link></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 CitasMed. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Salud y Tecnología</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
