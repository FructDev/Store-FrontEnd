// app/(dashboard)/customers/page.tsx
"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import apiClient from "@/lib/api";
import { PageHeader } from "@/components/common/page-header";
import { columns, CustomerActions } from "./columns"; // Importar columnas
import { Customer } from "@/types/customer.types";
import { PaginatedData } from "@/types/sales.types"; // Importar desde su ubicación real
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/common/data-table-pagination"; // Tu componente de paginación
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { getErrorMessage } from "@/lib/utils/get-error-message";

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const queryClient = useQueryClient();

  // Estado de paginación compatible con TanStack Table
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, // Inicia en 0
    pageSize: 10,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  // TODO: Añadir estado para diálogos de CUD
  // const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const {
    data: paginatedCustomers,
    isLoading,
    isFetching,
  } = useQuery<PaginatedData<Customer>, Error>({
    queryKey: [
      "customersList",
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchTerm,
      sorting,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(pagination.pageIndex + 1), // La API espera la página 1, no 0
        limit: String(pagination.pageSize),
        search: debouncedSearchTerm,
      });
      // Añadir ordenamiento a los parámetros si existe
      if (sorting.length > 0) {
        params.append("sortBy", sorting[0].id);
        params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
      }
      const response = await apiClient.get(`/customers?${params.toString()}`);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // --- MUTACIÓN PARA DESACTIVAR/ACTIVAR CLIENTE ---
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (customerId: string) =>
      apiClient.delete(`/customers/${customerId}`),
    onSuccess: () => {
      toast.success("Estado del cliente actualizado.");
      queryClient.invalidateQueries({ queryKey: ["customersList"] });
      setCustomerToDelete(null); // Cerrar diálogo de confirmación
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar el estado del cliente."
      );
      toast.error(errorMessage);
      setCustomerToDelete(null);
    },
  });

  const handleOpenCreateDialog = () => {
    setEditingCustomer(null); // Asegurarse de que no haya datos de edición
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
  };

  const customerActions: CustomerActions = {
    onEdit: handleOpenEditDialog,
    onDelete: handleOpenDeleteDialog,
  };

  const table = useReactTable({
    data: paginatedCustomers?.data ?? [],
    columns,
    pageCount: paginatedCustomers?.totalPages ?? -1,
    state: { pagination, sorting },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    meta: { actions: customerActions },
  });

  return (
    <>
      <PageHeader
        title="Gestión de Clientes"
        description="Visualiza, crea, y administra la información de tus clientes."
        actionButton={
          <Button size="sm" onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Cliente
          </Button>
        }
      />
      <div className="p-1 space-y-4">
        <div className="flex items-center py-4">
          <Input
            placeholder="Buscar por nombre, email, teléfono, RNC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm h-9"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(pagination.pageSize)].map((_, i) => (
                  <TableRow key={`skel-row-${i}`}>
                    {columns.map(
                      (
                        col,
                        j // <-- 'j' es el índice de la columna
                      ) => (
                        <TableCell
                          key={`skel-cell-${i}-${j}`} // <-- USA EL ÍNDICE 'j' PARA LA KEY
                        >
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Usando tu DataTablePagination existente y adaptando las props */}
        <DataTablePagination
          page={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          totalRecords={paginatedCustomers?.total ?? 0}
          limit={table.getState().pagination.pageSize}
          onNextPage={() => table.nextPage()}
          onPreviousPage={() => table.previousPage()}
          isFetching={isFetching}
        />
      </div>

      {/* DIÁLOGOS DE FORMULARIO Y CONFIRMACIÓN */}
      <CustomerFormDialog
        isOpen={isFormDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Si el diálogo se cierra (por botón, esc, clic afuera)
            setEditingCustomer(null); // Limpiar datos de edición
          }
          setIsFormDialogOpen(open);
        }}
        onSuccess={() => {
          // <-- AJUSTAR ESTA FUNCIÓN
          setIsFormDialogOpen(false);
          setEditingCustomer(null);
          // Usar invalidateQueries es más robusto que refetch para este caso
          // Invalida todas las queries que comiencen con "customersList"
          queryClient.invalidateQueries({ queryKey: ["customersList"] });
        }}
        customerData={editingCustomer}
      />

      <AlertDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción{" "}
              {customerToDelete?.isActive ? "desactivará" : "activará"} al
              cliente
              <strong>
                {" "}
                {`${customerToDelete?.firstName || ""} ${
                  customerToDelete?.lastName || ""
                }`.trim()}
              </strong>
              .
              {customerToDelete?.isActive &&
                " No podrás seleccionarlo para nuevas ventas o reparaciones."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(customerToDelete!.id)}
              disabled={deleteMutation.isPending}
              className={
                customerToDelete?.isActive
                  ? "bg-destructive hover:bg-destructive/90"
                  : ""
              }
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sí, {customerToDelete?.isActive ? "Desactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
