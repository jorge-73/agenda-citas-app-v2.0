"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "./logo";

interface PublicHeaderProps {
  navLinks?: { href: string; label: string }[];
}

const DEFAULT_LINKS = [
  { href: "#specialties", label: "Especialidades" },
  { href: "#features", label: "Servicios" },
  { href: "#testimonials", label: "Testimonios" },
  { href: "#contact", label: "Contacto" },
];

export function PublicHeader({ navLinks = DEFAULT_LINKS }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/20 bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo href="/" size="md" />

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
              <Button variant="ghost" size="sm" className="px-4" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" className="px-4" asChild>
                <Link href="/booking">Reservar Cita</Link>
              </Button>
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
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Iniciar sesión
                </Link>
              </Button>
              <Button size="sm" className="w-full" asChild>
                <Link href="/booking" onClick={() => setMobileMenuOpen(false)}>
                  Reservar Cita
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}