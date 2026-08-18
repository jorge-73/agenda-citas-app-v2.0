"use client";

import Link from "next/link";
import { formatInTz, AR_TZ } from "@/lib/date-utils";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { exportToCSV, formatDateForExport } from "@/lib/export";
import type { Patient } from "../types";

const columnHelper = createColumnHelper<Patient>();

interface PatientsTableProps {
  patients: Patient[];
  isLoading?: boolean;
}

export function PatientsTable({ patients, isLoading }: PatientsTableProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Patient, any>[] = [
    columnHelper.accessor("user", {
      header: "Paciente",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.user?.image || ""} />
            <AvatarFallback>{getInitials(row.original.user?.name || "P")}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.user?.name || "Sin nombre"}</div>
            <div className="text-xs text-muted-foreground">{row.original.user?.email}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("document", {
      header: "Documento",
      cell: ({ row }) => row.original.document || "-",
    }),
    columnHelper.accessor("phone", {
      header: "Teléfono",
      cell: ({ row }) => row.original.phone || "-",
    }),
    columnHelper.accessor("insurance", {
      header: "Seguro",
      cell: ({ row }) =>
        row.original.insurance ? (
          <Badge variant="outline">{row.original.insurance}</Badge>
        ) : "-",
    }),
    columnHelper.accessor("createdAt", {
      header: "Registrado",
      cell: ({ row }) => formatInTz(new Date(row.original.createdAt), "dd MMM yyyy", AR_TZ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Acciones del paciente">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/patients/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={patients}
      isLoading={isLoading}
      searchPlaceholder="Buscar pacientes..."
      emptyMessage="No se encontraron pacientes"
      onExport={() => {
        const data = patients.map((p: Patient) => ({
          Nombre: p.user?.name || "—",
          Email: p.user?.email || "—",
          Teléfono: p.phone || "",
          Documento: p.document || "",
          "Tipo sangre": p.bloodType || "",
          Seguro: p.insurance || "",
          "Fecha registro": formatDateForExport(p.createdAt),
        }));
        exportToCSV(data, `pacientes-${new Date().toISOString().split("T")[0]}`);
      }}
    />
  );
}