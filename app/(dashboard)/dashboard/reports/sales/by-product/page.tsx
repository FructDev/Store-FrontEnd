// app/(dashboard)/reports/sales/by-product/page.tsx
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Filter,
  XCircle,
  Download,
  ChevronsUpDown,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency } from "@/lib/utils/formatters";

import { PaginatedSalesByProductReport } from "@/types/reports.types";
import { Category, Supplier, ProductBasic } from "@/types/inventory.types"; // Para los filtros
import { SalesByProductOrderBy } from "@/types/prisma-enums"; // Ajusta la ruta al DTO del backend si lo necesitas para los valores del enum
import { toast } from "sonner";

const ALL_ITEMS_FILTER_VALUE = "__ALL__"; // O un string vacío

export default function SalesByProductReportPage() {
  // --- Estados para Filtros ---
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedProductId, setSelectedProductId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearch = useDebounce(productSearchTerm, 300);
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);

  const [orderBy, setOrderBy] = useState<SalesByProductOrderBy>(
    SalesByProductOrderBy.QUANTITY_SOLD
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(25);

  // --- Fetch para Selectores de Filtro ---
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["allCategoriesForReportFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/categories?limit=500")
        .then((res) => res.data.data || []),
  });
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<
    Supplier[]
  >({
    queryKey: ["allSuppliersForReportFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/suppliers?limit=500")
        .then((res) => res.data.data || []),
  });
  const { data: productsForFilter, isLoading: isLoadingProductsForFilter } =
    useQuery<ProductBasic[]>({
      queryKey: ["allProductsForSBPreportFilter", debouncedProductSearch],
      queryFn: () =>
        apiClient
          .get(
            `/inventory/products?isActive=true&limit=20${
              debouncedProductSearch ? `&search=${debouncedProductSearch}` : ""
            }`
          )
          .then((res) => res.data.data || []),
      enabled:
        debouncedProductSearch.length > 1 ||
        debouncedProductSearch.length === 0,
    });

  // --- Query Principal para el Reporte ---
  const queryParams = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return null;
    const params: any = {
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate: format(dateRange.to, "yyyy-MM-dd"),
      page: currentPage,
      limit: limitPerPage,
      orderBy: orderBy,
      sortOrder: sortOrder,
    };
    if (selectedCategoryId !== ALL_ITEMS_FILTER_VALUE)
      params.categoryId = selectedCategoryId;
    if (selectedSupplierId !== ALL_ITEMS_FILTER_VALUE)
      params.supplierId = selectedSupplierId;
    if (selectedProductId !== ALL_ITEMS_FILTER_VALUE)
      params.productId = selectedProductId;
    return params;
  }, [
    dateRange,
    selectedCategoryId,
    selectedSupplierId,
    selectedProductId,
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
  } = useQuery<PaginatedSalesByProductReport, Error>({
    queryKey: ["salesByProductReport", queryParams],
    queryFn: async () => {
      if (!queryParams) throw new Error("Rango de fechas es requerido.");
      const response = await apiClient.get("/reports/sales/by-product", {
        params: queryParams,
      });
      return response.data;
    },
    enabled: !!queryParams,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [
    dateRange,
    selectedCategoryId,
    selectedSupplierId,
    selectedProductId,
    orderBy,
    sortOrder,
  ]);

  const handleDownloadPDF = () =>
    toast.info("TODO: Implementar descarga de PDF para Ventas por Producto.");
  const clearFilters = () => {
    /* ... tu lógica para limpiar filtros ... */
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    });
    setSelectedCategoryId(ALL_ITEMS_FILTER_VALUE);
    setSelectedSupplierId(ALL_ITEMS_FILTER_VALUE);
    setSelectedProductId(ALL_ITEMS_FILTER_VALUE);
    setProductSearchTerm("");
    setOrderBy(SalesByProductOrderBy.QUANTITY_SOLD);
    setSortOrder("desc");
    setCurrentPage(1);
  };
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(
      productId === "all" ? ALL_ITEMS_FILTER_VALUE : productId
    );
    setIsProductPopoverOpen(false);
  };

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <PageHeader
        title="Reporte de Ventas por Producto/Servicio"
        description="Analiza el rendimiento de ventas para cada ítem en el período seleccionado."
        actionButton={
          <Button
            onClick={handleDownloadPDF} // Asume que handleDownloadPDF está definido
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
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-base flex items-center">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            Filtros del Reporte
          </CardTitle>
          <Button
            variant="ghost"
            onClick={clearFilters} // Asume que clearFilters está definido
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            <XCircle className="mr-1 h-3 w-3" /> Limpiar Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 items-end">
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

            {/* Filtro Categoría */}
            <div className="space-y-1">
              <Label htmlFor="category-filter" className="text-xs font-medium">
                Categoría
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(value) =>
                  setSelectedCategoryId(
                    value === ALL_ITEMS_FILTER_VALUE
                      ? ALL_ITEMS_FILTER_VALUE
                      : value
                  )
                } // Permite "Todos"
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="h-9 text-xs" id="category-filter">
                  <SelectValue placeholder="Todas las Categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>
                    Todas las Categorías
                  </SelectItem>
                  {isLoadingCategories && (
                    <SelectItem value="loading-cat" disabled>
                      Cargando...
                    </SelectItem>
                  )}
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Proveedor */}
            <div className="space-y-1">
              <Label htmlFor="supplier-filter" className="text-xs font-medium">
                Proveedor
              </Label>
              <Select
                value={selectedSupplierId}
                onValueChange={(value) =>
                  setSelectedSupplierId(
                    value === ALL_ITEMS_FILTER_VALUE
                      ? ALL_ITEMS_FILTER_VALUE
                      : value
                  )
                }
                disabled={isLoadingSuppliers}
              >
                <SelectTrigger className="h-9 text-xs" id="supplier-filter">
                  <SelectValue placeholder="Todos los Proveedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>
                    Todos los Proveedores
                  </SelectItem>
                  {isLoadingSuppliers && (
                    <SelectItem value="loading-sup" disabled>
                      Cargando...
                    </SelectItem>
                  )}
                  {suppliers?.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Producto Específico */}
            <div className="lg:col-span-2 xl:col-span-2 space-y-1">
              {" "}
              {/* Ocupa más espacio */}
              <Label
                htmlFor="product-filter-trigger"
                className="text-xs font-medium"
              >
                Producto Específico
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
                      {(selectedProductId !== ALL_ITEMS_FILTER_VALUE &&
                        productsForFilter?.find(
                          (p) => p.id === selectedProductId
                        )?.name) ||
                        "Todos los Productos"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command
                    filter={(value, search) =>
                      value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                    }
                  >
                    <CommandInput
                      placeholder="Buscar producto..."
                      value={productSearchTerm}
                      onValueChange={setProductSearchTerm}
                      className="text-xs h-8"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isLoadingProductsForFilter
                          ? "Buscando..."
                          : "No encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          key="all-prod-filter"
                          value={ALL_ITEMS_FILTER_VALUE}
                          onSelect={() =>
                            handleProductSelect(ALL_ITEMS_FILTER_VALUE)
                          }
                        >
                          Todos los Productos
                        </CommandItem>
                        {productsForFilter?.map((p) => (
                          <CommandItem
                            key={p.id}
                            value={p.name}
                            onSelect={() => handleProductSelect(p.id)}
                          >
                            {p.name}{" "}
                            {p.sku && (
                              <span className="text-muted-foreground ml-1 text-[10px]">
                                ({p.sku})
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtros de Ordenamiento */}
            <div className="flex items-end space-x-2 xl:col-span-1">
              {" "}
              {/* Ajustar span para que quepa en la misma fila en XL */}
              <div className="flex-1 space-y-1">
                <Label htmlFor="orderby-filter" className="text-xs font-medium">
                  Ordenar Por
                </Label>
                <Select
                  value={orderBy}
                  onValueChange={(v) => setOrderBy(v as SalesByProductOrderBy)}
                >
                  <SelectTrigger className="h-9 text-xs" id="orderby-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SalesByProductOrderBy.QUANTITY_SOLD}>
                      Cant. Vendida
                    </SelectItem>
                    <SelectItem value={SalesByProductOrderBy.REVENUE}>
                      Ingresos
                    </SelectItem>
                    <SelectItem value={SalesByProductOrderBy.PROFIT}>
                      Ganancia
                    </SelectItem>
                    <SelectItem value={SalesByProductOrderBy.PRODUCT_NAME}>
                      Nombre Producto
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

      {/* Sección de Totales Generales del Reporte */}
      {reportData?.reportGrandTotals && !isLoadingReport && (
        <Card className="mb-4 shrink-0">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">
              Totales Globales del Reporte
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Productos Únicos:</span>
              <strong className="block">
                {reportData.reportGrandTotals.totalUniqueProductsSold}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Ítems Vendidos:</span>
              <strong className="block">
                {reportData.reportGrandTotals.totalItemsSold}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Ingresos Totales:</span>
              <strong className="block">
                {formatCurrency(reportData.reportGrandTotals.totalRevenue)}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Costo Total:</span>
              <strong className="block">
                {formatCurrency(
                  reportData.reportGrandTotals.totalCostOfGoodsSold
                )}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Ganancia Total:</span>
              <strong className="block font-semibold text-green-600">
                {formatCurrency(reportData.reportGrandTotals.totalProfit)}
              </strong>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Datos */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-base">
              Detalle de Ventas por Producto/Servicio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table className="sticky top-0 bg-background z-10">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                      Producto/Servicio
                    </TableHead>
                    <TableHead className="min-w-[100px]">SKU</TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Cant. Vendida
                    </TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      P. Venta Prom.
                    </TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Ingresos Totales
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Costo Prom.
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Costo Total
                    </TableHead>
                    <TableHead className="text-right min-w-[110px] font-semibold">
                      Ganancia Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingReport || isFetchingReport ? (
                    [...Array(limitPerPage)].map(
                      (
                        _,
                        i // Mostrar skeletons según el limitPerPage
                      ) => (
                        <TableRow key={`skel-prod-report-${i}`}>
                          {[...Array(8)].map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton className="h-5 w-full" />
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    )
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-red-500 py-10"
                      >
                        Error al cargar el reporte: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : reportData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No se encontraron resultados con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData?.data.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell
                          className="font-medium max-w-[250px] truncate sticky left-0 bg-background z-0"
                          title={item.productName}
                        >
                          {/* Podrías hacer 'item.productId' un enlace al detalle del producto si es un producto de catálogo */}
                          {item.productName}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground max-w-[100px] truncate"
                          title={item.productSku || ""}
                        >
                          {item.productSku || "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.totalQuantitySold}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.averageSellingPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.averageCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.totalCostOfGoodsSold)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.totalProfit)}
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

      {/* Paginación */}
      {reportData && reportData.total > 0 && (
        <div className="pt-4 shrink-0">
          <DataTablePagination
            page={reportData.page}
            totalPages={reportData.totalPages}
            totalRecords={reportData.total}
            limit={reportData.limit}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            isFetching={isFetchingReport} // Pasa isFetching para los controles de paginación
          />
        </div>
      )}
    </div>
  );
}
