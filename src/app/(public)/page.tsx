"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
  Menu,
  X,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

const SPECIALTIES = [
  { name: "Medicina General", icon: Stethoscope, description: "Atención primaria y preventiva", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", gradient: "from-emerald-500/10" },
  { name: "Cardiología", icon: Heart, description: "Enfermedades cardiovasculares", color: "text-rose-500", bg: "bg-rose-500/10", border: "hover:border-rose-500/30", gradient: "from-rose-500/10" },
  { name: "Neurología", icon: Brain, description: "Trastornos del sistema nervioso", color: "text-violet-500", bg: "bg-violet-500/10", border: "hover:border-violet-500/30", gradient: "from-violet-500/10" },
  { name: "Oftalmología", icon: Eye, description: "Cirugías oculares y visión", color: "text-sky-500", bg: "bg-sky-500/10", border: "hover:border-sky-500/30", gradient: "from-sky-500/10" },
  { name: "Pediatría", icon: Baby, description: "Atención para niños", color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/30", gradient: "from-amber-500/10" },
  { name: "Dermatología", icon: Activity, description: "Tratamientos de piel", color: "text-teal-500", bg: "bg-teal-500/10", border: "hover:border-teal-500/30", gradient: "from-teal-500/10" },
  { name: "Ginecología", icon: HeartPulse, description: "Salud femenina", color: "text-pink-500", bg: "bg-pink-500/10", border: "hover:border-pink-500/30", gradient: "from-pink-500/10" },
  { name: "Ortopedia", icon: Award, description: "Lesiones óseas", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "hover:border-indigo-500/30", gradient: "from-indigo-500/10" },
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
  { icon: Phone, label: "Teléfono", value: "+52 (55) 1234-5678" },
  { icon: Mail, label: "Email", value: "contacto@citamed.com" },
  { icon: MapPin, label: "Dirección", value: "Av. Principal 123, Ciudad de México" },
  { icon: Clock, label: "Horario", value: "Lun-Vie: 8AM-8PM | Sáb-Dom: 9AM-5PM" },
];

const navLinks = [
  { href: "#specialties", label: "Especialidades" },
  { href: "#features", label: "Servicios" },
  { href: "#testimonials", label: "Testimonios" },
  { href: "#contact", label: "Contacto" },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 -z-20 overflow-x-hidden pointer-events-none">
        <FloatingOrb className="top-[-10%] right-[-5%] w-[700px] h-[700px] bg-primary/8" delay={0} />
        <FloatingOrb className="top-[40%] left-[-10%] w-[500px] h-[500px] bg-accent/6" delay={2} />
        <FloatingOrb className="bottom-[-5%] right-[20%] w-[600px] h-[600px] bg-primary/5" delay={4} />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.04] pointer-events-none -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/20 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20"
              >
                <HeartPulse className="h-5.5 w-5.5 text-primary-foreground" />
              </motion.div>
              <span className="text-xl font-bold tracking-tight text-foreground">CitasMed</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm rounded-xl px-4">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/booking">
                  <Button size="sm" className="text-sm rounded-xl px-4 shadow-lg shadow-primary/10">
                    Reservar Cita
                  </Button>
                </Link>
              </div>

              <button
                className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menú"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-2xl"
          >
            <div className="px-4 py-5 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border/20 flex flex-col gap-2.5">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full rounded-xl">Iniciar sesión</Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full rounded-xl shadow-lg shadow-primary/10">Reservar Cita</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </header>

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
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    Sistema de gestión médica premium
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-tight"
                >
                  Tu salud,{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-emerald-500/70 to-teal-500">
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
                  <Link href="/booking" className="w-full sm:w-auto">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto px-8 py-4 text-base font-semibold rounded-2xl bg-gradient-to-br from-primary to-primary/95 text-primary-foreground shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Reservar Cita
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link href="#specialties" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-base rounded-2xl border-border/80 hover:bg-muted/50 transition-colors">
                      Ver Especialistas
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                  {["Sin filas de espera", "Confirmación inmediata", "100% seguro"].map((text) => (
                    <div key={text} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                      <span className="font-medium">{text}</span>
                    </div>
                  ))}
                </motion.div>
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
                      "rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 text-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden",
                      "hover:border-primary/20",
                      specialty.border
                    )}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      specialty.gradient
                    )} />
                    <div className="relative z-10">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300",
                        specialty.bg
                      )}>
                        <Icon className={cn("w-7 h-7", specialty.color)} />
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
                    className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20"
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
                  className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                >
                  <div>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
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
              className="rounded-3xl border border-border/20 shadow-2xl bg-card/50 backdrop-blur-xl p-8 md:p-16 text-center max-w-4xl mx-auto"
            >
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                ¿Listo para agendar tu cita?
              </motion.h2>
              <motion.p variants={itemVariants} className="text-muted-foreground text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Selecciona la fecha y hora que más te convenga de forma online.
                Sin papeleos y con confirmación garantizada.
              </motion.p>
              <motion.div variants={itemVariants}>
                <Link href="/booking" className="inline-block">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-4 text-base font-semibold rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Reservar Ahora
                  </motion.button>
                </Link>
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
                    className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/20"
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
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                    <HeartPulse className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-foreground">CitasMed</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-sm mb-4 leading-relaxed">
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
