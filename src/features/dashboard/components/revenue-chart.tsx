"use client";

import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

import { SpecialistRevenue } from "../services/dashboard-service";

interface RevenueChartProps {
  data: SpecialistRevenue[];
  isLoading?: boolean;
}

const COLORS = [
  "#4E8598", "#5C93A5", "#6FA3B2", "#88B7C3", "#A5CCD6",
  "#5C93A5", "#6FA3B2", "#88B7C3", "#4E8598", "#A5CCD6"
];

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const chartData = data.map(d => ({
    name: d.specialistName.length > 15 
      ? d.specialistName.substring(0, 15) + "..." 
      : d.specialistName,
    ingresos: d.revenue,
    citas: d.appointmentCount
  }));

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (data.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-base font-semibold">Ingresos por Especialista</h3>
          </div>
          <div className="p-6">
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hay datos de ingresos disponibles
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-primary/10 transition-all duration-300">
        <div className="p-6 pb-2 flex flex-row items-center justify-between">
          <h3 className="text-base font-semibold">Ingresos por Especialista</h3>
          <span className="text-sm font-medium text-muted-foreground">
            Total: {formatCurrency(totalRevenue)}
          </span>
        </div>
        <div className="p-6 pt-2 [&_.recharts-text]:text-muted-foreground">
          <div className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Cargando...
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos de ingresos en este período
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 16, 
                      border: "1px solid var(--border)",
                      background: "color-mix(in oklab, var(--card) 85%, transparent)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px color-mix(in oklab, var(--foreground) 12%, transparent)"
                    }}
                    formatter={(value) => [formatCurrency(Number(value) || 0), "Ingresos"]}
                  />
                  <Bar 
                    dataKey="ingresos" 
                    radius={[0, 4, 4, 0]}
                    name="Ingresos"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}