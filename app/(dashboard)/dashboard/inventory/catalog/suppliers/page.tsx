// app/(dashboard)/inventory/catalog/suppliers/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Supplier, PaginatedSuppliersResponse } from "@/types/inventory.types";
import { SupplierFormDialog } from "@/components/inventory/catalog/supplier-form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  PlusCircle,
  Trash2,
  Edit3,
  Search,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
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
import { useDebounce } from "@/hooks/use-debounce"; // Asumiendo que tienes este hook
import { Card, CardContent } from "@/components/ui/card";

export default function SuppliersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const queryClient = useQueryClient();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );

  const {
    data: paginatedSuppliers,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedSuppliersResponse, Error>({
    queryKey: [
      "inventorySuppliers",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: limitPerPage,
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm; // Asumimos que el backend soporta 'search'
      const response = await apiClient.get("/inventory/suppliers", { params });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (supplierId: string) =>
      apiClient.delete(`/inventory/suppliers/${supplierId}`),
    onSuccess: () => {
      toast.success("Proveedor eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["inventorySuppliers"] });
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "Error al eliminar proveedor. Es posible que esté en uso.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    },
  });

  const handleOpenCreateDialog = () => {
    setSelectedSupplier(null); // Asegurar que no hay datos de edición
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      deleteMutation.mutate(supplierToDelete.id);
    }
  };

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedSuppliers && currentPage < paginatedSuppliers.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  return (
    <>
      <PageHeader
        title="Proveedores"
        description="Gestiona los proveedores de tus productos."
        actionButton={
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Proveedor
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar proveedores por nombre, contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full md:w-1/3"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedSuppliers?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-sup-${i}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-40" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-red-500 py-10"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedSuppliers?.data?.length ? (
                paginatedSuppliers.data.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>{supplier.contactName || "-"}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleOpenEditDialog(supplier)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenDeleteDialog(supplier)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No se encontraron proveedores.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedSuppliers &&
        paginatedSuppliers.data &&
        paginatedSuppliers.totalPages > 0 && (
          <DataTablePagination /* ... (props como en CategoriesPage) ... */
            page={paginatedSuppliers.page}
            totalPages={paginatedSuppliers.totalPages}
            totalRecords={paginatedSuppliers.total}
            limit={paginatedSuppliers.limit}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            isFetching={isFetching}
          />
        )}

      {/* Diálogo para Crear/Editar Proveedor */}
      <SupplierFormDialog
        supplier={selectedSupplier}
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        // onSuccess={() => {setSelectedSupplier(null); /* Opcional */ }}
      />

      {/* Diálogo de Confirmación para Eliminar */}
      {supplierToDelete && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              {" "}
              1<AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará 2
                permanentemente al proveedor {supplierToDelete.name}. Si este
                proveedor está asociado a Órdenes de Compra, es posible que no
                se pueda eliminar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSupplierToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sí, Eliminar Proveedor
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
