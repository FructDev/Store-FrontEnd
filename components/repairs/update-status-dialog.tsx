// components/repairs/update-status-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { RepairOrder } from "@/types/repairs.types"; // O donde tengas el tipo RepairOrder
import { RepairStatus as PrismaRepairStatus } from "@/types/prisma-enums";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react"; // React no siempre es necesario importar

// Mapeo para estados de Reparación (importar de un archivo de constantes/utils o definir aquí)
const repairStatusLabels: Record<PrismaRepairStatus, string> = {
  RECEIVED: "Recibido",
  DIAGNOSING: "Diagnosticando",
  QUOTE_PENDING: "Pend. Cotización",
  AWAITING_QUOTE_APPROVAL: "Esperando Aprob. Cotización",
  QUOTE_APPROVED: "Cotización Aprobada",
  QUOTE_REJECTED: "Cotización Rechazada",
  AWAITING_PARTS: "Esperando Repuestos",
  IN_REPAIR: "En Reparación",
  ASSEMBLING: "Ensamblando",
  TESTING_QC: "Pruebas C. Calidad",
  REPAIR_COMPLETED: "Reparación Interna OK",
  PENDING_PICKUP: "Listo para Entrega",
  COMPLETED_PICKED_UP: "Entregado",
  CANCELLED: "Cancelado",
  UNREPAIRABLE: "No Reparable",
};
const ALL_REPAIR_STATUSES_ARRAY = Object.values(PrismaRepairStatus);

const updateStatusSchema = z.object({
  status: z.nativeEnum(PrismaRepairStatus, {
    required_error: "Debe seleccionar un nuevo estado.",
  }),
  notes: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});
type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

interface UpdateStatusDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: PrismaRepairStatus;
  repairId: string;
  onSuccess: () => void; // Callback para refrescar datos en la página padre
}

export function UpdateStatusDialog({
  isOpen,
  onOpenChange,
  currentStatus,
  repairId,
  onSuccess,
}: UpdateStatusDialogProps) {
  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: currentStatus,
      notes: "",
    },
  });

  // Resetear el form cuando el diálogo se abre o el estado actual cambia
  useEffect(() => {
    if (isOpen) {
      form.reset({ status: currentStatus, notes: "" });
    }
  }, [isOpen, currentStatus, form]);

  const updateStatusMutation = useMutation<
    RepairOrder, // Asume que el backend devuelve la RepairOrder actualizada
    Error,
    UpdateStatusFormValues // El DTO del backend es UpdateRepairStatusDto
  >({
    mutationFn: async (data) => {
      // El payload para PATCH /repairs/:repairId/status es UpdateRepairStatusDto
      const payload = {
        status: data.status,
        notes: data.notes,
      };
      const response = await apiClient.patch<RepairOrder>(
        `/repairs/${repairId}/status`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Estado de la reparación actualizado exitosamente.");
      onSuccess(); // Llama al callback para refrescar datos en la página padre
      onOpenChange(false); // Cierra este diálogo
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Error al actualizar el estado.";
      toast.error(
        Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg.toString()
      );
    },
  });

  function onSubmit(data: UpdateStatusFormValues) {
    updateStatusMutation.mutate(data);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Actualizar Estado de Reparación</DialogTitle>
          <DialogDescription>
            Selecciona el nuevo estado para la orden #{repairId.slice(-6)}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nuevo Estado*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ALL_REPAIR_STATUSES_ARRAY.map((statusValue) => (
                        <SelectItem key={statusValue} value={statusValue}>
                          {repairStatusLabels[statusValue] || statusValue}
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
                  <FormLabel>Notas del Cambio de Estado (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Añade notas relevantes sobre este cambio de estado..."
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
                disabled={updateStatusMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Actualizar Estado
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
