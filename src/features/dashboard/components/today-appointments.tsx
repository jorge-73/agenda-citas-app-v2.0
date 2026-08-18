"use client";

import { motion } from "framer-motion";
import { formatInTz, AR_TZ } from "@/lib/date-utils";
import { Clock } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { AppointmentWithDetails } from "../services/dashboard-service";

interface TodayAppointmentsProps {
  appointments: AppointmentWithDetails[];
  isLoading?: boolean;
}

export function TodayAppointments({ appointments, isLoading }: TodayAppointmentsProps) {
  const pendingCount = appointments.filter(a => a.status === "PENDING").length;
  const confirmedCount = appointments.filter(a => a.status === "CONFIRMED").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm h-full">
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Citas de Hoy</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning" />
                {pendingCount}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" />
                {confirmedCount}
              </span>
            </div>
          </div>
        </div>
        <div className="p-6 pt-0">
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
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/50 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {apt.startTime ? formatInTz(new Date(apt.startTime), "HH:mm", AR_TZ) : "--:--"}
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
                  <StatusBadge status={apt.status === "NO_SHOW" ? "ABSENT" : apt.status} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}