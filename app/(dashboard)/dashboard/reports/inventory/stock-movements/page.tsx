// app/(dashboard)/reports/inventory/stock-movements/page.tsx
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
// import { es } from "date-fns/locale";
import {
  Filter,
  // Search,
  XCircle,
  Download,
  ChevronsUpDown,
  // Check,
  // History,
  SortAsc,
  SortDesc,
  // ArrowUpDown,
} from "lucide-react"; // Añadido SortAsc, SortDesc
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

import {
  FindInventoryReportParams,
  PaginatedStockMovementsReport,
  ReportStockMovementItem,
} from "@/types/reports.types";
import { ProductBasic, InventoryLocationBasic } from "@/types/inventory.types";
import { UserMinimal } from "@/types/user.types";
import { MovementType as PrismaMovementType } from "@/types/prisma-enums";
import { StockMovementsOrderBy } from "@/types/prisma-enums"; // Ajusta la ruta al DTO del backend
import { toast } from "sonner";

// Mapeo para MovementType
const movementTypeLabels: Record<PrismaMovementType, string> = {
  SALE: "Venta",
  PURCHASE_RECEIPT: "Recepción Compra",
  ADJUSTMENT_IN: "Ajuste Entrada",
  ADJUSTMENT_OUT: "Ajuste Salida",
  TRANSFER_OUT: "Transferencia (Salida)",
  TRANSFER_IN: "Transferencia (Entrada)",
  RETURN_RESTOCK: "Devolución (Reingreso)",
  REPAIR_CONSUMPTION: "Consumo Reparación",
  INITIAL_STOCK: "Stock Inicial",
  STOCK_COUNT_ADJUSTMENT: "Ajuste Conteo",
  PRODUCTION_IN: "Entrada Producción",
  PRODUCTION_OUT: "Salida Producción",
};
const ALL_MOVEMENT_TYPES = Object.values(PrismaMovementType);
const ALL_ITEMS_FILTER_VALUE = "__ALL__"; // O usa "" si prefieres y ajusta la lógica

