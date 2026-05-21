"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CalendarOff, Plus, Trash2, Loader2, Ban } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { getBlockedDatesAction, createBlockedDateAction, unblockDateAction } from "@/features/blocked-dates/actions";

interface BlockedDate {
  id: string;
  date: Date;
  reason: string | null;
  isRecurring: boolean;
  createdAt: Date;
}

export default function BlockedDatesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newRecurring, setNewRecurring] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBlockedDates = async () => {
    setIsLoading(true);
    const data = await getBlockedDatesAction();
    setBlockedDates(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const handleCreate = async () => {
    if (!newDate) {
      toast.error("Selecciona una fecha");
      return;
    }
    setSaving(true);
    try {
      await createBlockedDateAction({
        date: new Date(newDate),
        reason: newReason || undefined,
        isRecurring: newRecurring,
      });
      toast.success("Fecha bloqueada correctamente");
      setModalOpen(false);
      setNewDate("");
      setNewReason("");
      setNewRecurring(false);
      fetchBlockedDates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al bloquear fecha");
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockDateAction(id);
      toast.success("Fecha desbloqueada");
      fetchBlockedDates();
    } catch {
      toast.error("Error al desbloquear fecha");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Días Bloqueados"
        description="Administra los días no laborables del sistema"
        icon={CalendarOff}
        actions={
          <Button onClick={() => setModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Bloquear fecha
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/50 bg-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : blockedDates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
              <Ban className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No hay días bloqueados</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Los días bloqueados son fechas no laborables como feriados o mantenimiento del sistema.
            </p>
            <Button onClick={() => setModalOpen(true)} variant="outline" className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Bloquear primera fecha
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Día</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Motivo</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Recurrente</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acción</th>
                </tr>
              </thead>
              <tbody>
                {blockedDates.map((bd) => (
                  <tr key={bd.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">
                      {format(new Date(bd.date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(bd.date), "EEEE", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {bd.reason || "—"}
                    </td>
                    <td className="px-6 py-4">
                      {bd.isRecurring ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
                          Cada año
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblock(bd.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Bloquear fecha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo (opcional)</Label>
              <Textarea
                id="reason"
                placeholder="Ej: Feriado nacional"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="rounded-xl resize-none"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Recurrente cada año</Label>
                <p className="text-xs text-muted-foreground">Se bloquea automáticamente cada año en esta fecha</p>
              </div>
              <Switch checked={newRecurring} onCheckedChange={setNewRecurring} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving} className="rounded-xl">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Bloqueando...
                </>
              ) : (
                "Bloquear fecha"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}