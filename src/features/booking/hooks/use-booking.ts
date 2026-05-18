"use client";

import { useState, useCallback } from "react";
import { bookingService } from "../services/booking-service";
import { BookingStep, CreateBookingInput, TimeSlot } from "../types";

export function useBooking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingStep>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const updateBookingData = useCallback((data: Partial<BookingStep>) => {
    setBookingData((prev) => ({ ...prev, ...data }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const loadAvailableDates = useCallback(async (specialistId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date();
      const endDate = addDays(today, 60);
      const dates = await bookingService.getAvailableDates(specialistId, today, endDate);
      setAvailableDates(dates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar fechas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAvailableSlots = useCallback(async (specialistId: string, date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const slots = await bookingService.getAvailableTimeSlots(specialistId, date);
      setAvailableSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar horarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitBooking = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const input: CreateBookingInput = {
        patientName: bookingData.patientName!,
        patientLastname: bookingData.patientLastname!,
        patientEmail: bookingData.patientEmail!,
        patientPhone: bookingData.patientPhone!,
        specialistId: bookingData.specialistId!,
        specialty: bookingData.specialty!,
        reason: bookingData.reason,
        date: bookingData.date!,
        time: bookingData.time!,
      };

      const booking = await bookingService.createBooking(input);
      return booking;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear reserva";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [bookingData]);

  const resetBooking = useCallback(() => {
    setCurrentStep(1);
    setBookingData({});
    setAvailableDates([]);
    setAvailableSlots([]);
    setError(null);
  }, []);

  return {
    currentStep,
    bookingData,
    isLoading,
    error,
    availableDates,
    availableSlots,
    updateBookingData,
    nextStep,
    prevStep,
    goToStep,
    loadAvailableDates,
    loadAvailableSlots,
    submitBooking,
    resetBooking,
  };
}

import { addDays } from "date-fns";