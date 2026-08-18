"use client";

import { motion } from "framer-motion";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

import { ChartDataPoint } from "../services/dashboard-service";

interface SpecialtyChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
}

const COLORS = [
  "#1f68bc", "#3a7fd6", "#5a9ae6", "#7db2f0", "#a3caf7",
  "#3a7fd6", "#5a9ae6", "#7db2f0", "#1f68bc", "#a3caf7",
  "#2a76cf", "#5a9ae6", "#7db2f0", "#8fbeeb", "#a3caf7"
];

export function SpecialtyChart({ data, isLoading }: SpecialtyChartProps) {
  if (data.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm">
          <div className="p-6 pb-2 flex flex-row items-center justify-between">
            <h3 className="text-base font-semibold">Citas por Especialidad</h3>
          </div>
          <div className="p-6">
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No hay datos de especialidades
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const chartData = data.map(d => ({
    name: d.label,
    value: d.value
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-xl hover:border-primary/10 transition-all duration-300">
        <div className="p-6 pb-2 flex flex-row items-center justify-between">
          <h3 className="text-base font-semibold">Citas por Especialidad</h3>
          <span className="text-sm text-muted-foreground">
            Total: {total}
          </span>
        </div>
        <div className="p-6 pt-2">
          <div className="h-[280px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Cargando...
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No hay datos de especialidades
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 16, 
                      border: "1px solid oklch(var(--border))",
                      background: "oklch(var(--card) / 0.85)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px oklch(var(--foreground) / 0.12)"
                    }}
                    formatter={(value, name) => [value, String(name)]}
                  />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}