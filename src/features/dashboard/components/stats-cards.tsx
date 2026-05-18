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
import { Card, CardContent } from "@/components/ui/card";
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
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    key: "totalRevenue",
    label: "Ingresos",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    format: "currency"
  },
  {
    key: "cancelledAppointments",
    label: "Canceladas",
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  {
    key: "newPatients",
    label: "Nuevos Pacientes",
    icon: UserPlus,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    key: "newBookings",
    label: "Reservas Online",
    icon: Users,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    key: "activeSpecialists",
    label: "Especialistas",
    icon: Stethoscope,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10"
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
            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {isLoading ? "..." : formatValue(stat.key, value)}
                    </p>
                  </div>
                  <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}