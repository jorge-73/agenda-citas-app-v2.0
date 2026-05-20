"use client";

import { DateRangeSelector } from "@/features/dashboard/components/date-range-selector";
import { StatsCards } from "@/features/dashboard/components/stats-cards";
import { AppointmentsChart } from "@/features/dashboard/components/appointments-chart";
import { RevenueChart } from "@/features/dashboard/components/revenue-chart";
import { TodayAppointments } from "@/features/dashboard/components/today-appointments";
import { RecentPatients } from "@/features/dashboard/components/recent-patients";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";
import { SpecialtyChart } from "@/features/dashboard/components/specialty-chart";
import { useDashboardStats } from "@/features/dashboard/hooks/use-dashboard-stats";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div />
        <DateRangeSelector
          value={dateRange}
          onChange={(range) => setDateRange(range)}
        />
      </div>

      <StatsCards stats={stats} isLoading={isLoading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AppointmentsChart 
          appointmentsData={appointmentsChartData} 
          bookingsData={bookingsChartData}
          isLoading={isLoading} 
        />
        <RevenueChart 
          data={revenueData}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentActivity 
          activities={recentActivity}
          isLoading={isLoading}
        />
        <SpecialtyChart 
          data={specialtyData}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}