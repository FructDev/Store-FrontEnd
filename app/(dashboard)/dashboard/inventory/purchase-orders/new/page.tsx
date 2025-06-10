// app/(dashboard)/inventory/purchase-orders/new/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/formatters";
// import Link from "next/link";

import { SupplierBasic, ProductBasic } from "@/types/inventory.types"; // Asumiendo estos tipos básicos
import { PurchaseOrder } from "@/types/inventory.types"; // O un tipo específico para la respuesta de creación

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; // Asumiendo que tienes un DatePicker simple
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { Loader2, PlusCircle, Trash2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Schema Zod para una línea de PO
const poLineSchema = z.object({
  productId: z.string().min(1, "Producto es requerido."),
  orderedQuantity: z.coerce.number().positive("Cantidad debe ser > 0."),
  unitCost: z.coerce.number().min(0, "Costo debe ser >= 0."),
});

// Schema Zod principal para el formulario de PO
const createPOFormSchema = z.object({
  supplierId: z.string().min(1, "Proveedor es requerido."),
  orderDate: z.date({ required_error: "Fecha de orden es requerida." }),
  expectedDate: z.date().optional().nullable(),
  notes: z
    .string()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  lines: z
    .array(poLineSchema)
    .min(1, "Debe añadir al menos un producto a la orden."),
});

type CreatePOFormValues = z.infer<typeof createPOFormSchema>;

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<CreatePOFormValues>({
    resolver: zodResolver(createPOFormSchema),
    defaultValues: {
      supplierId: undefined,
      orderDate: new Date(), // Default a hoy
      expectedDate: null,
      notes: "",
      lines: [{ productId: "", orderedQuantity: 1, unitCost: 0 }], // Iniciar con una línea
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  // Fetch para Proveedores
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<
    SupplierBasic[]
  >({
    queryKey: ["allSuppliersForPOForm"],
    queryFn: () =>
      apiClient
        .get("/inventory/suppliers?isActive=true&limit=100")
        .then((res) => res.data.data || res.data),
  });

  // Fetch para Productos (para los selects en las líneas)
  const { data: products, isLoading: isLoadingProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["allProductsForPOLines"],
    // Podrías filtrar por productos que son comprables (no servicios puros, por ejemplo)
    queryFn: () =>
      apiClient
        .get("/inventory/products?isActive=true&limit=1000")
        .then((res) => res.data.data || res.data),
  });

  const createPOMutation = useMutation<
    PurchaseOrder, // Asume que el backend devuelve la PO creada
    Error,
    CreatePOFormValues
  >({
    mutationFn: async (data: CreatePOFormValues) => {
      // Formatear fechas a YYYY-MM-DD si el backend lo espera así, o dejar como Date si Prisma lo maneja
      const payload = {
        ...data,
        orderDate: format(data.orderDate, "yyyy-MM-dd"),
        expectedDate: data.expectedDate
          ? format(data.expectedDate, "yyyy-MM-dd")
          : null,
        lines: data.lines.map((line) => ({
          ...line,
          // Zod con coerce ya convierte quantity y unitCost a number
        })),
      };
      const response = await apiClient.post<PurchaseOrder>(
        "/inventory/purchase-orders",
        payload
      );
      return response.data;
    },
    onSuccess: (createdPO) => {
      toast.success(
        `Orden de Compra #${createdPO.poNumber} creada exitosamente.`
      );
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] }); // Para refrescar la lista
      router.push(`/dashboard/inventory/purchase-orders/${createdPO.id}`); // Ir al detalle de la PO creada
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar el estado del cliente."
      );
      toast.error(errorMessage);
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage
      );
    },
  });

  function onSubmit(data: CreatePOFormValues) {
    console.log("PO Form Data:", data);
    createPOMutation.mutate(data);
  }

  // Calcular totales (esto es solo para visualización, el backend recalculará)
  const watchedLines = form.watch("lines");
  const subTotalPO = useMemo(() => {
    return watchedLines.reduce((acc, line) => {
      const quantity = Number(line.orderedQuantity) || 0;
      const cost = Number(line.unitCost) || 0;
      return acc + quantity * cost;
    }, 0);
  }, [watchedLines]);

  return (
    <>
      <PageHeader
        title="Crear Nueva Orden de Compra"
        description="Completa los detalles para generar una nueva orden a un proveedor."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General de la PO</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Proveedor*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoadingSuppliers}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un proveedor..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingSuppliers && (
                          <SelectItem value="loading" disabled>
                            Cargando...
                          </SelectItem>
                        )}
                        {suppliers?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>{" "}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div></div> {/* Espacio en blanco para alinear con grid de 2 */}
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    {" "}
                    <FormLabel>Fecha de Orden*</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                    />{" "}
                    {/* Asume que DatePicker maneja esto */}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    {" "}
                    <FormLabel>Fecha de Entrega Esperada</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    {" "}
                    <FormLabel>Notas Adicionales</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas internas o para el proveedor..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Líneas de Productos</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ productId: "", orderedQuantity: 1, unitCost: 0 })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto
                </Button>
              </div>
              <FormDescription>
                Añade los productos que deseas ordenar.
              </FormDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay productos en esta orden.
                </p>
              )}
              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-x-4 gap-y-2 items-start border p-3 rounded-md relative"
                >
                  <FormField
                    control={form.control}
                    name={`lines.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="col-span-12 md:col-span-5">
                        {" "}
                        <FormLabel
                          className={
                            index !== 0 ? "sr-only md:not-sr-only" : ""
                          }
                        >
                          Producto*
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoadingProducts}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona producto..." />
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
                    name={`lines.${index}.orderedQuantity`}
                    render={({ field }) => (
                      <FormItem className="col-span-6 md:col-span-2">
                        {" "}
                        <FormLabel
                          className={
                            index !== 0 ? "sr-only md:not-sr-only" : ""
                          }
                        >
                          Cantidad*
                        </FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`lines.${index}.unitCost`}
                    render={({ field }) => (
                      <FormItem className="col-span-6 md:col-span-2">
                        {" "}
                        <FormLabel
                          className={
                            index !== 0 ? "sr-only md:not-sr-only" : ""
                          }
                        >
                          Costo Unit.*
                        </FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-12 md:col-span-2 flex items-end">
                    <p className="text-sm w-full text-right font-medium">
                      Subtotal:{" "}
                      {formatCurrency(
                        (form.getValues(`lines.${index}.orderedQuantity`) ||
                          0) * (form.getValues(`lines.${index}.unitCost`) || 0)
                      )}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-1 flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive/80 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end font-semibold text-lg">
              Total Orden: {formatCurrency(subTotalPO)}
            </CardFooter>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createPOMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createPOMutation.isPending || fields.length === 0}
            >
              {createPOMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" /> Crear Orden de Compra
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
