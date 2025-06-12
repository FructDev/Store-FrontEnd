// app/(dashboard)/reports/repairs/list/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandList,
  CommandItem,
  CommandGroup,
} from "@/components/ui/command";
import { DataTablePagination } from "@/components/common/data-table-pagination";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { format, startOfMonth, endOfMonth, parseISO, subDays } from "date-fns";
// import { es } from "date-fns/locale";
import {
  Filter,
  // Search,
  XCircle,
  Download,
  ChevronsUpDown,
  // Check,
  // Wrench,
  // ArrowUpDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
// import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

import {
  FindInventoryReportParams,
  PaginatedRepairsReport,
  ReportRepairItem,
} from "@/types/reports.types"; // Importar RepairsReportSortBy
import { CustomerBasic } from "@/types/customer.types";
import { UserMinimal } from "@/types/user.types";
import {
  RepairStatus as PrismaRepairStatus,
  RepairsReportSortBy,
} from "@/types/prisma-enums";
import Link from "next/link";
import { toast } from "sonner";
// Importar repairStatusLabels (idealmente de un archivo de constantes)
const repairStatusLabels: Record<PrismaRepairStatus, string> = {
  // Definir localmente o importar
  RECEIVED: "Recibido",
  DIAGNOSING: "Diagnosticando",
  QUOTE_PENDING: "Pend. Cotización",
  AWAITING_QUOTE_APPROVAL: "Esperando Aprob. Cotización",
  QUOTE_APPROVED: "Cotización Aprobada",
  QUOTE_REJECTED: "Cotización Rechazada",
  AWAITING_PARTS: "Esperando Repuestos",
  IN_REPAIR: "En Reparación",
  ASSEMBLING: "Ensamblando",
  TESTING_QC: "Pruebas C. Calidad",
  REPAIR_COMPLETED: "Reparación Interna OK",
  PENDING_PICKUP: "Listo para Entrega",
  COMPLETED_PICKED_UP: "Entregado",
  CANCELLED: "Cancelado",
  UNREPAIRABLE: "No Reparable",
};

const ALL_REPAIR_STATUSES_ARRAY = Object.values(PrismaRepairStatus);
const ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__"; // Usar string vacío para "Todos" para simplificar Selects

export default function DetailedRepairsReportPage() {
  const defaultStartDate = startOfMonth(subDays(new Date(), 30)); // Inicio del mes anterior o hace 30 días
  const defaultEndDate = endOfMonth(new Date()); // Fin del mes actual

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultStartDate,
    to: defaultEndDate,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );

  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const debouncedCustomerSearch = useDebounce(customerSearchTerm, 300);
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);

  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceImei, setDeviceImei] = useState("");

  const [orderBy, setOrderBy] = useState<RepairsReportSortBy>(
    RepairsReportSortBy.RECEIVED_AT
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(25);

  // --- Fetch para Selectores de Filtro ---
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<
    CustomerBasic[]
  >({
    queryKey: ["filterCustomersForRepairsReport", debouncedCustomerSearch],
    queryFn: () =>
      apiClient
        .get(
          `/customers?isActive=true&limit=20${
            debouncedCustomerSearch ? `&search=${debouncedCustomerSearch}` : ""
          }`
        )
        .then((res) => res.data.data || []),
    enabled: isCustomerPopoverOpen, // Solo buscar cuando el popover está abierto
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<
    UserMinimal[]
  >({
    queryKey: ["filterTechniciansForRepairsReport"],
    queryFn: () =>
      apiClient
        .get("/users?role=TECHNICIAN&isActive=true&limit=200")
        .then((res) => res.data.data || []), // Asume filtro por rol
    staleTime: 1000 * 60 * 5, // Cachear por 5 mins
  });

  // --- Query Principal para el Reporte ---
  const queryParams = useMemo(() => {
    const params: FindInventoryReportParams = {
      startDate: dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : undefined, // Enviar undefined si no hay fecha
      endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
      page: currentPage,
      limit: limitPerPage,
      sortBy: orderBy,
      sortOrder,
    };
    if (selectedStatus && selectedStatus !== ALL_ITEMS_FILTER_VALUE)
      params.status = selectedStatus;
    if (selectedTechnicianId && selectedTechnicianId !== ALL_ITEMS_FILTER_VALUE)
      params.technicianId = selectedTechnicianId;
    if (selectedCustomerId && selectedCustomerId !== ALL_ITEMS_FILTER_VALUE)
      params.customerId = selectedCustomerId;
    if (deviceBrand.trim()) params.deviceBrand = deviceBrand.trim();
    if (deviceModel.trim()) params.deviceModel = deviceModel.trim();
    if (deviceImei.trim()) params.deviceImei = deviceImei.trim();
    return params;
  }, [
    dateRange,
    selectedStatus,
    selectedTechnicianId,
    selectedCustomerId,
    deviceBrand,
    deviceModel,
    deviceImei,
    currentPage,
    limitPerPage,
    orderBy,
    sortOrder,
  ]);

  const {
    data: reportData,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
    isError,
    error,
  } = useQuery<PaginatedRepairsReport, Error>({
    queryKey: ["repairsDetailedListReport", queryParams],
    queryFn: async () => {
      // No lanzar error si no hay rango, el backend debería manejar query opcional o devolver vacío
      // if (!queryParams?.startDate || !queryParams?.endDate) throw new Error("Rango de fechas es requerido.");
      const response = await apiClient.get("/reports/repairs/detailed-list", {
        params: queryParams,
      });
      if (response.data?.data) {
        response.data.data = response.data.data.map(
          (repair: ReportRepairItem) => ({
            ...repair,
            receivedAt: repair.receivedAt
              ? parseISO(String(repair.receivedAt))
              : new Date(0), // Fallback a fecha inválida si es null
            completedAt: repair.completedAt
              ? parseISO(String(repair.completedAt))
              : null,
          })
        );
      }
      return response.data;
    },
    // enabled: !!queryParams?.startDate && !!queryParams?.endDate, // El reporte podría funcionar sin fechas para ver "todos"
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    // Resetear a página 1 solo si los filtros que no son de paginación cambian
    setCurrentPage(1);
  }, [
    dateRange,
    selectedStatus,
    selectedTechnicianId,
    selectedCustomerId,
    deviceBrand,
    deviceModel,
    deviceImei,
    orderBy,
    sortOrder,
  ]);

  const handleDownloadPDF = () =>
    toast.info("TODO: Descarga PDF para Reporte de Reparaciones.");

  const clearFilters = () => {
    setDateRange({ from: defaultStartDate, to: defaultEndDate });
    setSelectedStatus(ALL_ITEMS_FILTER_VALUE);
    setSelectedTechnicianId(ALL_ITEMS_FILTER_VALUE);
    setSelectedCustomerId(ALL_ITEMS_FILTER_VALUE);
    setCustomerSearchTerm("");
    setDeviceBrand("");
    setDeviceModel("");
    setDeviceImei("");
    setOrderBy(RepairsReportSortBy.RECEIVED_AT);
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const handleCustomerSelect = (customerIdValue: string) => {
    setSelectedCustomerId(
      customerIdValue === ALL_ITEMS_FILTER_VALUE
        ? ALL_ITEMS_FILTER_VALUE
        : customerIdValue
    );
    setIsCustomerPopoverOpen(false);
  };

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <PageHeader
        title="Listado Detallado de Órdenes de Reparación"
        description="Seguimiento y análisis del estado y detalles de las reparaciones."
        actionButton={
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
            disabled={isLoadingReport || !reportData?.data?.length}
          >
            <Download className="mr-2 h-4 w-4" /> Descargar PDF
          </Button>
        }
      />

      <Card className="shrink-0">
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-base flex items-center">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            Filtros
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Limpiar Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
            <div>
              <Label htmlFor="rep-date-range" className="text-xs font-medium">
                Rango Fechas (Recepción)
              </Label>
              <DatePickerWithRange
                id="rep-date-range"
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full h-9 mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="rep-status-filter"
                className="text-xs font-medium"
              >
                Estado
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v)}
              >
                <SelectTrigger className="h-9 text-xs" id="rep-status-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todos</SelectItem>
                  {ALL_REPAIR_STATUSES_ARRAY.map((s) => (
                    <SelectItem key={s} value={s}>
                      {repairStatusLabels[s] || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rep-tech-filter" className="text-xs font-medium">
                Técnico
              </Label>
              <Select
                value={selectedTechnicianId}
                onValueChange={(v) => setSelectedTechnicianId(v)}
                disabled={isLoadingTechnicians}
              >
                <SelectTrigger className="h-9 text-xs" id="rep-tech-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todos</SelectItem>
                  {isLoadingTechnicians && (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  )}
                  {technicians?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.firstName} {t.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rep-cust-filter" className="text-xs font-medium">
                Cliente
              </Label>
              <Popover
                open={isCustomerPopoverOpen}
                onOpenChange={setIsCustomerPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="rep-cust-filter"
                    variant="outline"
                    role="combobox"
                    className="w-full h-9 justify-between font-normal text-xs truncate"
                  >
                    <span className="truncate">
                      {selectedCustomerId !== ALL_ITEMS_FILTER_VALUE &&
                      customers?.find((c) => c.id === selectedCustomerId)
                        ?.firstName
                        ? `${
                            customers.find((c) => c.id === selectedCustomerId)
                              ?.firstName
                          } ${
                            customers.find((c) => c.id === selectedCustomerId)
                              ?.lastName
                          }`.trim()
                        : "Todos"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar cliente..."
                      value={customerSearchTerm}
                      onValueChange={setCustomerSearchTerm}
                      className="text-xs h-8"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingCustomers ? "Buscando..." : "No encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value={ALL_ITEMS_FILTER_VALUE}
                          onSelect={() =>
                            handleCustomerSelect(ALL_ITEMS_FILTER_VALUE)
                          }
                        >
                          Todos
                        </CommandItem>
                        {customers?.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={`${c.firstName} ${c.lastName}`}
                            onSelect={() => handleCustomerSelect(c.id)}
                          >
                            {c.firstName} {c.lastName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="rep-brand-filter" className="text-xs font-medium">
                Marca Dispositivo
              </Label>
              <Input
                id="rep-brand-filter"
                className="h-9 text-xs"
                value={deviceBrand}
                onChange={(e) => setDeviceBrand(e.target.value)}
                placeholder="Ej: Apple"
              />
            </div>
            <div>
              <Label htmlFor="rep-model-filter" className="text-xs font-medium">
                Modelo Dispositivo
              </Label>
              <Input
                id="rep-model-filter"
                className="h-9 text-xs"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="Ej: iPhone 13"
              />
            </div>
            <div>
              <Label htmlFor="rep-imei-filter" className="text-xs font-medium">
                IMEI/Serial
              </Label>
              <Input
                id="rep-imei-filter"
                className="h-9 text-xs"
                value={deviceImei}
                onChange={(e) => setDeviceImei(e.target.value)}
                placeholder="IMEI o S/N"
              />
            </div>
            <div className="flex items-end space-x-2">
              <div>
                <Label
                  htmlFor="rep-orderby-filter"
                  className="text-xs font-medium"
                >
                  Ordenar Por
                </Label>
                <Select
                  value={orderBy}
                  onValueChange={(v) => setOrderBy(v as RepairsReportSortBy)}
                >
                  <SelectTrigger
                    className="h-9 text-xs"
                    id="rep-orderby-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RepairsReportSortBy.RECEIVED_AT}>
                      Fecha Recepción
                    </SelectItem>
                    <SelectItem value={RepairsReportSortBy.REPAIR_NUMBER}>
                      Nº Reparación
                    </SelectItem>
                    <SelectItem value={RepairsReportSortBy.CUSTOMER_NAME}>
                      Cliente
                    </SelectItem>
                    <SelectItem value={RepairsReportSortBy.TECHNICIAN_NAME}>
                      Técnico
                    </SelectItem>
                    <SelectItem value={RepairsReportSortBy.STATUS}>
                      Estado
                    </SelectItem>
                    <SelectItem value={RepairsReportSortBy.COMPLETED_AT}>
                      Fecha Completado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortOrder}
                className="h-9 w-9 shrink-0"
                title={`Orden: ${
                  sortOrder === "asc" ? "Ascendente" : "Descendente"
                }`}
              >
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de Totales del Reporte */}
      {reportData?.reportTotals && !isLoadingReport && (
        <Card className="mb-4 shrink-0">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">
              Resumen del Reporte Filtrado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Total Reparaciones:</span>
              <strong className="block text-lg">
                {reportData.reportTotals.totalRepairsInPeriod}
              </strong>
            </div>
            {Object.entries(reportData.reportTotals.repairsByStatusCount || {})
              .filter(([, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status}>
                  <span className="text-muted-foreground">
                    {repairStatusLabels[status as PrismaRepairStatus] || status}
                    :
                  </span>
                  <strong className="block text-lg">{count}</strong>
                </div>
              ))}
            {reportData.reportTotals.averageDaysOpenActive !== null && (
              <div>
                <span className="text-muted-foreground">
                  Prom. Días (Activas):
                </span>
                <strong className="block text-lg">
                  {reportData.reportTotals.averageDaysOpenActive?.toFixed(1)}
                </strong>
              </div>
            )}
            {reportData.reportTotals.averageCompletionTime !== null && (
              <div>
                <span className="text-muted-foreground">
                  Prom. Días (Completadas):
                </span>
                <strong className="block text-lg">
                  {reportData.reportTotals.averageCompletionTime?.toFixed(1)}
                </strong>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-base">
              Listado de Órdenes de Reparación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto overflow-x-auto">
            {/* <ScrollArea className="h-full"> */}
            <Table className="text-xs">
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-[100px]">Nº Reparación</TableHead>
                  <TableHead className="w-[90px]">Recibido</TableHead>
                  <TableHead className="min-w-[150px] sticky left-0 bg-background z-10">
                    Cliente
                  </TableHead>
                  <TableHead className="min-w-[150px]">Dispositivo</TableHead>
                  <TableHead className="w-[130px]">IMEI/Serial</TableHead>
                  <TableHead className="min-w-[180px]">
                    Problema Reportado
                  </TableHead>
                  <TableHead className="min-w-[120px]">Técnico</TableHead>
                  <TableHead className="w-[140px]">Estado</TableHead>
                  <TableHead className="text-right w-[90px]">
                    Cotizado
                  </TableHead>
                  <TableHead className="text-right w-[90px]">
                    Facturado
                  </TableHead>
                  <TableHead className="w-[90px]">Completado</TableHead>
                  <TableHead className="text-right w-[70px]">Días</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingReport || isFetchingReport ? (
                  [...Array(limitPerPage)].map((_, i) => (
                    <TableRow key={`skel-rep-report-${i}`}>
                      {[...Array(12)].map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="text-center text-red-500 py-10"
                    >
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                ) : reportData?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No se encontraron reparaciones con los filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  reportData?.data.map((repair) => (
                    <TableRow
                      key={repair.repairId}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <Link
                          href={`/dashboard/repairs/${repair.repairId}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {repair.repairNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {formatDate(repair.receivedAt, "dd/MM/yy")}
                      </TableCell>
                      <TableCell
                        className="sticky left-0 bg-background z-0 max-w-[150px] truncate"
                        title={repair.customerName || ""}
                      >
                        {repair.customerName || "N/A"}
                      </TableCell>
                      <TableCell
                        className="max-w-[150px] truncate"
                        title={repair.deviceDisplay}
                      >
                        {repair.deviceDisplay}
                      </TableCell>
                      <TableCell
                        className="max-w-[130px] truncate text-muted-foreground"
                        title={repair.deviceImei || ""}
                      >
                        {repair.deviceImei || "-"}
                      </TableCell>
                      <TableCell
                        className="max-w-[180px] truncate"
                        title={repair.reportedIssueExcerpt}
                      >
                        {repair.reportedIssueExcerpt}
                      </TableCell>
                      <TableCell
                        className="max-w-[120px] truncate"
                        title={repair.technicianName || ""}
                      >
                        {repair.technicianName || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          {repairStatusLabels[repair.status] || repair.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(repair.quotedAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(repair.totalBilledAmount)}
                      </TableCell>
                      <TableCell>
                        {formatDate(repair.completedAt, "dd/MM/yy")}
                      </TableCell>
                      <TableCell className="text-right">
                        {repair.daysOpenOrToCompletion ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {/* </ScrollArea> */}
          </CardContent>
        </Card>
      </div>

      {reportData && reportData.total > 0 && (
        <div className="pt-4 shrink-0">
          <DataTablePagination
            page={reportData.page}
            totalPages={reportData.totalPages}
            totalRecords={reportData.total}
            limit={reportData.limit}
            onNextPage={() => setCurrentPage(reportData.page + 1)}
            onPreviousPage={() => setCurrentPage(reportData.page - 1)}
            isFetching={isFetchingReport}
          />
        </div>
      )}
    </div>
  );
}
