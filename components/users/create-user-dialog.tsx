// components/users/create-user-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Añadir DialogClose
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Para roles
import { Switch } from "@/components/ui/switch"; // Para isActive
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Schema de validación con Zod (similar al CreateUserDto del backend)
const createUserFormSchema = z.object({
  firstName: z.string().min(2, "Nombre muy corto").max(50),
  lastName: z.string().min(2, "Apellido muy corto").max(50),
  email: z.string().email("Email inválido."),
  password: z
    .string()
    .min(8, "Contraseña debe tener al menos 8 caracteres.")
    .max(100),
  roleName: z.enum(["SALESPERSON", "TECHNICIAN"], {
    required_error: "Debes seleccionar un rol.", // Esto aplica si roleName no es opcional
  }),
  isActive: z.boolean().optional(), // Hacemos que sea opcional en la entrada a Zod
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export function CreateUserDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleName: undefined, // Para que el placeholder del Select funcione
      isActive: true,
    },
  });

  interface CreateUserApiResponse {
    id: string;
    email: string;
    // ...otros campos que devuelve tu backend al crear un usuario
  }

  const createUserMutation = useMutation<
    CreateUserApiResponse,
    Error,
    CreateUserFormValues
  >({
    mutationFn: async (dataToSubmit) => {
      console.log("mutationFn: Enviando datos al backend:", dataToSubmit); // DEBUG
      const response = await apiClient.post<CreateUserApiResponse>(
        "/users",
        dataToSubmit
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("mutationFn: Éxito", data); // DEBUG
      toast.success("Usuario creado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["storeUsers"] });
      setIsOpen(false);
      form.reset();
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al crear el usuario");
      console.error("Create user error", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: CreateUserFormValues) {
    createUserMutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>
            Completa los datos para añadir un nuevo miembro a tu tienda.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
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
                    <FormLabel>Apellido</FormLabel>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan.perez@correo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SALESPERSON">Vendedor</SelectItem>
                      <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Activo</FormLabel>
                    <FormDescription>
                      El usuario podrá iniciar sesión y acceder al sistema.
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
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={createUserMutation.isPending}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Usuario
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
