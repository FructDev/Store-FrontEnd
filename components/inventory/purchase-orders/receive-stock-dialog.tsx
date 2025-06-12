// components/inventory/purchase-orders/receive-stock-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  PurchaseOrderLine,
  InventoryLocationBasic,
} from "@/types/inventory.types"; // Product para line.product?.tracksImei

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
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils/get-error-message";

interface ReceiveStockDialogProps {
  poId: string;
  line: PurchaseOrderLine | null; // PurchaseOrderLine debe tener product.tracksImei
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onStockReceived: () => void; // Para invalidar query de PO y cerrar
}

const serializedItemSchema = z.object({
  imei: z
    .string()
    .min(5, "IMEI/Serial debe tener al menos 5 caracteres.")
    .max(50),
  condition: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  notes: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

// Schema Zod dinámico
const generateReceiveStockSchema = (
  isSerialized: boolean,
  maxPendingQuantity: number // Cantidad máxima que se puede recibir
) => {
  return z
    .object({
      locationId: z.string().min(1, "Ubicación de destino es requerida."),

      // Este campo 'receivedQuantity' es el que el usuario ingresa para NO SERIALIZADOS
      // o el que se calcula para SERIALIZADOS.
      receivedQuantity: z.coerce
        .number({ invalid_type_error: "Cantidad debe ser un número." })
        .int({ message: "Cantidad debe ser un entero." })
        .min(1, "Cantidad recibida debe ser al menos 1.")
        .max(
          maxPendingQuantity,
          `No puedes recibir más de ${maxPendingQuantity} unidades pendientes.`
        ),

      // 'serializedItems' es el array de objetos para productos serializados
      // y es donde el usuario ingresará los datos de IMEI, condición, notas.
      serializedItems: isSerialized
        ? z
            .array(serializedItemSchema)
            .min(1, "Debes añadir al menos un ítem serializado.")
            .max(
              maxPendingQuantity,
              `No puedes recibir más de ${maxPendingQuantity} ítems serializados.`
            )
        : z.array(serializedItemSchema).optional().default([]), // Para no serializados, será un array vacío o no se usará
    })
    .refine(
      (data) => {
        if (isSerialized) {
          // Para serializados, la cantidad de items en el array DEBE coincidir con receivedQuantity.
          // O, más bien, receivedQuantity SE DERIVA de serializedItems.length.
          // El refine aquí asegura que si hay serializedItems, receivedQuantity coincida con su longitud.
          // Y que serializedItems.length no exceda maxPendingQuantity (ya cubierto por .max en serializedItems).
          return data.serializedItems
            ? data.serializedItems.length === data.receivedQuantity
            : data.receivedQuantity === 0;
        }
        return true; // Para no serializados, la validación de maxQuantity ya está en receivedQuantity
      },
      {
        // Este mensaje se mostrará si el conteo de serializedItems no coincide con quantityReceived
        // (si el usuario edita quantityReceived manualmente para serializados, lo cual no debería poder hacer)
        message:
          "La cantidad de ítems serializados debe coincidir con la Cantidad Recibida.",
        path: ["receivedQuantity"], // O "serializedItems"
      }
    );
};

// Tipos para el formulario (imeis es string) y para el payload (imeis es string[])
type ReceiveStockFormValues = z.infer<
  ReturnType<typeof generateReceiveStockSchema>
>;
// Tendrá: locationId: string, receivedQuantity: number, serializedItems: Array<{imei, condition?, notes?}> | undefined

// Este es el tipo de datos que se envía al backend
interface ReceiveStockApiPayload {
  receivedQuantity: number;
  locationId: string;
  // El backend espera 'serializedItems' con la misma estructura que 'serializedItemSchema'
  serializedItems?: Array<{
    imei: string;
    condition?: string | null;
    notes?: string | null;
  }>;
}

export function ReceiveStockDialog({
  poId,
  line,
  isOpen,
  onOpenChange,
  onStockReceived,
}: ReceiveStockDialogProps) {
  // const queryClient = useQueryClient();
  const isSerializedProduct = !!line?.product?.tracksImei;
  const pendingQuantity = line
    ? line.orderedQuantity - line.receivedQuantity
    : 0;

  const currentSchema = useMemo(
    () => generateReceiveStockSchema(isSerializedProduct, pendingQuantity),
    [isSerializedProduct, pendingQuantity]
  );

  const form = useForm({
    resolver: zodResolver(currentSchema), // currentSchema se genera con useMemo
    defaultValues: {
      locationId: undefined,
      receivedQuantity: undefined, // Para serializados, esto se actualiza desde los items
      serializedItems: [], // Siempre inicializar como array vacío para useFieldArray
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "serializedItems", // Nombre del campo array en tu schema Zod
  });

  useEffect(() => {
    if (isOpen && line) {
      const defaultQtyForNonSerialized = !isSerializedProduct
        ? pendingQuantity > 0
          ? Math.min(1, pendingQuantity)
          : undefined
        : undefined;

      form.reset({
        locationId: undefined, // El usuario siempre selecciona
        receivedQuantity: defaultQtyForNonSerialized,
        // Para serializados, iniciar con un campo si pendingQuantity > 0, o vacío
        serializedItems:
          isSerializedProduct && pendingQuantity > 0
            ? [{ imei: "", condition: "Nuevo en PO", notes: "" }]
            : [],
      });
    }
  }, [line, isOpen, form, isSerializedProduct, pendingQuantity]);

  const watchedSerializedItems = form.watch("serializedItems");
  useEffect(() => {
    if (isSerializedProduct) {
      // La cantidad recibida es la longitud del array de items serializados
      form.setValue("receivedQuantity", watchedSerializedItems?.length || 0, {
        shouldValidate: true,
      });
    }
  }, [watchedSerializedItems, isSerializedProduct, form]);

  // Cargar ubicaciones para el Select
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["allActiveLocationsForReceiving"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=100")
        .then((res) => res.data.data || res.data),
  });

  const mutation = useMutation<unknown, Error, ReceiveStockApiPayload>({
    mutationFn: async (payload: ReceiveStockApiPayload) => {
      // Recibe el payload ya construido
      if (!line) throw new Error("Línea de PO no seleccionada.");
      console.log("Enviando para recibir stock (payload final):", payload);
      const response = await apiClient.post(
        `/inventory/purchase-orders/${poId}/lines/${line.id}/receive`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        `Stock recibido para "${
          line?.product?.name || "producto"
        }" exitosamente.`
      );
      onStockReceived(); // Llama al callback del padre (para invalidar query de PO y cerrar diálogo)
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al recibir stock");
      console.error("Error al resivir stock", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: ReceiveStockFormValues) {
    // data tiene serializedItems: Array<{imei, condition?, notes?}>
    if (!line) return;

    let payloadToSubmit: ReceiveStockApiPayload;

    if (isSerializedProduct) {
      if (!data.serializedItems || data.serializedItems.length === 0) {
        // Zod ya debería haber validado esto con .min(1) en el array
        form.setError("serializedItems", {
          // O un error general
          message: "Debe añadir al menos un ítem serializado.",
        });
        return;
      }
      // La validación refine de Zod ya comparó data.serializedItems.length con data.receivedQuantity
      // y data.receivedQuantity se actualiza por el useEffect.
      // No necesitamos re-validar explícitamente aquí si Zod funciona.

      payloadToSubmit = {
        locationId: data.locationId!,
        receivedQuantity: data.serializedItems.length, // La cantidad es el número de items
        serializedItems: data.serializedItems, // Este es el array de objetos
      };
    } else {
      // No serializado
      if (
        data.receivedQuantity === undefined ||
        data.receivedQuantity === null ||
        data.receivedQuantity <= 0
      ) {
        form.setError("receivedQuantity", {
          message: "Cantidad debe ser positiva.",
        });
        return;
      }
      if (data.receivedQuantity > pendingQuantity) {
        form.setError("receivedQuantity", {
          message: `No puedes recibir más de ${pendingQuantity} unidades.`,
        });
        return;
      }
      payloadToSubmit = {
        locationId: data.locationId!,
        receivedQuantity: data.receivedQuantity,
        // serializedItems será undefined o no se incluirá
      };
    }

    console.log(
      "Datos del formulario VALIDADOS POR ZOD listos para mutación:",
      data
    );
    console.log("Payload que se enviará al backend:", payloadToSubmit);
    mutation.mutate(payloadToSubmit); // Enviar el payload correcto
  }

  if (!line || !isOpen) return null; // No renderizar si no hay línea o no está abierto

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col">
        {" "}
        {/* flex flex-col para que ScrollArea y Footer funcionen bien */}
        <DialogHeader>
          <DialogTitle>Recibir Stock: {line.product?.name}</DialogTitle>
          <DialogDescription>
            Ordenado: {line.orderedQuantity} | Ya Recibido:{" "}
            {line.receivedQuantity} | Pendiente: {pendingQuantity}
          </DialogDescription>
        </DialogHeader>
        {pendingQuantity > 0 ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-2 flex-1 flex flex-col overflow-hidden"
            >
              {/* Contenido del formulario con scroll */}
              <ScrollArea className="flex-1 pr-3 -mr-3">
                {" "}
                {/* Negativo mr para compensar padding del scrollbar */}
                <div className="space-y-4 pr-1">
                  {" "}
                  {/* Padding para el contenido interno */}
                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación de Destino*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoadingLocations}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la ubicación..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingLocations && (
                              <SelectItem value="loading-loc" disabled>
                                Cargando...
                              </SelectItem>
                            )}
                            {locations?.map((loc) => (
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
                  {!isSerializedProduct && (
                    <FormField
                      control={form.control}
                      name="receivedQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad Recibida Hoy*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={pendingQuantity}
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                field.onChange(
                                  val === "" ? undefined : parseInt(val, 10)
                                );
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {isSerializedProduct && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-baseline">
                        <FormLabel>
                          IMEIs / Números de Serie Recibidos*
                        </FormLabel>
                        <FormDescription className="text-xs">
                          (Total: {fields.length})
                        </FormDescription>
                      </div>

                      {/* Campo de referencia para 'receivedQuantity', se actualiza por el useEffect */}
                      <FormField
                        control={form.control}
                        name="receivedQuantity"
                        render={({ field }) => (
                          <FormItem className="sr-only">
                            <FormLabel>Cantidad (Calculada)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3 max-h-[250px] overflow-y-auto border p-2 rounded-md">
                        {" "}
                        {/* Scroll interno */}
                        {fields.length === 0 && (
                          <p className="text-sm text-muted-foreground py-2 text-center">
                            Añade ítems serializados.
                          </p>
                        )}
                        {fields.map((itemField, index) => (
                          <Card
                            key={itemField.id}
                            className="p-3 space-y-3 relative bg-muted/50"
                          >
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive/80 z-10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <p className="text-xs font-medium text-muted-foreground">
                              Ítem Serializado #{index + 1}
                            </p>
                            <FormField
                              control={form.control}
                              name={`serializedItems.${index}.imei`}
                              render={({ field }) => (
                                <FormItem>
                                  {" "}
                                  <FormLabel className="text-xs">
                                    IMEI/Serial*
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ingresa IMEI o N/S"
                                      {...field}
                                    />
                                  </FormControl>{" "}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`serializedItems.${index}.condition`}
                              render={({ field }) => (
                                <FormItem>
                                  {" "}
                                  <FormLabel className="text-xs">
                                    Condición
                                  </FormLabel>
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
                              name={`serializedItems.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  {" "}
                                  <FormLabel className="text-xs">
                                    Notas
                                  </FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={1}
                                      placeholder="Notas para este ítem..."
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                  </FormControl>{" "}
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </Card>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({
                            imei: "",
                            condition: "Nuevo en PO",
                            notes: "",
                          })
                        }
                        disabled={
                          fields.length >= pendingQuantity || mutation.isPending
                        }
                        className="mt-2"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Ítem
                        Serializado
                      </Button>
                      {/* Mensajes de error para el array de Zod */}
                      {form.formState.errors.serializedItems?.root && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.serializedItems.root.message}
                        </p>
                      )}
                      {form.formState.errors.receivedQuantity && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {form.formState.errors.receivedQuantity.message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>{" "}
              {/* Fin ScrollArea principal del formulario */}
              <DialogFooter className="pt-4 border-t mt-auto">
                {" "}
                {/* mt-auto para empujar al fondo si hay espacio */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={mutation.isPending}
                >
                  {" "}
                  Cancelar{" "}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirmar Recepción
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="py-4 text-center">
            <p className="text-green-600 font-medium">
              ¡Todas las unidades de esta línea ya han sido recibidas!
            </p>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
