"use client";

import { motion, type Variants } from "framer-motion";
import { DateRangeSelector } from "@/features/dashboard/components/date-range-selector";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { AppointmentsChart } from "@/features/dashboard/components/appointments-chart";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { TodayAppointments } from "@/features/dashboard/components/today-appointments";
import { RecentPatients } from "@/features/dashboard/components/recent-patients";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { SpecialtyChart } from "@/features/dashboard/components/specialty-chart";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" as const },
  }),
} satisfies Variants;

export function DashboardClient() {
  const {
    dateRange,
    setDateRange,
    stats,
    appointmentsChartData,
    bookingsChartData,
    revenueData,
    specialtyData,
    todayAppointments,
    recentPatients,
    recentActivity,
    isLoading,
  } = useDashboardStats();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div custom={0} variants={sectionVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div />
        <DateRangeSelector
          value={dateRange}
          onChange={(range) => setDateRange(range)}
        />
      </motion.div>

      <motion.div custom={1} variants={sectionVariants}>
        <StatsCards stats={stats} isLoading={isLoading} />
      </motion.div>

      <motion.div custom={2} variants={sectionVariants} className="grid gap-4 lg:grid-cols-2">
        <AppointmentsChart 
          appointmentsData={appointmentsChartData} 
          bookingsData={bookingsChartData}
          isLoading={isLoading} 
        />
        <RevenueChart 
          data={revenueData}
          isLoading={isLoading}
        />
      </motion.div>

      <motion.div custom={3} variants={sectionVariants} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayAppointments 
            appointments={todayAppointments}
            isLoading={isLoading}
          />
        </div>
        <div>
          <RecentPatients 
            patients={recentPatients}
            isLoading={isLoading}
          />
        </div>
      </motion.div>

      <motion.div custom={4} variants={sectionVariants} className="grid gap-4 lg:grid-cols-2">
        <RecentActivity 
          activities={recentActivity}
          isLoading={isLoading}
        />
        <SpecialtyChart 
          data={specialtyData}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}