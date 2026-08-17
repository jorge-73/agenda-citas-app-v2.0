"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Download, FileSpreadsheet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
  onExport?: () => void;
  exportLabel?: string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron registros",
  pageSize = 10,
  onExport,
  exportLabel = "Exportar",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const rows = table.getRowModel().rows;
  const totalRows = data.length;

  const skeletonRows = useMemo(
    () => Array.from({ length: Math.min(pageSize, 5) }),
    [pageSize]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 h-10 rounded-lg bg-card/60 border-border/40"
          />
        </div>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="rounded-lg gap-2 h-10"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">{exportLabel}</span>
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-sm overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border/30 bg-muted/20">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 whitespace-nowrap"
                      style={{ width: header.getSize() === 150 ? undefined : header.getSize() }}
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
              {isLoading ? (
                skeletonRows.map((_, i) => (
                  <tr key={i} className="border-b border-border/20">
                    {columns.map((_, ci) => (
                      <td key={ci} className="px-4 py-3.5">
                        <Skeleton className={cn("h-5", ci === 0 ? "w-40" : "w-24")} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 flex items-center justify-center mb-2">
                        <FileSpreadsheet className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.15 }}
                      className="border-b border-border/20 hover:bg-muted/20 transition-colors duration-150"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3.5 text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            <span className="inline-block h-4 w-40 bg-muted/50 rounded animate-pulse" />
          ) : (
            <>
              Mostrando {rows.length} de {totalRows} registros
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isLoading}
            aria-label="Página anterior"
            className="rounded-lg h-9 w-9 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[4rem] text-center tabular-nums">
            {isLoading ? "—" : `${table.getState().pagination.pageIndex + 1} / ${table.getPageCount()}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isLoading}
            aria-label="Página siguiente"
            className="rounded-lg h-9 w-9 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}