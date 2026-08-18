"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, User, ClipboardList, Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";
import { ActivityItem } from "../services/dashboard-service";

interface RecentActivityProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const ACTIVITY_ICONS = {
  appointment: Calendar,
  patient: User,
  booking: ClipboardList,
  specialist: Stethoscope
};

const ACTIVITY_COLORS = {
  appointment: "text-primary bg-primary/10",
  patient: "text-info bg-info/10",
  booking: "text-primary bg-primary/10",
  specialist: "text-info bg-info/10"
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm h-full hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-primary/10 transition-all duration-300">
        <div className="p-6 pb-3">
          <h3 className="text-base font-semibold">Actividad Reciente</h3>
        </div>
        <div className="p-6 pt-0">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay actividad reciente
            </div>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 10).map((activity, index) => {
                const Icon = ACTIVITY_ICONS[activity.type];
                const colorClass = ACTIVITY_COLORS[activity.type];

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={cn("p-2 rounded-lg flex-shrink-0", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.timestamp), { 
                          addSuffix: true,
                          locale: es 
                        })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}