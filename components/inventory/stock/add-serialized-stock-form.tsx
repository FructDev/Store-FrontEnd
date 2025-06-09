// components/inventory/stock/add-serialized-stock-form.tsx
"use client";
// Similar a AddNonSerializedStockForm, pero con campo IMEI y quantity siempre es 1
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { ProductBasic, InventoryLocationBasic } from "@/types/inventory.types";

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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const addSerializedStockSchema = z.object({
  productId: z.string().min(1, "Debes seleccionar un producto."),
  locationId: z.string().min(1, "Debes seleccionar una ubicación."),
  imei: z
    .string()
    .min(5, "IMEI/Serial es requerido y debe tener al menos 5 caracteres.")
    .max(50), // Ajusta longitud
  costPrice: z.coerce.number().min(0, "Costo no puede ser negativo."),
  condition: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});
type AddSerializedStockValues = z.infer<typeof addSerializedStockSchema>;

export function AddSerializedStockForm() {
  const queryClient = useQueryClient();
  const form = useForm<AddSerializedStockValues>({
    resolver: zodResolver(addSerializedStockSchema),
    defaultValues: {
      productId: undefined,
      locationId: undefined,
      imei: "",
      costPrice: 0,
      condition: "Nuevo",
      notes: "",
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["productsForStockForm", { tracksImei: true }], // Solo productos serializados
    queryFn: () =>
      apiClient
        .get("/inventory/products?tracksImei=true&limit=500&isActive=true")
        .then((res) => res.data.data || res.data),
  });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["locationsForStockForm", { isActive: true }], // Reutiliza la query key si es la misma data
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  const mutation = useMutation({
    mutationFn: (data: AddSerializedStockValues) =>
      apiClient.post("/inventory/stock/add-serialized", data),
    onSuccess: (response) => {
      toast.success(
        `Item serializado ${response.data.imei} añadido exitosamente (ID: ${response.data.id}).`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryProductStock", form.getValues("productId")],
      });
      form.reset();
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Error al añadir item serializado.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    },
  });

  function onSubmit(data: AddSerializedStockValues) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Producto Serializado*</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isLoadingProducts}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingProducts && (
                    <SelectItem value="loading" disabled>
                      Cargando...
                    </SelectItem>
                  )}
                  {products?.map((p) => (
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
        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Ubicación*</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={isLoadingLocations}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ubicación..." />
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
          name="imei"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>IMEI / Número de Serie*</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresa el IMEI o serial único"
                  {...field}
                />
              </FormControl>{" "}
              <FormMessage />{" "}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="costPrice"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Costo Unitario*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              </FormControl>{" "}
              <FormMessage />{" "}
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Condición</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Nuevo, Usado - Grado A"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>{" "}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Notas Adicionales</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas sobre esta entrada de stock..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>{" "}
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Añadir Item Serializado
        </Button>
      </form>
    </Form>
  );
}
