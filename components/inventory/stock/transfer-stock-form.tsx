// components/inventory/stock/transfer-stock-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  ProductBasic,
  InventoryLocationBasic,
  ProductStockInfo,
} from "@/types/inventory.types";
import { InventoryItemStatus } from "@/types/prisma-enums";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";

const transferStockSchema = z.object({
  productId: z.string().min(1, "Debes seleccionar un producto."),
  fromLocationId: z
    .string()
    .min(1, "Debes seleccionar una ubicación de origen."),
  toLocationId: z
    .string()
    .min(1, "Debes seleccionar una ubicación de destino."),
  quantity: z.coerce
    .number()
    .positive("Cantidad debe ser positiva.")
    .optional(), // Opcional, requerido si no es serializado
  imei: z.string().optional().nullable(), // Opcional, requerido si es serializado
  notes: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

// Nota: La validación cruzada en Zod dentro de React Hook Form puede ser un poco compleja de mostrar
// directamente en los campos. Usaremos lógica en el componente.
// Simplificaremos el schema por ahora y manejaremos la lógica en el submit o con `watch`.

// const simplifiedTransferStockSchema = z.object({
//   productId: z.string().min(1, "Producto es requerido."),
//   fromLocationId: z.string().min(1, "Ubicación origen es requerida."),
//   toLocationId: z.string().min(1, "Ubicación destino es requerida."),
//   quantity: z.coerce.number().optional(), // Será positivo si se ingresa
//   imei: z
//     .string()
//     .optional()
//     .transform((val) => (val === "" ? undefined : val)), // Convertir "" a undefined
//   notes: z
//     .string()
//     .max(255)
//     .optional()
//     .nullable()
//     .transform((val) => (val === "" ? null : val)),
// });

// type TransferStockFormValues = z.infer<typeof simplifiedTransferStockSchema>;
type TransferStockFormValues = z.infer<typeof transferStockSchema>;

// Necesitamos una forma de pasar el estado de tracksImei al validador refine o manejarlo en onSubmit
// Por ahora, lo validaremos en onSubmit.

// Para almacenar temporalmente el producto seleccionado para la validación cruzada en Zod
// Esto es un hack. Una mejor manera sería usar el 'context' de Zod o un superRefine.
// O más simple: validar en la función onSubmit ANTES de llamar a la mutación.
// import { useAuthStore } from "@/stores/auth.store"; // Solo para el hack de abajo, no ideal

export function TransferStockForm() {
  const queryClient = useQueryClient();
  const form = useForm<TransferStockFormValues>({
    resolver: zodResolver(transferStockSchema),
    defaultValues: {
      productId: undefined,
      fromLocationId: undefined,
      toLocationId: undefined,
      quantity: undefined, // Se inicializa como undefined
      imei: undefined,
      notes: "",
    },
  });

  const selectedProductId = form.watch("productId");
  const selectedFromLocationId = form.watch("fromLocationId");

  const { data: allProducts, isLoading: isLoadingAllProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["allProductsForTransfer"],
    queryFn: () =>
      apiClient
        .get("/inventory/products?isActive=true&limit=1000")
        .then((res) => res.data.data || res.data),
  });

  const selectedProductInfo = useMemo(() => {
    return allProducts?.find((p) => p.id === selectedProductId);
  }, [allProducts, selectedProductId]);

  const { data: allLocations, isLoading: isLoadingAllLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["allLocationsForTransfer"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  // Query para obtener stock del producto en la ubicación de origen
  const { data: stockInFromLocationData, isLoading: isLoadingStockFrom } =
    useQuery<
      ProductStockInfo,
      Error,
      ProductStockInfo,
      readonly (string | null | undefined)[]
    >({
      queryKey: [
        "stockInFromLocation",
        selectedProductId,
        selectedFromLocationId,
      ],
      queryFn: async () => {
        if (!selectedProductId || !selectedFromLocationId) {
          return { product: null, items: [], totalQuantity: 0 };
        }
        const response = await apiClient.get<ProductStockInfo>(
          `/inventory/stock/product/${selectedProductId}`
        );
        return response.data; // La respuesta completa es ProductStockInfo
      },
      enabled: !!selectedProductId && !!selectedFromLocationId,
      staleTime: 1000 * 10,
    });

  const availableStockForTransfer = useMemo(() => {
    if (
      !stockInFromLocationData ||
      !selectedFromLocationId ||
      !stockInFromLocationData.items
    ) {
      return { items: [], totalQuantity: 0 };
    }
    const filteredItems = stockInFromLocationData.items.filter(
      (item) =>
        item.location?.id === selectedFromLocationId &&
        item.status === InventoryItemStatus.AVAILABLE
    );
    const totalQty = selectedProductInfo?.tracksImei
      ? filteredItems.filter((item) => !!item.imei).length // Para serializados, cantidad de items únicos con IMEI
      : filteredItems.reduce((sum, item) => sum + item.quantity, 0);

    return { items: filteredItems, totalQuantity: totalQty };
  }, [
    stockInFromLocationData,
    selectedFromLocationId,
    selectedProductInfo?.tracksImei,
  ]);

  const availableImeis = useMemo(() => {
    if (selectedProductInfo?.tracksImei && availableStockForTransfer.items) {
      return availableStockForTransfer.items
        .filter(
          (item) =>
            !!item.imei &&
            item.status === InventoryItemStatus.AVAILABLE &&
            item.location?.id === selectedFromLocationId
        ) // Doble chequeo
        .map((item) => item.imei!);
    }
    return [];
  }, [
    selectedProductInfo,
    availableStockForTransfer.items,
    selectedFromLocationId,
  ]);

  const mutation = useMutation<any, Error, TransferStockFormValues>({
    // Ajusta 'any' a tu tipo de respuesta de /transfer
    mutationFn: (data: TransferStockFormValues) => {
      const payload: any = {
        productId: data.productId,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        notes: data.notes,
      };
      if (selectedProductInfo?.tracksImei) {
        payload.imei = data.imei;
        payload.quantity = 1;
      } else {
        payload.quantity = data.quantity;
      }
      console.log("Enviando payload de transferencia:", payload);
      return apiClient.post("/inventory/stock/transfer", payload);
    },
    onSuccess: () => {
      toast.success("Transferencia de stock realizada exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryProductStock", selectedProductId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "stockInFromLocation",
          selectedProductId,
          selectedFromLocationId,
        ],
      });
      form.reset({
        // Resetear a los valores iniciales definidos
        productId: undefined,
        fromLocationId: undefined,
        toLocationId: undefined,
        quantity: undefined,
        imei: undefined,
        notes: "",
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al transferir stock."
      );
    },
  });

  function onSubmit(data: TransferStockFormValues) {
    if (!selectedProductInfo) {
      toast.error("Por favor, selecciona un producto válido primero.");
      return;
    }
    if (data.fromLocationId === data.toLocationId) {
      form.setError("toLocationId", {
        type: "manual",
        message: "Origen y destino no pueden ser iguales.",
      });
      return;
    }

    if (selectedProductInfo.tracksImei) {
      if (!data.imei || data.imei.trim() === "") {
        form.setError("imei", {
          type: "manual",
          message: "IMEI/Serial es requerido.",
        });
        return;
      }
      if (!availableImeis.includes(data.imei)) {
        form.setError("imei", {
          type: "manual",
          message: "IMEI/Serial no disponible en origen.",
        });
        return;
      }
    } else {
      if (
        data.quantity === undefined ||
        data.quantity === null ||
        data.quantity <= 0
      ) {
        form.setError("quantity", {
          type: "manual",
          message: "Cantidad debe ser positiva.",
        });
        return;
      }
      if (data.quantity > availableStockForTransfer.totalQuantity) {
        form.setError("quantity", {
          type: "manual",
          message: `Stock insuficiente. Disponible: ${availableStockForTransfer.totalQuantity}`,
        });
        return;
      }
    }
    mutation.mutate(data); // SOLO UNA LLAMADA A MUTATE
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Producto a Transferir*</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("imei", undefined); // Resetear imei al cambiar producto
                    form.setValue("quantity", undefined); // Resetear quantity
                  }}
                  value={field.value || ""}
                  disabled={isLoadingAllProducts}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un producto..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingAllProducts && (
                      <SelectItem value="loading-prod" disabled>
                        Cargando...
                      </SelectItem>
                    )}
                    {allProducts?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.sku ? `(${p.sku})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedProductInfo && (
            <>
              <FormField
                control={form.control}
                name="fromLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desde Ubicación (Origen)*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoadingAllLocations || !selectedProductId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ubicación origen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingAllLocations && (
                          <SelectItem value="loading-loc" disabled>
                            Cargando...
                          </SelectItem>
                        )}
                        {allLocations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedProductInfo.tracksImei ? (
                <FormField
                  control={form.control}
                  name="imei"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMEI / Número de Serie*</FormLabel>
                      {availableImeis.length > 0 ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={
                            isLoadingStockFrom ||
                            !selectedFromLocationId ||
                            availableImeis.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona IMEI/Serial..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingStockFrom && (
                              <SelectItem value="loading-imei" disabled>
                                Cargando IMEIs...
                              </SelectItem>
                            )}
                            {availableImeis.map((imeiStr) => (
                              <SelectItem key={imeiStr} value={imeiStr}>
                                {imeiStr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="Ingresa IMEI/Serial manualmente"
                          {...field}
                          value={field.value ?? ""}
                          disabled={
                            isLoadingStockFrom || !selectedFromLocationId
                          }
                        />
                      )}
                      {selectedFromLocationId &&
                        !isLoadingStockFrom &&
                        availableStockForTransfer.totalQuantity === 0 && (
                          <FormDescription className="text-orange-600">
                            No hay stock de este producto en la ubicación
                            origen.
                          </FormDescription>
                        )}
                      {selectedFromLocationId &&
                        !isLoadingStockFrom &&
                        availableStockForTransfer.totalQuantity > 0 &&
                        availableImeis.length === 0 && (
                          <FormDescription className="text-orange-600">
                            No hay items serializados específicos en el stock de
                            origen, ingrese IMEI manualmente si conoce alguno.
                          </FormDescription>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                // No serializado
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad a Transferir*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(
                              val === "" ? undefined : parseInt(val, 10)
                            );
                          }}
                          disabled={!selectedFromLocationId}
                        />
                      </FormControl>
                      {selectedFromLocationId && !isLoadingStockFrom && (
                        <FormDescription>
                          Disponible en origen:{" "}
                          {availableStockForTransfer.totalQuantity}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="toLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hacia Ubicación (Destino)*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoadingAllLocations || !selectedProductId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ubicación destino..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingAllLocations && (
                          <SelectItem value="loading-loc-to" disabled>
                            Cargando...
                          </SelectItem>
                        )}
                        {allLocations
                          ?.filter((loc) => loc.id !== selectedFromLocationId)
                          .map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notas adicionales sobre la transferencia..."
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={
              mutation.isPending ||
              !selectedProductId ||
              !selectedFromLocationId ||
              !form.watch("toLocationId")
            }
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Realizar Transferencia
          </Button>
        </form>
      </Form>
    </>
  );
}
