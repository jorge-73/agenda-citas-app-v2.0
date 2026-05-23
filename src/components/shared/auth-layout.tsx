"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AuthOrb } from "./auth-orb";

interface OrbConfig {
  className: string;
  delay?: number;
}

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  orbs?: OrbConfig[];
  showHeader?: boolean;
}

const defaultOrbs: OrbConfig[] = [
  { className: "top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/12" },
  { className: "bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/8", delay: 3 },
  { className: "top-1/2 right-1/3 w-[400px] h-[400px] bg-primary/6", delay: 6 },
];

export function AuthLayout({ children, title, subtitle, orbs = defaultOrbs, showHeader = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-mesh">
      <div className="absolute inset-0 -z-10">
        {orbs.map((orb, i) => (
          <AuthOrb key={i} className={orb.className} delay={orb.delay} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -top-2 right-0 z-20">
          <ThemeToggle />
        </div>
        {showHeader && title && (
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25"
              >
                <HeartPulse className="h-6 w-6 text-primary-foreground" />
              </motion.div>
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl font-bold text-foreground mb-2"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-3xl border border-border/40 bg-card p-8 shadow-2xl shadow-foreground/5"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}
