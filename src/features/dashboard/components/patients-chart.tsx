"use client";

import { motion } from "framer-motion";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

import { ChartDataPoint } from "../services/dashboard-service";

interface PatientsChartProps {
  appointmentsData: ChartDataPoint[];
  bookingsData: ChartDataPoint[];
  isLoading?: boolean;
}

export function PatientsChart({ 
  appointmentsData, 
  bookingsData,
  isLoading 
}: PatientsChartProps) {
  const hasData = appointmentsData.length > 0 || bookingsData.length > 0;

  if (!hasData && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-base font-semibold">Pacientes y Reservas</h3>
          </div>
          <div className="p-6">
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const combinedData = appointmentsData.map((apt, index) => ({
    date: apt.date,
    label: apt.label,
    pacientes: apt.value,
    reservas: bookingsData[index]?.value || 0
  }));

  const totalPacientes = appointmentsData.reduce((sum, d) => sum + d.value, 0);
  const totalReservas = bookingsData.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-xl hover:border-primary/10 transition-all duration-300">
        <div className="p-6 pb-2 flex flex-row items-center justify-between">
          <h3 className="text-base font-semibold">Pacientes y Reservas</h3>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Pacientes: {totalPacientes}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Reservas: {totalReservas}
            </span>
          </div>
        </div>
        <div className="p-6 pt-2">
          <div className="h-[250px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Cargando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 16, 
                      border: "1px solid oklch(var(--border))",
                      background: "oklch(var(--card) / 0.85)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px oklch(var(--foreground) / 0.12)"
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: "12px" }}
                    iconType="circle"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pacientes" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                    name="Pacientes"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="reservas" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: "#f97316", strokeWidth: 2, r: 3 }}
                    name="Reservas"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}