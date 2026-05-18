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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpecialistRevenue } from "../services/dashboard-service";

interface RevenueChartProps {
  data: SpecialistRevenue[];
  isLoading?: boolean;
}

const COLORS = [
  "#3b82f6", "#10b981", "#8b5cf6", "#f97316", "#ec4899",
  "#14b8a6", "#6366f1", "#84cc16", "#06b6d4", "#a855f7"
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
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-medium">Ingresos por Especialista</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            Total: {formatCurrency(totalRevenue)}
          </span>
        </CardHeader>
        <CardContent>
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
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis 
                    type="number"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8, 
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
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
        </CardContent>
      </Card>
    </motion.div>
  );
}