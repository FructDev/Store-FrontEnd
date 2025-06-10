// components/pos/non-serialized-product-to-cart-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  ProductBasic,
  // InventoryLocationBasic,
  // InventoryItem,
  ProductStockInfo,
} from "@/types/inventory.types"; // O tus archivos de tipos
import { InventoryItemStatus } from "@/types/prisma-enums";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ShoppingCart } from "lucide-react"; // ShoppingCart para el botón
import React, { useEffect, useMemo } from "react";

interface NonSerializedProductToCartDialogProps {
  product: ProductBasic | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // onAddToCart ahora solo necesita el producto y la ubicación, la cantidad es 1
  onAddToCart: (
    product: ProductBasic,
    location: { locationId: string; locationName: string }
  ) => void;
}

// Información de stock por ubicación para el producto no serializado
interface LocationStockInfo {
  locationId: string;
  locationName: string;
  availableQuantity: number;
}

// Schema Zod solo para locationId, ya que la cantidad es fija (1)
const selectLocationSchema = z.object({
  locationId: z.string().min(1, "Debe seleccionar una ubicación de origen."),
});

type SelectLocationFormValues = z.infer<typeof selectLocationSchema>;

export function NonSerializedProductToCartDialog({
  product,
  isOpen,
  onOpenChange,
  onAddToCart,
}: NonSerializedProductToCartDialogProps) {
  const { data: productStockInfo, isLoading: isLoadingProductStock } = useQuery<
    ProductStockInfo,
    Error
  >({
    queryKey: ["productAvailableStockForDialog", product?.id],
    queryFn: async () => {
      if (!product?.id)
        throw new Error("ID de producto no disponible para cargar stock.");
      const response = await apiClient.get<ProductStockInfo>(
        `/inventory/stock/product/${product.id}` // Endpoint que devuelve stock detallado
      );
      return response.data;
    },
    enabled: !!product && isOpen, // Solo ejecutar si el diálogo está abierto y hay producto
    staleTime: 1000 * 30, // Cachear por 30 segundos para evitar llamadas repetidas rápidas
  });

  // Calcula y memoiza las ubicaciones con stock disponible para el producto
  const locationsWithStock = useMemo((): LocationStockInfo[] => {
    if (!productStockInfo?.items) return [];

    const locationMap = new Map<string, LocationStockInfo>();
    productStockInfo.items.forEach((item) => {
      if (
        item.status === InventoryItemStatus.AVAILABLE &&
        !item.imei &&
        item.location
      ) {
        const existing = locationMap.get(item.location.id);
        const currentQuantityInLocation = existing
          ? existing.availableQuantity
          : 0;
        locationMap.set(item.location.id, {
          locationId: item.location.id,
          locationName: item.location.name,
          availableQuantity: currentQuantityInLocation + item.quantity,
        });
      }
    });
    return Array.from(locationMap.values()).filter(
      (loc) => loc.availableQuantity > 0
    );
  }, [productStockInfo]);

  const form = useForm<SelectLocationFormValues>({
    resolver: zodResolver(selectLocationSchema),
    defaultValues: {
      locationId: undefined,
    },
  });

  // Efecto para resetear el formulario y preseleccionar ubicación si solo hay una opción
  useEffect(() => {
    if (isOpen && product) {
      let initialLocationId: string | undefined = undefined;
      if (locationsWithStock && locationsWithStock.length === 1) {
        initialLocationId = locationsWithStock[0].locationId;
      }
      form.reset({
        locationId: initialLocationId,
      });
    } else if (!isOpen) {
      // Limpiar el formulario cuando el diálogo se cierra
      form.reset({ locationId: undefined });
    }
  }, [product, isOpen, form, locationsWithStock]); // form.reset es estable, pero RHF recomienda incluir form

  // Función que se ejecuta al enviar el formulario del diálogo
  function onSubmit(data: SelectLocationFormValues) {
    if (!product || !data.locationId) {
      toast.error("Error inesperado: Producto o ubicación no están definidos.");
      return;
    }

    const selectedLocation = locationsWithStock.find(
      (loc) => loc.locationId === data.locationId
    );

    if (!selectedLocation) {
      toast.error("Ubicación seleccionada no es válida o no tiene stock.");
      return;
    }

    // Validar que haya al menos 1 unidad disponible (ya que siempre añadimos 1)
    if (selectedLocation.availableQuantity < 1) {
      form.setError("locationId", {
        type: "manual",
        message: `No hay stock disponible en ${selectedLocation.locationName}.`,
      });
      toast.error(`Stock insuficiente en ${selectedLocation.locationName}.`);
      return;
    }

    // Llama al callback del POSPage para añadir el producto al carrito
    onAddToCart(product, {
      locationId: selectedLocation.locationId,
      locationName: selectedLocation.locationName,
    });

    onOpenChange(false); // Cierra el diálogo después de llamar a onAddToCart
  }

  // No renderizar nada si el diálogo no está abierto o no hay producto
  if (!isOpen || !product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {" "}
        {/* Ancho más ajustado */}
        <DialogHeader>
          <DialogTitle className="text-lg">
            Añadir: <span className="font-semibold">{product.name}</span>
          </DialogTitle>
          <DialogDescription>
            {product.sku && (
              <span className="block text-xs text-muted-foreground">
                SKU: {product.sku}
              </span>
            )}
            Selecciona la ubicación para añadir 1 unidad al carrito.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-1"
          >
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación de Origen*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""} // Controlado por RHF
                    disabled={
                      isLoadingProductStock || locationsWithStock.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue
                          placeholder={
                            isLoadingProductStock
                              ? "Cargando stock..."
                              : locationsWithStock.length === 0
                              ? "Sin stock disponible"
                              : "Selecciona una ubicación..."
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!isLoadingProductStock &&
                        locationsWithStock.length === 0 && (
                          <div className="px-2 py-3 text-center text-sm text-muted-foreground">
                            No hay stock disponible para este producto en
                            ninguna ubicación.
                          </div>
                        )}
                      {locationsWithStock.map((loc) => (
                        <SelectItem
                          key={loc.locationId}
                          value={loc.locationId}
                          disabled={loc.availableQuantity < 1} // Deshabilitar si no hay al menos 1
                        >
                          {loc.locationName} (Disponible:{" "}
                          {loc.availableQuantity})
                          {loc.availableQuantity < 1 && (
                            <span className="text-xs text-destructive ml-2">
                              (Agotado)
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  !form.watch("locationId") || // Deshabilitar si no hay ubicación seleccionada
                  form.formState.isSubmitting ||
                  isLoadingProductStock ||
                  locationsWithStock.length === 0 ||
                  (locationsWithStock.find(
                    (l) => l.locationId === form.getValues("locationId")
                  )?.availableQuantity || 0) < 1 // Si la ubicación seleccionada se quedó sin stock
                }
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <ShoppingCart className="mr-2 h-4 w-4" /> Añadir al Carrito (1
                ud.)
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
