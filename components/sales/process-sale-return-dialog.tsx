// components/sales/process-sale-return-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { InventoryLocationBasic } from "@/types/inventory.types"; // Ajusta si EnrichedSaleLineItem está en sales.types
import { EnrichedSale, EnrichedSaleLineItem } from "@/types/sales.types";
import { PaymentMethod as PrismaPaymentMethod } from "@/types/prisma-enums";
import { formatCurrency } from "@/lib/utils/formatters";
import { useAuthStore } from "@/stores/auth.store"; // Para métodos de pago aceptados por la tienda

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusCircle, Trash2, CalendarIcon } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format as formatDateFn } from "date-fns"; // Para formatear la fecha de devolución
import { es } from "date-fns/locale";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const paymentMethodLabels: Record<PrismaPaymentMethod, string> = {
  [PrismaPaymentMethod.CASH]: "Efectivo",
  [PrismaPaymentMethod.CARD_CREDIT]: "Tarjeta de Crédito",
  [PrismaPaymentMethod.CARD_DEBIT]: "Tarjeta de Débito",
  [PrismaPaymentMethod.TRANSFER]: "Transferencia Bancaria",
  [PrismaPaymentMethod.MOBILE_WALLET]: "Billetera Móvil (Ej: Yape, Plin)",
  [PrismaPaymentMethod.STORE_CREDIT]: "Crédito de Tienda",
  [PrismaPaymentMethod.OTHER]: "Otro Método",
  // Asegúrate de que todos los valores de tu enum PrismaPaymentMethod
  // tengan una etiqueta correspondiente aquí. Si tienes más o menos, ajusta la lista.
};

const ALL_PAYMENT_METHODS = Object.values(PrismaPaymentMethod);

// --- SCHEMAS ZOD ---
const formReturnLineSchema = z
  .object({
    fieldId: z.string(), // Para useFieldArray key
    saleLineId: z.string(),
    productId: z.string(),
    productName: z.string(),
    maxReturnableQuantity: z.number().min(0),
    unitPrice: z.number(),
    isSelected: z.boolean().default(false),
    returnQuantity: z.coerce
      .number()
      .int("Debe ser entero.")
      .min(0, "No puede ser negativo.")
      .default(0),
    restockLocationId: z.string().optional().nullable(), // Será requerido si isSelected y returnQuantity > 0
    returnedCondition: z
      .string()
      .max(100)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    reason: z
      .string()
      .max(100)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
  })
  .refine(
    (data) => {
      // Si se selecciona y la cantidad a devolver es > 0, la ubicación es requerida
      if (data.isSelected && data.returnQuantity > 0) {
        return !!data.restockLocationId && data.restockLocationId.length > 0;
      }
      return true;
    },
    {
      message: "Ubicación de reingreso es requerida para ítems seleccionados.",
      path: ["restockLocationId"],
    }
  )
  .refine((data) => data.returnQuantity <= data.maxReturnableQuantity, {
    message: "No puedes devolver más de la cantidad máxima permitida.",
    path: ["returnQuantity"],
  });

