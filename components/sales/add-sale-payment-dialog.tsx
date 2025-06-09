// components/sales/add-sale-payment-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { PaymentMethod as PrismaPaymentMethod } from "@/types/prisma-enums";
import { useAuthStore } from "@/stores/auth.store"; // Para métodos de pago aceptados
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
import { DatePicker } from "@/components/ui/date-picker"; // Tu componente DatePicker
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/formatters";

interface AddSalePaymentDialogProps {
  saleId: string;
  amountDue: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentAdded: () => void;
}

const paymentMethodLabels: Record<PrismaPaymentMethod, string> = {
  CASH: "Efectivo",
  CARD_CREDIT: "Tarjeta de Crédito",
  CARD_DEBIT: "Tarjeta de Débito",
  TRANSFER: "Transferencia",
  MOBILE_WALLET: "Billetera Móvil", // Ej: Yape, Plin
  STORE_CREDIT: "Crédito de Tienda",
  OTHER: "Otro",
  // Asegúrate de que todos los valores de tu enum PrismaPaymentMethod tengan una etiqueta aquí
};

const ALL_PAYMENT_METHODS = Object.values(PrismaPaymentMethod);

const createAddPaymentSchema = (maxAmount: number) => {
  return z.object({
    paymentMethod: z.nativeEnum(PrismaPaymentMethod, {
      required_error: "Método de pago es requerido.",
    }),
    amount: z.coerce
      .number()
      .positive("Monto debe ser positivo.")
      .max(
        maxAmount,
        `Monto no puede exceder el saldo pendiente de ${maxAmount.toFixed(2)}.`
      ),
    // paymentDate: z.date({ required_error: "Fecha de pago es requerida." }),
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
    // cardLast4, etc. si los necesitas aquí
  });
};

type AddPaymentFormValues = z.infer<ReturnType<typeof createAddPaymentSchema>>;

export function AddSalePaymentDialog({
  saleId,
  amountDue,
  isOpen,
  onOpenChange,
  onPaymentAdded,
}: AddSalePaymentDialogProps) {
  const storeAcceptedPaymentMethods =
    useAuthStore((state) => state.user?.store?.acceptedPaymentMethods) ||
    ALL_PAYMENT_METHODS;

  const currentSchema = React.useMemo(
    () => createAddPaymentSchema(amountDue),
    [amountDue]
  );

  const form = useForm<AddPaymentFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      paymentMethod: undefined,
      amount: amountDue > 0 ? parseFloat(amountDue.toFixed(2)) : 0, // Default al monto pendiente
      //   paymentDate: new Date(),
      reference: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        paymentMethod: storeAcceptedPaymentMethods.includes(
          PrismaPaymentMethod.CASH
        )
          ? PrismaPaymentMethod.CASH
          : storeAcceptedPaymentMethods[0],
        amount: amountDue > 0 ? parseFloat(amountDue.toFixed(2)) : 0,
        // paymentDate: new Date(),
        reference: "",
        notes: "",
      });
    }
  }, [isOpen, amountDue, form, storeAcceptedPaymentMethods]);

  const addPaymentMutation = useMutation<
    any, // Tipo de la respuesta del backend (ej. SalePayment creado o Sale actualizada)
    Error,
    AddPaymentFormValues // Los datos del formulario (ya no tienen paymentDate)
  >({
    mutationFn: async (dataFromForm: AddPaymentFormValues) => {
      // El payload es directamente dataFromForm porque ya no tiene paymentDate
      const payloadToSubmit = {
        paymentMethod: dataFromForm.paymentMethod,
        amount: dataFromForm.amount,
        reference: dataFromForm.reference,
        notes: dataFromForm.notes,
      };

      console.log("Enviando pago al backend:", payloadToSubmit);
      const response = await apiClient.post(
        `/sales/${saleId}/payments`,
        payloadToSubmit
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Pago añadido exitosamente.");
      onPaymentAdded(); // Llama al callback del padre (cierra diálogo, refresca data de la venta)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al añadir el pago.");
      console.error("Add payment error:", error.response?.data || error);
    },
  });

  function onSubmit(data: AddPaymentFormValues) {
    addPaymentMutation.mutate(data);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Pago a Venta</DialogTitle>
          <DialogDescription>
            Saldo Pendiente: {formatCurrency(amountDue)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Método de Pago*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona método..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storeAcceptedPaymentMethods.map((m) => (
                        <SelectItem key={m} value={m}>
                          {paymentMethodLabels[m] || m.replace("_", " ")}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Monto a Pagar*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0.01}
                      max={amountDue}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value)
                        )
                      }
                    />
                  </FormControl>{" "}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Referencia</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Nro. Cheque, Últimos 4 tarjeta"
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
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre el pago..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>{" "}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={addPaymentMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={addPaymentMutation.isPending}>
                {addPaymentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar Pago
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
