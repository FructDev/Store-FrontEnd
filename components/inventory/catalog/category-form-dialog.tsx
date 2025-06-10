// components/inventory/catalog/category-form-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Category } from "@/types/inventory.types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Añadir DialogTrigger
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Nombre debe tener al menos 2 caracteres." })
    .max(100),
  description: z.string().max(255).optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormDialogProps {
  category?: Category | null; // Si se pasa, es modo edición
  triggerButton?: React.ReactNode; // Para un botón de disparo personalizado
  isOpen?: boolean; // Para control externo opcional
  onOpenChange?: (open: boolean) => void; // Para control externo opcional
  onSuccess?: () => void; // Callback opcional
}

export function CategoryFormDialog({
  category,
  triggerButton,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: CategoryFormDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const isControlled =
    controlledIsOpen !== undefined && controlledOnOpenChange !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = isControlled ? controlledOnOpenChange : setInternalIsOpen;

  const isEditMode = !!category?.id;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Solo resetear si el diálogo está abierto o se va a abrir
      if (isEditMode && category) {
        console.log("EDIT MODE - Resetting form with category:", category); // DEBUG
        form.reset({
          name: category.name,
          description: category.description || "", // Usar "" si es null/undefined
        });
      } else if (!isEditMode) {
        // Si es modo creación y se abre
        console.log("CREATE MODE - Resetting form for new category"); // DEBUG
        form.reset({ name: "", description: "" });
      }
    }
  }, [category, isEditMode, isOpen, form]);

  const mutation = useMutation<Category, Error, CategoryFormValues>({
    mutationFn: async (data: CategoryFormValues) => {
      const apiData = {
        name: data.name, // Asegurar que solo enviamos lo que el DTO UpdateCategoryDto espera
        description: data.description || null, // Enviar null si está vacío para limpiar en BD
      };
      // ¡IMPORTANTE! UpdateCategoryDto SÓLO debe tener name? y description?
      // No envíes campos que no estén en el DTO de actualización del backend.

      if (isEditMode && category?.id) {
        // Asegurar que category.id exista
        console.log(
          `EDIT MODE - Patching to /inventory/categories/${category.id}`,
          apiData
        ); // DEBUG
        const response = await apiClient.patch<Category>(
          `/inventory/categories/${category.id}`,
          apiData
        );
        return response.data;
      } else {
        console.log("CREATE MODE - Posting to /inventory/categories", apiData); // DEBUG
        const response = await apiClient.post<Category>(
          "/inventory/categories",
          apiData
        );
        return response.data;
      }
    },
    onSuccess: (createdOrUpdatedCategory) => {
      toast.success(
        `Categoría "${createdOrUpdatedCategory.name}" ${
          isEditMode ? "actualizada" : "creada"
        } correctamente.`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryCategories"] });
      setIsOpen(false);
      if (onSuccess) onSuccess();
      // No resetear aquí si queremos que el usuario vea los datos guardados si reabre
      // El reset ya se hace en el useEffect cuando isOpen o category cambia.
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al guardar la categoría"
      );
      console.error("Error al guardar la categoría", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: CategoryFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {triggerButton ? (
        <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Categoría
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Categoría" : "Crear Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica los detalles de la categoría."
              : "Añade una nueva categoría para tus productos."}
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
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Smartphones" {...field} />
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
                      placeholder="Breve descripción de la categoría"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
