"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useBooking } from "../hooks/use-booking";
import { getAvailableSpecialistsAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Calendar, 
  Clock, 
  User, 
  Stethoscope,
  Mail,
  Phone,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
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

const SPECIALTY_ICONS: Record<string, string> = {
  "Medicina General": "🩺",
  "Cardiología": "❤️",
  "Dermatología": "🧴",
  "Endocrinología": "⚖️",
  "Gastroenterología": "🫁",
  "Ginecología": "👶",
  "Neurología": "🧠",
  "Oftalmología": "👁️",
  "Ortopedia": "🦴",
  "Pediatría": "🧒",
  "Psiquiatría": "💭",
  "Urología": "🔬",
  "Oncología": "🎗️",
};

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
      {/* Premium Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
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
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              {step.id < 6 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded-full transition-all duration-300",
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1.5" />
        <p className="text-center mt-3 text-sm text-muted-foreground font-medium">
          Paso {currentStep} de {STEPS.length}: <span className="text-foreground">{STEPS[currentStep - 1].title}</span>
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Specialties */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Selecciona una especialidad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALTIES.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => handleSpecialtySelect(specialty)}
                      className="p-4 rounded-xl border border-border/50 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left group"
                    >
                      <span className="text-3xl block mb-3">{SPECIALTY_ICONS[specialty] || "🏥"}</span>
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{specialty}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Professionals */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={prevStep} className="hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-xl">Selecciona un profesional</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {specialists.map((specialist) => (
                    <button
                      key={specialist.id}
                      onClick={() => handleSpecialistSelect(specialist)}
                      className="w-full p-4 rounded-xl border border-border/50 hover:border-primary hover:bg-primary/5 transition-all duration-200 text-left flex items-center gap-4 group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <User className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-foreground">{specialist.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                      </div>
                      {specialist.price && (
                        <Badge variant="secondary" className="font-medium">
                          ${specialist.price}
                        </Badge>
                      )}
                    </button>
                  ))}
                  {specialists.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay profesionales disponibles para esta especialidad</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Date */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={prevStep} className="hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-xl">Selecciona una fecha</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
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
                          "p-3 rounded-lg text-center text-sm font-medium transition-all duration-200 hover:scale-105",
                          isSelected 
                            ? "bg-primary text-primary-foreground shadow-md" 
                            : "bg-muted/50 hover:bg-primary/10 hover:text-foreground"
                        )}
                      >
                        {format(date, "d")}
                      </button>
                    );
                  })}
                </div>
                {availableDates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No hay fechas disponibles en los próximos 60 días</p>
                  </div>
                )}
                {selectedDate && (
                  <Button onClick={nextStep} className="w-full mt-4" size="lg">
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Time */}
        {currentStep === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={prevStep} className="hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-xl">Selecciona un horario</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        "p-3 rounded-lg text-center text-sm font-medium transition-all duration-200",
                        slot.available
                          ? "bg-muted/50 hover:bg-primary/10 hover:text-foreground border border-transparent hover:border-primary cursor-pointer hover:scale-105"
                          : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed opacity-50 line-through"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                {availableSlots.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Selecciona una fecha para ver los horarios disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Patient Data */}
        {currentStep === 5 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={prevStep} className="hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-xl">Tus datos de contacto</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePatientDataSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        placeholder="Tu nombre"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Apellido *</Label>
                      <Input
                        id="lastname"
                        name="lastname"
                        required
                        placeholder="Tu apellido"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="tu@email.com"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+52 123 456 7890"
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo de consulta</Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      className="min-h-[100px] resize-none"
                      placeholder="Describe brevemente tu motivo de consulta..."
                    />
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    Revisar reserva <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 6: Confirmation */}
        {currentStep === 6 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={prevStep} className="hover:bg-muted">
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle className="text-xl">Confirmar reserva</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 bg-muted/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Especialidad</p>
                      <p className="font-semibold text-foreground">{bookingData.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profesional</p>
                      <p className="font-semibold text-foreground">
                        {specialists.find(s => s.id === bookingData.specialistId)?.user?.name || "Profesional"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha y hora</p>
                      <p className="font-semibold text-foreground">
                        {bookingData.date && format(bookingData.date, "EEEE d 'de' MMMM", { locale: es })} a las {bookingData.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contacto</p>
                      <p className="font-semibold text-foreground">{bookingData.patientEmail}</p>
                      <p className="text-sm text-muted-foreground">{bookingData.patientPhone}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleConfirm} 
                  disabled={isLoading} 
                  className="w-full mt-6" 
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirmando...
                    </>
                  ) : (
                    "Confirmar reserva"
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}