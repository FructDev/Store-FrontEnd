// app/(dashboard)/reports/inventory/low-stock/page.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

import { Filter, XCircle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
// import { formatCurrency } from "@/lib/utils/formatters"; // Si muestras algún valor monetario

import {
  FindInventoryReportParams,
  PaginatedLowStockReport,
  // ReportLowStockItem,
} from "@/types/reports.types";
import {
  Category,
  Supplier,
  InventoryLocationBasic,
} from "@/types/inventory.types";
import { toast } from "sonner";

const ALL_ITEMS_FILTER_VALUE = "__ALL__"; // O un string vacío ""

export default function LowStockReportPage() {
  // --- Estados para Filtros ---
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    ALL_ITEMS_FILTER_VALUE
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(25);

  // --- Fetch para Selectores de Filtro ---
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["allCategoriesForFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/categories?limit=500&isActive=true")
        .then((res) => res.data.data || []),
  });
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<
    Supplier[]
  >({
    queryKey: ["allSuppliersForFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/suppliers?limit=500&isActive=true")
        .then((res) => res.data.data || []),
  });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["allLocationsForFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?limit=500&isActive=true")
        .then((res) => res.data.data || []),
  });

  // --- Query Principal para el Reporte ---
  const queryParams = useMemo(() => {
    const params: FindInventoryReportParams = {
      page: currentPage,
      limit: limitPerPage,
    };
    if (selectedCategoryId !== ALL_ITEMS_FILTER_VALUE)
      params.categoryId = selectedCategoryId;
    if (selectedSupplierId !== ALL_ITEMS_FILTER_VALUE)
      params.supplierId = selectedSupplierId;
    if (selectedLocationId !== ALL_ITEMS_FILTER_VALUE)
      params.locationId = selectedLocationId;
    return params;
  }, [
    selectedCategoryId,
    selectedSupplierId,
    selectedLocationId,
    currentPage,
    limitPerPage,
  ]);

  const {
    data: reportData,
    isLoading: isLoadingReport,
    isFetching: isFetchingReport,
    isError,
    error,
  } = useQuery<PaginatedLowStockReport, Error>({
    queryKey: ["lowStockReport", queryParams],
    queryFn: async () => {
      const response = await apiClient.get("/reports/inventory/low-stock", {
        params: queryParams,
      });
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, selectedSupplierId, selectedLocationId]);

  const handleDownloadPDF = () =>
    toast.info("TODO: Implementar descarga de PDF para Reporte de Stock Bajo.");
  const clearFilters = () => {
    setSelectedCategoryId(ALL_ITEMS_FILTER_VALUE);
    setSelectedSupplierId(ALL_ITEMS_FILTER_VALUE);
    setSelectedLocationId(ALL_ITEMS_FILTER_VALUE);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 space-y-4">
      <PageHeader
        title="Reporte Detallado de Stock Bajo"
        description="Productos no serializados cuyo stock disponible es igual o inferior al nivel de reorden."
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
            <XCircle className="mr-1 h-3 w-3" /> Limpiar Filtros
          </Button>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <Label
                htmlFor="category-filter-lowstock"
                className="text-xs font-medium"
              >
                Categoría
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(v) => setSelectedCategoryId(v)}
                disabled={isLoadingCategories}
              >
                <SelectTrigger
                  className="h-9 text-xs"
                  id="category-filter-lowstock"
                >
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
              <Label
                htmlFor="supplier-filter-lowstock"
                className="text-xs font-medium"
              >
                Proveedor
              </Label>
              <Select
                value={selectedSupplierId}
                onValueChange={(v) => setSelectedSupplierId(v)}
                disabled={isLoadingSuppliers}
              >
                <SelectTrigger
                  className="h-9 text-xs"
                  id="supplier-filter-lowstock"
                >
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
              <Label
                htmlFor="location-filter-lowstock"
                className="text-xs font-medium"
              >
                Ubicación de Stock
              </Label>
              <Select
                value={selectedLocationId}
                onValueChange={(v) => setSelectedLocationId(v)}
                disabled={isLoadingLocations}
              >
                <SelectTrigger
                  className="h-9 text-xs"
                  id="location-filter-lowstock"
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
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Datos */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-3 px-4 shrink-0">
            <CardTitle className="text-base">
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <Table className="sticky top-0 bg-background z-10">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">
                      Producto
                    </TableHead>
                    <TableHead className="min-w-[100px]">SKU</TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Stock Actual
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Nivel Reorden
                    </TableHead>
                    <TableHead className="text-right min-w-[120px]">
                      Stock Ideal
                    </TableHead>
                    <TableHead className="text-right min-w-[120px] font-semibold text-orange-600">
                      Cant. a Pedir
                    </TableHead>
                    <TableHead className="min-w-[150px]">Proveedor</TableHead>
                    <TableHead className="min-w-[150px]">Categoría</TableHead>
                    {/* Columna para Stock por Ubicación solo si no se filtra por ubicación */}
                    {!selectedLocationId && (
                      <TableHead className="min-w-[200px]">
                        Stock por Ubicación
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingReport || isFetchingReport ? (
                    [...Array(limitPerPage)].map((_, i) => (
                      <TableRow key={`skel-lowstock-${i}`}>
                        {[...Array(!selectedLocationId ? 9 : 8)].map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : isError ? (
                    <TableRow>
                      <TableCell
                        colSpan={!selectedLocationId ? 9 : 8}
                        className="text-center text-red-500 py-10"
                      >
                        Error: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : reportData?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={!selectedLocationId ? 9 : 8}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No se encontraron productos con stock bajo para los
                        filtros aplicados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    reportData?.data.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell
                          className="font-medium max-w-[250px] truncate sticky left-0 bg-background z-0"
                          title={item.productName}
                        >
                          {/* Podrías hacer 'item.productName' un enlace al detalle del producto */}
                          {item.productName}
                        </TableCell>
                        <TableCell
                          className="text-muted-foreground max-w-[100px] truncate"
                          title={item.productSku || ""}
                        >
                          {item.productSku || "N/A"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right",
                            item.currentStock <= item.reorderLevel
                              ? "text-destructive font-semibold"
                              : ""
                          )}
                        >
                          {item.currentStock}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.reorderLevel}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.idealStockLevel ?? "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-orange-600">
                          {item.quantityToOrder}
                        </TableCell>
                        <TableCell
                          className="max-w-[150px] truncate"
                          title={item.supplierName || ""}
                        >
                          {item.supplierName || "N/A"}
                        </TableCell>
                        <TableCell
                          className="max-w-[150px] truncate"
                          title={item.categoryName || ""}
                        >
                          {item.categoryName || "N/A"}
                        </TableCell>
                        {!selectedLocationId && (
                          <TableCell className="text-xs max-w-[200px] truncate">
                            {item.stockByLocation &&
                            item.stockByLocation.length > 0
                              ? item.stockByLocation
                                  .map(
                                    (loc) =>
                                      `${loc.locationName}: ${loc.quantityAvailable}`
                                  )
                                  .join("; ")
                              : "N/A"}
                          </TableCell>
                        )}
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
            isFetching={isFetchingReport}
          />
        </div>
      )}
    </div>
  );
}
