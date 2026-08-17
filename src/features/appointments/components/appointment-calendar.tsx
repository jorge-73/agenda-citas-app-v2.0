"use client";

import { useState } from "react";
import { isSameDay, isToday, startOfDay, addHours, setHours, setMinutes } from "date-fns";
import { formatInTz, AR_TZ } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCalendar, useCalendarEvents } from "../hooks/use-calendar";
import { CalendarToolbar } from "./calendar-toolbar";
import { AppointmentModal } from "./appointment-modal";
import type { Appointment, CalendarEvent } from "../types";
import { APPOINTMENT_STATUS_COLORS, APPOINTMENT_STATUS_LABELS } from "../types";
import { Plus, Clock } from "lucide-react";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function AppointmentCalendar({
  appointments,
  onAppointmentClick,
}: AppointmentCalendarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  
  const {
    currentDate,
    view,
    title,
    days,
    navigateNext,
    navigatePrevious,
    goToToday,
    changeView,
    selectDate,
  } = useCalendar();

  const events = useCalendarEvents(appointments);

  const handleCellClick = (day: Date, hour: number) => {
    const startTime = setMinutes(setHours(startOfDay(day), hour), 0);
    const endTime = addHours(startTime, 1);
    setSelectedSlot({ start: startTime, end: endTime });
    setModalOpen(true);
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start), day));
  };

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const duration = endHour - startHour;
    
    return {
      top: `${(startHour - 8) * 60}px`,
      height: `${Math.max(duration * 60 - 4, 20)}px`,
    };
  };

  if (view === "month") {
    return (
      <div className="space-y-4">
        <CalendarToolbar
          title={title}
          view={view}
          onViewChange={changeView}
          onPrevious={navigatePrevious}
          onNext={navigateNext}
          onToday={goToToday}
        />
        
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {DAYS.map((day) => (
            <div key={day} className="bg-muted p-2 text-center text-sm font-medium">
              {day}
            </div>
          ))}
          
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            
            return (
              <div
                key={index}
                className={cn(
                  "bg-background min-h-[120px] p-2 cursor-pointer hover:bg-muted/50 transition-colors",
                  !isCurrentMonth && "opacity-50"
                )}
                onClick={() => selectDate(day)}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) && "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center"
                  )}
                >
                  {formatInTz(day, "d", AR_TZ)}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${APPOINTMENT_STATUS_COLORS[event.status]} 20%, transparent)`,
                        color: APPOINTMENT_STATUS_COLORS[event.status],
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick?.(appointments.find((a) => a.id === event.id)!);
                      }}
                    >
                      {formatInTz(new Date(event.start), "HH:mm", AR_TZ)} {event.patientName}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (view === "day") {
    const dayEvents = getEventsForDay(currentDate);
    
    return (
      <div className="space-y-4">
        <CalendarToolbar
          title={title}
          view={view}
          onViewChange={changeView}
          onPrevious={navigatePrevious}
          onNext={navigateNext}
          onToday={goToToday}
        />
        
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[80px_1fr]">
            <div className="border-r bg-muted/50 p-2">
              <div className="text-sm font-medium">
                {formatInTz(currentDate, "EEEE d 'de' MMMM", AR_TZ)}
              </div>
            </div>
            <div className="p-2 flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setSelectedSlot({
                    start: now,
                    end: addHours(now, 1),
                  });
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva cita
              </Button>
            </div>
          </div>
          
          <div className="relative" style={{ height: `${HOURS.length * 60}px` }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_1fr] absolute w-full"
                style={{ top: `${(hour - 8) * 60}px`, height: "60px" }}
              >
                <div className="border-r pr-2 text-right text-xs text-muted-foreground pt-1">
                  {formatInTz(setHours(new Date(), hour), "HH:mm", AR_TZ)}
                </div>
                <div
                  className="border-l cursor-pointer hover:bg-muted/30"
                  onClick={(e) => {
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const clickedHour = Math.floor(y / 60);
                    handleCellClick(currentDate, 8 + clickedHour);
                  }}
                />
              </div>
            ))}
            
            {dayEvents.map((event) => {
              const pos = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  className="absolute left-[80px] right-0 rounded-md p-2 cursor-pointer transition-transform hover:scale-[1.02] shadow-sm"
                  style={{
                    top: pos.top,
                    height: pos.height,
                    backgroundColor: `color-mix(in srgb, ${APPOINTMENT_STATUS_COLORS[event.status]} 15%, transparent)`,
                    borderLeft: `3px solid ${APPOINTMENT_STATUS_COLORS[event.status]}`,
                  }}
                  onClick={() => onAppointmentClick?.(appointments.find((a) => a.id === event.id)!)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-sm">{event.patientName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatInTz(new Date(event.start), "HH:mm", AR_TZ)} - {formatInTz(new Date(event.end), "HH:mm", AR_TZ)}
                      </div>
                      {event.reason && <div className="text-xs text-muted-foreground mt-1">{event.reason}</div>}
                    </div>
                    <Badge variant="outline" className="text-xs"
                      style={{ color: APPOINTMENT_STATUS_COLORS[event.status], borderColor: APPOINTMENT_STATUS_COLORS[event.status] }}>
                      {APPOINTMENT_STATUS_LABELS[event.status]}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Week view (default)
  return (
    <div className="space-y-4">
      <CalendarToolbar
        title={title}
        view={view}
        onViewChange={changeView}
        onPrevious={navigatePrevious}
        onNext={navigateNext}
        onToday={goToToday}
      />
      
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-muted/50 border-b">
          <div className="p-2" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center cursor-pointer hover:bg-muted",
                isToday(day) && "bg-primary/10"
              )}
              onClick={() => selectDate(day)}
            >
              <div className="text-xs text-muted-foreground">
                {formatInTz(day, "EEE", AR_TZ)}
              </div>
              <div
                className={cn(
                  "text-lg font-semibold",
                  isToday(day) && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                )}
              >
                {formatInTz(day, "d", AR_TZ)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="relative overflow-auto max-h-[600px]">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[60px]"
            >
              <div className="border-r border-t p-1 text-xs text-muted-foreground text-right pr-2">
                {formatInTz(setHours(new Date(), hour), "HH:mm", AR_TZ)}
              </div>
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day).filter((event) => {
                  const eventStart = new Date(event.start);
                  return eventStart.getHours() === hour;
                });
                
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className="border-r border-t cursor-pointer hover:bg-muted/30"
                    onClick={(e) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const clickedHour = Math.floor(y / 60);
                      handleCellClick(day, hour + clickedHour);
                    }}
                  >
                    {dayEvents.map((event) => {
                      const pos = getEventPosition(event);
                      const startMinutes = new Date(event.start).getMinutes();
                      const offsetTop = startMinutes;
                      
                      return (
                        <div
                          key={event.id}
                          className="absolute left-1 right-1 rounded p-1 text-xs cursor-pointer transition-transform hover:scale-[1.02] shadow-sm overflow-hidden"
                          style={{
                            top: `calc(${(hour - 8) * 60}px + ${offsetTop}px)`,
                            height: pos.height,
                            backgroundColor: `color-mix(in srgb, ${APPOINTMENT_STATUS_COLORS[event.status]} 15%, transparent)`,

                            borderLeft: `2px solid ${APPOINTMENT_STATUS_COLORS[event.status]}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(appointments.find((a) => a.id === event.id)!);
                          }}
                        >
                          <div className="font-medium truncate">{event.patientName}</div>
                          <div className="text-muted-foreground truncate">
                            {formatInTz(new Date(event.start), "HH:mm", AR_TZ)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <AppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={selectedSlot ? { startTime: selectedSlot.start, endTime: selectedSlot.end } : undefined}
        onSuccess={() => {
          setSelectedSlot(null);
        }}
      />
    </div>
  );
}