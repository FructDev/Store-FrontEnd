// components/common/data-table-pagination.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  isFetching?: boolean;
}

export function DataTablePagination({
  page,
  totalPages,
  totalRecords,
  onNextPage,
  onPreviousPage,
  isFetching,
}: DataTablePaginationProps) {
  if (totalPages <= 0) return null;

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  return (
    <div className="flex items-center justify-between space-x-2 py-4 px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {/* Podrías calcular el rango de items mostrados si quieres */}
        Total: {totalRecords}.
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!canPreviousPage || isFetching}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage || isFetching}
        >
          Siguiente
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
