"use client";

import Link from "next/link";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { MoreHorizontal, Eye, Pencil, Trash2, Clock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { exportToCSV } from "@/lib/export";
import type { Specialist } from "../types";

const columnHelper = createColumnHelper<Specialist>();

interface SpecialistsTableProps {
  specialists: Specialist[];
  isLoading?: boolean;
  onCreateNew?: () => void;
}

export function SpecialistsTable({ specialists, isLoading, onCreateNew }: SpecialistsTableProps) {
  const columns: ColumnDef<Specialist, any>[] = [
    columnHelper.accessor("user", {
      header: "Especialista",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.user?.image || ""} />
            <AvatarFallback>{getInitials(row.original.user?.name || "E")}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.original.user?.name || "Sin nombre"}</div>
            <div className="text-xs text-muted-foreground">{row.original.user?.email}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("specialty", {
      header: "Especialidad",
      cell: ({ row }) => <Badge variant="secondary">{row.original.specialty}</Badge>,
    }),
    columnHelper.accessor("license", {
      header: "Licencia",
      cell: ({ row }) => row.original.license || "-",
    }),
    columnHelper.accessor("price", {
      header: "Precio",
      cell: ({ row }) => (row.original.price ? `$${row.original.price}` : "-"),
    }),
    columnHelper.accessor("schedules", {
      header: "Horario",
      cell: ({ row }) => {
        const schedules = row.original.schedules || [];
        if (schedules.length === 0) return <Badge variant="outline">Sin configurar</Badge>;
        return (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {schedules.length} días
          </div>
        );
      },
    }),
    columnHelper.accessor("isAvailable", {
      header: "Estado",
      cell: ({ row }) => (
        <Badge variant={row.original.isAvailable ? "default" : "secondary"}>
          {row.original.isAvailable ? "Disponible" : "No disponible"}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/specialists/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-500">
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
      data={specialists}
      isLoading={isLoading}
      searchPlaceholder="Buscar especialistas..."
      emptyMessage="No se encontraron especialistas"
      onExport={() => {
        const data = specialists.map((s: Specialist) => ({
          Nombre: s.user?.name || "—",
          Email: s.user?.email || "—",
          Especialidad: s.specialty,
          Licencia: s.license || "",
          Teléfono: s.phone || "",
          Precio: s.price ? `$${s.price}` : "",
          Disponible: s.isAvailable ? "Sí" : "No",
          "Duración consulta": `${s.consultationDuration} min`,
        }));
        exportToCSV(data, `especialistas-${new Date().toISOString().split("T")[0]}`);
      }}
    />
  );
}