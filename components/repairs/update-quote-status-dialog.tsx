// components/repairs/update-quote-status-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { RepairOrder } from "@/types/repairs.types";
import { formatCurrency } from "@/lib/utils/formatters";

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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Para la decisión
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const updateQuoteStatusSchema = z.object({
  quoteApproved: z.boolean({
    required_error: "Debe indicar si la cotización fue aprobada o rechazada.",
  }),
  notes: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

type UpdateQuoteStatusFormValues = z.infer<typeof updateQuoteStatusSchema>;

interface UpdateQuoteStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  repairId: string;
  currentQuotedAmount: number; // Monto que se está aprobando/rechazando
  initialApprovalStatus?: boolean | null; // El estado actual para preseleccionar
  decisionToSet: boolean; // true si se está "Aprobando", false si se está "Rechazando"
  onSuccess: () => void;
}

export function UpdateQuoteStatusDialog({
  isOpen,
  onOpenChange,
  repairId,
  currentQuotedAmount,
  // initialApprovalStatus,
  decisionToSet, // Esta prop indica la acción (Aprobar/Rechazar)
  onSuccess,
}: UpdateQuoteStatusDialogProps) {
  const form = useForm<UpdateQuoteStatusFormValues>({
    resolver: zodResolver(updateQuoteStatusSchema),
    defaultValues: {
      quoteApproved: decisionToSet, // Pre-seleccionar basado en el botón que se presionó
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        quoteApproved: decisionToSet, // Siempre resetear al 'decisionToSet' al abrir
        notes: "",
      });
    }
  }, [isOpen, decisionToSet, form]);

  const mutation = useMutation<
    RepairOrder, // El backend devuelve la RepairOrder actualizada
    Error,
    UpdateQuoteStatusFormValues // DTO del backend: { quoteApproved: boolean, notes?: string }
  >({
    mutationFn: async (data) => {
      const response = await apiClient.patch<RepairOrder>(
        `/repairs/${repairId}/quote-status`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(
        `Cotización marcada como ${
          data.quoteApproved ? "Aprobada" : "Rechazada"
        }.`
      );
      onSuccess(); // Refrescar datos de la página padre
      onOpenChange(false); // Cerrar diálogo
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al guardar el estado de la cotización"
      );
      console.error(
        "Error al guardar el estado de cotizacion",
        error || errorMessage
      );
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: UpdateQuoteStatusFormValues) {
    // 'quoteApproved' ya está seteado por la prop 'decisionToSet' y el form
    mutation.mutate(data);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className={cn(decisionToSet ? "text-green-600" : "text-red-600")}
          >
            {decisionToSet ? "Confirmar Aprobación" : "Confirmar Rechazo"} de
            Cotización
          </DialogTitle>
          <DialogDescription>
            Monto Cotizado:{" "}
            <strong>{formatCurrency(currentQuotedAmount)}</strong>.
            {decisionToSet
              ? " Esto cambiará el estado de la reparación para proceder."
              : " Esto podría detener el proceso de reparación."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* El campo quoteApproved se maneja implícitamente por la prop 'decisionToSet' */}
            {/* Podríamos tener un RadioGroup si quisiéramos permitir cambiar la decisión en el mismo diálogo,
                pero es más simple si el diálogo es solo para confirmar una acción ya decidida. */}

            {/* Si se quiere mostrar la decisión y permitir cambiarla: */}
            <FormField
              control={form.control}
              name="quoteApproved"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Decisión del Cliente*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(valStr) =>
                        field.onChange(valStr === "true")
                      }
                      value={String(field.value)} // Convertir boolean a string para RadioGroup
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                        <FormLabel className="font-normal text-green-600">
                          Aprobada
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                        <FormLabel className="font-normal text-red-600">
                          Rechazada
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                  <FormLabel>Notas sobre la Decisión (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Cliente solicitó descuento adicional, Aprobado vía telefónica..."
                      {...field}
                      value={field.value ?? ""}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant={decisionToSet ? "default" : "destructive"}
                disabled={mutation.isPending}
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar {decisionToSet ? "Aprobación" : "Rechazo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
