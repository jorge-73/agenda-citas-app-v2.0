"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Stethoscope, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Star,
  Mail
} from "lucide-react";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createBookingAction } from "@/features/booking/actions";

const STEPS = [
  { id: 1, title: "Especialidad", icon: Stethoscope },
  { id: 2, title: "Profesional", icon: User },
  { id: 3, title: "Fecha y Hora", icon: Calendar },
  { id: 4, title: "Confirmación", icon: CheckCircle2 },
];

const SPECIALTIES = [
  { id: "1", name: "Medicina General", icon: "🩺" },
  { id: "2", name: "Cardiología", icon: "❤️" },
  { id: "3", name: "Neurología", icon: "🧠" },
  { id: "4", name: "Oftalmología", icon: "👁️" },
  { id: "5", name: "Pediatría", icon: "👶" },
  { id: "6", name: "Dermatología", icon: "✨" },
];

const MOCK_SPECIALISTS = [
  { id: "1", name: "Dr. Juan Pérez", specialty: "Medicina General", rating: 4.9, experience: "15 años" },
  { id: "2", name: "Dra. María García", specialty: "Medicina General", rating: 4.8, experience: "10 años" },
  { id: "3", name: "Dr. Carlos López", specialty: "Cardiología", rating: 4.9, experience: "20 años" },
  { id: "4", name: "Dra. Ana Martínez", specialty: "Neurología", rating: 4.7, experience: "12 años" },
];

