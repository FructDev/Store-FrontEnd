// app/(dashboard)/inventory/stock-levels/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  InventoryItem,
  PaginatedData, // Usaremos PaginatedData<InventoryItem>
  ProductBasic,
  InventoryLocationBasic,
} from "@/types/inventory.types";
import {
  InventoryItemStatus as PrismaInventoryItemStatus,
  // ProductType as PrismaProductType,
} from "@/types/prisma-enums";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { useDebounce } from "@/hooks/use-debounce";
import { Filter, XCircle } from "lucide-react"; // Iconos

// Mapeo para InventoryItemStatus (deberías tenerlo en un lugar central o definirlo aquí)
const itemStatusLabels: Record<PrismaInventoryItemStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
  USED_IN_REPAIR: "Usado en Reparación",
  RETURNED: "Devuelto",
  DAMAGED: "Dañado",
  IN_TRANSIT: "En Tránsito",
  CONSIGNMENT: "Consignación",
  REMOVED: "Eliminado/Ajustado",
};
const ALL_ITEM_STATUSES = Object.values(PrismaInventoryItemStatus);

export default function StockLevelsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(15); // Mostrar más items por página

  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterProductId, setFilterProductId] = useState<string>("all");
  const [filterLocationId, setFilterLocationId] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all"); // 'all' o un valor de PrismaInventoryItemStatus
  const [filterCondition, setFilterCondition] = useState("");
  const debouncedCondition = useDebounce(filterCondition, 500);
  const [filterTracksImei, setFilterTracksImei] = useState<string>("all"); // "all", "true", "false"

  // Fetch para Productos (para el filtro de producto)
  const { data: productsForFilter, isLoading: isLoadingPForFilter } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["allProductsForStockLevelFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/products?isActive=true&limit=1000")
        .then((res) => res.data.data || res.data),
  });

  // Fetch para Ubicaciones (para el filtro de ubicación)
  const { data: locationsForFilter, isLoading: isLoadingLForFilter } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["allLocationsForStockLevelFilter"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  // Fetch Principal para InventoryItems
  const {
    data: paginatedItems,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedData<InventoryItem>, Error>({
    // Usar InventoryItem directamente
    queryKey: [
      "inventoryItemsList",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
      filterProductId,
      filterLocationId,
      filterStatus,
      debouncedCondition,
      filterTracksImei,
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: limitPerPage,
        sortBy: "productName",
        sortOrder: "asc",
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterProductId !== "all") params.productId = filterProductId;
      if (filterLocationId !== "all") params.locationId = filterLocationId;
      if (filterStatus !== "all") params.status = filterStatus;
      if (debouncedCondition) params.condition = debouncedCondition;
      if (filterTracksImei !== "all")
        params.tracksImei = filterTracksImei === "true";

      const response = await apiClient.get("/inventory/stock/items", {
        params,
      });
      // El backend ya debería devolver costPrice como string/number, y product/location anidados
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedItems && currentPage < paginatedItems.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    filterProductId,
    filterLocationId,
    filterStatus,
    debouncedCondition,
    filterTracksImei,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterProductId("all");
    setFilterLocationId("all");
    setFilterStatus("all");
    setFilterCondition("");
    setFilterTracksImei("all");
  };

  return (
    <>
      <PageHeader
        title="Consulta de Niveles de Stock"
        description="Visualiza y filtra todos los ítems de inventario en tus ubicaciones."
        // No hay botón de acción principal aquí, es una vista de consulta
      />

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros Avanzados
          </CardTitle>
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <XCircle className="mr-1 h-4 w-4" /> Limpiar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            <Input
              type="search"
              placeholder="Buscar producto, SKU, IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Select
              value={filterProductId}
              onValueChange={setFilterProductId}
              disabled={isLoadingPForFilter}
            >
              <SelectTrigger className="w-full">
                <span className="truncate">
                  {" "}
                  {/* Clase para truncar texto */}
                  <SelectValue placeholder="Producto..." />
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {" "}
                {/* Permitir scroll en select largo */}
                <SelectItem value="all">Todos los Productos</SelectItem>
                {isLoadingPForFilter && (
                  <SelectItem value="loading-prod" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {productsForFilter?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterLocationId}
              onValueChange={setFilterLocationId}
              disabled={isLoadingLForFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ubicación..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todas Ubicaciones</SelectItem>
                {isLoadingLForFilter && (
                  <SelectItem value="loading-loc" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {locationsForFilter?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado del Ítem..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todos los Estados</SelectItem>
                {ALL_ITEM_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {itemStatusLabels[st] || st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterTracksImei}
              onValueChange={setFilterTracksImei}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Stock..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo Tipo de Stock</SelectItem>
                <SelectItem value="false">Solo No Serializado</SelectItem>
                <SelectItem value="true">Solo Serializado</SelectItem>
              </SelectContent>
            </Select>

            {/* <Input placeholder="Filtrar por Condición..." value={filterCondition} onChange={(e) => setFilterCondition(e.target.value)} /> */}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>IMEI/Serial</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead>Condición</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Costo Unit.</TableHead>
                <TableHead>Ingreso/Creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedItems?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-item-${i}`}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center text-red-500 py-10"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedItems?.data?.length ? (
                paginatedItems.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product?.name || "N/A"}
                    </TableCell>
                    <TableCell>{item.product?.sku || "-"}</TableCell>
                    <TableCell>
                      {item.imei ||
                        (item.product?.tracksImei ? (
                          <span className="text-muted-foreground">N/A</span>
                        ) : (
                          "-"
                        ))}
                    </TableCell>
                    <TableCell>{item.location?.name || "N/A"}</TableCell>
                    <TableCell className="text-center">
                      {item.product?.tracksImei
                        ? item.status === PrismaInventoryItemStatus.AVAILABLE
                          ? 1
                          : 0
                        : item.quantity}
                    </TableCell>
                    <TableCell>{item.condition || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === PrismaInventoryItemStatus.AVAILABLE
                            ? "default"
                            : item.status === PrismaInventoryItemStatus.SOLD
                            ? "secondary"
                            : item.status ===
                                PrismaInventoryItemStatus.REMOVED ||
                              item.status === PrismaInventoryItemStatus.DAMAGED
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          item.status === PrismaInventoryItemStatus.AVAILABLE
                            ? "bg-green-100 text-green-700"
                            : ""
                        }
                      >
                        {itemStatusLabels[
                          item.status as PrismaInventoryItemStatus
                        ] || item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.costPrice)}
                    </TableCell>
                    <TableCell>
                      {formatDate(item.entryDate || item.createdAt, "dd/MM/yy")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    No se encontraron ítems de inventario con los filtros
                    actuales.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedItems &&
        paginatedItems.data &&
        paginatedItems.totalPages > 0 && (
          <DataTablePagination
            page={paginatedItems.page}
            totalPages={paginatedItems.totalPages}
            totalRecords={paginatedItems.total}
            limit={paginatedItems.limit}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            isFetching={isFetching}
          />
        )}
    </>
  );
}
