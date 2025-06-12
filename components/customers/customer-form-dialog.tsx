// components/customers/customer-form-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import React, { useEffect } from "react";

import apiClient from "@/lib/api";
import { Customer } from "@/types/customer.types";
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
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Schema de validación con Zod para el formulario
// Basado en CreateCustomerDto y UpdateCustomerDto
const customerFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
    .max(100),
  lastName: z
    .string()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
    .max(100),
  email: z
    .string()
    .email({ message: "Formato de email inválido." })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(7, { message: "El teléfono debe tener al menos 7 dígitos." })
    .max(20)
    .optional()
    .or(z.literal("")),
  rnc: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

// Props que el diálogo espera
interface CustomerFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void; // Para refrezcar la lista de clientes
  customerData?: Customer | null; // Datos para el modo de edición
}

export function CustomerFormDialog({
  isOpen,
  onOpenChange,
  onSuccess,
  customerData,
}: CustomerFormDialogProps) {
  // const queryClient = useQueryClient();
  const isEditMode = !!customerData;

  const form = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      rnc: "",
      address: "",
      isActive: true,
    },
  });

  // Efecto para llenar el formulario con datos cuando se abre en modo edición
  useEffect(() => {
    if (isOpen && isEditMode && customerData) {
      form.reset({
        firstName: customerData.firstName || "",
        lastName: customerData.lastName || "",
        email: customerData.email || "",
        phone: customerData.phone || "",
        rnc: customerData.rnc || "",
        address: customerData.address || "",
        isActive: customerData.isActive,
      });
    } else if (!isOpen) {
      form.reset(); // Limpiar el formulario cuando se cierra
    }
  }, [isOpen, isEditMode, customerData, form]);

  // Mutación para crear o actualizar
  const mutation = useMutation<Customer, Error, CustomerFormValues>({
    mutationFn: async (data) => {
      // Prepara el payload base
      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        rnc: data.rnc || null,
        address: data.address || null,
      };

      if (isEditMode && customerData) {
        // MODO EDICIÓN: El payload ya incluye 'isActive' y es correcto.
        const response = await apiClient.patch(
          `/customers/${customerData.id}`,
          payload
        );
        return response.data;
      } else {
        // MODO CREACIÓN:
        // --- CORRECCIÓN AQUÍ ---
        // Eliminamos 'isActive' del payload antes de enviarlo
        const { isActive, ...createPayload } = payload;
        console.log(isActive);
        // --- FIN CORRECCIÓN ---

        const response = await apiClient.post("/customers", createPayload);
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? "Cliente actualizado exitosamente."
          : "Cliente creado exitosamente."
      );
      onSuccess(); // Llama al callback para invalidar query y cerrar diálogo
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error ||
          (isEditMode
            ? "Error al actualizar el cliente."
            : "Error al crear el cliente.")
      );
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: CustomerFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Cliente" : "Añadir Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualiza la información del cliente."
              : "Completa los datos para registrar un nuevo cliente."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre*</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido*</FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="809-555-1234"
                      {...field}
                      value={field.value || ""}
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
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan.perez@email.com"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rnc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RNC / Cédula</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="001-1234567-8"
                      {...field}
                      value={field.value || ""}
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
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Calle, #, Sector, Ciudad..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isEditMode && (
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Cliente Activo</FormLabel>
                      <FormDescription>
                        Desactiva para ocultar al cliente en búsquedas.
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
            )}
            <DialogFooter className="pt-4">
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
                {isEditMode ? "Guardar Cambios" : "Crear Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
