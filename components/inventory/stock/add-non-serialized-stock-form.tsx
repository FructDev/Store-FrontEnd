// components/inventory/stock/add-non-serialized-stock-form.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { ProductBasic, InventoryLocationBasic } from "@/types/inventory.types"; // O tus tipos

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
import { getErrorMessage } from "@/lib/utils/get-error-message";

const addNonSerializedStockSchema = z.object({
  productId: z.string().min(1, "Debes seleccionar un producto."),
  locationId: z.string().min(1, "Debes seleccionar una ubicación."),
  quantity: z.coerce.number().positive("Cantidad debe ser positiva."),
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
type AddNonSerializedStockValues = z.infer<typeof addNonSerializedStockSchema>;

export function AddNonSerializedStockForm() {
  const queryClient = useQueryClient();
  const form = useForm<AddNonSerializedStockValues>({
    resolver: zodResolver(addNonSerializedStockSchema),
    defaultValues: {
      productId: undefined,
      locationId: undefined,
      quantity: 1,
      costPrice: 0,
      condition: "Nuevo",
      notes: "",
    },
  });

  const { data: products, isLoading: isLoadingProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["productsForStockForm", { tracksImei: false }],
    queryFn: () =>
      apiClient
        .get("/inventory/products?tracksImei=false&limit=500&isActive=true")
        .then((res) => res.data.data || res.data),
  });
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["locationsForStockForm", { isActive: true }],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  const mutation = useMutation({
    mutationFn: (data: AddNonSerializedStockValues) =>
      apiClient.post("/inventory/stock/add", data),
    onSuccess: (response) => {
      toast.success(
        `Stock añadido para el producto (Lote ID: ${response.data.id}). Cantidad: ${response.data.quantity}`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] }); // Asumiendo que tienes esta query para alguna vista
      queryClient.invalidateQueries({
        queryKey: ["inventoryProductStock", form.getValues("productId")],
      });
      form.reset();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al añadir stock");
      console.error("Error al anadir a stock", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: AddNonSerializedStockValues) {
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
              <FormLabel>Producto*</FormLabel>
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
                      Cargando productos...
                    </SelectItem>
                  )}
                  {products?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {}
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
                      Cargando ubicaciones...
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
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                {" "}
                <FormLabel>Cantidad a Añadir*</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || 1)
                    }
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
        </div>
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Condición</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Nuevo, Caja Abierta"
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
          Añadir Stock
        </Button>
      </form>
    </Form>
  );
}
