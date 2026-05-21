"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { exportToCSV, formatDateForExport } from "@/lib/export";
import { Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Search, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

const columnHelper = createColumnHelper<any>();

const columns = [
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
    cell: ({ row }) => row.original.insurance ? (
      <Badge variant="outline">{row.original.insurance}</Badge>
    ) : "-",
  }),
  columnHelper.accessor("createdAt", {
    header: "Registrado",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: es }),
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
            <Link href={`/dashboard/patients/${row.original.id}`}>
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

interface PatientsTableProps {
  patients: any[];
  isLoading?: boolean;
  onCreateNew?: () => void;
}

export function PatientsTable({ patients, isLoading, onCreateNew }: PatientsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: patients,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Cargando pacientes...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const data = patients.map((p: any) => ({
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
          className="rounded-xl"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paciente
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm overflow-hidden hover:shadow-lg transition-all duration-300">
        <table className="table-premium">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border/30 bg-muted/20">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-muted-foreground">
                  No se encontraron pacientes
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors duration-150">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getRowModel().rows.length} de {patients.length} pacientes
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-xl"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}