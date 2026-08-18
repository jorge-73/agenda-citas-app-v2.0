"use client";

import { useState } from "react";
import { Loader2, Calendar, Stethoscope, FileText, ScrollText, CalendarX2 } from "lucide-react";
import { formatInTz, AR_TZ } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { cancelOwnAppointmentAction } from "../actions";
import type { Appointment } from "../types";
import { toast } from "sonner";

interface AppointmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onCancelled: () => void;
}

export function AppointmentDetailModal({
  open,
  onOpenChange,
  appointment,
  onCancelled,
}: AppointmentDetailModalProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canCancel =
    !!appointment &&
    (appointment.status === "PENDING" || appointment.status === "CONFIRMED") &&
    new Date(appointment.startTime) > new Date();

  const handleCancel = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      await cancelOwnAppointmentAction(appointment.id);
      toast.success("Turno cancelado correctamente");
      setCancelOpen(false);
      onOpenChange(false);
      onCancelled();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cancelar el turno");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
          <DialogHeader className="bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8">
            <DialogTitle className="text-xl font-bold">Detalle del turno</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Información de tu turno médico
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-5">
            {appointment && (
              <>
                <div className="flex items-center justify-between">
                  <StatusBadge status={appointment.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatInTz(appointment.startTime, "dd/MM/yyyy", AR_TZ)}
                  </span>
                </div>

                <div className="rounded-2xl bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {appointment.specialist?.user?.name || "Especialista"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.specialist?.specialty || "Especialidad"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {formatInTz(appointment.startTime, "EEEE dd 'de' MMMM", AR_TZ)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatInTz(appointment.startTime, "HH:mm", AR_TZ)} - {formatInTz(appointment.endTime, "HH:mm", AR_TZ)} hs
                      </p>
                    </div>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Motivo</p>
                      <p className="text-sm mt-0.5">{appointment.reason}</p>
                    </div>
                  </div>
                )}

                {appointment.notes && (
                  <div className="flex items-start gap-3">
                    <ScrollText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notas</p>
                      <p className="text-sm mt-0.5">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="gap-2 p-6 pt-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cerrar
            </Button>
            {canCancel && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setCancelOpen(true)}
                className="flex-1"
              >
                <CalendarX2 className="h-4 w-4 mr-2" />
                Cancelar turno
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este turno?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu turno del{" "}
              <strong>
                {appointment ? formatInTz(appointment.startTime, "dd/MM/yyyy 'a las' HH:mm", AR_TZ) : ""}
              </strong>{" "}
              será cancelado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="rounded-xl bg-destructive hover:bg-destructive/90"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar turno"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}