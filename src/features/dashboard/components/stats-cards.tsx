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
    icon: Calendar
  },
  {
    key: "totalRevenue",
    label: "Ingresos",
    icon: DollarSign,
    format: "currency"
  },
  {
    key: "cancelledAppointments",
    label: "Canceladas",
    icon: XCircle
  },
  {
    key: "newPatients",
    label: "Nuevos Pacientes",
    icon: UserPlus
  },
  {
    key: "newBookings",
    label: "Reservas Online",
    icon: Users
  },
  {
    key: "activeSpecialists",
    label: "Especialistas",
    icon: Stethoscope
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
            <div className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-sm relative overflow-hidden group hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
                  <div className="p-2.5 rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
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