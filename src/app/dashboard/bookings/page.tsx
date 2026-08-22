"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getAllBookingsAction, cancelBookingAction, confirmBookingAction } from "@/features/booking/actions";
import type { ColumnDef } from "@tanstack/react-table";

interface BookingWithSpecialist {
  id: string;
  patientName: string;
  patientLastname: string;
  patientEmail: string;
  patientPhone: string;
  specialistId: string;
  specialty: string;
  reason: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  date: Date;
  time: string;
  createdAt: Date;
  specialist: { user: { name: string } } | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingWithSpecialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllBookingsAction();
      setBookings(data as unknown as BookingWithSpecialist[]);
    } catch {
      toast.error("Error al cargar reservas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [fetchBookings]);

  const handleCancel = async (id: string) => {
    try {
      await cancelBookingAction(id);
      toast.success("Reserva cancelada correctamente");
      fetchBookings();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cancelar reserva");
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const result = await confirmBookingAction(id);
      if (result.appointmentCreated) {
        toast.success("Reserva confirmada y cita creada en el calendario");
      } else {
        toast.success("Reserva confirmada. El paciente no tiene cuenta registrada, no se creó cita automáticamente");
      }
      fetchBookings();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al confirmar reserva");
    }
  };

  const columns: ColumnDef<BookingWithSpecialist>[] = [
    {
      header: "Paciente",
      accessorKey: "patientName",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.patientName} {row.original.patientLastname}</p>
          <p className="text-xs text-muted-foreground">{row.original.patientEmail}</p>
        </div>
      ),
    },
    {
      header: "Teléfono",
      accessorKey: "patientPhone",
    },
    {
      header: "Especialista",
      accessorFn: (row) => row.specialist?.user?.name || "—",
    },
    {
      header: "Especialidad",
      accessorKey: "specialty",
    },
    {
      header: "Fecha",
      accessorFn: (row) => format(new Date(row.date), "dd/MM/yyyy", { locale: es }),
    },
    {
      header: "Hora",
      accessorKey: "time",
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: "Acciones",
      id: "actions",
      cell: ({ row }) => {
        const { id, status } = row.original;
        return (
          <div className="flex items-center gap-2">
            {status === "PENDING" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConfirm(id)}
                  className="text-success hover:text-success hover:bg-success/10"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </>
            )}
            {status === "CONFIRMED" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancel(id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Reservas"
        description="Gestiona las reservas online del sistema"
        icon={Calendar}
      />

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        searchPlaceholder="Buscar reserva..."
        emptyMessage="No hay reservas registradas"
      />
    </motion.div>
  );
}
