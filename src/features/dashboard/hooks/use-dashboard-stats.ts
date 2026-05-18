"use client";

import { useState, useCallback, useEffect } from "react";
import { subDays } from "date-fns";
import { 
  getDashboardStats, 
  getAppointmentsByDay, 
  getBookingsByDay,
  getRevenueBySpecialist,
  getAppointmentsBySpecialty,
  getTodayAppointments,
  getRecentPatients,
  getRecentActivity,
  type DashboardStats,
  type ChartDataPoint,
  type SpecialistRevenue,
  type AppointmentWithDetails,
  type RecentPatient,
  type ActivityItem
} from "../services/dashboard-service";

export type DateRange = {
  from: Date;
  to: Date;
};

export function useDashboardStats() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalRevenue: 0,
    cancelledAppointments: 0,
    newPatients: 0,
    newBookings: 0,
    activeSpecialists: 0
  });

  const [appointmentsChartData, setAppointmentsChartData] = useState<ChartDataPoint[]>([]);
  const [bookingsChartData, setBookingsChartData] = useState<ChartDataPoint[]>([]);
  const [revenueData, setRevenueData] = useState<SpecialistRevenue[]>([]);
  const [specialtyData, setSpecialtyData] = useState<ChartDataPoint[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentWithDetails[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        statsResult,
        appointmentsData,
        bookingsData,
        revenueResult,
        specialtyResult,
        todayApts,
        recentPats,
        activity
      ] = await Promise.all([
        getDashboardStats(dateRange.from, dateRange.to),
        getAppointmentsByDay(dateRange.from, dateRange.to),
        getBookingsByDay(dateRange.from, dateRange.to),
        getRevenueBySpecialist(dateRange.from, dateRange.to),
        getAppointmentsBySpecialty(dateRange.from, dateRange.to),
        getTodayAppointments(),
        getRecentPatients(10),
        getRecentActivity(10)
      ]);

      setStats(statsResult);
      setAppointmentsChartData(appointmentsData);
      setBookingsChartData(bookingsData);
      setRevenueData(revenueResult);
      setSpecialtyData(specialtyResult);
      setTodayAppointments(todayApts);
      setRecentPatients(recentPats);
      setRecentActivity(activity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
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
    error,
    refetch: fetchData
  };
}