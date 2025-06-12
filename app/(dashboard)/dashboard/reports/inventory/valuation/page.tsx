// app/(dashboard)/reports/inventory/valuation/page.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Input } from "@/components/ui/input"; // Si necesitas un input de búsqueda general
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

import {
  Filter,
  XCircle,
  Download,
  ChevronsUpDown,
  // Check,
  // Layers3,
  // TrendingUp,
  // Archive,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
// import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters"; // Asumiendo que tienes este

import {
  FindInventoryReportParams,
  PaginatedStockValuationReport,
  // ReportStockValuationItem,
  ReportStockValuationThreshold,
  StockValuationSortBy,
} from "@/types/reports.types";
import {
  Category,
  Supplier,
  ProductBasic,
  InventoryLocationBasic,
} from "@/types/inventory.types";
import { toast } from "sonner";

const ALL_ITEMS_FILTER_VALUE = "ALL_VALUES"; // Usar string vacío para "Todos"

const stockValuationThresholdLabels: Record<
  ReportStockValuationThreshold,
  string
> = {
  [ReportStockValuationThreshold.ALL_PRODUCTS]:
    "Todos los Productos (incl. stock 0)",
  [ReportStockValuationThreshold.POSITIVE_STOCK_ONLY]:
    "Solo con Stock Positivo (>0)",
};
// const ALL_THRESHOLDS = Object.values(ReportStockValuationThreshold);

const stockValuationSortByLabels: Record<StockValuationSortBy, string> = {
  [StockValuationSortBy.PRODUCT_NAME]: "Nombre Producto",
  [StockValuationSortBy.TOTAL_STOCK_VALUE]: "Valor Total Stock",
  [StockValuationSortBy.CURRENT_STOCK_QUANTITY]: "Cantidad Stock Actual",
};
// const ALL_SORT_BY_OPTIONS = Object.values(StockValuationSortBy);

export default function StockValuationReportPage() {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
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

  const [threshold, setThreshold] = useState<ReportStockValuationThreshold>(
    ReportStockValuationThreshold.POSITIVE_STOCK_ONLY
  );
  const [orderBy, setOrderBy] = useState<StockValuationSortBy>(
    StockValuationSortBy.PRODUCT_NAME
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(25);

  // --- Fetch para Selectores de Filtro ---
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["allActiveLocationsForFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || []),
  });
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["allActiveCategoriesForFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/categories?limit=500")
        .then((res) => res.data.data || []),
  });
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<
    Supplier[]
  >({
    queryKey: ["allActiveSuppliersForFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/suppliers?isActive=true&limit=500")
        .then((res) => res.data.data || []),
  });
  const { data: productsForFilter, isLoading: isLoadingProductsForFilter } =
    useQuery<ProductBasic[]>({
      queryKey: ["allActiveProductsForValuationFilter", debouncedProductSearch],
      queryFn: () =>
        apiClient
          .get(
            `/inventory/products?isActive=true&limit=20${
              debouncedProductSearch ? `&search=${debouncedProductSearch}` : ""
            }`
          )
          .then((res) => res.data.data || []),
      enabled: isProductPopoverOpen, // Solo buscar cuando el popover está abierto
    });

  // --- Query Principal para el Reporte ---
  const queryParams = useMemo(() => {
    const params: FindInventoryReportParams = {
      page: currentPage,
      limit: limitPerPage,
      sortBy: orderBy,
      sortOrder,
      threshold: threshold,
    };
    if (selectedLocationId && selectedLocationId !== ALL_ITEMS_FILTER_VALUE)
      params.locationId = selectedLocationId;
    if (selectedCategoryId && selectedCategoryId !== ALL_ITEMS_FILTER_VALUE)
      params.categoryId = selectedCategoryId;
    if (selectedSupplierId && selectedSupplierId !== ALL_ITEMS_FILTER_VALUE)
      params.supplierId = selectedSupplierId;
    if (selectedProductId && selectedProductId !== ALL_ITEMS_FILTER_VALUE)
      params.productId = selectedProductId;
    return params;
  }, [
    selectedLocationId,
    selectedCategoryId,
    selectedSupplierId,
    selectedProductId,
    threshold,
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
  } = useQuery<PaginatedStockValuationReport, Error>({
    queryKey: ["stockValuationReport", queryParams],
    queryFn: async () => {
      const response = await apiClient.get("/reports/inventory/valuation", {
        params: queryParams,
      });
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [queryParams]);

  const handleDownloadPDF = () =>
    toast.info("TODO: Implementar descarga de PDF para Valorización de Stock.");

  const clearFilters = () => {
    setSelectedLocationId(ALL_ITEMS_FILTER_VALUE);
    setSelectedCategoryId(ALL_ITEMS_FILTER_VALUE);
    setSelectedSupplierId(ALL_ITEMS_FILTER_VALUE);
    setSelectedProductId(ALL_ITEMS_FILTER_VALUE);
    setProductSearchTerm("");
    setThreshold(ReportStockValuationThreshold.POSITIVE_STOCK_ONLY);
    setOrderBy(StockValuationSortBy.PRODUCT_NAME);
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const handleProductSelect = (productIdValue: string) => {
    setSelectedProductId(
      productIdValue === ALL_ITEMS_FILTER_VALUE
        ? ALL_ITEMS_FILTER_VALUE
        : productIdValue
    );
    const product = productsForFilter?.find((p) => p.id === productIdValue);
    setProductSearchTerm(product ? product.name : ""); // Actualizar el input de búsqueda con el nombre
    setIsProductPopoverOpen(false);
  };

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <PageHeader
        title="Reporte de Valorización de Inventario"
        description="Valor actual de tu stock al costo, filtrable por diversos criterios."
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
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="val-location-filter" className="text-xs">
                Ubicación
              </Label>
              <Select
                value={selectedLocationId}
                onValueChange={setSelectedLocationId}
                disabled={isLoadingLocations}
              >
                <SelectTrigger className="h-9 text-xs" id="val-location-filter">
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
              <Label htmlFor="val-category-filter" className="text-xs">
                Categoría
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="h-9 text-xs" id="val-category-filter">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todas</SelectItem>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="val-supplier-filter" className="text-xs">
                Proveedor
              </Label>
              <Select
                value={selectedSupplierId}
                onValueChange={setSelectedSupplierId}
                disabled={isLoadingSuppliers}
              >
                <SelectTrigger className="h-9 text-xs" id="val-supplier-filter">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_FILTER_VALUE}>Todos</SelectItem>
                  {suppliers?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="val-product-filter" className="text-xs">
                Producto Específico
              </Label>
              <Popover
                open={isProductPopoverOpen}
                onOpenChange={setIsProductPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    id="val-product-filter"
                    variant="outline"
                    role="combobox"
                    className="w-full h-9 justify-between font-normal text-xs truncate"
                  >
                    <span className="truncate">
                      {(selectedProductId !== ALL_ITEMS_FILTER_VALUE &&
                        productsForFilter?.find(
                          (p) => p.id === selectedProductId
                        )?.name) ||
                        "Todos"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                >
                  <Command>
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
                          value={ALL_ITEMS_FILTER_VALUE}
                          onSelect={() =>
                            handleProductSelect(ALL_ITEMS_FILTER_VALUE)
                          }
                        >
                          Todos
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
            <div className="xl:col-span-2">
              {" "}
              {/* Agrupar threshold y ordenamiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="val-threshold-filter" className="text-xs">
                    Mostrar Productos
                  </Label>
                  <Select
                    value={threshold}
                    onValueChange={(v) =>
                      setThreshold(v as ReportStockValuationThreshold)
                    }
                  >
                    <SelectTrigger
                      className="h-9 text-xs"
                      id="val-threshold-filter"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value={
                          ReportStockValuationThreshold.POSITIVE_STOCK_ONLY
                        }
                      >
                        {
                          stockValuationThresholdLabels[
                            ReportStockValuationThreshold.POSITIVE_STOCK_ONLY
                          ]
                        }
                      </SelectItem>
                      <SelectItem
                        value={ReportStockValuationThreshold.ALL_PRODUCTS}
                      >
                        {
                          stockValuationThresholdLabels[
                            ReportStockValuationThreshold.ALL_PRODUCTS
                          ]
                        }
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor="val-orderby-filter" className="text-xs">
                      Ordenar Por
                    </Label>
                    <Select
                      value={orderBy}
                      onValueChange={(v) =>
                        setOrderBy(v as StockValuationSortBy)
                      }
                    >
                      <SelectTrigger
                        className="h-9 text-xs"
                        id="val-orderby-filter"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={StockValuationSortBy.PRODUCT_NAME}>
                          {
                            stockValuationSortByLabels[
                              StockValuationSortBy.PRODUCT_NAME
                            ]
                          }
                        </SelectItem>
                        <SelectItem
                          value={StockValuationSortBy.TOTAL_STOCK_VALUE}
                        >
                          {
                            stockValuationSortByLabels[
                              StockValuationSortBy.TOTAL_STOCK_VALUE
                            ]
                          }
                        </SelectItem>
                        <SelectItem
                          value={StockValuationSortBy.CURRENT_STOCK_QUANTITY}
                        >
                          {
                            stockValuationSortByLabels[
                              StockValuationSortBy.CURRENT_STOCK_QUANTITY
                            ]
                          }
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
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData?.reportGrandTotals && !isLoadingReport && (
        <Card className="mb-4 shrink-0">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-base">
              Valorización Total (Según Filtros)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">
                Productos Únicos Listados:
              </span>
              <strong className="block text-lg">
                {reportData.reportGrandTotals.totalUniqueProductsInStock}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">
                Unidades Totales en Stock:
              </span>
              <strong className="block text-lg">
                {reportData.reportGrandTotals.totalStockUnits}
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">
                Valor Total del Stock:
              </span>
              <strong className="block text-lg font-semibold text-green-600">
                {formatCurrency(
                  reportData.reportGrandTotals.totalOverallStockValue
                )}
              </strong>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-base">
              Valorización de Inventario por Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px] sticky left-0 bg-background z-10">
                      Producto
                    </TableHead>
                    <TableHead className="w-[120px]">SKU</TableHead>
                    <TableHead className="min-w-[150px]">Categoría</TableHead>
                    <TableHead className="text-right w-[100px]">
                      Stock Actual
                    </TableHead>
                    <TableHead className="text-right w-[100px]">
                      Costo Usado
                    </TableHead>
                    <TableHead className="text-right w-[140px] font-semibold">
                      Valor Total Stock
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingReport || isFetchingReport ? (
                    [...Array(limitPerPage)].map((_, i) => (
                      <TableRow key={`skel-val-report-${i}`}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-red-500 py-10"
                      >
                        Error: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : reportData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No hay productos para valorizar con los filtros
                        aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData?.data.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell
                          className="font-medium max-w-[250px] truncate sticky left-0 bg-background z-0"
                          title={item.productName}
                        >
                          {item.productName}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground max-w-[100px] truncate"
                          title={item.productSku || ""}
                        >
                          {item.productSku || "N/A"}
                        </TableCell>
                        <TableCell
                          className="max-w-[150px] truncate"
                          title={item.categoryName || ""}
                        >
                          {item.categoryName || "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.currentStockQuantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.costPriceUsed)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(item.totalStockValueByProduct)}
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
