// components/inventory/catalog/supplier-form-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Supplier } from "@/types/inventory.types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import React, { useEffect } from "react";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Schema Zod para el formulario de proveedor (refleja CreateSupplierDto y UpdateSupplierDto)
const supplierFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Nombre debe tener al menos 2 caracteres." })
    .max(100),
  contactName: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z
    .string()
    .email({ message: "Email inválido." })
    .max(100)
    .optional()
    .nullable(),
  address: z.string().max(255).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormDialogProps {
  supplier?: Supplier | null;
  triggerButton?: React.ReactNode; // Si quieres un botón de disparo personalizado
  isOpen: boolean; // Controlado por el padre
  onOpenChange: (open: boolean) => void; // Controlado por el padre
  onSuccess?: () => void;
}

export function SupplierFormDialog({
  supplier,
  triggerButton,
  isOpen,
  onOpenChange,
  onSuccess,
}: SupplierFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!supplier?.id;

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && supplier) {
        form.reset({
          name: supplier.name,
          contactName: supplier.contactName || "",
          phone: supplier.phone || "",
          email: supplier.email || "",
          address: supplier.address || "",
          notes: supplier.notes || "",
        });
      } else {
        form.reset({
          name: "",
          contactName: "",
          phone: "",
          email: "",
          address: "",
          notes: "",
        });
      }
    }
  }, [supplier, isEditMode, isOpen, form]);

  const mutation = useMutation<Supplier, Error, SupplierFormValues>({
    mutationFn: async (data: SupplierFormValues) => {
      // Convertir strings vacíos a null para campos opcionales donde el backend espera null
      const apiData = {
        ...data,
        contactName: data.contactName || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      };

      const url =
        isEditMode && supplier
          ? `/inventory/suppliers/${supplier.id}`
          : "/inventory/suppliers";
      const method = isEditMode ? "patch" : "post";

      const response = await apiClient[method]<Supplier>(url, apiData);
      return response.data;
    },
    onSuccess: (createdOrUpdatedSupplier) => {
      toast.success(
        `Proveedor "${createdOrUpdatedSupplier.name}" ${
          isEditMode ? "actualizado" : "creado"
        } correctamente.`
      );
      queryClient.invalidateQueries({ queryKey: ["inventorySuppliers"] });
      onOpenChange(false); // Cerrar diálogo
      if (onSuccess) onSuccess();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al guardar el proveedor. Inténtalo de nuevo."
      );
      console.error(
        "Error al guardar el proveedor. Inténtalo de nuevo.",
        error || errorMessage
      );
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: SupplierFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* El triggerButton se maneja desde la página padre si se pasa */}
      {/* Si no hay triggerButton, este diálogo debe ser abierto/cerrado solo por props isOpen/onOpenChange */}
      {!triggerButton && isEditMode && null}{" "}
      {/* No renderizar trigger por defecto si es edit mode y no hay trigger prop */}
      {!triggerButton && !isEditMode && (
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Proveedor
          </Button>
        </DialogTrigger>
      )}
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        {" "}
        {/* Ajustar ancho si es necesario */}
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Proveedor" : "Crear Nuevo Proveedor"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica los detalles del proveedor."
              : "Añade un nuevo proveedor a tu lista."}
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
                  <FormLabel>Nombre del Proveedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Compucell RD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre de Contacto{" "}
                    <span className="text-xs text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Ana Torres"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Teléfono{" "}
                    <span className="text-xs text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: 809-123-4567"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email{" "}
                    <span className="text-xs text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Ej: ventas@proveedor.com"
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Dirección{" "}
                    <span className="text-xs text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dirección completa del proveedor"
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
                  <FormLabel>
                    Notas{" "}
                    <span className="text-xs text-muted-foreground">
                      (Opcional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional sobre el proveedor"
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
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Guardar Cambios" : "Crear Proveedor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