export function BookingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSpecialty, setSelectedSpecialty] = useState<typeof SPECIALTIES[0] | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<typeof MOCK_SPECIALISTS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [patientData, setPatientData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    reason: ""
  });

  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));
  
  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedSpecialty;
      case 2: return !!selectedSpecialist;
      case 3: return !!selectedDate && !!selectedTime;
      case 4: return patientData.name && patientData.email && patientData.phone;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleConfirm = async () => {
    if (!selectedSpecialty || !selectedSpecialist || !selectedDate || !selectedTime || !patientData.name || !patientData.lastname || !patientData.email || !patientData.phone) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setIsLoading(true);
    try {
      const booking = await createBookingAction({
        patientName: patientData.name,
        patientLastname: patientData.lastname,
        patientEmail: patientData.email,
        patientPhone: patientData.phone,
        specialistId: selectedSpecialist.id,
        specialty: selectedSpecialty.name,
        reason: patientData.reason,
        date: selectedDate,
        time: selectedTime,
      });

      router.push(`/booking/confirmation?id=${booking.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la reserva");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        {STEPS.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <motion.div 
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  currentStep >= s.id 
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25" 
                    : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {currentStep > s.id ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`text-xs mt-3 font-medium ${currentStep >= s.id ? "text-foreground" : "text-muted-foreground"}`}>
                {s.title}
              </span>
            </motion.div>
            {index < STEPS.length - 1 && (
              <motion.div 
                className={`w-20 h-0.5 mx-3 rounded-full ${currentStep > s.id ? "bg-primary" : "bg-muted"}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: currentStep > s.id ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Specialties */}
          {currentStep === 1 && (
            <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
              <div className="p-6 pb-8 text-center">
                <Badge variant="soft" className="w-fit mx-auto mb-3">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Paso 1
                </Badge>
                <h3 className="text-2xl font-semibold">Selecciona una especialidad</h3>
                <p className="text-base mt-2 text-muted-foreground">
                  Elige el tipo de atención médica que necesitas
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SPECIALTIES.map((specialty, index) => (
                    <motion.button
                      key={specialty.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedSpecialty(specialty);
                        nextStep();
                      }}
                      className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.01] ${
                        selectedSpecialty?.id === specialty.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/40 hover:border-primary/30 hover:shadow-md bg-card/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{specialty.icon}</div>
                        <div>
                          <p className="font-semibold">{specialty.name}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Specialists */}
          {currentStep === 2 && (
            <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
              <div className="p-6 pb-8 text-center">
                <Badge variant="soft" className="w-fit mx-auto mb-3">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Paso 2
                </Badge>
                <h3 className="text-2xl font-semibold">Selecciona un profesional</h3>
                <p className="text-base mt-2 text-muted-foreground">
                  Elige el especialista que te atenderá
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  {MOCK_SPECIALISTS.map((specialist, index) => (
                    <motion.button
                      key={specialist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedSpecialist(specialist);
                        nextStep();
                      }}
                      className={`w-full p-5 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.005] ${
                        selectedSpecialist?.id === specialist.id
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                          : "border-border/40 hover:border-primary/30 hover:shadow-md bg-card/50"
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                          {specialist.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{specialist.name}</p>
                          <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">{specialist.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{specialist.experience}</span>
                          </div>
                        </div>
                        {selectedSpecialist?.id === specialist.id && (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {currentStep === 3 && (
            <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
              <div className="p-6 pb-8 text-center">
                <Badge variant="soft" className="w-fit mx-auto mb-3">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Paso 3
                </Badge>
                <h3 className="text-2xl font-semibold">Selecciona fecha y hora</h3>
                <p className="text-base mt-2 text-muted-foreground">
                  Elige el horario disponible que más te convenga
                </p>
              </div>
              <div className="p-6 pt-0 space-y-8">
                <div>
                  <p className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Fecha disponible
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {availableDates.slice(0, 7).map((date, index) => (
                      <motion.button
                        key={date.toISOString()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => setSelectedDate(date)}
                        className={`px-5 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                          selectedDate?.toDateString() === date.toDateString()
                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "border-border/40 hover:border-primary/30 hover:shadow-md bg-card/50"
                        }`}
                      >
                        <span className="font-medium">{format(date, "EEE d", { locale: es })}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Horarios disponibles
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {availableTimes.map((time, index) => (
                        <motion.button
                          key={time}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => setSelectedTime(time)}
                          className={`px-5 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                            selectedTime === time
                              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                              : "border-border/40 hover:border-primary/30 hover:shadow-md bg-card/50"
                          }`}
                        >
                          <span className="font-medium">{time}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="rounded-3xl border border-border/50 bg-card/70 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
              <div className="p-6 pb-8 text-center">
                <Badge variant="soft" className="w-fit mx-auto mb-3">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Paso 4
                </Badge>
                <h3 className="text-2xl font-semibold">Confirmar cita</h3>
                <p className="text-base mt-2 text-muted-foreground">
                  Revisa los detalles y completa tus datos
                </p>
              </div>
              <div className="p-6 pt-0 space-y-8">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-muted/30 to-transparent border border-border/40">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-muted-foreground">Especialidad</span>
                      <span className="font-semibold">{selectedSpecialty?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-muted-foreground">Profesional</span>
                      <span className="font-semibold">{selectedSpecialist?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/40">
                      <span className="text-muted-foreground">Fecha</span>
                      <span className="font-semibold">
                        {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Hora</span>
                      <span className="font-semibold">{selectedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre *</Label>
                      <Input
                        id="name"
                        value={patientData.name}
                        onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                        className="h-12"
                        placeholder="Tu nombre"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Apellido *</Label>
                      <Input
                        id="lastname"
                        value={patientData.lastname}
                        onChange={(e) => setPatientData({ ...patientData, lastname: e.target.value })}
                        className="h-12"
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={patientData.email}
                        onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                        className="h-12"
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={patientData.phone}
                        onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                        className="h-12"
                        placeholder="+52 123 456 7890"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motivo de consulta <span className="text-muted-foreground">(opcional)</span></Label>
                    <Textarea
                      id="reason"
                      value={patientData.reason}
                      onChange={(e) => setPatientData({ ...patientData, reason: e.target.value })}
                      className="min-h-[100px]"
                      placeholder="Describe brevemente tus síntomas"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <motion.div 
        className="flex justify-between pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          variant="outline"
          size="lg"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Atrás
        </Button>
        
        {currentStep === 4 ? (
          <Button 
            size="lg"
            onClick={handleConfirm} 
            disabled={isLoading || !canProceed()}
            className="px-8 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Confirmar Cita
              </>
            )}
          </Button>
        ) : (
          <Button 
            size="lg"
            onClick={nextStep} 
            disabled={!canProceed()}
            className="px-8"
          >
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}