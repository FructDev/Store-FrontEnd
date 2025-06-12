// components/repairs/facture-repair-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { RepairOrder } from "@/types/repairs.types"; // Asume que Sale está en repairs.types o importarlo de sales.types
import { SaleFromAPI as Sale } from "@/types/sales.types";
import {
  PaymentMethod,
  PaymentMethod as PrismaPaymentMethod,
} from "@/types/prisma-enums";
// import { useAuthStore } from "@/stores/auth.store";

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
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useMemo } from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getErrorMessage } from "@/lib/utils/get-error-message";
import { useStoreSettings } from "@/hooks/use-store-settings";

const paymentMethodLabels: Record<PrismaPaymentMethod, string> = {
  CASH: "Efectivo",
  CARD_CREDIT: "Tarjeta Crédito",
  CARD_DEBIT: "Tarjeta Débito",
  TRANSFER: "Transferencia",
  MOBILE_WALLET: "Billetera Móvil",
  STORE_CREDIT: "Crédito Tienda",
  OTHER: "Otro",
};
// Schema para un item de pago en el formulario
const factureRepairPaymentFormSchema = z.object({
  fieldId: z.string(), // Para useFieldArray
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
  cardLast4: z
    .string()
    .max(4)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  // Añadir más campos si tu CreateSalePaymentDto del backend los tiene
});

// Schema principal para el formulario de facturación de reparación
const factureRepairFormSchema = z
  .object({
    payments: z
      .array(factureRepairPaymentFormSchema)
      .min(1, "Se requiere al menos un método de pago."),
    notes: z
      .string()
      .max(500, "Máx 500 caracteres")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    ncf: z
      .string()
      .max(20)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)), // Si quieres ingresar NCF aquí
    // customerId se tomará del repairOrder
    // El monto total a pagar se pasará como prop y se usará para validar la suma de los pagos
  })
  .refine((data) => {
    console.log(typeof data);
    // La validación de que la suma de pagos cubra el total se hará en onSubmit
    return true;
  });

type FactureRepairFormValues = z.infer<typeof factureRepairFormSchema>;

interface FactureRepairDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  repairOrderData: RepairOrder | null; // La orden de reparación completa
  onSuccess: (createdSale: Sale) => void; // Callback con la venta creada
}

const ALL_PAYMENT_METHODS = Object.values(PrismaPaymentMethod);

