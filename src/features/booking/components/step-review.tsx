"use client";

import { formatInTz, AR_TZ } from "@/lib/date-utils";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


interface StepReviewProps {
  specialty: string;
  specialistName: string;
  specialistSpecialty: string;
  date: Date | null;
  time: string;
  patientData: {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    reason: string;
  };
  onPatientDataChange: (data: Partial<StepReviewProps["patientData"]>) => void;
  errors: Partial<Record<keyof StepReviewProps["patientData"], string>>;
}

export function StepReview({
  specialty,
  specialistName,
  specialistSpecialty,
  date,
  time,
  patientData,
  onPatientDataChange,
  errors,
}: StepReviewProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 via-muted/20 to-transparent p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Resumen de tu cita</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Stethoscope className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Especialidad</p>
              <p className="font-semibold text-sm text-foreground">{specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profesional</p>
              <p className="font-semibold text-sm text-foreground">{specialistName}</p>
              <p className="text-xs text-muted-foreground">{specialistSpecialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-semibold text-sm text-foreground">
                {date && formatInTz(date, "EEEE d 'de' MMMM 'de' yyyy", AR_TZ)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hora</p>
              <p className="font-semibold text-sm text-foreground">{time} hrs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tus datos</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rw-name" className="text-xs font-medium">Nombre *</Label>
            <Input
              id="rw-name"
              value={patientData.name}
              onChange={(e) => onPatientDataChange({ name: e.target.value })}
              className={cn("h-11 rounded-xl text-sm", errors.name && "border-destructive")}
              placeholder="Tu nombre"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rw-lastname" className="text-xs font-medium">Apellido *</Label>
            <Input
              id="rw-lastname"
              value={patientData.lastname}
              onChange={(e) => onPatientDataChange({ lastname: e.target.value })}
              className={cn("h-11 rounded-xl text-sm", errors.lastname && "border-destructive")}
              placeholder="Tu apellido"
            />
            {errors.lastname && <p className="text-xs text-destructive">{errors.lastname}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="rw-email" className="text-xs font-medium">Email *</Label>
            <Input
              id="rw-email"
              type="email"
              value={patientData.email}
              onChange={(e) => onPatientDataChange({ email: e.target.value })}
              className={cn("h-11 rounded-xl text-sm", errors.email && "border-destructive")}
              placeholder="tu@email.com"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rw-phone" className="text-xs font-medium">Teléfono *</Label>
            <Input
              id="rw-phone"
              type="tel"
              value={patientData.phone}
              onChange={(e) => onPatientDataChange({ phone: e.target.value })}
              className={cn("h-11 rounded-xl text-sm", errors.phone && "border-destructive")}
              placeholder="+56 9 1234 5678"
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rw-reason" className="text-xs font-medium">Motivo de consulta <span className="text-muted-foreground font-normal">(opcional)</span></Label>
          <Textarea
            id="rw-reason"
            value={patientData.reason}
            onChange={(e) => onPatientDataChange({ reason: e.target.value })}
            className="min-h-[80px] rounded-xl text-sm"
            placeholder="Describe brevemente tus síntomas o motivo de la consulta"
          />
        </div>
      </div>
    </div>
  );
}