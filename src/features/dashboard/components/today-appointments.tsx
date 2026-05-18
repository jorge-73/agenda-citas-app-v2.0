"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppointmentWithDetails } from "../services/dashboard-service";

interface TodayAppointmentsProps {
  appointments: AppointmentWithDetails[];
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  CONFIRMED: "bg-green-500/10 text-green-700 border-green-500/20",
  COMPLETED: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  CANCELLED: "bg-red-500/10 text-red-700 border-red-500/20",
  NO_SHOW: "bg-gray-500/10 text-gray-700 border-gray-500/20"
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió"
};

export function TodayAppointments({ appointments, isLoading }: TodayAppointmentsProps) {
  const pendingCount = appointments.filter(a => a.status === "PENDING").length;
  const confirmedCount = appointments.filter(a => a.status === "CONFIRMED").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Citas de Hoy</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                {pendingCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {confirmedCount}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay citas programadas para hoy
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt, index) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {apt.startTime ? format(new Date(apt.startTime), "HH:mm") : "--:--"}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">
                        {apt.patientName} {apt.patientLastname}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.specialistName} - {apt.specialty}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", STATUS_COLORS[apt.status])}
                  >
                    {STATUS_LABELS[apt.status] || apt.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}