"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  DollarSign, 
  XCircle, 
  Users, 
  UserPlus,
  Stethoscope
} from "lucide-react";

import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: {
    totalAppointments: number;
    totalRevenue: number;
    cancelledAppointments: number;
    newPatients: number;
    newBookings: number;
    activeSpecialists: number;
  };
  isLoading?: boolean;
}

const STATS_CONFIG = [
  {
    key: "totalAppointments",
    label: "Citas",
    icon: Calendar,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
    gradient: "from-emerald-500/20 to-transparent",
    glowColor: "shadow-emerald-500/10"
  },
  {
    key: "totalRevenue",
    label: "Ingresos",
    icon: DollarSign,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-100 dark:bg-sky-500/20",
    gradient: "from-sky-500/20 to-transparent",
    format: "currency",
    glowColor: "shadow-sky-500/10"
  },
  {
    key: "cancelledAppointments",
    label: "Canceladas",
    icon: XCircle,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-500/20",
    gradient: "from-rose-500/20 to-transparent",
    glowColor: "shadow-rose-500/10"
  },
  {
    key: "newPatients",
    label: "Nuevos Pacientes",
    icon: UserPlus,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-500/20",
    gradient: "from-violet-500/20 to-transparent",
    glowColor: "shadow-violet-500/10"
  },
  {
    key: "newBookings",
    label: "Reservas Online",
    icon: Users,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-500/20",
    gradient: "from-amber-500/20 to-transparent",
    glowColor: "shadow-amber-500/10"
  },
  {
    key: "activeSpecialists",
    label: "Especialistas",
    icon: Stethoscope,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-500/20",
    gradient: "from-teal-500/20 to-transparent",
    glowColor: "shadow-teal-500/10"
  }
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const formatValue = (key: string, value: number) => {
    if (key === "totalRevenue") {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    return value.toLocaleString("es-MX");
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {STATS_CONFIG.map((stat, index) => {
        const value = stats[stat.key as keyof typeof stats] as number;
        
        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="premium-card rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300">
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                stat.gradient
              )} />
              <div className="p-5 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight text-foreground">
                      {isLoading ? (
                        <span className="skeleton inline-block w-16 h-6 rounded" />
                      ) : formatValue(stat.key, value)}
                    </p>
                  </div>
                  <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                    stat.bgColor,
                    stat.glowColor
                  )}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}