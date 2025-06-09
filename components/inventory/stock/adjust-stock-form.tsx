// components/inventory/stock/adjust-stock-form.tsx
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
  Product,
} from "@/types/inventory.types"; // Asegúrate que InventoryItem esté aquí
import { InventoryItemStatus } from "@/types/prisma-enums"; // Asumiendo que tienes este enum

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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const adjustmentReasons = [
  "Conteo físico - Excedente",
  "Conteo físico - Faltante",
  "Producto dañado/descartado",
  "Producto encontrado/recuperado",
  "Transferencia interna (corrección)",
  "Consumo interno/Muestra",
  "Vencimiento/Obsolescencia",
  "Otro (especificar en notas)",
];

const adjustStockSchema = z.object({
  productId: z.string().min(1, "Debes seleccionar un producto."),
  locationId: z.string().min(1, "Debes seleccionar una ubicación."),
  quantityChange: z.coerce
    .number()
    .int({ message: "Cantidad debe ser un entero." })
    .refine((val) => val !== 0, { message: "El cambio no puede ser cero." }),
  reason: z.string().min(3, "El motivo es requerido.").max(100),
  notes: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});
type AdjustStockFormValues = z.infer<typeof adjustStockSchema>;

// Interfaz para la respuesta de /inventory/stock/product/:productId
interface ProductStockInfo {
  product: Product | null;
  items: (InventoryItem & { location: InventoryLocationBasic | null })[]; // Asumimos que items tiene la ubicación
  totalQuantity: number;
}

