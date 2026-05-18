"use client";

import { useState, useCallback } from "react";
import { 
  getAvailableDatesAction, 
  getAvailableTimeSlotsAction, 
  createBookingAction 
} from "../actions";
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
      const dates = await getAvailableDatesAction(specialistId);
      setAvailableDates(dates.map((d) => new Date(d)));
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
      const slots = await getAvailableTimeSlotsAction(specialistId, date);
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

      const booking = await createBookingAction(input);
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