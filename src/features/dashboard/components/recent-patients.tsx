"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { User, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentPatient } from "../services/dashboard-service";

interface RecentPatientsProps {
  patients: RecentPatient[];
  isLoading?: boolean;
}

export function RecentPatients({ patients, isLoading }: RecentPatientsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Pacientes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay pacientes registrados
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {patient.name || "Sin nombre"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">
                        {patient.email}
                      </span>
                    </div>
                    {patient.phone && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {patient.phone}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(patient.createdAt), { 
                      addSuffix: true,
                      locale: es 
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}