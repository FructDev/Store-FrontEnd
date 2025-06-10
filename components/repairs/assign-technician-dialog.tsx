// components/repairs/assign-technician-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { RepairOrder } from "@/types/repairs.types";
import { UserMinimal } from "@/types/user.types"; // Para la lista de técnicos

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
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react"; // React no siempre es necesario
import { getErrorMessage } from "@/lib/utils/get-error-message";

const NULL_TECHNICIAN_VALUE = "__NULL_TECH__"; // Para la opción "No Asignado"

const assignTechnicianSchema = z.object({
  technicianId: z.string().nullable(), // Permitir null para desasignar
});
type AssignTechnicianFormValues = z.infer<typeof assignTechnicianSchema>;

interface AssignTechnicianDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  repairId: string;
  currentTechnicianId?: string | null;
  onSuccess: () => void;
}

export function AssignTechnicianDialog({
  isOpen,
  onOpenChange,
  repairId,
  currentTechnicianId,
  onSuccess,
}: AssignTechnicianDialogProps) {
  // Fetch para la lista de técnicos/usuarios
  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery<
    UserMinimal[]
  >({
    queryKey: ["allActiveTechniciansForAssignment"], // Key más específica
    // Asume un endpoint que devuelve usuarios con rol 'TECHNICIAN' o similar
    // O un filtro general que puedas aplicar.
    queryFn: () =>
      apiClient
        .get("/users?roleName=TECHNICIAN&isActive=true&limit=200")
        .then((res) => res.data.data || (res.data as UserMinimal[]) || []),
    staleTime: 1000 * 60 * 5, // Cachear por 5 minutos
  });

  const form = useForm<AssignTechnicianFormValues>({
    resolver: zodResolver(assignTechnicianSchema),
    defaultValues: {
      technicianId: currentTechnicianId || null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ technicianId: currentTechnicianId || null });
    }
  }, [isOpen, currentTechnicianId, form]);

  const assignTechnicianMutation = useMutation<
    RepairOrder, // Asume que el backend devuelve la RepairOrder actualizada
    Error,
    { technicianId: string | null } // El DTO del backend AssignTechnicianDto espera technicianId
  >({
    mutationFn: async (data) => {
      const payload = { technicianId: data.technicianId }; // El DTO del backend espera technicianId
      const response = await apiClient.patch<RepairOrder>(
        `/repairs/${repairId}/assign`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Técnico asignado/actualizado exitosamente.");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al asignar técnico");
      console.error("Error al asignar tecnico", error || errorMessage);
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: AssignTechnicianFormValues) {
    assignTechnicianMutation.mutate({ technicianId: data.technicianId });
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Técnico a Reparación</DialogTitle>
          <DialogDescription>
            Selecciona el técnico que se encargará de esta orden de reparación.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="technicianId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Técnico Asignado</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === NULL_TECHNICIAN_VALUE ? null : value
                      )
                    }
                    value={
                      field.value === null
                        ? NULL_TECHNICIAN_VALUE
                        : field.value || ""
                    }
                    disabled={isLoadingTechnicians}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un técnico..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NULL_TECHNICIAN_VALUE}>
                        <em>-- No Asignado --</em>
                      </SelectItem>
                      {isLoadingTechnicians && (
                        <SelectItem value="loading-tech" disabled>
                          Cargando técnicos...
                        </SelectItem>
                      )}
                      {technicians?.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.firstName} {tech.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={assignTechnicianMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={assignTechnicianMutation.isPending}
              >
                {assignTechnicianMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Asignar Técnico
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
