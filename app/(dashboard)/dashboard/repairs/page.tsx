// app/(dashboard)/repairs/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { RepairOrder, PaginatedRepairsResponse } from "@/types/repairs.types"; // Tus tipos
import { CustomerBasic } from "@/types/customer.types";
import { UserMinimal } from "@/types/user.types";
import { RepairStatus as PrismaRepairStatus } from "@/types/prisma-enums";
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
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Eye,
  Search,
  Wrench, // Icono para "Registrar Nueva Reparación"
  PlayCircle, // Icono para "Continuar"
  Filter,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDate } from "date-fns"; // parseISO para manejar strings de fecha del backend
// import { es } from "date-fns/locale";
import { useDebounce } from "@/hooks/use-debounce"; // Asumiendo que tienes este hook
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
// No necesitamos FormLabel aquí si usamos <p> o <label> HTML para el DatePicker

// Mapeo para estados de Reparación
export const repairStatusLabels: Record<PrismaRepairStatus, string> = {
  [PrismaRepairStatus.RECEIVED]: "Recibido",
  [PrismaRepairStatus.DIAGNOSING]: "Diagnosticando",
  [PrismaRepairStatus.QUOTE_PENDING]: "Pend. Cotización",
  [PrismaRepairStatus.AWAITING_QUOTE_APPROVAL]: "Esperando Aprob. Cotización",
  [PrismaRepairStatus.QUOTE_REJECTED]: "Cotización Rechazada",
  [PrismaRepairStatus.AWAITING_PARTS]: "Esperando Repuestos",
  [PrismaRepairStatus.IN_REPAIR]: "En Reparación",
  [PrismaRepairStatus.ASSEMBLING]: "Ensamblando",
  [PrismaRepairStatus.TESTING_QC]: "Pruebas C. Calidad",
  [PrismaRepairStatus.REPAIR_COMPLETED]: "Reparación Interna OK",
  [PrismaRepairStatus.PENDING_PICKUP]: "Listo para Entrega",
  [PrismaRepairStatus.COMPLETED_PICKED_UP]: "Entregado al Cliente",
  [PrismaRepairStatus.CANCELLED]: "Cancelado",
  [PrismaRepairStatus.UNREPAIRABLE]: "No Reparable",
};
const ALL_REPAIR_STATUSES = Object.values(PrismaRepairStatus);

// Asumo que tienes una función formatCurrency global o la defines aquí
const formatCurrency = (
  amount: string | number | null | undefined,
  currencySymbol = "RD$"
) => {
  if (amount === null || amount === undefined) return "-";
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(numericAmount)) return "-";
  // Intl.NumberFormat es más robusto para formateo de moneda
  try {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    })
      .format(numericAmount)
      .replace("DOP", currencySymbol); // Reemplazar código ISO por símbolo si es necesario
  } catch (e) {
    console.log(e);
    return `${currencySymbol} ${numericAmount.toFixed(2)}`; // Fallback simple
  }
};