const formRefundSchema = z.object({
  fieldId: z.string(),
  paymentMethod: z.nativeEnum(PrismaPaymentMethod, {
    required_error: "Método es requerido.",
  }),
  amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
  reference: z
    .string()
    .max(100)
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

const processReturnFormSchema = z.object({
  returnDate: z
    .date()
    .optional()
    .default(() => new Date()),
  reason: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  notes: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  lines: z
    .array(formReturnLineSchema)
    .refine(
      (lines) =>
        lines.some((line) => line.isSelected && line.returnQuantity > 0),
      {
        message:
          "Debes seleccionar al menos un producto y cantidad > 0 para devolver.",
      }
    ),
  refunds: z
    .array(formRefundSchema)
    .min(
      1,
      "Se requiere al menos un método de reembolso si el monto a reembolsar es mayor a cero."
    ),
  // Validación de suma de reembolsos se hará en onSubmit
});

type ProcessReturnFormValues = z.infer<typeof processReturnFormSchema>;

// --- PAYLOAD PARA API ---
interface CreateSaleReturnApiPayload {
  returnDate?: string;
  reason?: string | null;
  notes?: string | null;
  lines: Array<{
    originalSaleLineId: string;
    returnQuantity: number;
    restockLocationId: string;
    returnedCondition?: string | null;
    // reason?: string | null; // Si el backend espera razón por línea
  }>;
  refunds: Array<{
    paymentMethod: PrismaPaymentMethod;
    amount: number;
    reference?: string | null;
    notes?: string | null;
  }>;
}

interface ProcessSaleReturnDialogProps {
  sale: EnrichedSale | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnProcessed: () => void;
}

export function ProcessSaleReturnDialog({
  sale,
  isOpen,
  onOpenChange,
  onReturnProcessed,
}: ProcessSaleReturnDialogProps) {
  // const queryClient = useQueryClient();
  const storeInfo = useAuthStore((state) => state.user?.store);
  const storeAcceptedPaymentMethods =
    storeInfo?.acceptedPaymentMethods || ALL_PAYMENT_METHODS;

  const form = useForm<ProcessReturnFormValues>({
    resolver: zodResolver(processReturnFormSchema),
    defaultValues: {
      returnDate: new Date(),
      reason: "",
      notes: "",
      lines: [],
      refunds: [
        {
          fieldId: crypto.randomUUID(),
          paymentMethod: PrismaPaymentMethod.CASH,
          amount: 0,
          reference: "",
          notes: "",
        },
      ],
    },
  });

  const { fields: lineFields } = useFieldArray({
    control: form.control,
    name: "lines",
    keyName: "fieldId",
  });
  const {
    fields: refundFields,
    append: appendRefund,
    remove: removeRefund,
  } = useFieldArray({
    control: form.control,
    name: "refunds",
    keyName: "fieldId",
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["activeLocationsForReturnRestock"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || []),
  });

  useEffect(() => {
    if (isOpen && sale?.lines) {
      const initialReturnLines = sale.lines
        .map((saleLine: EnrichedSaleLineItem) => {
          // ASUNCIÓN CRÍTICA: EnrichedSaleLineItem tiene 'quantityReturnedByPreviousReturns'
          // Si no, necesitas obtener este dato del backend para la línea de venta.
          const alreadyReturned =
            saleLine.quantityReturnedByPreviousReturns || 0;
          const maxReturnable = saleLine.quantity - alreadyReturned;
          return {
            fieldId: crypto.randomUUID(),
            saleLineId: saleLine.id!,
            productId: saleLine.productId!,
            productName: saleLine.product?.name || "Producto Desconocido",
            maxReturnableQuantity: maxReturnable,
            unitPrice: saleLine.unitPrice, // Ya es número en EnrichedSaleLineItem
            isSelected: false,
            returnQuantity: 0,
            restockLocationId: storeInfo?.defaultReturnLocationId || "", // Usar default de tienda si existe
            returnedCondition: "Vendible",
            reason: null,
          };
        })
        .filter((line) => line.maxReturnableQuantity > 0);

      form.reset({
        returnDate: new Date(),
        reason: "",
        notes: "",
        lines: initialReturnLines,
        refunds: [
          {
            fieldId: crypto.randomUUID(),
            paymentMethod: PrismaPaymentMethod.CASH,
            amount: 0,
            reference: "",
            notes: "",
          },
        ],
      });
    } else if (!isOpen) {
      form.reset({
        returnDate: new Date(),
        reason: "",
        notes: "",
        lines: [],
        refunds: [
          {
            fieldId: crypto.randomUUID(),
            paymentMethod: PrismaPaymentMethod.CASH,
            amount: 0,
            reference: "",
            notes: "",
          },
        ],
      });
    }
  }, [sale, isOpen, form, storeInfo?.defaultReturnLocationId]);

  const watchedReturnLines = form.watch("lines");
  const calculatedRefundAmount = useMemo(() => {
    console.log(
      "Recalculando calculatedRefundAmount con watchedLines:",
      watchedReturnLines
    );
    return (watchedReturnLines || []).reduce((acc, line) => {
      if (line.isSelected && line.returnQuantity > 0) {
        // Asegurarse que line.unitPrice sea un número aquí
        const unitPrice = Number(line.unitPrice) || 0;
        const returnQty = Number(line.returnQuantity) || 0;
        return acc + returnQty * unitPrice;
      }
      return acc;
    }, 0);
  }, [watchedReturnLines]);

  useEffect(() => {
    if (refundFields.length === 1) {
      const currentPaymentAmount = form.getValues("refunds.0.amount");
      const roundedRefundAmount = parseFloat(calculatedRefundAmount.toFixed(2));
      if (currentPaymentAmount !== roundedRefundAmount) {
        form.setValue("refunds.0.amount", roundedRefundAmount, {
          shouldValidate: true,
        });
      }
    } else if (refundFields.length === 0 && calculatedRefundAmount > 0) {
      // Si no hay métodos y se espera un reembolso, añadir uno por defecto
      appendRefund({
        fieldId: crypto.randomUUID(),
        paymentMethod: PrismaPaymentMethod.CASH,
        amount: parseFloat(calculatedRefundAmount.toFixed(2)),
        reference: "",
        notes: "",
      });
    }
  }, [calculatedRefundAmount, refundFields.length, form, appendRefund]);

  const returnMutation = useMutation<
    unknown,
    Error,
    CreateSaleReturnApiPayload
  >({
    mutationFn: async (payload) => {
      if (!sale?.id) throw new Error("ID de venta no disponible.");
      const response = await apiClient.post(
        `/sales/${sale.id}/return`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Devolución procesada exitosamente.");
      onReturnProcessed();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al procesar la devolución"
      );
      console.error("Error al procesar la devolucion", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: ProcessReturnFormValues) {
    if (!sale) return;

    const linesToSubmitApi = data.lines
      .filter(
        (line) =>
          line.isSelected && line.returnQuantity > 0 && line.restockLocationId
      ) // Asegurar que ubicación esté seleccionada
      .map((formLine) => ({
        originalSaleLineId: formLine.saleLineId,
        returnQuantity: formLine.returnQuantity,
        restockLocationId: formLine.restockLocationId!,
        returnedCondition: formLine.returnedCondition,
        // reason: formLine.reason, // Si tu DTO backend espera razón por línea
      }));

    if (linesToSubmitApi.length === 0) {
      toast.error(
        "Debes seleccionar productos, cantidades válidas y ubicación de reingreso para devolver."
      );
      // O usar form.setError en 'lines' para un mensaje más general
      return;
    }

    const totalRefundedByForm = data.refunds.reduce(
      (sum, ref) => sum + (Number(ref.amount) || 0),
      0
    );
    if (Math.abs(totalRefundedByForm - calculatedRefundAmount) > 0.01) {
      toast.error(
        "El monto total del reembolso no coincide con el valor de los ítems devueltos."
      );
      return;
    }

    const payload: CreateSaleReturnApiPayload = {
      returnDate: data.returnDate
        ? formatDateFn(data.returnDate, "yyyy-MM-dd")
        : undefined,
      reason: data.reason,
      notes: data.notes,
      lines: linesToSubmitApi,
      refunds: data.refunds.map((ref) => ({
        paymentMethod: ref.paymentMethod!,
        amount: Number(ref.amount) || 0,
        reference: ref.reference,
        notes: ref.notes,
      })),
    };
    returnMutation.mutate(payload);
  }

  if (!isOpen || !sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* ---- HEADER ---- */}
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>
            Procesar Devolución para Venta #{sale?.saleNumber}
          </DialogTitle>
          <DialogDescription>
            Selecciona productos/cantidades a devolver. El stock se reingresará
            y se procesará el reembolso.
            {/* Corregido: No usar pendingQuantity aquí si no está definido globalmente en este scope */}
          </DialogDescription>
        </DialogHeader>

        {/* ---- FORMULARIO ---- */}
        {/* Solo mostrar el formulario si hay una venta y líneas elegibles o si se permite añadir manualmente (no es el caso aquí) */}
        {sale &&
        sale.lines &&
        (lineFields.length > 0 || !isOpen || form.formState.isDirty) ? ( // Condición para mostrar el form
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-6">
                  {/* Card de Ítems a Devolver */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">
                        Ítems de la Venta Original a Devolver
                      </CardTitle>
                      <CardDescription>
                        Selecciona los ítems y cantidades a devolver. Máximo a
                        devolver por línea: la cantidad originalmente vendida
                        menos devoluciones previas.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lineFields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No hay ítems elegibles para devolución en esta venta
                          (o ya fueron todos devueltos).
                        </p>
                      )}
                      {lineFields.map((lineFieldItem, index) => {
                        // Renombrar item a lineFieldItem para evitar colisión con item de map interno
                        const currentLineValues = form.watch(`lines.${index}`);
                        return (
                          <Card
                            key={lineFieldItem.fieldId}
                            className={cn(
                              "p-4 transition-all",
                              currentLineValues?.isSelected
                                ? "border-primary ring-1 ring-primary shadow-md"
                                : "border"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <FormField
                                control={form.control}
                                name={`lines.${index}.isSelected`}
                                render={({ field }) => (
                                  <FormItem className="flex items-center pt-1.5">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        id={`line-select-${lineFieldItem.fieldId}`}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <label
                                htmlFor={`line-select-${lineFieldItem.fieldId}`}
                                className="flex-1 space-y-1.5 cursor-pointer group"
                              >
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                                  <div className="mb-2 sm:mb-0">
                                    <p className="font-medium text-sm group-hover:text-primary">
                                      {lineFieldItem.productName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Max a devolver:{" "}
                                      {lineFieldItem.maxReturnableQuantity} |
                                      P.Venta Unit:{" "}
                                      {formatCurrency(lineFieldItem.unitPrice)}
                                    </p>
                                  </div>
                                  {currentLineValues?.isSelected && (
                                    <div className="text-sm font-semibold text-right sm:text-left mt-1 sm:mt-0">
                                      Subtotal Devol.:{" "}
                                      {formatCurrency(
                                        (form.watch(
                                          `lines.${index}.returnQuantity`
                                        ) || 0) * lineFieldItem.unitPrice
                                      )}
                                    </div>
                                  )}
                                </div>
                                {currentLineValues?.isSelected && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-4 pt-2 border-t border-dashed mt-2">
                                    <FormField
                                      control={form.control}
                                      name={`lines.${index}.returnQuantity`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">
                                            Cant. a Devolver*
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              min={0}
                                              max={
                                                lineFieldItem.maxReturnableQuantity
                                              }
                                              {...field}
                                              value={field.value ?? ""}
                                              onChange={(e) =>
                                                field.onChange(
                                                  e.target.value === ""
                                                    ? 0
                                                    : parseInt(
                                                        e.target.value,
                                                        10
                                                      )
                                                )
                                              }
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`lines.${index}.restockLocationId`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">
                                            Reingresar a Ubicación*
                                          </FormLabel>
                                          <Select
                                            onValueChange={field.onChange}
                                            value={field.value || ""}
                                            disabled={isLoadingLocations}
                                          >
                                            <FormControl>
                                              <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Ubicación..." />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {isLoadingLocations && (
                                                <SelectItem
                                                  value="loading-loc-return"
                                                  disabled
                                                >
                                                  Cargando...
                                                </SelectItem>
                                              )}
                                              {locations?.map((loc) => (
                                                <SelectItem
                                                  key={loc.id}
                                                  value={loc.id}
                                                >
                                                  {loc.name}
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
                                      name={`lines.${index}.returnedCondition`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-xs">
                                            Condición Ítem Devuelto
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder="Ej: Como Nuevo, Caja Dañada"
                                              {...field}
                                              value={field.value ?? ""}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`lines.${index}.reason`}
                                      render={({ field }) => (
                                        <FormItem className="sm:col-span-full md:col-span-3">
                                          {" "}
                                          {/* Ocupar todo el ancho */}
                                          <FormLabel className="text-xs">
                                            Razón de Devolución (Línea)
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              placeholder="Ej: No le gustó, Defectuoso"
                                              {...field}
                                              value={field.value ?? ""}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                )}
                              </label>
                            </div>
                          </Card>
                        );
                      })}
                      <FormMessage>
                        {form.formState.errors.lines?.message ||
                          form.formState.errors.lines?.root?.message}
                      </FormMessage>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md flex justify-between items-center">
                        Información del Reembolso
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            appendRefund({
                              fieldId: crypto.randomUUID(),
                              paymentMethod: PrismaPaymentMethod.CASH,
                              amount:
                                refundFields.length === 0
                                  ? calculatedRefundAmount
                                  : 0,
                              reference: "",
                              notes: "",
                            })
                          }
                          disabled={
                            refundFields.length >= 2 || returnMutation.isPending
                          }
                        >
                          <PlusCircle className="mr-1 h-3 w-3" /> Añadir Método
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-lg font-semibold text-right mb-3">
                        {" "}
                        Total a Reembolsar:{" "}
                        {formatCurrency(calculatedRefundAmount)}{" "}
                      </div>
                      {refundFields.map((refundItem, index) => (
                        <div
                          key={refundItem.fieldId}
                          className="space-y-3 border p-3 rounded-md bg-muted/30"
                        >
                          <div className="grid grid-cols-[1fr_120px_min-content] gap-2 items-start">
                            <FormField
                              control={form.control}
                              name={`refunds.${index}.paymentMethod`}
                              render={({ field }) => (
                                <FormItem>
                                  {" "}
                                  <FormLabel className="text-xs sr-only">
                                    Método
                                  </FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value || ""}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="h-9 bg-background">
                                        <SelectValue placeholder="Método..." />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {storeAcceptedPaymentMethods
                                        .filter((m) =>
                                          [
                                            PrismaPaymentMethod.CASH,
                                            PrismaPaymentMethod.STORE_CREDIT,
                                            PrismaPaymentMethod.TRANSFER,
                                            PrismaPaymentMethod.OTHER,
                                          ].includes(m)
                                        )
                                        .map((m) => (
                                          <SelectItem key={m} value={m}>
                                            {paymentMethodLabels[m] ||
                                              m.replace("_", " ")}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`refunds.${index}.amount`}
                              render={({ field }) => (
                                <FormItem>
                                  {" "}
                                  <FormLabel className="text-xs sr-only">
                                    Monto
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min={0}
                                      className="h-9 text-right bg-background"
                                      {...field}
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRefund(index)}
                              className="h-9 w-9 text-destructive self-center"
                              disabled={
                                refundFields.length <= 1 ||
                                returnMutation.isPending
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormField
                            control={form.control}
                            name={`refunds.${index}.reference`}
                            render={({ field }) => (
                              <FormItem>
                                {" "}
                                <FormLabel className="text-xs">
                                  Referencia Reembolso
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nro. Transacción, etc."
                                    className="h-8 text-xs"
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`refunds.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                {" "}
                                <FormLabel className="text-xs">
                                  Notas Reembolso
                                </FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={1}
                                    placeholder="Notas..."
                                    className="text-xs"
                                    {...field}
                                    value={field.value ?? ""}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                      <FormMessage>
                        {form.formState.errors.refunds?.message ||
                          form.formState.errors.refunds?.root?.message}
                      </FormMessage>
                    </CardContent>
                  </Card>

                  <FormField
                    control={form.control}
                    name="returnDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col pt-2">
                        {" "}
                        <FormLabel>Fecha de Devolución*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full sm:w-[280px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  formatDateFn(field.value, "PPP", {
                                    locale: es,
                                  })
                                ) : (
                                  <span>Selecciona fecha de devolución</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("2000-01-01")
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>
                          Razón General de la Devolución (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Cliente insatisfecho"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
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
                        <FormLabel>
                          Notas Generales de la Devolución (Internas)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observaciones adicionales sobre la devolución..."
                            {...field}
                            value={field.value ?? ""}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </ScrollArea>

              <DialogFooter className="p-6 pt-4 border-t shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={returnMutation.isPending}
                >
                  {" "}
                  Cancelar{" "}
                </Button>
                <Button
                  type="submit"
                  disabled={
                    returnMutation.isPending ||
                    calculatedRefundAmount <= 0 ||
                    (form.formState.isSubmitted &&
                      !form.formState.isValid &&
                      !form.formState.isValidating)
                  }
                >
                  {returnMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Procesar Devolución
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          // Si pendingQuantity es 0 o no hay venta/líneas elegibles
          <div className="py-4 text-center flex-1 flex flex-col justify-center items-center">
            <p className="text-green-600 font-medium">
              ¡Todas las unidades de esta venta ya han sido devueltas o no hay
              ítems elegibles para devolución!
            </p>
            <DialogFooter className="mt-6 pt-4">
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
