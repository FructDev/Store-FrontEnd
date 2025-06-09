// app/(dashboard)/inventory/stock-counts/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  StockCount,
  PaginatedStockCountsResponse,
  InventoryLocationBasic,
} from "@/types/inventory.types";
import { UserMinimal } from "@/types/user.types"; // Asumiendo que tienes este tipo
import { StockCountStatus as PrismaStockCountStatus } from "@/types/prisma-enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker"; // Asumiendo que lo tienes
import { DateRange } from "react-day-picker";
import {
  PlusCircle,
  Eye,
  Search,
  PlayCircle,
  Filter,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateStockCountDialog } from "@/components/inventory/stock-counts/create-stock-count-dialog";
// TODO: Si necesitas AlertDialog para cancelar un conteo pendiente
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusLabels: Record<PrismaStockCountStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};
const ALL_STATUSES = Object.values(PrismaStockCountStatus);

const formatDateForDisplay = (dateInput?: string | Date | null) => {
  if (!dateInput) return "-";
  try {
    return format(new Date(dateInput), "dd/MM/yyyy HH:mm", { locale: es });
  } catch (e) {
    return String(dateInput);
  }
};

export default function StockCountsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);

  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLocationId, setFilterLocationId] = useState<string>("all");
  const [filterUserId, setFilterUserId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Estado para el diálogo de creación
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch para Ubicaciones (para el filtro)
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["allActiveLocationsForStockCountFilter"],
    queryFn: async () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  // Fetch para Usuarios de la tienda (para el filtro)
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserMinimal[]>({
    queryKey: ["allStoreUsersForStockCountFilter"],
    queryFn: async () =>
      apiClient
        .get("/users?limit=500&isActive=true")
        .then((res) => res.data.data || res.data), // Asume que /users soporta 'fields'
  });

  const {
    data: paginatedData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedStockCountsResponse, Error>({
    queryKey: [
      "stockCounts",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
      filterStatus,
      filterLocationId,
      filterUserId,
      dateRange?.from,
      dateRange?.to,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: limitPerPage,
        sortBy: "initiatedAt",
        sortOrder: "desc",
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterLocationId !== "all") params.locationId = filterLocationId;
      if (filterUserId !== "all") params.userId = filterUserId;
      if (dateRange?.from)
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
      if (dateRange?.to) params.endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await apiClient.get("/inventory/stock-counts", {
        params,
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedData && currentPage < paginatedData.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    filterStatus,
    filterLocationId,
    filterUserId,
    dateRange,
  ]);

  const navigateToDetail = (id: string) => {
    router.push(`/dashboard/inventory/stock-counts/${id}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterLocationId("all");
    setFilterUserId("all");
    setDateRange(undefined);
    // setCurrentPage(1); // El useEffect ya lo hace
  };

  return (
    <>
      <PageHeader
        title="Conteos Físicos de Stock"
        description="Inicia, gestiona y finaliza los conteos de tu inventario físico."
        actionButton={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Iniciar Nuevo Conteo
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
          <Button
            variant="ghost"
            onClick={clearFilters}
            size="sm"
            className="text-sm"
          >
            <XCircle className="mr-1 h-4 w-4" /> Limpiar Filtros
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por Nº, Notas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Estados</SelectItem>
                {ALL_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status] || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterLocationId}
              onValueChange={setFilterLocationId}
              disabled={isLoadingLocations}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ubicación..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Ubicaciones</SelectItem>
                {isLoadingLocations && (
                  <SelectItem value="loading-loc" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {locations?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterUserId}
              onValueChange={setFilterUserId}
              disabled={isLoadingUsers}
            >
              <SelectTrigger>
                <SelectValue placeholder="Iniciado por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Usuarios</SelectItem>
                {isLoadingUsers && (
                  <SelectItem value="loading-usr" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {users?.map((usr) => (
                  <SelectItem key={usr.id} value={usr.id}>
                    {usr.firstName} {usr.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <p className="text-sm font-medium mb-1.5">
                Rango de Fechas (Iniciado)
              </p>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Conteo</TableHead>
                <TableHead>Fecha Iniciado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Iniciado Por</TableHead>
                <TableHead className="text-center">Líneas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedData?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-sc-${i}`}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-red-500 py-10"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedData?.data?.length ? (
                paginatedData.data.map((sc) => (
                  <TableRow key={sc.id}>
                    <TableCell className="font-medium">
                      {sc.stockCountNumber || sc.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      {formatDateForDisplay(sc.initiatedAt)}
                    </TableCell>
                    <TableCell>
                      {sc.location?.name || "Ad-hoc / Múltiple"}
                    </TableCell>
                    <TableCell>
                      {sc.user?.firstName || ""} {sc.user?.lastName || ""}
                    </TableCell>
                    <TableCell className="text-center">
                      {sc._count?.lines ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sc.status === PrismaStockCountStatus.COMPLETED
                            ? "default"
                            : sc.status === PrismaStockCountStatus.CANCELLED
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          sc.status === PrismaStockCountStatus.COMPLETED
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : ""
                        }
                      >
                        {statusLabels[sc.status as PrismaStockCountStatus] ||
                          sc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToDetail(sc.id)}
                      >
                        {sc.status === PrismaStockCountStatus.PENDING ||
                        sc.status === PrismaStockCountStatus.IN_PROGRESS ? (
                          <>
                            <PlayCircle className="mr-1 h-4 w-4" /> Continuar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1 h-4 w-4" /> Ver Resultados
                          </>
                        )}
                      </Button>
                      {/* TODO: Si se necesita DropdownMenu para más acciones (ej. Cancelar conteo PENDING) */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No se encontraron sesiones de conteo con los filtros
                    actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedData && paginatedData.data && paginatedData.totalPages > 0 && (
        <DataTablePagination
          page={paginatedData.page}
          totalPages={paginatedData.totalPages}
          totalRecords={paginatedData.total}
          limit={paginatedData.limit}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isFetching={isFetching}
        />
      )}

      <CreateStockCountDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={(newStockCountId) => {
          // El diálogo ya se cierra a sí mismo en su onSuccess
          router.push(`/dashboard/inventory/stock-counts/${newStockCountId}`);
        }}
      />
    </>
  );
}
