// components/inventory/bundles/assemble-bundle-form.tsx
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
  Product,
} from "@/types/inventory.types";
import { ProductType as PrismaProductType } from "@/types/prisma-enums";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const assembleBundleSchema = z
  .object({
    bundleProductId: z.string().min(1, "Debes seleccionar un producto bundle."),
    quantityToAssemble: z.coerce
      .number()
      .positive("Cantidad debe ser positiva."),
    // El backend toma componentSourceLocationId del DTO
    componentSourceLocationId: z
      .string()
      .min(1, "Ubicación de componentes es requerida."),
    targetLocationId: z
      .string()
      .min(1, "Ubicación destino del bundle es requerida."),
  })
  .refine((data) => data.componentSourceLocationId !== data.targetLocationId, {
    message:
      "Ubicación de componentes y destino no pueden ser la misma para este tipo de operación simple.",
    path: ["targetLocationId"], // O path general
  }); // Simplificación, el backend podría permitirlo si el bundle se "crea" en la misma ubicación.

type AssembleBundleFormValues = z.infer<typeof assembleBundleSchema>;

export function AssembleBundleForm() {
  const queryClient = useQueryClient();
  const form = useForm<AssembleBundleFormValues>({
    resolver: zodResolver(assembleBundleSchema),
    defaultValues: {
      bundleProductId: undefined,
      quantityToAssemble: 1,
      componentSourceLocationId: undefined,
      targetLocationId: undefined,
    },
  });

  const selectedBundleProductId = form.watch("bundleProductId");

  // Productos tipo BUNDLE
  const { data: bundleProducts, isLoading: isLoadingBundleProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["bundleProductsForAssembly"],
    queryFn: () =>
      apiClient
        .get(
          `/inventory/products?productType=${PrismaProductType.BUNDLE}&isActive=true&limit=500`
        )
        .then((res) => res.data.data || res.data),
  });

  // Todas las ubicaciones activas (para origen de componentes y destino de bundles)
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["locationsForBundleAssembly"], // Diferente key que en otros forms si es necesario
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  const { data: selectedBundleDetails, isLoading: isLoadingBundleDetails } =
    useQuery<
      Product | null, // TQueryFnData: queryFn puede devolver Product o null
      Error, // TError
      Product | null, // TData: lo que finalmente estará en 'data'
      readonly (string | null | undefined)[] // TQueryKey
    >({
      // <-- Abre el objeto de opciones aquí
      queryKey: ["selectedBundleDetailsForAssembly", selectedBundleProductId],
      queryFn: async () => {
        if (!selectedBundleProductId) {
          // Si enabled es false, esto no se ejecuta.
          // Si se ejecuta y selectedBundleProductId es falsy, devolvemos null.
          return null;
        }
        const response = await apiClient.get<Product>(
          `/inventory/products/${selectedBundleProductId}`
        );
        return response.data;
      },
      enabled: !!selectedBundleProductId, // Solo hacer fetch si hay selectedBundleProductId
      // --- Cierra el objeto de opciones aquí --- V V V
    });

  const mutation = useMutation({
    mutationFn: (data: AssembleBundleFormValues) =>
      apiClient.post("/inventory/stock/assemble-bundle", data),
    onSuccess: () => {
      const bundleName =
        bundleProducts?.find((p) => p.id === form.getValues("bundleProductId"))
          ?.name || "Bundle";
      toast.success(`${bundleName} ensamblado(s) exitosamente.`);
      queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryProductStock", form.getValues("bundleProductId")],
      });
      // Invalidar stock de componentes también
      selectedBundleDetails?.bundleComponents?.forEach((comp) => {
        queryClient.invalidateQueries({
          queryKey: ["inventoryProductStock", comp.componentProductId],
        });
      });
      form.reset();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al crear cliente");
      console.error("Create customer error:", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: AssembleBundleFormValues) {
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
              <FormLabel>Producto Bundle a Ensamblar*</FormLabel>
              <Select
                onValueChange={field.onChange}
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

        {selectedBundleProductId && selectedBundleDetails && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">
                Componentes Requeridos (por unidad de Bundle)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBundleDetails && <p>Cargando componentes...</p>}
              {selectedBundleDetails.bundleComponents &&
              selectedBundleDetails.bundleComponents.length > 0 ? (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {selectedBundleDetails.bundleComponents.map((comp) => (
                    <li key={comp.componentProductId}>
                      {comp.componentProduct?.name ||
                        `ID: ${comp.componentProductId}`}{" "}
                      (SKU: {comp.componentProduct?.sku || "N/A"}) - Cantidad:{" "}
                      {comp.quantity}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este bundle no tiene componentes definidos.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="quantityToAssemble"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Cantidad de Bundles a Ensamblar*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
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

        <FormField
          control={form.control}
          name="componentSourceLocationId"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Ubicación Origen de Componentes*</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isLoadingLocations}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona ubicación de componentes..." />
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

        <FormField
          control={form.control}
          name="targetLocationId"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Ubicación Destino de Bundles Ensamblados*</FormLabel>
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
          disabled={mutation.isPending || !selectedBundleProductId}
        >
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Ensamblar Bundles
        </Button>
      </form>
    </Form>
  );
}
