// components/inventory/stock/product-stock-details-dialog.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Product, InventoryItem } from "@/types/inventory.types"; // Asume que InventoryItem tiene 'location' anidado
import { InventoryLocationBasic } from "@/types/settings.types"; // O define un tipo local
import { InventoryItemStatus } from "@/types/prisma-enums"; // O donde tengas tus enums

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns"; // Para formatear fechas
import { es } from "date-fns/locale"; // Para formato en español

// Interfaz para el InventoryItem como lo esperamos del backend (con location anidado)
interface InventoryItemWithDetails
  extends Omit<InventoryItem, "locationId" | "product" | "productId"> {
  location: InventoryLocationBasic | null; // Nombre de la ubicación
  product?: { name: string; sku: string | null; tracksImei: boolean }; // Producto básico
}

interface ProductStockDetailsResponse {
  product: Product | null;
  items: InventoryItemWithDetails[];
  totalQuantity: number; // Total DISPONIBLE
}

interface ProductStockDetailsDialogProps {
  productId: string | null; // ID del producto a mostrar
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (
  amount: string | number | null | undefined,
  currencySymbol = "RD$"
) => {
  if (amount === null || amount === undefined) return "-";
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "-";
  return `${currencySymbol} ${numericAmount.toFixed(2)}`;
};

const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
  } catch (e) {
    return String(dateString); // Fallback
  }
};

export function ProductStockDetailsDialog({
  productId,
  isOpen,
  onOpenChange,
}: ProductStockDetailsDialogProps) {
  const {
    data: stockDetails,
    isLoading,
    isError,
    error,
  } = useQuery<
    ProductStockDetailsResponse,
    Error,
    ProductStockDetailsResponse,
    readonly (string | null)[]
  >({
    // Tipado más explícito para queryKey
    // --- CAMBIO AQUÍ: Todo dentro de un solo objeto --- V V V
    queryKey: ["productStockDetails", productId],
    queryFn: async () => {
      if (!productId) {
        // Esto no debería lanzarse si 'enabled' funciona bien, pero es una buena guarda.
        // O podrías devolver Promise.reject(new Error(...)) o un valor que indique no datos.
        // React Query prefiere que queryFn devuelva una promesa que resuelva o rechace.
        // No lanzar errores directamente aquí si 'enabled' lo maneja.
        // Si enabled es false, queryFn no se ejecuta.
        // Si productId es null y enabled es true por alguna razón, entonces sí es un error.
        console.warn(
          "Product ID es null en queryFn, no se debería ejecutar si 'enabled' está bien."
        );
        return { product: null, items: [], totalQuantity: 0 }; // Devolver data vacía/default o lanzar error
      }
      const response = await apiClient.get(
        `/inventory/stock/product/${productId}`
      );
      return response.data;
    },
    enabled: !!productId && isOpen, // Solo hacer fetch si hay productId y el diálogo está abierto
    staleTime: 1000 * 60 * 1, // 1 minuto de stale time
    // --- FIN CAMBIO --- V V V
  });

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full flex flex-col">
        {" "}
        {/* Ancho adaptable */}
        <SheetHeader className="pr-10">
          {" "}
          {/* Padding para el botón de cerrar */}
          <SheetTitle>
            Detalle de Stock:{" "}
            {isLoading ? (
              <Skeleton className="h-6 w-40 inline-block" />
            ) : (
              stockDetails?.product?.name || "Producto Desconocido"
            )}
          </SheetTitle>
          <SheetDescription>
            <span>
              SKU: {stockDetails?.product?.sku || "-"} | Total Disponible:{" "}
              {isLoading ? (
                <Skeleton className="h-4 w-10 inline-block" />
              ) : (
                stockDetails?.totalQuantity ?? 0
              )}{" "}
              unidades
            </span>
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 pr-2">
          {" "}
          {/* ScrollArea para la tabla si es larga */}
          <div className="py-4">
            {isLoading && (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            )}
            {isError && (
              <p className="text-red-500 text-center py-10">
                Error cargando detalles de stock: {error.message}
              </p>
            )}
            {!isLoading &&
              !isError &&
              (!stockDetails || stockDetails.items.length === 0) && (
                <p className="text-muted-foreground text-center py-10">
                  No hay items de inventario registrados para este producto.
                </p>
              )}
            {!isLoading &&
              !isError &&
              stockDetails &&
              stockDetails.items.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ubicación</TableHead>
                      {stockDetails.product?.tracksImei && (
                        <TableHead>IMEI/Serial</TableHead>
                      )}
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Costo Unit.</TableHead>
                      <TableHead>Condición</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Ingreso</TableHead>
                      <TableHead>Últ. Act.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockDetails.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.location?.name || "N/A"}</TableCell>
                        {stockDetails.product?.tracksImei && (
                          <TableCell>{item.imei || "-"}</TableCell>
                        )}
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.costPrice)}
                        </TableCell>
                        <TableCell>{item.condition || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === InventoryItemStatus.AVAILABLE
                                ? "default"
                                : item.status === InventoryItemStatus.SOLD
                                ? "secondary"
                                : item.status ===
                                  InventoryItemStatus.USED_IN_REPAIR
                                ? "outline"
                                : item.status === InventoryItemStatus.DAMAGED
                                ? "destructive"
                                : item.status === InventoryItemStatus.REMOVED
                                ? "destructive" // Usar 'destructive' para REMOVED
                                : item.status === InventoryItemStatus.RETURNED
                                ? "default" // 'default' para RETURNED, color se añade con className
                                : item.status === InventoryItemStatus.RESERVED
                                ? "outline" // 'outline' para RESERVED
                                : item.status === InventoryItemStatus.IN_TRANSIT
                                ? "outline" // 'outline' para IN_TRANSIT
                                : item.status ===
                                  InventoryItemStatus.CONSIGNMENT
                                ? "secondary" // 'secondary' para CONSIGNMENT
                                : "secondary" // Un default general para otros estados si los hubiera
                            }
                            className={
                              item.status === InventoryItemStatus.AVAILABLE
                                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:text-green-300 dark:bg-green-700/30"
                                : item.status === InventoryItemStatus.RETURNED
                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-700/30"
                                : item.status === InventoryItemStatus.RESERVED
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-700/30"
                                : item.status === InventoryItemStatus.IN_TRANSIT
                                ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-700/30"
                                : // No necesitas clases adicionales si 'destructive' o 'secondary' por defecto ya se ven bien
                                  ""
                            }
                          >
                            {/* Formatear el nombre para mostrarlo más amigable */}
                            {item.status
                              ? item.status
                                  .toString()
                                  .replace(/_/g, " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (l) => l.toUpperCase())
                              : "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(item.entryDate || item.createdAt)}
                        </TableCell>
                        <TableCell>{formatDate(item.updatedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </div>
        </ScrollArea>
        <div className="mt-auto pt-4 border-t">
          {" "}
          {/* Footer del Sheet */}
          <SheetClose asChild>
            <Button type="button" variant="outline" className="w-full">
              Cerrar
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
