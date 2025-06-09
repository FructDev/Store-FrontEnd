// app/(dashboard)/reports/sales/detailed-period/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { format, startOfMonth, endOfMonth } from "date-fns";
import { Filter, XCircle, Download, ChevronsUpDown } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";

import {
  PaginatedDetailedSalesReport,
  ReportDetailedSaleItem,
} from "@/types/reports.types"; // Tus tipos frontend
import { CustomerBasic } from "@/types/customer.types";
import { UserMinimal } from "@/types/user.types";
import { ProductBasic } from "@/types/inventory.types";
import { SaleStatus as PrismaSaleStatus } from "@/types/prisma-enums";
import { saleStatusLabels } from "@/app/(dashboard)/dashboard/sales/page"; // Reutilizar etiquetas de estado de venta
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ALL_SALE_STATUSES_ARRAY = Object.values(PrismaSaleStatus);
const ALL_ITEMS_VALUE = "__ALL_ITEMS__"; // O cualquier string único no vacío

export default function DetailedSalesPeriodReportPage() {
  //   const queryClient = useQueryClient();

  // Estados para Filtros
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(""); // "all" o ID
  const [selectedSalespersonId, setSelectedSalespersonId] =
    useState<string>(""); // "all" o ID
  const [selectedProductId, setSelectedProductId] = useState<string>(""); // "all" o ID
  const [selectedStatus, setSelectedStatus] = useState<string>(""); // "all" o SaleStatus
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);

  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const debouncedCustomerSearch = useDebounce(customerSearchTerm, 300);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearch = useDebounce(productSearchTerm, 300);

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(25);

  // Fetch para selectores de filtro
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<
    CustomerBasic[]
  >({
    queryKey: ["allCustomersForReportFilter", debouncedCustomerSearch],
    queryFn: () =>
      apiClient
        .get(
          `/customers?limit=20&isActive=true${
            debouncedCustomerSearch ? `&search=${debouncedCustomerSearch}` : ""
          }`
        )
        .then((res) => res.data.data || []),
    enabled:
      debouncedCustomerSearch.length > 1 ||
      debouncedCustomerSearch.length === 0, // Fetch inicial y con búsqueda
  });
  const { data: salespersons, isLoading: isLoadingSalespersons } = useQuery<
    UserMinimal[]
  >({
    queryKey: ["allSalespersonsForReportFilter"],
    queryFn: () =>
      apiClient
        .get("/users?isActive=true&limit=200&role=SALESPERSON")
        .then((res) => res.data.data || []), // Asume un filtro de rol
  });
  const { data: products, isLoading: isLoadingProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["allProductsForReportFilter", debouncedProductSearch],
    queryFn: () =>
      apiClient
        .get(
          `/inventory/products?isActive=true&limit=20${
            debouncedProductSearch ? `&search=${debouncedProductSearch}` : ""
          }`
        )
        .then((res) => res.data.data || []),
    enabled:
      debouncedProductSearch.length > 1 || debouncedProductSearch.length === 0,
  });

  // Query principal para el reporte
  const {
    data: reportData,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
    isError,
    error,
  } = useQuery<PaginatedDetailedSalesReport, Error>({
    queryKey: [
      "detailedSalesReport",
      dateRange?.from,
      dateRange?.to,
      selectedCustomerId,
      selectedSalespersonId,
      selectedProductId,
      selectedStatus,
      currentPage,
      limitPerPage,
    ],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) {
        // Esto no debería pasar si los DatePicker siempre tienen valor
        throw new Error("Rango de fechas es requerido.");
      }
      const params: any = {
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        page: currentPage,
        limit: limitPerPage,
      };
      if (selectedCustomerId && selectedCustomerId !== "all")
        params.customerId = selectedCustomerId;
      if (selectedSalespersonId && selectedSalespersonId !== "all")
        params.salespersonId = selectedSalespersonId;
      if (selectedProductId && selectedProductId !== "all")
        params.productId = selectedProductId;
      if (selectedStatus && selectedStatus !== "all")
        params.status = selectedStatus;

      const response = await apiClient.get("/reports/sales/detailed-period", {
        params,
      });
      return response.data;
    },
    enabled: !!dateRange?.from && !!dateRange?.to, // Solo ejecutar si hay rango de fechas
    placeholderData: (prev) => prev,
  });

  const handleFilterChange = () => {
    setCurrentPage(1); // Resetear a página 1 cuando los filtros cambian
    // queryClient.invalidateQueries({ queryKey: ["detailedSalesReport"] }); // React Query lo hará por cambio en queryKey
  };
  useEffect(handleFilterChange, [
    dateRange,
    selectedCustomerId,
    selectedSalespersonId,
    selectedProductId,
    selectedStatus,
  ]);

  const queryParams = useMemo(() => {
    // Si no hay un rango de fechas válido, no generamos PDF ni llamamos a la query principal
    if (!dateRange?.from || !dateRange?.to) {
      // Podrías devolver un objeto que indique que los params no están listos,
      // o manejar esto antes de llamar a handleDownloadPDF
      return null;
    }
    const params: any = {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
      // page y limit no son usualmente necesarios para el PDF, ya que el backend debería generar el reporte completo.
      // Pero si tu endpoint PDF los necesita o los ignora, está bien pasarlos.
      // Por ahora, los omitiremos para el PDF, asumiendo que el backend PDF genera todos los datos.
    };
    if (selectedCustomerId && selectedCustomerId !== ALL_ITEMS_VALUE)
      params.customerId = selectedCustomerId;
    if (selectedSalespersonId && selectedSalespersonId !== ALL_ITEMS_VALUE)
      params.salespersonId = selectedSalespersonId;
    if (selectedProductId && selectedProductId !== ALL_ITEMS_VALUE)
      params.productId = selectedProductId;
    if (selectedStatus && selectedStatus !== ALL_ITEMS_VALUE)
      params.status = selectedStatus;
    // NO incluimos page y limit aquí, ya que el PDF debería ser completo
    return params;
  }, [
    dateRange,
    selectedCustomerId,
    selectedSalespersonId,
    selectedProductId,
    selectedStatus,
  ]);

  const handleDownloadPDF = async () => {
    if (!queryParams) {
      toast.error(
        "Por favor, selecciona un rango de fechas válido para generar el PDF."
      );
      return;
    }

    const filteredParamsForUrl = Object.entries(queryParams)
      .filter(
        ([, value]) => value !== null && value !== undefined && value !== ""
      )
      .reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>);

    const queryString = new URLSearchParams(filteredParamsForUrl).toString();

    // NO necesitamos la base de la API aquí si apiClient ya la tiene configurada
    const pdfEndpointPath = `/reports/sales/detailed-period/pdf?${queryString}`;

    toast.info("Generando PDF... Por favor espera.");

    try {
      // Usa tu instancia de apiClient que ya debería tener los interceptores de autenticación
      const response = await apiClient.get(pdfEndpointPath, {
        responseType: "blob", // Importante para que Axios maneje la respuesta como un archivo binario
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      const startDate = queryParams.startDate || "reporte";
      const endDate = queryParams.endDate || "ventas";
      link.download = `reporte-ventas-<span class="math-inline">\{startDate\}\-al\-</span>{endDate}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href); // Limpiar el object URL

      toast.success("PDF descargado exitosamente.");
    } catch (err: any) {
      console.error("Error descargando PDF:", err);
      let errorMessage = "Error al generar el PDF del reporte.";
      if (err.response?.data) {
        // Si la respuesta es un blob y hubo un error, puede que necesitemos leer el blob como texto
        if (
          err.response.data instanceof Blob &&
          err.response.data.type === "application/json"
        ) {
          try {
            const errorJson = JSON.parse(await err.response.data.text());
            errorMessage = errorJson.message || errorMessage;
          } catch (e) {
            // No hacer nada si no se puede parsear
          }
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      toast.error(errorMessage);
    }
  };

  const clearFilters = () => {
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    setSelectedCustomerId("");
    setSelectedSalespersonId("");
    setSelectedProductId("");
    setSelectedStatus("");
    setCustomerSearchTerm("");
    setProductSearchTerm("");
    setCurrentPage(1);
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(
      customerId === ALL_ITEMS_VALUE ? ALL_ITEMS_VALUE : customerId
    ); // O usa "" para "todos"
    setIsCustomerPopoverOpen(false); // <--- CERRAR POPOVER
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(
      productId === ALL_ITEMS_VALUE ? ALL_ITEMS_VALUE : productId
    ); // O usa "" para "todos"
    setIsProductPopoverOpen(false); // <--- CERRAR POPOVER
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      {" "}
      {/* (1) Contenedor principal flex-col y padding */}
      <PageHeader
        title="Reporte de Ventas Detalladas"
        description="Analiza las transacciones de venta con detalle de líneas, pagos, costos y ganancias."
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
      {/* Sección de Filtros */}
      <Card className="shrink-0">
        {" "}
        {/* (2) shrink-0 para que los filtros no se encojan si la tabla es grande */}
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-base flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            Filtros del Reporte
          </CardTitle>
          <Button
            variant="ghost"
            onClick={clearFilters}
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            <XCircle className="mr-1 h-3 w-3" /> Limpiar
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            {/* Rango de Fechas */}
            <div className="space-y-1">
              <Label
                htmlFor="report-date-range"
                className="text-xs font-medium"
              >
                Rango de Fechas*
              </Label>
              <DatePickerWithRange
                id="report-date-range"
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full h-9 mt-1"
              />
            </div>

            {/* Filtro Cliente */}
            <div className="space-y-1">
              <Label
                htmlFor="customer-filter-trigger"
                className="text-xs font-medium"
              >
                Cliente
              </Label>
              <Popover
                open={isCustomerPopoverOpen}
                onOpenChange={setIsCustomerPopoverOpen}
              >
                <PopoverTrigger asChild id="customer-filter-trigger">
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-9 justify-between font-normal text-xs truncate"
                  >
                    <span className="truncate">
                      {selectedCustomerId !== ALL_ITEMS_VALUE &&
                      customers?.find((c) => c.id === selectedCustomerId)
                        ? `${
                            customers.find((c) => c.id === selectedCustomerId)
                              ?.firstName
                          } ${
                            customers.find((c) => c.id === selectedCustomerId)
                              ?.lastName
                          }`.trim()
                        : "Todos los Clientes"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
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
                          key="all-cust"
                          value={ALL_ITEMS_VALUE}
                          onSelect={() => handleCustomerSelect(ALL_ITEMS_VALUE)}
                        >
                          Todos los Clientes
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

            {/* Filtro Vendedor */}
            <div className="space-y-1">
              <Label
                htmlFor="salesperson-filter"
                className="text-xs font-medium"
              >
                Vendedor
              </Label>
              <Select
                value={selectedSalespersonId}
                onValueChange={(value) =>
                  setSelectedSalespersonId(
                    value === ALL_ITEMS_VALUE ? ALL_ITEMS_VALUE : value
                  )
                }
              >
                <SelectTrigger className="h-9 text-xs" id="salesperson-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_VALUE}>
                    Todos los Vendedores
                  </SelectItem>
                  {isLoadingSalespersons && (
                    <SelectItem value="loading-sp" disabled>
                      Cargando...
                    </SelectItem>
                  )}
                  {salespersons?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Producto */}
            <div className="space-y-1">
              <Label
                htmlFor="product-filter-trigger"
                className="text-xs font-medium"
              >
                Producto
              </Label>
              <Popover
                open={isProductPopoverOpen}
                onOpenChange={setIsProductPopoverOpen}
              >
                <PopoverTrigger asChild id="product-filter-trigger">
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full h-9 justify-between font-normal text-xs truncate"
                  >
                    <span className="truncate">
                      {(selectedProductId !== ALL_ITEMS_VALUE &&
                        products?.find((p) => p.id === selectedProductId)
                          ?.name) ||
                        "Todos los Productos"}
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
                          key="all-prod"
                          value={ALL_ITEMS_VALUE}
                          onSelect={() => handleProductSelect(ALL_ITEMS_VALUE)}
                        >
                          Todos los Productos
                        </CommandItem>
                        {products?.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => handleProductSelect(p.id)}
                          >
                            {p.name}{" "}
                            <span className="text-muted-foreground ml-2">
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

            {/* Filtro Estado Venta */}
            <div className="space-y-1">
              <Label htmlFor="status-filter" className="text-xs font-medium">
                Estado Venta
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value === ALL_ITEMS_VALUE ? "" : value)
                }
              >
                <SelectTrigger className="h-9 text-xs" id="status-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_VALUE}>
                    Todos los Estados
                  </SelectItem>
                  {ALL_SALE_STATUSES_ARRAY.map((s) => (
                    <SelectItem key={s} value={s}>
                      {saleStatusLabels[s] || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Sección de Totales Generales del Reporte */}
      {reportData?.reportGrandTotals && !isLoadingReport && (
        <Card className="mb-4 shrink-0">
          {" "}
          {/* shrink-0 */}
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">
              Totales del Período Filtrado
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
            {/* ... tus divs para mostrar los reportGrandTotals ... */}
            <div>
              <span className="text-muted-foreground">Ventas Totales:</span>
              <strong className="block">
                {reportData.reportGrandTotals.totalSalesCount}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Ingresos Brutos:</span>
              <strong className="block">
                {formatCurrency(reportData.reportGrandTotals.totalRevenue)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Desc. Línea:</span>
              <strong className="block">
                {formatCurrency(
                  reportData.reportGrandTotals.totalAllLineDiscounts
                )}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Desc. General:</span>
              <strong className="block">
                {formatCurrency(
                  reportData.reportGrandTotals.totalOverallDiscounts
                )}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Desc. Neto Total:</span>
              <strong className="block">
                {formatCurrency(reportData.reportGrandTotals.totalNetDiscounts)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Impuestos:</span>
              <strong className="block">
                {formatCurrency(reportData.reportGrandTotals.totalTaxes)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Costo Mercancía:</span>
              <strong className="block">
                {formatCurrency(
                  reportData.reportGrandTotals.totalCostOfGoodsSold
                )}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Ganancia Bruta:</span>
              <strong className="block font-semibold text-green-600">
                {formatCurrency(reportData.reportGrandTotals.totalProfit)}
              </strong>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-base">
              Detalle de Ventas del Período
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table className="sticky top-0 bg-background z-10">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Nº Venta</TableHead>
                    <TableHead className="w-[100px]">Fecha</TableHead>
                    <TableHead className="min-w-[180px]">Cliente</TableHead>
                    <TableHead className="min-w-[150px]">Vendedor</TableHead>
                    <TableHead className="w-[130px]">Estado</TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Subtotal
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Desc. Gral
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Impuestos
                    </TableHead>
                    <TableHead className="text-right min-w-[110px] font-semibold">
                      Total Venta
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Costo
                    </TableHead>
                    <TableHead className="text-right min-w-[100px] font-semibold">
                      Ganancia
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingReport || isFetchingReport ? (
                    [...Array(10)].map((_, i) => (
                      <TableRow key={`skel-sale-report-${i}`}>
                        {[...Array(11)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center text-red-500 py-10"
                      >
                        Error: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : reportData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No se encontraron ventas con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData?.data.map((sale) => (
                      <TableRow key={sale.saleId}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/sales/${sale.saleId}`}
                            className="text-primary hover:underline"
                          >
                            {sale.saleNumber}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {formatDate(sale.saleDate, "dd/MM/yy")}
                        </TableCell>
                        <TableCell
                          className="max-w-[180px] truncate"
                          title={sale.customerName || ""}
                        >
                          {sale.customerName || "Genérico"}
                        </TableCell>
                        <TableCell
                          className="max-w-[150px] truncate"
                          title={sale.salespersonName || ""}
                        >
                          {sale.salespersonName || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              sale.status === PrismaSaleStatus.COMPLETED
                                ? "success"
                                : sale.status === PrismaSaleStatus.CANCELLED
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {saleStatusLabels[sale.status] || sale.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.subTotalAfterLineDiscounts)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.discountOnTotalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.taxTotal)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sale.totalCostOfGoodsSold)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(sale.totalSaleProfit)}
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
      {reportData && reportData.total > 0 && (
        <div className="pt-4 shrink-0">
          {" "}
          {/* (8) shrink-0 */}
          <DataTablePagination
            page={reportData.page}
            totalPages={reportData.totalPages}
            totalRecords={reportData.total}
            limit={reportData.limit}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            isFetching={isFetchingReport}
          />
        </div>
      )}
    </div>
  );
}
