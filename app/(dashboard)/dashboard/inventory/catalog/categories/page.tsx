// app/(dashboard)/inventory/catalog/categories/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination"; // Asumiendo que tienes este
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Category, PaginatedCategoriesResponse } from "@/types/inventory.types";
import { CategoryFormDialog } from "@/components/inventory/catalog/category-form-dialog";
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

export default function CategoriesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  const {
    data: paginatedCategories,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedCategoriesResponse, Error>({
    queryKey: [
      "inventoryCategories",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: limitPerPage,
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      // Aquí podrías añadir más filtros si tu backend los soporta para categorías
      const response = await apiClient.get("/inventory/categories", { params });
      console.log(response);
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (categoryId: string) =>
      apiClient.delete(`/inventory/categories/${categoryId}`),
    onSuccess: () => {
      toast.success("Categoría eliminada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["inventoryCategories"] });
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Error al eliminar la categoría.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    },
  });

  const handleOpenEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id);
    }
  };

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedCategories && currentPage < paginatedCategories.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    // Resetear página a 1 cuando cambian los filtros
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  return (
    <>
      <PageHeader
        title="Categorías de Productos"
        description="Organiza tus productos en diferentes categorías."
        actionButton={
          <CategoryFormDialog
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            triggerButton={
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Categoría
              </Button>
            }
          />
        }
      />

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar categorías por nombre..."
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
                <TableHead className="w-[40%]">Nombre</TableHead>
                <TableHead className="w-[40%]">Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedCategories?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-cat-${i}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-3/4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-red-500 py-10"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedCategories?.data?.length ? (
                paginatedCategories.data.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                      {category.description || "-"}
                    </TableCell>
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
                            onClick={() => handleOpenEditDialog(category)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenDeleteDialog(category)}
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
                  <TableCell colSpan={3} className="text-center py-10">
                    No se encontraron categorías.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedCategories &&
        paginatedCategories.data &&
        paginatedCategories.totalPages > 0 && (
          <DataTablePagination
            page={paginatedCategories.page}
            totalPages={paginatedCategories.totalPages}
            totalRecords={paginatedCategories.total}
            limit={paginatedCategories.limit}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            isFetching={isFetching}
          />
        )}

      {/* Diálogo de Edición */}
      <CategoryFormDialog
        category={selectedCategory}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />

      {/* Diálogo de Confirmación para Eliminar */}
      {categoryToDelete && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                la categoría {categoryToDelete.name}. Los productos asociados a
                esta categoría no serán eliminados pero quedarán sin categoría.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
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
                Sí, Eliminar Categoría
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
