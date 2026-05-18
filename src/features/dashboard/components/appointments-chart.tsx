"use client";

import { motion } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartDataPoint } from "../services/dashboard-service";

interface AppointmentsChartProps {
  appointmentsData: ChartDataPoint[];
  bookingsData: ChartDataPoint[];
  isLoading?: boolean;
}

export function AppointmentsChart({ 
  appointmentsData, 
  bookingsData,
  isLoading 
}: AppointmentsChartProps) {
  const combinedData = appointmentsData.map((apt, index) => ({
    date: apt.date,
    label: apt.label,
    citas: apt.value,
    reservas: bookingsData[index]?.value || 0
  }));

  const totalCitas = appointmentsData.reduce((sum, d) => sum + d.value, 0);
  const totalReservas = bookingsData.reduce((sum, d) => sum + d.value, 0);

  const hasData = appointmentsData.length > 0 || bookingsData.length > 0;

  if (!hasData && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Citas y Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos disponibles para el período seleccionado
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Citas y Reservas</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[--primary]" />
              Citas: {totalCitas}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Reservas: {totalReservas}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Cargando...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReservas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    stroke="oklch(var(--muted-foreground))"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    stroke="oklch(var(--muted-foreground))"
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: "1px solid oklch(var(--border))",
                      backgroundColor: "oklch(var(--card))",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="citas" 
                    stroke="oklch(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorCitas)"
                    strokeWidth={2}
                    name="Citas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reservas" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorReservas)"
                    strokeWidth={2}
                    name="Reservas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}