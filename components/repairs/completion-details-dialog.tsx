// components/repairs/completion-details-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { RepairOrder } from "@/types/repairs.types";

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
  // FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react"; // React no siempre es necesario importar
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// --- COPIAR postRepairChecklistItems y completionDetailsSchema AQUÍ ---
export const postRepairChecklistItems = [
  { id: "power_on_off", label: "Encendido y Apagado Correcto" },
  { id: "screen_touch_response", label: "Respuesta Táctil de Pantalla OK" },
  { id: "buttons_check", label: "Todos los Botones Físicos Funcionan" },
  { id: "sound_audio_jack", label: "Audio (Altavoz, Auriculares) OK" },
  { id: "microphone_check", label: "Micrófono Funciona" },
  { id: "camera_front_rear", label: "Cámaras (Frontal y Trasera) OK" },
  { id: "wifi_connectivity", label: "Conectividad WiFi Estable" },
  { id: "cellular_signal", label: "Señal Celular y Llamadas OK" },
  { id: "charging_port", label: "Puerto de Carga Funciona" },
  {
    id: "battery_performance",
    label: "Rendimiento de Batería Adecuado (si aplica)",
  },
  { id: "no_overheating", label: "Sin Sobrecalentamiento Anormal" },
  { id: "device_cleaned", label: "Dispositivo Limpio Externamente" },
  // ... añade más ítems según sea necesario
];

// Construir el schema para el checklist dinámicamente
const checklistSchemaObject = postRepairChecklistItems.reduce((acc, item) => {
  acc[item.id] = z.boolean().default(false);
  return acc;
}, {} as Record<string, z.ZodBoolean>);

const completionDetailsSchema = z.object({
  completionNotes: z
    .string()
    .max(2000, "Máx 2000 caracteres.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  warrantyPeriodDays: z.coerce
    .number()
    .int("Debe ser un número entero.")
    .min(0, "No puede ser negativo.")
    .optional()
    .nullable(),
  postRepairChecklist: z.object(checklistSchemaObject).optional().nullable(),
});

type CompletionDetailsFormValues = z.infer<typeof completionDetailsSchema>;
// --- FIN SCHEMAS ---

interface CompletionDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  repairId: string;
  currentData?: {
    // Datos actuales para poblar el formulario
    completionNotes?: string | null;
    warrantyPeriodDays?: number | null;
    postRepairChecklist?: unknown | null; // Prisma.JsonValue
  };
  onSuccess: () => void;
}

export function CompletionDetailsDialog({
  isOpen,
  onOpenChange,
  repairId,
  currentData,
  onSuccess,
}: CompletionDetailsDialogProps) {
  const defaultChecklistValues = postRepairChecklistItems.reduce(
    (acc, item) => {
      acc[item.id] =
        (currentData?.postRepairChecklist as Record<string, boolean>)?.[
          item.id
        ] || false;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const form = useForm<CompletionDetailsFormValues>({
    resolver: zodResolver(completionDetailsSchema),
    defaultValues: {
      completionNotes: currentData?.completionNotes || "",
      warrantyPeriodDays: currentData?.warrantyPeriodDays ?? undefined, // Usar undefined si es null para el input number
      postRepairChecklist: defaultChecklistValues,
    },
  });

  useEffect(() => {
    if (isOpen) {
      const checklistVals = postRepairChecklistItems.reduce((acc, item) => {
        acc[item.id] =
          (currentData?.postRepairChecklist as Record<string, boolean>)?.[
            item.id
          ] || false;
        return acc;
      }, {} as Record<string, boolean>);
      form.reset({
        completionNotes: currentData?.completionNotes || "",
        warrantyPeriodDays: currentData?.warrantyPeriodDays ?? undefined,
        postRepairChecklist: checklistVals,
      });
    }
  }, [isOpen, currentData, form]);

  const updateCompletionMutation = useMutation<
    RepairOrder,
    Error,
    CompletionDetailsFormValues
  >({
    mutationFn: async (data) => {
      // El DTO del backend (UpdateRepairOrderDto) es parcial
      const payload = {
        completionNotes: data.completionNotes,
        warrantyPeriodDays: data.warrantyPeriodDays,
        postRepairChecklist: data.postRepairChecklist,
      };
      const response = await apiClient.patch<RepairOrder>(
        `/repairs/${repairId}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Detalles de finalización guardados.");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al guardar los detalles de finalización"
      );
      console.error(
        "Error al guardar detalles de finalizacion",
        error || errorMessage
      );
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: CompletionDetailsFormValues) {
    updateCompletionMutation.mutate(data);
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>Registrar Detalles de Finalización</DialogTitle>
          <DialogDescription>
            Añade notas finales, garantía y completa el checklist
            post-reparación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto"
          >
            <div className="px-6 py-4 space-y-6">
              <FormField
                control={form.control}
                name="completionNotes"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Notas de Finalización</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalles sobre el trabajo realizado, pruebas finales, etc."
                        rows={4}
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
                name="warrantyPeriodDays"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Garantía (Días)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ej: 30, 90 (0 para sin garantía)"
                        min={0}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </FormControl>{" "}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel className="text-sm font-medium">
                  Checklist Post-Reparación
                </FormLabel>
                <Card className="p-4 mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {" "}
                  {/* Scroll para checklist largo */}
                  {postRepairChecklistItems.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`postRepairChecklist.${item.id}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </Card>
                <FormMessage>
                  {form.formState.errors.postRepairChecklist?.message ||
                    form.formState.errors.postRepairChecklist?.root?.message}
                </FormMessage>
              </div>
            </div>

            <DialogFooter className="p-6 pt-4 border-t shrink-0 sticky bottom-0 bg-background z-10">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateCompletionMutation.isPending}
              >
                {" "}
                Cancelar{" "}
              </Button>
              <Button
                type="submit"
                disabled={
                  updateCompletionMutation.isPending || !form.formState.isDirty
                }
              >
                {updateCompletionMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Detalles
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
