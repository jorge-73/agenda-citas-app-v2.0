"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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
  X
} from "lucide-react";
import { useState } from "react";

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
  {
    icon: Calendar,
    title: "Reserva Online 24/7",
    description: "Agenda tu cita desde cualquier dispositivo, sin llamadas ni filas.",
  },
  {
    icon: Clock,
    title: "Horarios Flexibles",
    description: "Disponibilidad de 8AM a 8PM, incluyendo fines de semana.",
  },
  {
    icon: Shield,
    title: "Confirmación Inmediata",
    description: "Recibe tu comprobante al instante por email y recordatorios.",
  },
  {
    icon: ClipboardList,
    title: "Historial Digital",
    description: "Accede a tu expediente médico completo en cualquier momento.",
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
    content: "Excelente plataforma. Pude agendar una cita en menos de 10 minutos. Totalmente recomendado.",
    rating: 5,
    avatar: "MG"
  },
  {
    name: "Carlos Rodríguez",
    role: "Paciente",
    content: "Como padre de tres niños, esta app me permite agendar citas para toda la familia en un solo lugar.",
    rating: 5,
    avatar: "CR"
  },
  {
    name: "Ana Martínez",
    role: "Paciente",
    content: "El proceso de reserva es intuitivo, los doctores son profesionales de primer nivel.",
    rating: 5,
    avatar: "AM"
  },
  {
    name: "Roberto Sánchez",
    role: "Paciente",
    content: "Gracias a la disponibilidad de horarios pude conseguir una cita el mismo día. Experiencia 10/10.",
    rating: 5,
    avatar: "RS"
  },
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

function Users({ className }: { className?: string }) {
  return <div className={className}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>;
}

export default function PublicLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/home" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20"
              >
                <HeartPulse className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="text-lg font-semibold text-foreground">CitasMed</span>
            </Link>
            
            {/* Desktop Nav */}
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
              
              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border/40 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Iniciar sesión</Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">Reservar Cita</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-4xl text-center"
            >
              <Badge variant="secondary" className="mb-6 bg-primary/5 text-primary border-primary/20">
                <Star className="w-3 h-3 mr-1 text-amber-500" />
                Sistema de gestión médica líder
              </Badge>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                Tu salud,{' '}
                <span className="text-primary">a un clic de distancia</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              >
                Reserva citas médicas con los mejores especialistas de forma rápida, 
                segura y sin filas de espera.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link href="/booking">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-8 py-3 text-base font-medium rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  >
                    <Calendar className="w-5 h-5 mr-2 inline" />
                    Reservar Cita
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </motion.button>
                </Link>
                <Link href="#specialties">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 text-base rounded-2xl">
                    Ver Especialistas
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              >
                {[
                  { text: "Sin filas de espera", icon: CheckCircle2 },
                  { text: "Confirmación inmediata", icon: CheckCircle2 },
                  { text: "100% seguro", icon: CheckCircle2 },
                ].map((item, i) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4 text-green-500" />
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialties Section */}
        <section id="specialties" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Especialidades Disponibles
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Contamos con un equipo de profesionales especializados en diversas áreas de la medicina
              </p>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SPECIALTIES.map((specialty, i) => (
                <motion.div
                  key={specialty.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-border/40 bg-card p-5 text-center cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <specialty.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold text-sm mb-1">{specialty.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{specialty.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/20 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                ¿Por qué elegirnos?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Nuestra plataforma está diseñada para brindarte la mejor experiencia en gestión de citas médicas
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="rounded-2xl border border-border/40 bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Lo que dicen nuestros pacientes
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Miles de pacientes confían en nosotros para su atención médica
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {TESTIMONIALS.map((testimonial, i) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-2xl border border-border/40 bg-card p-5"
                >
                    <div className="flex gap-1 mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-4">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-primary/8 to-primary/3 p-8 md:p-12 text-center"
            >
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
                  ¿Necesitas una cita médica?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Reserva ahora y recibe atención médica de calidad. 
                  Nuestro equipo está listo para atenderte.
                </p>
                <Link href="/booking">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-3 text-base font-medium rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl transition-all"
                  >
                    <Calendar className="w-5 h-5 mr-2 inline" />
                    Reservar Ahora
                  </motion.button>
                </Link>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Contáctanos
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {CONTACT_INFO.map((contact, i) => (
                <motion.div
                  key={contact.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-2xl border border-border/40 bg-card p-5 text-center"
                >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <contact.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{contact.label}</p>
                    <p className="font-medium text-sm break-words">{contact.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                    <HeartPulse className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">CitasMed</span>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs mb-4">
                  Sistema de gestión de citas médicas moderno y eficiente. 
                  Tu salud a un clic de distancia.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-sm">Enlaces rápidos</h4>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li><Link href="/booking" className="hover:text-foreground transition-colors">Reservar Cita</Link></li>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Iniciar Sesión</Link></li>
                  <li><Link href="#specialties" className="hover:text-foreground transition-colors">Especialidades</Link></li>
                  <li><Link href="#contact" className="hover:text-foreground transition-colors">Contacto</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-sm">Legal</h4>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-foreground transition-colors">Términos de uso</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Política de privacidad</Link></li>
                  <li><Link href="#" className="hover:text-foreground transition-colors">Aviso legal</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
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