export function FactureRepairDialog({
  isOpen,
  onOpenChange,
  repairOrderData,
  onSuccess,
}: FactureRepairDialogProps) {
  const { data: storeInfo } = useStoreSettings();
  // const storeInfo = useAuthStore((state) => state.user?.store);
  const storeAcceptedPaymentMethods =
    storeInfo?.acceptedPaymentMethods || ALL_PAYMENT_METHODS;

  const totalAmountToPay = useMemo(() => {
    return Number(
      repairOrderData?.totalRepairAmount || repairOrderData?.quotedAmount || 0
    );
  }, [repairOrderData]);

  const form = useForm<FactureRepairFormValues>({
    resolver: zodResolver(factureRepairFormSchema),
    defaultValues: {
      payments: [
        {
          fieldId: crypto.randomUUID(),
          paymentMethod: PrismaPaymentMethod.CASH,
          amount: totalAmountToPay > 0 ? totalAmountToPay : 0,
          reference: "",
          notes: "",
        },
      ],
      notes: `Factura de Reparación #${repairOrderData?.repairNumber || ""}`,
      ncf: "",
    },
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
    // replace: replacePayments,
  } = useFieldArray({
    control: form.control,
    name: "payments",
    keyName: "fieldId",
  });

  // Resetear y poblar el formulario cuando el diálogo se abre o los datos de la reparación cambian
  useEffect(() => {
    if (isOpen && repairOrderData) {
      const amountToPay = Number(
        repairOrderData.totalRepairAmount || repairOrderData.quotedAmount || 0
      );
      form.reset({
        payments: [
          {
            fieldId: crypto.randomUUID(),
            paymentMethod: storeAcceptedPaymentMethods.includes(
              PrismaPaymentMethod.CASH
            )
              ? PrismaPaymentMethod.CASH
              : storeAcceptedPaymentMethods[0],
            amount: amountToPay > 0 ? parseFloat(amountToPay.toFixed(2)) : 0,
            reference: "",
            notes: "",
          },
        ],
        notes: `Factura por Reparación #${repairOrderData.repairNumber}`,
        ncf: repairOrderData.customer?.rnc || "", // Pre-llenar con RNC del cliente si existe
      });
    }
  }, [isOpen, repairOrderData, form, storeAcceptedPaymentMethods]);

  const watchedPayments = form.watch("payments");
  const totalPaidInForm = useMemo(() => {
    return watchedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [watchedPayments]);

  const factureRepairMutation = useMutation<
    Sale, // El backend devuelve la Venta creada
    Error,
    // El payload que espera el backend CreateSaleFromRepairDto
    {
      payments: Array<{
        paymentMethod: PrismaPaymentMethod;
        amount: number;
        reference?: string | null;
        notes?: string | null;
        cardLast4?: string | null;
        amountTendered?: number | null /*...otros campos de pago...*/;
      }>;
      notes?: string | null;
      ncf?: string | null;
      customerId?: string | null;
    }
  >({
    mutationFn: async (payload) => {
      if (!repairOrderData?.id)
        throw new Error("ID de orden de reparación no disponible.");
      console.log("Enviando payload para facturar reparación:", payload);
      const response = await apiClient.post<Sale>(
        `/repairs/${repairOrderData.id}/bill`,
        payload
      );
      return response.data;
    },
    onSuccess: (createdSale) => {
      toast.success(
        `Venta #${createdSale.saleNumber} creada exitosamente para la reparación.`
      );
      onSuccess(createdSale); // Llama al callback (refresca datos de reparación, redirige a venta, etc.)
      onOpenChange(false); // Cierra este diálogo
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al guardar el proveedor"
      );
      console.error(
        "Error al guardar el proveedor. Inténtalo de nuevo.",
        error || errorMessage
      );
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: FactureRepairFormValues) {
    if (!repairOrderData) return;

    const amountToPay = Number(
      repairOrderData.totalRepairAmount || repairOrderData.quotedAmount || 0
    );
    const currentTotalPaid = data.payments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    if (currentTotalPaid < amountToPay) {
      toast.error(
        `El monto pagado (${formatCurrency(
          currentTotalPaid
        )}) es menor al total de la reparación (${formatCurrency(
          amountToPay
        )}).`
      );
      form.setError("payments.0.amount", { message: "Monto insuficiente." }); // O un error general
      return;
    }

    const payload = {
      payments: data.payments.map((p) => ({
        paymentMethod: p.paymentMethod!,
        amount: p.amount,
        reference: p.reference,
        notes: p.notes,
        cardLast4: p.cardLast4,
        // amountTendered se manejaría si tuvieras un campo para eso en el form de facturación
      })),
      notes: data.notes,
      ncf: data.ncf,
      customerId: repairOrderData.customerId, // Usar el customerId de la orden de reparación
    };
    factureRepairMutation.mutate(payload);
  }

  if (!isOpen || !repairOrderData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Facturar Reparación #{repairOrderData.repairNumber}
          </DialogTitle>
          <DialogDescription>
            Cliente: {repairOrderData.customer?.firstName || ""}{" "}
            {repairOrderData.customer?.lastName || "N/A"} <br />
            Monto Total a Pagar:{" "}
            <strong className="text-lg">
              {formatCurrency(totalAmountToPay)}
            </strong>
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* Sección de Pagos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex justify-between items-center">
                  Forma(s) de Pago
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendPayment({
                        fieldId: crypto.randomUUID(),
                        paymentMethod: PrismaPaymentMethod.CASH,
                        amount: 0,
                        reference: "",
                        notes: "",
                      })
                    }
                    disabled={
                      paymentFields.length >= 2 ||
                      factureRepairMutation.isPending
                    }
                  >
                    <PlusCircle className="mr-1 h-3 w-3" />
                    Añadir Método
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentFields.map((paymentItem, index) => (
                  <div
                    key={paymentItem.fieldId}
                    className="space-y-3 border p-3 rounded-md bg-muted/30"
                  >
                    <div className="grid grid-cols-[1fr_120px_auto] gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`payments.${index}.paymentMethod`}
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
                                {storeAcceptedPaymentMethods.map(
                                  (m: PaymentMethod) => (
                                    <SelectItem key={m} value={m}>
                                      {paymentMethodLabels[m] ??
                                        m.replace("_", " ")}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`payments.${index}.amount`}
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
                        onClick={() => removePayment(index)}
                        className="h-9 w-9 text-destructive self-center"
                        disabled={
                          paymentFields.length <= 1 ||
                          factureRepairMutation.isPending
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Campos de referencia condicionales si los necesitas aquí */}
                    <FormField
                      control={form.control}
                      name={`payments.${index}.reference`}
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel className="text-xs">
                            Referencia Pago
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
                      name={`payments.${index}.notes`}
                      render={({ field }) => (
                        <FormItem>
                          {" "}
                          <FormLabel className="text-xs">Notas Pago</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={1}
                              placeholder="Notas sobre este pago..."
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
                <Separator className="my-2" />
                <div className="text-sm space-y-0.5">
                  <div className="flex justify-between">
                    <span>Total Pagado:</span>
                    <span className="font-medium">
                      {formatCurrency(totalPaidInForm)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pendiente por Pagar:</span>
                    <span className="font-semibold text-destructive">
                      {formatCurrency(
                        Math.max(0, totalAmountToPay - totalPaidInForm)
                      )}
                    </span>
                  </div>
                  {/* Aquí no manejamos 'amountTenderedCash' ni 'changeGiven' directamente en este diálogo simplificado,
                        pero el backend podría calcular el cambio si el método es efectivo y se paga de más. */}
                </div>
                <FormMessage>
                  {form.formState.errors.payments?.message ||
                    form.formState.errors.payments?.root?.message}
                </FormMessage>
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="ncf"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>NCF (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Número de Comprobante Fiscal"
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
                  <FormLabel>Notas para la Venta (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales para la factura/venta..."
                      {...field}
                      value={field.value ?? ""}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={factureRepairMutation.isPending}
              >
                {" "}
                Cancelar{" "}
              </Button>
              <Button
                type="submit"
                disabled={
                  factureRepairMutation.isPending ||
                  totalPaidInForm < totalAmountToPay ||
                  (!form.formState.isValid && form.formState.isSubmitted)
                }
              >
                {factureRepairMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar y Facturar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
