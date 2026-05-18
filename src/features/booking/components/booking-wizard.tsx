"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBooking } from "../hooks/use-booking";
import { getAvailableSpecialistsAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Heart,
  Mail,
  Phone
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { SPECIALTY_ICONS } from "../types";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Especialidad" },
  { id: 2, title: "Profesional" },
  { id: 3, title: "Fecha" },
  { id: 4, title: "Horario" },
  { id: 5, title: "Datos" },
  { id: 6, title: "Confirmar" },
];

const SPECIALTIES = [
  "Medicina General", "Cardiología", "Dermatología", "Endocrinología",
  "Gastroenterología", "Ginecología", "Neurología", "Oftalmología",
  "Ortopedia", "Pediatría", "Psiquiatría", "Urología", "Oncología",
];

export function BookingWizard() {
  const router = useRouter();
  const {
    currentStep,
    bookingData,
    isLoading,
    availableDates,
    availableSlots,
    updateBookingData,
    nextStep,
    prevStep,
    loadAvailableDates,
    loadAvailableSlots,
    submitBooking,
  } = useBooking();

  const [specialists, setSpecialists] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (bookingData.specialty) {
      getAvailableSpecialistsAction(bookingData.specialty).then(setSpecialists);
    }
  }, [bookingData.specialty]);

  useEffect(() => {
    if (bookingData.specialistId) {
      loadAvailableDates(bookingData.specialistId);
    }
  }, [bookingData.specialistId, loadAvailableDates]);

  useEffect(() => {
    if (bookingData.specialistId && selectedDate) {
      loadAvailableSlots(bookingData.specialistId, selectedDate);
    }
  }, [bookingData.specialistId, selectedDate, loadAvailableSlots]);

  const handleSpecialtySelect = (specialty: string) => {
    updateBookingData({ specialty });
    nextStep();
  };

  const handleSpecialistSelect = (specialist: any) => {
    updateBookingData({ 
      specialistId: specialist.id,
      specialty: specialist.specialty 
    });
    nextStep();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    updateBookingData({ date });
  };

  const handleTimeSelect = (time: string) => {
    updateBookingData({ time });
    nextStep();
  };

  const handlePatientDataSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateBookingData({
      patientName: formData.get("name") as string,
      patientLastname: formData.get("lastname") as string,
      patientEmail: formData.get("email") as string,
      patientPhone: formData.get("phone") as string,
      reason: formData.get("reason") as string,
    });
    nextStep();
  };

  const handleConfirm = async () => {
    try {
      const booking = await submitBooking();
      router.push(`/booking/confirmation?id=${booking.id}`);
    } catch (error) {
      toast.error("Error al confirmar la reserva");
    }
  };

  const progress = (currentStep / 6) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center",
                step.id < 6 ? "flex-1" : ""
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              {step.id < 6 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-center mt-2 text-sm text-muted-foreground">
          Paso {currentStep} de 6: {STEPS[currentStep - 1].title}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Selecciona una especialidad</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALTIES.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => handleSpecialtySelect(specialty)}
                      className="p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <span className="text-2xl block mb-2">
                        {SPECIALTY_ICONS[specialty] || "🏥"}
                      </span>
                      <span className="text-sm font-medium">{specialty}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">Selecciona un profesional</h2>
                </div>
                <div className="space-y-3">
                  {specialists.map((specialist) => (
                    <button
                      key={specialist.id}
                      onClick={() => handleSpecialistSelect(specialist)}
                      className="w-full p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{specialist.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                      </div>
                      {specialist.price && (
                        <Badge variant="secondary">${specialist.price}</Badge>
                      )}
                    </button>
                  ))}
                  {specialists.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">
                      No hay profesionales disponibles para esta especialidad
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">Selecciona una fecha</h2>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  {availableDates.map((date, index) => {
                    const isSelected = selectedDate && format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          "p-3 rounded-lg text-center hover:bg-primary/10 transition-colors",
                          isSelected && "bg-primary text-primary-foreground"
                        )}
                      >
                        <span className="text-sm font-medium">{format(date, "d")}</span>
                      </button>
                    );
                  })}
                </div>
                {availableDates.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    No hay fechas disponibles en los próximos 60 días
                  </p>
                )}
                {selectedDate && (
                  <Button onClick={nextStep} className="w-full mt-4">
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">Selecciona un horario</h2>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        "p-3 rounded-lg text-center text-sm font-medium transition-colors",
                        slot.available
                          ? "hover:bg-primary/10 border"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                {availableSlots.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">
                    Selecciona una fecha para ver los horarios disponibles
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">Tus datos de contacto</h2>
                </div>
                <form onSubmit={handlePatientDataSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre *</label>
                      <input
                        name="name"
                        required
                        className="w-full p-2 rounded-md border"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Apellido *</label>
                      <input
                        name="lastname"
                        required
                        className="w-full p-2 rounded-md border"
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email *</label>
                      <input
                        name="email"
                        type="email"
                        required
                        className="w-full p-2 rounded-md border"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Teléfono *</label>
                      <input
                        name="phone"
                        type="tel"
                        required
                        className="w-full p-2 rounded-md border"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Motivo de consulta</label>
                    <textarea
                      name="reason"
                      className="w-full p-2 rounded-md border min-h-[80px]"
                      placeholder="Describe brevemente tu motivo de consulta..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Revisar reserva <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {currentStep === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">Confirmar reserva</h2>
                </div>
                
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Especialidad</p>
                      <p className="font-medium">{bookingData.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Profesional</p>
                      <p className="font-medium">
                        {specialists.find(s => s.id === bookingData.specialistId)?.user?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha y hora</p>
                      <p className="font-medium">
                        {bookingData.date && format(bookingData.date, "EEEE d 'de' MMMM", { locale: es })} a las {bookingData.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contacto</p>
                      <p className="font-medium">{bookingData.patientEmail} - {bookingData.patientPhone}</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleConfirm} disabled={isLoading} className="w-full mt-6">
                  {isLoading ? "Confirmando..." : "Confirmar reserva"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}