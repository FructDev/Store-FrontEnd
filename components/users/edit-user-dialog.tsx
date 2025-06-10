// components/users/edit-user-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { User } from "@/stores/auth.store";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  //   DialogClose,
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
import { Badge } from "@/components/ui/badge";

import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Schema Zod para editar (sin password, email podría ser readonly o no editable)
const editUserFormSchema = z.object({
  firstName: z.string().min(2, "Nombre muy corto").max(50),
  lastName: z.string().min(2, "Apellido muy corto").max(50),
  email: z.string().email("Email inválido."), // Hacerlo readonly en el form
  // roleName: z.enum(["SALESPERSON", "TECHNICIAN"]),
  isActive: z.boolean(),
});

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

interface EditUserDialogProps {
  user: User | null; // Usuario a editar
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
}: EditUserDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      isActive: user?.isActive ?? true,
    },
  });

  // Resetear el formulario cuando el usuario cambie o el diálogo se abra/cierre
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",

        isActive: user.isActive,
      });
    } else {
      form.reset({
        // Valores por defecto si no hay usuario (aunque no debería abrirse sin user)
        firstName: "",
        lastName: "",
        email: "",
        isActive: true,
      });
    }
  }, [user, isOpen, form]);

  const updateUserMutation = useMutation<
    User,
    Error,
    Pick<EditUserFormValues, "firstName" | "lastName" | "isActive">
  >({
    mutationFn: (data) => apiClient.patch(`/users/${user?.id}`, data), // PATCH al endpoint de actualizar
    onSuccess: () => {
      toast.success("Usuario actualizado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["storeUsers"] });
      onOpenChange(false); // Cerrar diálogo
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar el usuario"
      );
      console.error("Update user error", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: EditUserFormValues) {
    if (!user) return;
    const dataForBackend: Pick<
      EditUserFormValues,
      "firstName" | "lastName" | "isActive"
    > = {
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: data.isActive,
      // NO incluimos data.email ni data.roleName
    };
    updateUserMutation.mutate(dataForBackend);
  }

  if (!user) return null; // No renderizar si no hay usuario para editar

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>
            Editar Usuario: {user.firstName} {user.lastName}
          </DialogTitle>
          <DialogDescription>
            Modifica los datos del usuario. La contraseña solo se puede cambiar
            por separado.
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
                    {" "}
                    <FormLabel>Nombre</FormLabel>{" "}
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Apellido</FormLabel>{" "}
                    <FormControl>
                      <Input {...field} />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>{" "}
                  <FormControl>
                    <Input type="email" {...field} readOnly disabled />
                    {/* Email usualmente no se edita o con cuidado */}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {user?.roles && user.roles.length > 0 && (
              <div className="space-y-2 pt-4">
                <FormLabel>Rol Actual</FormLabel>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((roleObj) => {
                    // --- AÑADIR CONSOLE LOGS AQUÍ --- V V V
                    console.log(
                      "Objeto de Rol Completo (roleObj):",
                      JSON.stringify(roleObj)
                    );
                    console.log("Valor de roleObj.name:", roleObj.name);

                    // Intentar mostrar el nombre sin formatear primero para ver el valor crudo
                    const rawRoleName =
                      roleObj.name || "Nombre de Rol Vacío/Inválido";
                    console.log("Nombre de Rol Crudo a Mostrar:", rawRoleName);

                    const displayName =
                      typeof roleObj.name === "string"
                        ? roleObj.name.toLowerCase().replace("_", " ")
                        : "Error: Rol no es string";
                    console.log(
                      "Nombre de Rol Formateado (displayName):",
                      displayName
                    );
                    // --- FIN CONSOLE LOGS --- V V V

                    return (
                      <Badge
                        key={roleObj.id}
                        variant="secondary"
                        className="capitalize"
                      >
                        {displayName}{" "}
                        {/* Usar el nombre formateado y validado */}
                      </Badge>
                    );
                  })}
                </div>
                <FormDescription>
                  El rol del usuario no se puede modificar desde esta pantalla.
                </FormDescription>
              </div>
            )}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Activo</FormLabel>{" "}
                    <FormDescription>
                      El usuario podrá iniciar sesión.
                    </FormDescription>{" "}
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
                disabled={updateUserMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
