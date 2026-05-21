"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { CalendarOff, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getBlockedDatesAction, createBlockedDateAction, unblockDateAction } from "@/features/blocked-dates/actions";
import { DAY_OF_WEEK_LABELS } from "@/features/shared/constants";

const blockedDateSchema = z.object({
  date: z.string().min(1, "Selecciona una fecha"),
  reason: z.string().optional(),
  isRecurring: z.boolean(),
});

type BlockedDateFormData = z.infer<typeof blockedDateSchema>;

interface BlockedDate {
  id: string;
  date: Date;
  reason: string | null;
  isRecurring: boolean;
  createdAt: Date;
}

const columnHelper = createColumnHelper<BlockedDate>();

export default function BlockedDatesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlockedDate | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<BlockedDateFormData>({
    resolver: zodResolver(blockedDateSchema),
    defaultValues: { date: "", reason: "", isRecurring: false },
  });

  const isRecurring = watch("isRecurring");

  const fetchBlockedDates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBlockedDatesAction();
      setBlockedDates(data);
    } catch {
      toast.error("Error al cargar días bloqueados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlockedDates(); }, [fetchBlockedDates]);

  const onCreateSubmit = async (data: BlockedDateFormData) => {
    setSaving(true);
    try {
      await createBlockedDateAction({
        date: new Date(data.date),
        reason: data.reason || undefined,
        isRecurring: data.isRecurring,
      });
      toast.success("Fecha bloqueada correctamente");
      setModalOpen(false);
      reset();
      fetchBlockedDates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al bloquear fecha");
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async () => {
    if (!deleteTarget) return;
    try {
      await unblockDateAction(deleteTarget.id);
      toast.success("Fecha desbloqueada");
      setDeleteTarget(null);
      fetchBlockedDates();
    } catch {
      toast.error("Error al desbloquear fecha");
    }
  };

  const columns = [
    columnHelper.accessor("date", {
      header: "Fecha",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{format(new Date(row.original.date), "dd/MM/yyyy")}</span>
      ),
    }),
    columnHelper.accessor("date", {
      id: "day",
      header: "Día",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground capitalize">
          {DAY_OF_WEEK_LABELS[new Date(row.original.date).getDay()]}
        </span>
      ),
    }),
    columnHelper.accessor("reason", {
      header: "Motivo",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.reason || "—"}</span>
      ),
    }),
    columnHelper.accessor("isRecurring", {
      header: "Recurrente",
      cell: ({ row }) =>
        row.original.isRecurring ? (
          <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            Cada año
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No</span>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acción",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row.original)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Días Bloqueados"
        description="Administra los días no laborables del sistema"
        icon={CalendarOff}
        actions={
          <Button onClick={() => { reset(); setModalOpen(true); }} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Bloquear fecha
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={blockedDates}
        isLoading={isLoading}
        searchPlaceholder="Buscar fechas..."
        emptyMessage="No hay días bloqueados"
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Bloquear fecha</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bd-date">Fecha</Label>
              <Input id="bd-date" type="date" {...register("date")} className="rounded-xl" />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bd-reason">Motivo <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Textarea
                id="bd-reason"
                {...register("reason")}
                className="rounded-xl resize-none"
                placeholder="Ej: Feriado nacional"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Recurrente cada año</Label>
                <p className="text-xs text-muted-foreground">Se bloquea automáticamente cada año en esta fecha</p>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(v) => setValue("isRecurring", v)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Bloqueando...</> : "Bloquear fecha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desbloquear fecha?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el bloqueo del día{" "}
              <strong>{deleteTarget && format(new Date(deleteTarget.date), "dd/MM/yyyy")}</strong>.
              {deleteTarget?.isRecurring && " Las recurrencias futuras no se verán afectadas."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock} className="rounded-xl bg-destructive hover:bg-destructive/90">
              Desbloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}