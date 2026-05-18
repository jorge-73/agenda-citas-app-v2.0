"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, User, ClipboardList, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  appointment: "text-blue-500 bg-blue-500/10",
  patient: "text-purple-500 bg-purple-500/10",
  booking: "text-orange-500 bg-orange-500/10",
  specialist: "text-cyan-500 bg-cyan-500/10"
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}