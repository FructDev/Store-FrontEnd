// components/customers/create-customer-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Customer } from "@/types/customer.types"; // Asume estos tipos existen

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
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Textarea } from "../ui/textarea";

// Schema Zod para el formulario de creación rápida de cliente
// Ajusta según los campos que tu CreateCustomerDto del backend espera como mínimos/opcionales
const createCustomerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Nombre es requerido y debe tener al menos 2 caracteres.")
    .max(50),
  lastName: z
    .string()
    .min(2, "Apellido es requerido y debe tener al menos 2 caracteres.")
    .max(50),
  phone: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  email: z
    .string()
    .email("Email inválido.")
    .max(100)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  rnc: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)), // Opcional
  address: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)), // Opcional
});

type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newCustomer: Customer) => void; // Callback con el cliente creado
}

export function CreateCustomerDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateCustomerDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateCustomerFormValues>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      rnc: "",
      address: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        // Resetear al abrir
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        rnc: "",
        address: "",
      });
    }
  }, [isOpen, form]);

  const createCustomerMutation = useMutation<
    Customer, // Tipo de respuesta del backend
    Error,
    CreateCustomerFormValues
  >({
    mutationFn: async (data: CreateCustomerFormValues) => {
      // El backend espera el storeId implícitamente del usuario autenticado
      const response = await apiClient.post<Customer>("/customers", data);
      return response.data;
    },
    onSuccess: (newCustomer) => {
      toast.success(
        `Cliente "${newCustomer.firstName} ${newCustomer.lastName}" creado exitosamente.`
      );
      queryClient.invalidateQueries({ queryKey: ["customers"] }); // Para refrescar listas de clientes
      queryClient.invalidateQueries({ queryKey: ["posCustomerSearch"] }); // Para refrescar búsqueda en POS
      onOpenChange(false); // Cerrar este diálogo
      onSuccess(newCustomer); // Llamar al callback con el nuevo cliente
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message || "Error al crear el cliente.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    },
  });

  function onSubmit(data: CreateCustomerFormValues) {
    createCustomerMutation.mutate(data);
  }

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!createCustomerMutation.isPending) onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Ingresa los datos del nuevo cliente. Los campos marcados con * son
            requeridos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Nombre*</FormLabel>{" "}
                    <FormControl>
                      <Input placeholder="Juan" {...field} />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Apellido*</FormLabel>{" "}
                    <FormControl>
                      <Input placeholder="Pérez" {...field} />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Teléfono</FormLabel>{" "}
                  <FormControl>
                    <Input
                      placeholder="809-123-4567"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>{" "}
                  <FormMessage />{" "}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Email</FormLabel>{" "}
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan.perez@email.com"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>{" "}
                  <FormMessage />{" "}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rnc"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>RNC/Cédula</FormLabel>{" "}
                  <FormControl>
                    <Input
                      placeholder="Número de identificación fiscal"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>{" "}
                  <FormMessage />{" "}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Dirección</FormLabel>{" "}
                  <FormControl>
                    <Textarea
                      placeholder="Dirección del cliente..."
                      {...field}
                      value={field.value ?? ""}
                      rows={2}
                    />
                  </FormControl>{" "}
                  <FormMessage />{" "}
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createCustomerMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Cliente
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
