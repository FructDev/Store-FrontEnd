// app/(dashboard)/inventory/catalog/locations/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  InventoryLocation,
  PaginatedInventoryLocationsResponse,
} from "@/types/inventory.types";
import { LocationFormDialog } from "@/components/inventory/catalog/location-form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  CheckSquare,
  XSquare,
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
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent } from "@/components/ui/card";

export default function LocationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const queryClient = useQueryClient();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<InventoryLocation | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] =
    useState<InventoryLocation | null>(null);

  const {
    data: paginatedLocations,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedInventoryLocationsResponse, Error>({
    queryKey: [
      "inventoryLocations",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: limitPerPage,
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm; // Asume que backend soporta 'search' por nombre
      const response = await apiClient.get("/inventory/locations", { params });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (locationId: string) =>
      apiClient.delete(`/inventory/locations/${locationId}`),
    onSuccess: () => {
      toast.success("Ubicación eliminada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["inventoryLocations"] });
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "Error al eliminar ubicación. Puede estar en uso o contener stock.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    },
  });

  const handleOpenCreateDialog = () => {
    setSelectedLocation(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (location: InventoryLocation) => {
    setSelectedLocation(location);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (location: InventoryLocation) => {
    setLocationToDelete(location);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete.id);
    }
  };

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedLocations && currentPage < paginatedLocations.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  return (
    <>
      <PageHeader
        title="Ubicaciones de Inventario"
        description="Gestiona los lugares donde se almacena tu stock."
        actionButton={
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ubicación
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ubicaciones por nombre..."
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
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Por Defecto</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedLocations?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-loc-${i}`}>
                    <TableCell>
                      <Skeleton className="h-5 w-3/4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-6 mx-auto" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-6 w-16 mx-auto" />
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
              ) : paginatedLocations?.data?.length ? (
                paginatedLocations.data.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      {location.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                      {location.description || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {location.isDefault ? (
                        <CheckSquare className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <XSquare className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={location.isActive ? "default" : "destructive"}
                        className={
                          location.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300"
                            : ""
                        }
                      >
                        {location.isActive ? "Activa" : "Inactiva"}
                      </Badge>
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
                            onClick={() => handleOpenEditDialog(location)}
                          >
                            <Edit3 className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenDeleteDialog(location)}
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
                    No se encontraron ubicaciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedLocations &&
        paginatedLocations.data &&
        paginatedLocations.totalPages > 0 && (
          <DataTablePagination
            page={paginatedLocations.page}
            totalPages={paginatedLocations.totalPages}
            totalRecords={paginatedLocations.total}
            limit={paginatedLocations.limit}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            isFetching={isFetching}
          />
        )}

      <LocationFormDialog
        location={selectedLocation}
        isOpen={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
      />

      {locationToDelete && (
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás 1 absolutamente seguro?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede 2 deshacer. Se eliminará la ubicación
                {locationToDelete.name}. Si esta ubicación tiene stock asociado
                o está en uso, es posible que no se pueda eliminar.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setLocationToDelete(null)}>
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
                Sí, Eliminar Ubicación
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
