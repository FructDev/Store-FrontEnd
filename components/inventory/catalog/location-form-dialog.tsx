// components/inventory/catalog/location-form-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { InventoryLocation } from "@/types/inventory.types";

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
import { Switch } from "@/components/ui/switch"; // Para isDefault e isActive
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const locationFormSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres.").max(100),
  description: z.string().max(255).optional().nullable(),
  isDefault: z.boolean().optional().default(false), // Opcional en la entrada, default a false en la salida
  isActive: z.boolean().optional().default(true),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

interface LocationFormDialogProps {
  location?: InventoryLocation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LocationFormDialog({
  location,
  isOpen,
  onOpenChange,
  onSuccess,
}: LocationFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!location?.id;

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isDefault: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && location) {
        form.reset({
          name: location.name || "",
          description: location.description || "",
          isDefault: location.isDefault,
          isActive: location.isActive,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          isDefault: false,
          isActive: true,
        });
      }
    }
  }, [location, isEditMode, isOpen, form]);

  const mutation = useMutation<InventoryLocation, Error, LocationFormValues>({
    mutationFn: async (data: LocationFormValues) => {
      const apiData = {
        ...data,
        description: data.description || null,
        // isDefault e isActive ya son booleanos
      };
      const url =
        isEditMode && location
          ? `/inventory/locations/${location.id}`
          : "/inventory/locations";
      const method = isEditMode ? "patch" : "post";

      const response = await apiClient[method]<InventoryLocation>(url, apiData);
      return response.data;
    },
    onSuccess: (createdOrUpdatedLocation) => {
      toast.success(
        `Ubicación "${createdOrUpdatedLocation.name}" ${
          isEditMode ? "actualizada" : "creada"
        } correctamente.`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryLocations"] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al guardar la ubicación"
      );
      console.error("Error al guardar la ubicacion", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: LocationFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* El DialogTrigger lo maneja la página padre */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Ubicación" : "Crear Nueva Ubicación"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica los detalles de la ubicación."
              : "Añade una nueva ubicación para tu inventario."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Ubicación</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Almacén Principal, Vitrina 1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Descripción{" "}
                    <span className="text-xs text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles adicionales sobre la ubicación"
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
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Ubicación por Defecto</FormLabel>
                    <FormDescription>
                      Marcar si es la ubicación principal o por defecto.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Activa</FormLabel>
                    <FormDescription>
                      Permitir usar esta ubicación para stock.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Guardar Cambios" : "Crear Ubicación"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
