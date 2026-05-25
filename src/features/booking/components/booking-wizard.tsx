"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAvailableSpecialistsAction, getAvailableDatesAction, getAvailableTimeSlotsAction, createBookingAction } from "@/features/booking/actions";
import { StepSpecialties } from "./step-specialties";
import { StepProfessionals } from "./step-professionals";
import { StepDateTime } from "./step-datetime";
import { StepReview } from "./step-review";
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import type { TimeSlot } from "../types";

const VISUAL_STEPS = [
  { id: 1, label: "Especialidad", short: "Esp." },
  { id: 2, label: "Profesional", short: "Pro." },
  { id: 3, label: "Fecha y Hora", short: "Fecha" },
  { id: 4, label: "Confirmar", short: "Conf." },
];

interface SpecialistFlat {
  id: string;
  name: string;
  specialty: string;
  price?: number | null;
  bio?: string | null;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  return /^[\d\s\-\+\(\)]{7,20}$/.test(phone);
}

export function BookingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Data from server
  const [allSpecialists, setAllSpecialists] = useState<SpecialistFlat[]>([]);
  const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(true);

  // Selections
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Dynamic data
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Patient form
  const [patientData, setPatientData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Partial<Record<"name" | "lastname" | "email" | "phone", string>>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch specialists on mount
  useEffect(() => {
    (async () => {
      setIsLoadingSpecialists(true);
      try {
        const data = await getAvailableSpecialistsAction();
        setAllSpecialists(
          data.map((s) => ({
            id: s.id,
            name: s.user?.name || "Especialista",
            specialty: s.specialty,
            price: s.price,
            bio: s.bio,
          }))
        );
      } catch {
        toast.error("Error al cargar especialistas");
      } finally {
        setIsLoadingSpecialists(false);
      }
    })();
  }, []);

  // Derived specialties from actual data
  const specialties = useMemo(() => {
    const map = new Map<string, number>();
    allSpecialists.forEach((s) => {
      map.set(s.specialty, (map.get(s.specialty) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [allSpecialists]);

  // Filtered specialists by specialty
  const filteredSpecialists = useMemo(
    () => allSpecialists.filter((s) => s.specialty === selectedSpecialty),
    [allSpecialists, selectedSpecialty]
  );

  const selectedSpecialist = useMemo(
    () => allSpecialists.find((s) => s.id === selectedSpecialistId),
    [allSpecialists, selectedSpecialistId]
  );

  // Load dates when specialist is selected
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!selectedSpecialistId) return;
    let cancelled = false;

    setAvailableDates([]);
    setSelectedDate(null);
    setSelectedTime(null);
    setAvailableSlots([]);
    setIsLoadingDates(true);

    getAvailableDatesAction(selectedSpecialistId)
      .then((dates) => { if (!cancelled) setAvailableDates(dates.map((d) => new Date(d))); })
      .catch(() => { if (!cancelled) toast.error("Error al cargar fechas disponibles"); })
      .finally(() => { if (!cancelled) setIsLoadingDates(false); });

    return () => { cancelled = true; };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedSpecialistId]);

  // Load slots when date is selected
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!selectedSpecialistId || !selectedDate) return;
    let cancelled = false;

    setSelectedTime(null);
    setAvailableSlots([]);
    setIsLoadingSlots(true);

    getAvailableTimeSlotsAction(selectedSpecialistId, selectedDate)
      .then((slots) => { if (!cancelled) setAvailableSlots(slots); })
      .catch(() => { if (!cancelled) toast.error("Error al cargar horarios"); })
      .finally(() => { if (!cancelled) setIsLoadingSlots(false); });

    return () => { cancelled = true; };
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedSpecialistId, selectedDate]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 1: return !!selectedSpecialty;
      case 2: return !!selectedSpecialistId;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return !!(
        patientData.name.trim() &&
        patientData.lastname.trim() &&
        patientData.email.trim() &&
        patientData.phone.trim() &&
        !Object.values(errors).some(Boolean)
      );
      default: return false;
    }
  }, [step, selectedSpecialty, selectedSpecialistId, selectedDate, selectedTime, patientData, errors]);

  const goNext = useCallback(() => {
    if (step < 4) {
      // Auto-load on step 4
      if (step === 3) {
        setErrors({});
      }
      setStep((s) => s + 1);
    }
  }, [step]);

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handlePatientChange = useCallback((data: Partial<typeof patientData>) => {
    setPatientData((prev) => {
      const next = { ...prev, ...data };
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      if ("name" in data) delete next.name;
      if ("lastname" in data) delete next.lastname;
      if ("email" in data) delete next.email;
      if ("phone" in data) delete next.phone;
      return next;
    });
  }, []);

  const validateForm = useCallback(() => {
    const errs: typeof errors = {};
    if (!patientData.name.trim()) errs.name = "El nombre es requerido";
    if (!patientData.lastname.trim()) errs.lastname = "El apellido es requerido";
    if (!patientData.email.trim()) errs.email = "El email es requerido";
    else if (!validateEmail(patientData.email)) errs.email = "Email inválido";
    if (!patientData.phone.trim()) errs.phone = "El teléfono es requerido";
    else if (!validatePhone(patientData.phone)) errs.phone = "Teléfono inválido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [patientData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    if (!selectedSpecialty || !selectedSpecialistId || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const booking = await createBookingAction({
        patientName: patientData.name.trim(),
        patientLastname: patientData.lastname.trim(),
        patientEmail: patientData.email.trim(),
        patientPhone: patientData.phone.trim(),
        specialistId: selectedSpecialistId,
        specialty: selectedSpecialty,
        reason: patientData.reason.trim() || undefined,
        date: selectedDate,
        time: selectedTime,
      });

      router.push(`/booking/confirmation?id=${booking.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la reserva");
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, selectedSpecialty, selectedSpecialistId, selectedDate, selectedTime, patientData, router]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-1 sm:gap-2 px-1">
        {VISUAL_STEPS.map((s, i) => {
          const isActive = step === s.id;
          const isCompleted = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-0 flex-1">
              <Button
                variant="ghost"
                onClick={() => s.id < step && setStep(s.id)}
                disabled={s.id >= step}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-xl min-w-0 transition-all duration-200",
                  isActive && "bg-primary/10 shadow-sm",
                  isCompleted && "hover:bg-primary/10 active:scale-95",
                  s.id >= step && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-all duration-300",
                    isCompleted
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : isActive
                        ? "border-2 border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "border-2 border-border/50 bg-muted/40 text-muted-foreground"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : s.id}
                </div>
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium truncate hidden sm:block",
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </Button>
              {i < VISUAL_STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 sm:mx-2 rounded-full transition-colors duration-300",
                    isCompleted ? "bg-primary" : "bg-border/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="relative min-h-[360px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div>
                <div className="mb-5 sm:mb-6 text-center sm:text-left">
                  <p className="text-lg sm:text-xl font-semibold text-foreground">Selecciona una especialidad</p>
                  <p className="text-sm text-muted-foreground mt-1">Elige el tipo de atención médica que necesitas</p>
                </div>
                <StepSpecialties
                  specialties={specialties}
                  selected={selectedSpecialty}
                  onSelect={(s) => { setSelectedSpecialty(s); goNext(); }}
                  isLoading={isLoadingSpecialists}
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-5 sm:mb-6 text-center sm:text-left">
                  <p className="text-lg sm:text-xl font-semibold text-foreground">Selecciona un profesional</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredSpecialists.length} {filteredSpecialists.length === 1 ? "especialista disponible" : "especialistas disponibles"} en {selectedSpecialty}
                  </p>
                </div>
                <StepProfessionals
                  specialists={filteredSpecialists}
                  selected={selectedSpecialistId}
                  onSelect={(id) => { setSelectedSpecialistId(id); goNext(); }}
                  isLoading={isLoadingSpecialists}
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-5 sm:mb-6 text-center sm:text-left">
                  <p className="text-lg sm:text-xl font-semibold text-foreground">Selecciona fecha y hora</p>
                  <p className="text-sm text-muted-foreground mt-1">Elige el horario disponible que más te convenga</p>
                </div>
                {isLoadingDates ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : availableDates.length > 0 ? (
                  <StepDateTime
                    availableDates={availableDates}
                    availableSlots={availableSlots}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSelectDate={setSelectedDate}
                    onSelectTime={setSelectedTime}
                    isLoadingSlots={isLoadingSlots}
                  />
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground">No hay fechas disponibles para este especialista.</p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div>
                <div className="mb-5 sm:mb-6 text-center sm:text-left">
                  <p className="text-lg sm:text-xl font-semibold text-foreground">Confirma tu cita</p>
                  <p className="text-sm text-muted-foreground mt-1">Revisa los detalles y completa tus datos</p>
                </div>
                <StepReview
                  specialty={selectedSpecialty || ""}
                  specialistName={selectedSpecialist?.name || ""}
                  specialistSpecialty={selectedSpecialist?.specialty || ""}
                  date={selectedDate}
                  time={selectedTime || ""}
                  patientData={patientData}
                  onPatientDataChange={handlePatientChange}
                  errors={errors}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <motion.div
        className="flex items-center justify-between pt-2 pb-4 sm:pb-0 gap-3 sticky bottom-0 bg-background/90 backdrop-blur-lg border-t border-border/20 -mx-4 px-4 sm:relative sm:bg-transparent sm:border-0 sm:mx-0 sm:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Button
          variant="outline"
          size="lg"
          onClick={goBack}
          disabled={step === 1}
          className="rounded-xl px-5 h-12"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>

        {step === 4 ? (
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar cita
              </>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={goNext}
            disabled={!canProceed()}
            className="rounded-xl px-6 h-12"
          >
            Siguiente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}