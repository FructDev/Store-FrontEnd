// components/inventory/bundles/disassemble-bundle-form.tsx
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
  InventoryItem,
  ProductStockInfo,
} from "@/types/inventory.types";
import {
  ProductType as PrismaProductType,
  InventoryItemStatus,
} from "@/types/prisma-enums";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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

const disassembleBundleSchema = z.object({
  bundleProductId: z.string().min(1, "Debes seleccionar un producto bundle."),
  bundleInventoryItemId: z
    .string()
    .min(
      1,
      "Debes seleccionar el lote/item específico del bundle a desensamblar."
    ),
  quantityToDisassemble: z.coerce
    .number()
    .positive("Cantidad debe ser positiva."),
  targetLocationIdForComponents: z
    .string()
    .min(1, "Ubicación destino de componentes es requerida."),
});
type DisassembleBundleFormValues = z.infer<typeof disassembleBundleSchema>;

export function DisassembleBundleForm() {
  const queryClient = useQueryClient();
  const form = useForm<DisassembleBundleFormValues>({
    resolver: zodResolver(disassembleBundleSchema),
    defaultValues: {
      bundleProductId: undefined,
      bundleInventoryItemId: undefined,
      quantityToDisassemble: 1,
      targetLocationIdForComponents: undefined,
    },
  });

  const selectedBundleProductIdForDisassembly = form.watch("bundleProductId");

  // Productos tipo BUNDLE que podrían tener stock
  const { data: bundleProducts, isLoading: isLoadingBundleProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["bundleProductsForDisassembly"], // Podría reusar 'bundleProductsForAssembly' si la lista es la misma
    queryFn: () =>
      apiClient
        .get(
          `/inventory/products?productType=${PrismaProductType.BUNDLE}&isActive=true&limit=500`
        )
        .then((res) => res.data.data || res.data),
  });

  const {
    data: bundleStockItemsData, // Renombrar para evitar confusión con el map
    isLoading: isLoadingBundleStockItems,
  } = useQuery<
    InventoryItem[], // TQueryFnData: queryFn devuelve un array de InventoryItem
    Error,
    InventoryItem[], // TData
    readonly (string | null | undefined)[] // TQueryKey
  >({
    // <-- Abre el objeto de opciones aquí
    queryKey: [
      "bundleStockItemsForDisassembly",
      selectedBundleProductIdForDisassembly,
    ],
    queryFn: async () => {
      if (!selectedBundleProductIdForDisassembly) {
        return []; // Devolver array vacío si no hay ID
      }
      // Asumimos que la respuesta de este endpoint es ProductStockInfo
      const response = await apiClient.get<ProductStockInfo>(
        `/inventory/stock/product/${selectedBundleProductIdForDisassembly}`
      );
      // Filtrar solo los items AVAILABLE del bundle (usualmente no serializados)
      return response.data.items.filter(
        (item) => item.status === InventoryItemStatus.AVAILABLE && !item.imei
        // && item.productId === selectedBundleProductIdForDisassembly // El endpoint ya filtra por productId
      );
    },
    enabled: !!selectedBundleProductIdForDisassembly,
    // --- Cierra el objeto de opciones aquí --- V V V
  });

  const selectedBundleItemInfo = bundleStockItemsData?.find(
    (item) => item.id === form.watch("bundleInventoryItemId")
  );

  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["locationsForBundleDisassembly"], // Key diferente
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  const mutation = useMutation({
    mutationFn: async (formData: DisassembleBundleFormValues) => {
      // formData tiene todos los campos del form
      const payloadForBackend = {
        bundleInventoryItemId: formData.bundleInventoryItemId,
        quantityToDisassemble: formData.quantityToDisassemble,
        targetLocationIdForComponents: formData.targetLocationIdForComponents,
        // NO incluimos formData.bundleProductId aquí
      };

      console.log("Enviando payload para DESENSAMBLAR:", payloadForBackend);
      return apiClient.post(
        "/inventory/stock/disassemble-bundle",
        payloadForBackend
      );
    },
    onSuccess: () => {
      toast.success(
        "Bundle desensamblado exitosamente. Componentes devueltos al stock."
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
      queryClient.invalidateQueries({
        queryKey: [
          "inventoryProductStock",
          selectedBundleProductIdForDisassembly,
        ],
      });
      // Invalidar stock de componentes también si se conoce cuáles son
      queryClient.invalidateQueries({
        queryKey: [
          "bundleStockItemsForDisassembly",
          selectedBundleProductIdForDisassembly,
        ],
      });
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Error al desensamblar el bundle."
      );
    },
  });

  function onSubmit(data: DisassembleBundleFormValues) {
    if (
      selectedBundleItemInfo &&
      data.quantityToDisassemble > selectedBundleItemInfo.quantity
    ) {
      form.setError("quantityToDisassemble", {
        message: `No puedes desensamblar más de ${selectedBundleItemInfo.quantity} unidades de este lote.`,
      });
      return;
    }
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bundleProductId"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Producto Bundle a Desensamblar*</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("bundleInventoryItemId", undefined);
                }}
                value={field.value || ""}
                disabled={isLoadingBundleProducts}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto bundle..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingBundleProducts && (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  )}
                  {bundleProducts?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>{" "}
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedBundleProductIdForDisassembly && (
          <FormField
            control={form.control}
            name="bundleInventoryItemId"
            render={({ field }) => (
              <FormItem>
                {" "}
                <FormLabel>Lote/Item Específico del Bundle*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={
                    isLoadingBundleStockItems ||
                    !bundleStockItemsData ||
                    bundleStockItemsData.length === 0
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el lote del bundle..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingBundleStockItems && (
                      <SelectItem value="loading" disabled>
                        Cargando lotes...
                      </SelectItem>
                    )}
                    {!isLoadingBundleStockItems &&
                      bundleStockItemsData?.length === 0 && (
                        <SelectItem value="no-items" disabled>
                          No hay stock de este bundle.
                        </SelectItem>
                      )}
                    {bundleStockItemsData?.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        Lote ID: ...{item.id.slice(-6)} (Ubic:{" "}
                        {item.location?.name}, Disp: {item.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>{" "}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {selectedBundleItemInfo && (
          <FormField
            control={form.control}
            name="quantityToDisassemble"
            render={({ field }) => (
              <FormItem>
                {" "}
                <FormLabel>
                  Cantidad a Desensamblar* (Máx:{" "}
                  {selectedBundleItemInfo.quantity})
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={selectedBundleItemInfo.quantity}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 1)
                    }
                  />
                </FormControl>
                <FormMessage />{" "}
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="targetLocationIdForComponents"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Ubicación Destino para Componentes*</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isLoadingLocations}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona ubicación destino..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingLocations && (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  )}
                  {locations?.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>{" "}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            mutation.isPending || !form.getValues("bundleInventoryItemId")
          }
        >
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Desensamblar Bundle
        </Button>
      </form>
    </Form>
  );
}