export default function StockMovementsReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(
      new Date(new Date().setMonth(new Date().getMonth() - 1))
    ), // Default al mes anterior
    to: endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
  });
  const [selectedProductId, setSelectedProductId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearch = useDebounce(productSearchTerm, 300);
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);

  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedMovementType, setSelectedMovementType] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedUserId, setSelectedUserId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [referenceType, setReferenceType] = useState<string>("");
  const [referenceId, setReferenceId] = useState<string>("");

  const [orderBy, setOrderBy] = useState<string>(
    StockMovementsOrderBy.MOVEMENT_DATE
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(50); // Límite para este reporte

  // Fetch para selectores de filtro
  const { data: productsForFilter, isLoading: isLoadingProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["allProductsForMovementFilter", debouncedProductSearch],
    queryFn: () =>
      apiClient
        .get(
          `/inventory/products?isActive=true&limit=50${
            debouncedProductSearch ? `&search=${debouncedProductSearch}` : ""
          }`
        )
        .then((res) => res.data.data || []),
    enabled: isProductPopoverOpen, // Solo buscar cuando el popover esté abierto
  });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["allLocationsForMovementFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || []),
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserMinimal[]>({
    queryKey: ["allUsersForMovementFilter"],
    queryFn: () =>
      apiClient
        .get("/users?isActive=true&limit=200")
        .then((res) => res.data.data || []), // Asume que devuelve usuarios activos
  });

  const queryParams = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const params: FindInventoryReportParams = {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
      page: currentPage,
      limit: limitPerPage,
      sortBy: orderBy,
      sortOrder,
    };
    if (selectedProductId !== ALL_ITEMS_FILTER_VALUE)
      params.productId = selectedProductId;
    if (selectedLocationId !== ALL_ITEMS_FILTER_VALUE)
      params.locationId = selectedLocationId;
    if (selectedMovementType !== ALL_ITEMS_FILTER_VALUE)
      params.movementType = selectedMovementType;
    if (selectedUserId !== ALL_ITEMS_FILTER_VALUE)
      params.userId = selectedUserId;
    if (referenceType.trim()) params.referenceType = referenceType.trim();
    if (referenceId.trim()) params.referenceId = referenceId.trim();
    return params;
  }, [
    dateRange,
    selectedProductId,
    selectedLocationId,
    selectedMovementType,
    selectedUserId,
    referenceType,
    referenceId,
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
  } = useQuery<PaginatedStockMovementsReport, Error>({
    queryKey: ["stockMovementsReport", queryParams],
    queryFn: async () => {
      if (!queryParams) throw new Error("Rango de fechas es requerido.");
      const response = await apiClient.get(
        "/reports/inventory/stock-movements",
        { params: queryParams }
      );
      if (response.data?.data) {
        response.data.data = response.data.data.map(
          (mov: ReportStockMovementItem) => ({
            ...mov,
            movementDate: mov.movementDate
              ? parseISO(String(mov.movementDate))
              : new Date(),
          })
        );
      }
      return response.data;
    },
    enabled: !!queryParams,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [queryParams]);

  const handleDownloadPDF = () =>
    toast.info("TODO: Implementar descarga de PDF para Kardex.");
  const clearFilters = () => {
    setDateRange({
      from: startOfMonth(
        new Date(new Date().setMonth(new Date().getMonth() - 1))
      ),
      to: endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
    });
    setSelectedProductId(ALL_ITEMS_FILTER_VALUE);
    setProductSearchTerm("");
    setSelectedLocationId(ALL_ITEMS_FILTER_VALUE);
    setSelectedMovementType(ALL_ITEMS_FILTER_VALUE);
    setSelectedUserId(ALL_ITEMS_FILTER_VALUE);
    setReferenceType("");
    setReferenceId("");
    setOrderBy(StockMovementsOrderBy.MOVEMENT_DATE);
    setSortOrder("desc");
    setCurrentPage(1);
  };
  const handleProductSelect = (productIdValue: string) => {
    setSelectedProductId(productIdValue);
    setIsProductPopoverOpen(false);
  };
  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  const isKardexMode =
    selectedProductId !== ALL_ITEMS_FILTER_VALUE && selectedProductId !== "";

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <PageHeader
        title="Reporte de Movimientos de Stock (Kardex)"
        description="Historial detallado de todas las entradas y salidas de inventario."
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
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            Filtros
          </CardTitle>
          <Button
            variant="ghost"
            onClick={clearFilters}
            size="sm"
            className="text-xs"
          >
            <XCircle className="mr-1 h-3 w-3" /> Limpiar
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
            <div>
              <Label
                htmlFor="kardex-date-range"
                className="text-xs font-medium"
              >
                Rango de Fechas*
              </Label>
              <DatePickerWithRange
                id="kardex-date-range"
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full h-9 mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="kardex-product-filter"
                className="text-xs font-medium"
              >
                Producto (para Kardex)
              </Label>
              <Popover
                open={isProductPopoverOpen}
                onOpenChange={setIsProductPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="kardex-product-filter"
                    variant="outline"
                    role="combobox"
                    className="w-full h-9 justify-between font-normal text-xs truncate"
                  >
                    <span className="truncate">
                      {(selectedProductId !== ALL_ITEMS_FILTER_VALUE &&
                        productsForFilter?.find(
                          (p) => p.id === selectedProductId
                        )?.name) ||
                        "Todos (Lista General)"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Buscar producto..."
                      value={productSearchTerm}
                      onValueChange={setProductSearchTerm}
                      className="text-xs h-8"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingProducts ? "Buscando..." : "No encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value={ALL_ITEMS_FILTER_VALUE}
                          onSelect={() =>
                            handleProductSelect(ALL_ITEMS_FILTER_VALUE)
                          }
                        >
                          Todos (Lista General)
                        </CommandItem>
                        {productsForFilter?.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => handleProductSelect(p.id)}
                          >
                            {p.name}{" "}
                            <span className="text-muted-foreground ml-1 text-[10px]">
                              ({p.sku || "N/A"})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label
                htmlFor="kardex-location-filter"
                className="text-xs font-medium"
              >
                Ubicación
              </Label>
              <Select
                value={selectedLocationId}
                onValueChange={(v) => setSelectedLocationId(v)}
                disabled={isLoadingLocations}
              >
                <SelectTrigger
                  className="h-9 text-xs"
                  id="kardex-location-filter"
                >
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todas</SelectItem>
                  {locations?.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="kardex-movtype-filter"
                className="text-xs font-medium"
              >
                Tipo Movimiento
              </Label>
              <Select
                value={selectedMovementType}
                onValueChange={(v) => setSelectedMovementType(v)}
              >
                <SelectTrigger
                  className="h-9 text-xs"
                  id="kardex-movtype-filter"
                >
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todos</SelectItem>
                  {ALL_MOVEMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {movementTypeLabels[t] || t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="kardex-user-filter"
                className="text-xs font-medium"
              >
                Usuario
              </Label>
              <Select
                value={selectedUserId}
                onValueChange={(v) => setSelectedUserId(v)}
                disabled={isLoadingUsers}
              >
                <SelectTrigger className="h-9 text-xs" id="kardex-user-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todos</SelectItem>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.firstName} {u.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="kardex-reftype-filter"
                className="text-xs font-medium"
              >
                Tipo Referencia
              </Label>
              <Input
                id="kardex-reftype-filter"
                className="h-9 text-xs"
                placeholder="Ej: SALE, PO"
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value)}
              />
            </div>
            <div>
              <Label
                htmlFor="kardex-refid-filter"
                className="text-xs font-medium"
              >
                ID Referencia
              </Label>
              <Input
                id="kardex-refid-filter"
                className="h-9 text-xs"
                placeholder="Ej: VTA-001"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <div>
                <Label
                  htmlFor="kardex-orderby-filter"
                  className="text-xs font-medium"
                >
                  Ordenar Por
                </Label>
                <Select
                  value={orderBy}
                  onValueChange={(v) => setOrderBy(v as string)}
                >
                  <SelectTrigger
                    className="h-9 text-xs"
                    id="kardex-orderby-filter"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="movementDate">Fecha</SelectItem>
                    <SelectItem value="productName">Producto</SelectItem>
                    <SelectItem value="movementType">Tipo</SelectItem>
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

      {isKardexMode &&
        reportData &&
        reportData.openingBalance !== null &&
        !isLoadingReport && (
          <Card className="mb-4 shrink-0 bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-sm">
              <strong>Saldo Inicial del Producto</strong> (antes de{" "}
              {formatDate(dateRange?.from, "dd/MM/yy")}):
              <span className="font-semibold ml-2">
                {reportData.openingBalance} und.
              </span>
            </CardContent>
          </Card>
        )}

      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-base">
              Detalle de Movimientos de Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Fecha</TableHead>
                    <TableHead className="min-w-[180px] sticky left-0 bg-background z-10">
                      Producto
                    </TableHead>
                    <TableHead className="w-[100px]">SKU</TableHead>
                    <TableHead className="w-[120px]">IMEI/Serial</TableHead>
                    <TableHead className="w-[150px]">Tipo Mov.</TableHead>
                    <TableHead className="text-right w-[80px]">
                      Cant +/-
                    </TableHead>
                    {isKardexMode && (
                      <TableHead className="text-right w-[80px] font-semibold">
                        Saldo
                      </TableHead>
                    )}
                    <TableHead className="text-right w-[100px]">
                      Costo Mov.
                    </TableHead>
                    <TableHead className="text-right w-[100px]">
                      Valor Mov.
                    </TableHead>
                    <TableHead className="w-[120px]">Desde Ubic.</TableHead>
                    <TableHead className="w-[120px]">Hacia Ubic.</TableHead>
                    <TableHead className="w-[150px]">Referencia</TableHead>
                    <TableHead className="w-[120px]">Usuario</TableHead>
                    <TableHead className="min-w-[200px]">Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingReport || isFetchingReport ? (
                    [...Array(limitPerPage)].map((_, i) => (
                      <TableRow key={`skel-mov-${i}`}>
                        {[...Array(isKardexMode ? 14 : 13)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={isKardexMode ? 14 : 13}
                        className="text-center text-red-500 py-10"
                      >
                        Error: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : reportData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isKardexMode ? 14 : 13}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No se encontraron movimientos con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData?.data.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {formatDate(mov.movementDate, "dd/MM/yy HH:mm")}
                        </TableCell>
                        <TableCell
                          className="font-medium max-w-[180px] truncate sticky left-0 bg-background z-0"
                          title={mov.productName}
                        >
                          {mov.productName}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[100px] truncate">
                          {mov.productSku || "N/A"}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[120px] truncate">
                          {mov.imei || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {movementTypeLabels[mov.movementType] ||
                              mov.movementType}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold",
                            mov.quantityChange > 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {mov.quantityChange > 0
                            ? `+${mov.quantityChange}`
                            : mov.quantityChange}
                        </TableCell>
                        {isKardexMode && (
                          <TableCell className="text-right font-bold">
                            {mov.balanceAfterMovement}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          {formatCurrency(mov.unitCostAtTimeOfMovement)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(mov.totalValueChange)}
                        </TableCell>
                        <TableCell
                          className="max-w-[100px] truncate"
                          title={mov.fromLocationName || ""}
                        >
                          {mov.fromLocationName || "-"}
                        </TableCell>
                        <TableCell
                          className="max-w-[100px] truncate"
                          title={mov.toLocationName || ""}
                        >
                          {mov.toLocationName || "-"}
                        </TableCell>
                        <TableCell
                          className="text-[11px] max-w-[150px] truncate"
                          title={`${mov.referenceType || ""} ${
                            mov.referenceId || ""
                          }`}
                        >
                          {mov.referenceType && mov.referenceId
                            ? `${mov.referenceType}: ${mov.referenceId}`
                            : mov.referenceType || mov.referenceId || "-"}
                        </TableCell>
                        <TableCell
                          className="max-w-[120px] truncate"
                          title={mov.userName || ""}
                        >
                          {mov.userName || "Sistema"}
                        </TableCell>
                        <TableCell
                          className="text-xs max-w-[200px] truncate"
                          title={mov.notes || ""}
                        >
                          {mov.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {isKardexMode &&
        reportData?.closingBalance !== null &&
        reportData?.closingBalance !== undefined &&
        reportData.page === reportData.totalPages &&
        !isLoadingReport && (
          <Card className="mt-4 shrink-0 bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-sm text-right">
              <strong>Saldo Final del Producto</strong> (al{" "}
              {formatDate(dateRange?.to, "dd/MM/yy")}):
              <span className="font-semibold ml-2">
                {reportData.closingBalance} und.
              </span>
            </CardContent>
          </Card>
        )}

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