export default function RepairsListPage() {
  const router = useRouter();
  //   const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);

  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCustomerId, setFilterCustomerId] = useState<string>("all");
  const [filterTechnicianId, setFilterTechnicianId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch para Clientes (para el filtro)
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<
    CustomerBasic[]
  >({
    queryKey: ["allActiveCustomersForRepairFilter"],
    queryFn: () =>
      apiClient
        .get("/customers?isActive=true&limit=500&page=1") // Pedir suficientes para un select
        .then((res) => res.data.data || (res.data as CustomerBasic[]) || []), // Manejar diferentes estructuras de respuesta
    staleTime: 1000 * 60 * 5, // Cache por 5 mins
  });

  // Fetch para Técnicos/Usuarios (para el filtro)
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<
    UserMinimal[]
  >({
    queryKey: ["allActiveTechniciansForRepairFilter"],
    // Asume un endpoint que devuelve usuarios que pueden ser técnicos, o todos los usuarios activos
    queryFn: () =>
      apiClient
        .get("/users?isActive=true&limit=500&page=1") // Pedir suficientes
        .then((res) => res.data.data || (res.data as UserMinimal[]) || []),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: paginatedRepairs,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedRepairsResponse, Error>({
    queryKey: [
      "repairsList",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
      filterStatus,
      filterCustomerId,
      filterTechnicianId,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(), // Usar ISOString para la queryKey si es más estable
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: limitPerPage,
        sortBy: "receivedAt", // O el campo que uses para fecha de recepción en RepairOrder
        sortOrder: "desc",
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterCustomerId !== "all") params.customerId = filterCustomerId;
      if (filterTechnicianId !== "all")
        params.technicianId = filterTechnicianId;
      if (dateRange?.from)
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
      if (dateRange?.to) params.endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await apiClient.get("/repairs", { params });
      // Parsear montos si vienen como string y los necesitas como number en la lista
      const parsedData = (response.data.data || []).map(
        (repair: RepairOrder) => ({
          ...repair,
          quotedAmount:
            repair.quotedAmount !== null && repair.quotedAmount !== undefined
              ? parseFloat(String(repair.quotedAmount))
              : null,
          totalRepairAmount:
            repair.totalRepairAmount !== null &&
            repair.totalRepairAmount !== undefined
              ? parseFloat(String(repair.totalRepairAmount))
              : null,
        })
      );
      return {
        ...response.data,
        data: parsedData,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
      };
    },
    placeholderData: (previousData) => previousData,
  });

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedRepairs && currentPage < paginatedRepairs.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // Resetear a página 1 cuando los filtros cambian
  }, [
    debouncedSearchTerm,
    filterStatus,
    filterCustomerId,
    filterTechnicianId,
    dateRange,
  ]);

  const navigateToDetail = (repairId: string) => {
    router.push(`/dashboard/repairs/${repairId}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterCustomerId("all");
    setFilterTechnicianId("all");
    setDateRange(undefined);
  };

  return (
    <>
      <PageHeader
        title="Órdenes de Reparación"
        description="Gestiona todas las reparaciones de dispositivos de tus clientes."
        actionButton={
          <Button asChild>
            <Link href="/dashboard/repairs/new">
              <Wrench className="mr-2 h-4 w-4" /> Registrar Nueva Reparación
            </Link>
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5 text-muted-foreground" />
            Filtros
          </CardTitle>
          <Button
            variant="ghost"
            onClick={clearFilters}
            size="sm"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            <XCircle className="mr-1 h-4 w-4" /> Limpiar Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar Nº, Cliente, IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {ALL_REPAIR_STATUSES.map((statusValue) => (
                  <SelectItem key={statusValue} value={statusValue}>
                    {repairStatusLabels[statusValue] || statusValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterCustomerId}
              onValueChange={setFilterCustomerId}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Cliente..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todos los Clientes</SelectItem>
                {isLoadingCustomers && (
                  <SelectItem value="loading-cust" disabled>
                    Cargando clientes...
                  </SelectItem>
                )}
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterTechnicianId}
              onValueChange={setFilterTechnicianId}
              disabled={isLoadingTechnicians}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Técnico..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todos los Técnicos</SelectItem>
                {isLoadingTechnicians && (
                  <SelectItem value="loading-tech" disabled>
                    Cargando técnicos...
                  </SelectItem>
                )}
                {technicians?.map((tech) => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.firstName} {tech.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                Fecha de Recepción
              </p>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full h-10"
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
                <TableHead>Nº Reparación</TableHead>
                <TableHead>Recibido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Monto Cotizado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-repair-${i}`}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-red-500 py-10"
                  >
                    Error cargando reparaciones: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedRepairs?.data?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No se encontraron órdenes de reparación con los filtros
                    actuales.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRepairs?.data.map((repair) => (
                  <TableRow key={repair.id}>
                    <TableCell className="font-medium">
                      {repair.repairNumber}
                    </TableCell>
                    <TableCell>
                      {formatDate(repair.receivedAt, "dd/MM/yy")}
                    </TableCell>
                    <TableCell>
                      {repair.customer
                        ? `${repair.customer.firstName || ""} ${
                            repair.customer.lastName || ""
                          }`.trim()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {repair.deviceBrand} {repair.deviceModel}
                    </TableCell>
                    <TableCell>
                      {repair.technician
                        ? `${repair.technician.firstName || ""} ${
                            repair.technician.lastName || ""
                          }`.trim()
                        : "No asignado"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          repair.status ===
                            PrismaRepairStatus.REPAIR_COMPLETED &&
                            "bg-green-100 text-green-700 border-green-300",
                          repair.status === PrismaRepairStatus.CANCELLED &&
                            "bg-red-100 text-red-700 border-red-300",
                          repair.status === PrismaRepairStatus.DIAGNOSING &&
                            "bg-blue-100 text-blue-700 border-blue-300",
                          repair.status === PrismaRepairStatus.IN_REPAIR &&
                            "bg-yellow-100 text-yellow-700 border-yellow-300",
                          repair.status === PrismaRepairStatus.PENDING_PICKUP &&
                            "bg-teal-100 text-teal-700 border-teal-300"
                        )}
                      >
                        {repairStatusLabels[repair.status] || repair.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(repair.quotedAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToDetail(repair.id)}
                      >
                        {repair.status === PrismaRepairStatus.DIAGNOSING ||
                        repair.status === PrismaRepairStatus.IN_REPAIR ||
                        repair.status === PrismaRepairStatus.QUOTE_PENDING ||
                        repair.status ===
                          PrismaRepairStatus.AWAITING_QUOTE_APPROVAL ||
                        repair.status === PrismaRepairStatus.AWAITING_PARTS ||
                        repair.status === PrismaRepairStatus.TESTING_QC ? (
                          <>
                            <PlayCircle className="mr-1 h-4 w-4" /> Gestionar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-1 h-4 w-4" /> Ver Detalle
                          </>
                        )}
                      </Button>
                      {/* Podrías añadir un DropdownMenu aquí para más acciones como "Cancelar" (si status === PENDING_DIAGNOSIS) */}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedRepairs && paginatedRepairs.total > 0 && (
        <DataTablePagination
          page={paginatedRepairs.page}
          totalPages={paginatedRepairs.totalPages}
          totalRecords={paginatedRepairs.total}
          limit={paginatedRepairs.limit}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isFetching={isFetching}
        />
      )}

      {/* El diálogo de creación se integrará aquí o en un botón en PageHeader */}
      {/* <CreateRepairOrderDialog isOpen={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={(newRepairId) => router.push(`/dashboard/repairs/${newRepairId}`)} /> */}
    </>
  );
}
