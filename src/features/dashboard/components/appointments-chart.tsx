"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";


interface ChartData {
  date: string;
  appointments?: number;
  bookings?: number;
  value?: number;
  label?: string;
}

interface AppointmentsChartProps {
  appointmentsData: ChartData[];
  bookingsData: ChartData[];
  isLoading?: boolean;
}

export function AppointmentsChart({ appointmentsData, bookingsData, isLoading }: AppointmentsChartProps) {
  const [activeView, setActiveView] = useState<"bar" | "line">("bar");

  const combinedData = appointmentsData.map((item, index) => ({
    date: item.date,
    appointments: item.appointments ?? item.value ?? 0,
    bookings: bookingsData[index]?.bookings ?? bookingsData[index]?.value ?? 0,
  }));

  const colors = {
    appointments: "#1f68bc",
    bookings: "#5a9ae6",
    grid: "oklch(var(--border) / 0.5)",
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm">
        <div className="p-6 pb-2">
          <h3 className="text-lg font-semibold">Citas y Reservas</h3>
          <p className="text-sm text-muted-foreground">Comparación de citas vs reservas online</p>
        </div>
        <div className="p-6 h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm hover:shadow-xl hover:border-primary/10 transition-all duration-300">
      <div className="p-6 pb-2 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Citas y Reservas</h3>
          <p className="text-sm text-muted-foreground">Comparación de citas vs reservas online</p>
        </div>
        <div className="flex gap-1 p-1 bg-muted/60 rounded-xl">
          <button
            onClick={() => setActiveView("bar")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
              activeView === "bar" 
                ? "bg-card shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Barras
          </button>
          <button
            onClick={() => setActiveView("line")}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
              activeView === "line" 
                ? "bg-card shadow-sm text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Línea
          </button>
        </div>
      </div>
      <div className="p-6 pt-2">
        <div className="h-[300px] [&_.recharts-text]:text-muted-foreground">
          <ResponsiveContainer width="100%" height="100%">
            {activeView === "bar" ? (
                <BarChart data={combinedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "16px", 
                      border: "1px solid oklch(var(--border))",
                      background: "oklch(var(--card) / 0.85)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px oklch(var(--foreground) / 0.12)"
                    }}
                    cursor={{ fill: "oklch(var(--muted) / 0.5)" }}
                  />
                <Legend 
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <defs>
                  <linearGradient id="appointmentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.appointments} stopOpacity={1} />
                    <stop offset="100%" stopColor={colors.appointments} stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.bookings} stopOpacity={1} />
                    <stop offset="100%" stopColor={colors.bookings} stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <Bar 
                  dataKey="appointments" 
                  name="Citas" 
                  fill="url(#appointmentsGrad)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Bar 
                  dataKey="bookings" 
                  name="Reservas" 
                  fill="url(#bookingsGrad)" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            ) : (
                <LineChart data={combinedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: "currentColor" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: "16px", 
                      border: "1px solid oklch(var(--border))",
                      background: "oklch(var(--card) / 0.85)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow: "0 8px 32px oklch(var(--foreground) / 0.12)"
                    }}
                  />
                <Legend 
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <defs>
                  <linearGradient id="appointmentsLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.appointments} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={colors.appointments} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bookingsLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.bookings} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={colors.bookings} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="appointments" 
                  name="Citas"
                  stroke={colors.appointments} 
                  strokeWidth={3}
                  dot={{ fill: colors.appointments, strokeWidth: 0, r: 4, stroke: colors.appointments }}
                  activeDot={{ r: 6, stroke: colors.appointments, strokeWidth: 2, fill: "oklch(var(--card))" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="bookings" 
                  name="Reservas"
                  stroke={colors.bookings} 
                  strokeWidth={3}
                  dot={{ fill: colors.bookings, strokeWidth: 0, r: 4, stroke: colors.bookings }}
                  activeDot={{ r: 6, stroke: colors.bookings, strokeWidth: 2, fill: "oklch(var(--card))" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}