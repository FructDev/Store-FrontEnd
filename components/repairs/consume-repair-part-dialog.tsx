// components/repairs/consume-repair-part-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { InventoryItem } from "@/types/inventory.types";
import { InventoryItemStatus as PrismaInventoryItemStatus } from "@/types/prisma-enums";

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
// import React, { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { RepairLineItem } from "@/types/repairs.types";
import { useEffect } from "react";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Schema Zod para el formulario de consumo de parte
const consumePartSchema = z.object({
  inventoryItemId: z
    .string()
    .min(1, "Debe seleccionar un ítem/lote específico del inventario."),
  // quantityConsumed: z.coerce.number().int().positive(), // Solo si se permite consumir parcial de un lote no serializado
  notes: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});
type ConsumePartFormValues = z.infer<typeof consumePartSchema>;

interface ConsumeRepairPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  repairId: string;
  repairLine: RepairLineItem | null; // La línea para la cual se consume el repuesto
  onSuccess: () => void;
}

export function ConsumeRepairPartDialog({
  isOpen,
  onOpenChange,
  repairId,
  repairLine,
  onSuccess,
}: ConsumeRepairPartDialogProps) {
  const form = useForm<ConsumePartFormValues>({
    resolver: zodResolver(consumePartSchema),
    defaultValues: { inventoryItemId: undefined, notes: "" },
  });

  const productId = repairLine?.productId;
  const isProductSerialized = repairLine?.product?.tracksImei;
  const quantityNeeded = repairLine?.quantity || 1;

  // Fetch de InventoryItems disponibles para este producto
  const { data: availableStockItems, isLoading: isLoadingStockItems } =
    useQuery<InventoryItem[], Error>({
      queryKey: [
        "availableStockForRepairConsume",
        productId,
        isProductSerialized,
      ],
      queryFn: async () => {
        if (!productId) return [];
        const params: Record<string, unknown> = {
          productId: productId,
          status: PrismaInventoryItemStatus.AVAILABLE,
          limit: 100, // Traer suficientes para seleccionar
        };
        // if (isProductSerialized) params.tracksImei = true; // El backend debe inferir esto de Product
        // else params.tracksImei = false;

        const response = await apiClient.get("/inventory/stock/items", {
          params,
        });
        return response.data.data || (response.data as InventoryItem[]) || [];
      },
      enabled: !!productId && isOpen,
    });

  useEffect(() => {
    if (isOpen) {
      form.reset({ inventoryItemId: undefined, notes: "" });
    }
  }, [isOpen, form]);

  const consumePartMutation = useMutation<
    unknown, // El backend podría devolver la RepairLine actualizada o un mensaje
    Error,
    ConsumePartFormValues
  >({
    mutationFn: async (data: ConsumePartFormValues) => {
      if (!repairLine?.id)
        throw new Error("ID de línea de reparación no disponible.");
      // El DTO del backend ConsumeRepairPartDto espera inventoryItemId y notes.
      // La cantidad se infiere de repairLine.quantity para no serializados,
      // o es 1 para serializados (manejado por el backend).
      const payload = {
        inventoryItemId: data.inventoryItemId,
        notes: data.notes,
      };
      const response = await apiClient.post(
        `/repairs/${repairId}/lines/${repairLine.id}/consume-stock`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        `Repuesto "${
          repairLine?.product?.name || "seleccionado"
        }" consumido del inventario.`
      );
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al consumir repuesto del inventario"
      );
      console.error("Error al consumir repuestos", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: ConsumePartFormValues) {
    // Si no es serializado, y queremos validar cantidad consumida contra cantidad de la línea
    if (!isProductSerialized) {
      const selectedLot = availableStockItems?.find(
        (item) => item.id === data.inventoryItemId
      );
      if (selectedLot && quantityNeeded > selectedLot.quantity) {
        form.setError("inventoryItemId", {
          message: `El lote seleccionado solo tiene ${selectedLot.quantity} uds. y se necesitan ${quantityNeeded}.`,
        });
        return;
      }
    }
    consumePartMutation.mutate(data);
  }

  if (!isOpen || !repairLine || !repairLine.productId) return null; // Solo para líneas con producto de catálogo

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Consumir Repuesto para: {repairLine.product?.name}
          </DialogTitle>
          <DialogDescription>
            {isProductSerialized
              ? `Selecciona el IMEI/Serial específico a utilizar (Necesitas: ${quantityNeeded}).`
              : `Selecciona el lote/ubicación de donde tomar ${quantityNeeded} unidad(es).`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="inventoryItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isProductSerialized
                      ? "IMEI/Serial Específico*"
                      : "Lote de Inventario/Ubicación*"}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                    disabled={
                      isLoadingStockItems ||
                      !availableStockItems ||
                      availableStockItems.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingStockItems
                              ? "Cargando stock..."
                              : !availableStockItems ||
                                availableStockItems.length === 0
                              ? "No hay stock disponible"
                              : "Selecciona ítem/lote..."
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {availableStockItems?.map((item) => (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          disabled={
                            !isProductSerialized &&
                            item.quantity < quantityNeeded
                          }
                        >
                          {isProductSerialized
                            ? `${item.imei} (Ubic: ${
                                item.location?.name || "N/A"
                              }, Cond: ${item.condition || "N/A"})`
                            : `${item.location?.name || "N/A"} - Lote (Disp: ${
                                item.quantity
                              }, Costo: ${formatCurrency(item.costPrice)})`}
                          {!isProductSerialized &&
                            item.quantity < quantityNeeded && (
                              <span className="text-xs text-destructive ml-2">
                                (Insuficiente)
                              </span>
                            )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* {!isProductSerialized && (
                 <FormField control={form.control} name="quantityConsumed" render={...} />
                 // Si quieres permitir consumir una cantidad específica de un lote no serializado
            )} */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Notas de Consumo (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas..."
                      {...field}
                      value={field.value ?? ""}
                      rows={2}
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
                disabled={consumePartMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  consumePartMutation.isPending ||
                  isLoadingStockItems ||
                  !form.formState.isValid
                }
              >
                {consumePartMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar Consumo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