export function AdjustStockForm() {
  const queryClient = useQueryClient();

  const form = useForm<AdjustStockFormValues>({
    resolver: zodResolver(adjustStockSchema),
    defaultValues: {
      productId: undefined,
      locationId: undefined,
      quantityChange: 0,
      reason: "",
      notes: "",
    },
  });

  const selectedProductId = form.watch("productId");
  const selectedLocationId = form.watch("locationId");

  // Productos NO serializados
  const { data: products, isLoading: isLoadingProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["productsForStockForm", { tracksImei: false, isActive: true }],
    queryFn: () =>
      apiClient
        .get("/inventory/products?tracksImei=false&isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  // Ubicaciones activas
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["locationsForStockForm", { isActive: true }],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  // --- IMPLEMENTACIÓN DEL TODO: Cargar stock actual del producto/ubicación ---
  // Query para Cargar stock actual del producto/ubicación
  const { data: currentProductStockInfo, isLoading: isLoadingCurrentStock } =
    useQuery<
      ProductStockInfo,
      Error,
      ProductStockInfo, // TData (lo que devuelve queryFn)
      readonly (string | null | undefined)[] // TQueryKey
    >({
      // <-- Abre el objeto de opciones aquí
      queryKey: [
        // Query key depende del producto y ubicación seleccionados
        "currentProductStockForAdjustment",
        selectedProductId,
        selectedLocationId,
      ],
      queryFn: async () => {
        // El 'enabled' de abajo previene que esto se ejecute si los IDs no están
        if (!selectedProductId || !selectedLocationId) {
          // Este console.warn no debería ejecutarse si 'enabled' funciona bien.
          console.warn(
            "currentProductStockForAdjustment: ProductID o LocationID es nulo en queryFn, aunque 'enabled' debería prevenir esto."
          );
          // Devolver una estructura que no cause error o lanzar un error específico si 'enabled' fallara.
          // Como 'enabled' lo controla, podemos asumir que si queryFn se ejecuta, los IDs son válidos.
          return { product: null, items: [], totalQuantity: 0 }; // O lanzar un error
        }
        const response = await apiClient.get<ProductStockInfo>(
          `/inventory/stock/product/${selectedProductId}`
        );
        return response.data;
      },
      // Habilitar la query solo si ambos, producto y ubicación, están seleccionados
      enabled: !!selectedProductId && !!selectedLocationId,
      staleTime: 1000 * 30, // Opcional: cuánto tiempo considerar los datos frescos (30s)
      // --- Cierra el objeto de opciones aquí --- V V V
    });

  // Encontrar el item específico o el stock total en la ubicación seleccionada
  let currentStockInLocation: number | string = "N/A";
  if (currentProductStockInfo && selectedLocationId) {
    const itemsInSelectedLocation = currentProductStockInfo.items.filter(
      (item) =>
        item.location?.id === selectedLocationId &&
        item.status === InventoryItemStatus.AVAILABLE &&
        !item.imei
    );
    // Para no serializados, sumamos las cantidades de los lotes en esa ubicación
    // (Asumiendo que adjustStock trabaja sobre un concepto de "stock total no serializado en ubicación")
    // Si tu `adjustStock` del backend espera un `inventoryItemId` específico para no serializados,
    // esta lógica necesitaría ser más compleja (ej. un selector de lote si hay varios).
    // Por ahora, sumamos todo el stock no serializado del producto en esa ubicación.
    const totalQuantityInLocation = itemsInSelectedLocation.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    currentStockInLocation = totalQuantityInLocation;
  }
  // --- FIN IMPLEMENTACIÓN DEL TODO ---

  const mutation = useMutation({
    mutationFn: (data: AdjustStockFormValues) =>
      apiClient.post("/inventory/stock/adjust", data),
    onSuccess: (response: any) => {
      const productName =
        products?.find((p) => p.id === form.getValues("productId"))?.name ||
        "Producto";
      const locationName =
        locations?.find((l) => l.id === form.getValues("locationId"))?.name ||
        "Ubicación";
      toast.success(
        `Stock de "${productName}" en "${locationName}" ajustado en ${form.getValues(
          "quantityChange"
        )} unidades.`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] }); // Clave genérica
      queryClient.invalidateQueries({
        queryKey: ["inventoryProductStock", form.getValues("productId")],
      }); // Para vista detallada de stock
      queryClient.invalidateQueries({
        queryKey: [
          "currentProductStockForAdjustment",
          form.getValues("productId"),
          form.getValues("locationId"),
        ],
      }); // Para refrescar el stock actual mostrado
      form.reset();
      // setSelectedProductId(undefined); // form.reset() debería limpiar los campos del form
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Error al ajustar stock.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    },
  });

  function onSubmit(data: AdjustStockFormValues) {
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
              <FormLabel>Producto (No Serializado)*</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // setSelectedProductId(value); // No es necesario si usamos form.watch("productId")
                }}
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

        {/* Mostrar Stock Actual */}
        {selectedProductId && selectedLocationId && (
          <div className="p-3 border rounded-md bg-accent/50 text-sm">
            <p className="text-muted-foreground">
              Stock actual (sistema) del producto seleccionado en esta
              ubicación:
              <span className="font-semibold text-foreground ml-1">
                {isLoadingCurrentStock ? "Cargando..." : currentStockInLocation}
              </span>
              {typeof currentStockInLocation === "number" && " unidades"}
            </p>
          </div>
        )}

        <FormField
          control={form.control}
          name="quantityChange"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Cambio en Cantidad*</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Ej: 5 (añadir) o -2 (quitar)"
                  {...field}
                  value={
                    field.value === undefined || field.value === null
                      ? ""
                      : String(field.value)
                  } // Para manejar 0
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : parseInt(val, 10)); // Enviar undefined si está vacío para que Zod lo maneje
                  }}
                />
              </FormControl>
              <FormDescription>
                Positivo para añadir, negativo para quitar. No puede ser cero.
              </FormDescription>
              <FormMessage />{" "}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              {" "}
              <FormLabel>Motivo del Ajuste*</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un motivo..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {adjustmentReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Detalles sobre el ajuste..."
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
          Aplicar Ajuste
        </Button>
      </form>
    </Form>
  );
}
