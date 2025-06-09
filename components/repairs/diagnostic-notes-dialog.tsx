// components/repairs/diagnostic-notes-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { RepairOrder } from "@/types/repairs.types"; // Para el tipo de respuesta de la mutación

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
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react"; // React no es siempre necesario importar explícitamente

interface DiagnosticNotesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  repairId: string;
  currentNotes?: string | null;
  onSuccess: () => void; // Callback para refrescar datos
}

const diagnosticNotesSchema = z.object({
  diagnosticNotes: z
    .string()
    .max(2000, "Las notas no pueden exceder los 2000 caracteres.")
    .nullable() // Permitir que sea null si se borra el texto
    .transform((val) => (val === "" ? null : val)), // Convertir string vacío a null
});

type DiagnosticNotesFormValues = z.infer<typeof diagnosticNotesSchema>;

export function DiagnosticNotesDialog({
  isOpen,
  onOpenChange,
  repairId,
  currentNotes,
  onSuccess,
}: DiagnosticNotesDialogProps) {
  const form = useForm<DiagnosticNotesFormValues>({
    resolver: zodResolver(diagnosticNotesSchema),
    defaultValues: {
      diagnosticNotes: currentNotes || "", // Iniciar con las notas actuales o vacío
    },
  });

  // Resetear el form cuando el diálogo se abre o las notas actuales cambian
  useEffect(() => {
    if (isOpen) {
      form.reset({ diagnosticNotes: currentNotes || "" });
    }
  }, [isOpen, currentNotes, form]);

  const updateDiagnosticNotesMutation = useMutation<
    RepairOrder, // El backend podría devolver la RepairOrder actualizada
    Error,
    { diagnosticNotes?: string | null } // El payload para PATCH /repairs/:repairId
  >({
    mutationFn: async (data) => {
      // El DTO del backend 'UpdateRepairOrderDto' es parcial,
      // así que solo enviamos el campo que estamos actualizando.
      const response = await apiClient.patch<RepairOrder>(
        `/repairs/${repairId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Notas de diagnóstico guardadas exitosamente.");
      onSuccess(); // Llama al callback para refrescar datos en la página padre
      onOpenChange(false); // Cierra este diálogo
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "Error al guardar las notas de diagnóstico.";
      toast.error(
        Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg.toString()
      );
    },
  });

  function onSubmit(data: DiagnosticNotesFormValues) {
    updateDiagnosticNotesMutation.mutate({
      diagnosticNotes: data.diagnosticNotes,
    });
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Notas de Diagnóstico Técnico</DialogTitle>
          <DialogDescription>
            Ingresa o actualiza el diagnóstico detallado para esta orden de
            reparación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="diagnosticNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnóstico Detallado</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe el problema encontrado, la causa raíz, y las partes o servicios que podrían ser necesarios..."
                      rows={8} // Más espacio para notas detalladas
                      {...field}
                      value={field.value ?? ""} // Manejar null
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
                disabled={updateDiagnosticNotesMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  updateDiagnosticNotesMutation.isPending ||
                  !form.formState.isDirty
                }
              >
                {updateDiagnosticNotesMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Diagnóstico
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
