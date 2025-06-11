// components/inventory/stock-counts/create-stock-count-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  CreateStockCountPayload,
  InventoryLocationBasic,
  StockCount,
} from "@/types/inventory.types"; // O types/stock-counts.types
// import { useRouter } from "next/navigation";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getErrorMessage } from "@/lib/utils/get-error-message";

const createStockCountSchema = z.object({
  locationId: z.string().optional().nullable(),
  notes: z
    .string()
    .max(255, "Máximo 255 caracteres")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  // Opcional: un campo para indicar si se pre-poblará con items de la ubicación
  // Por ahora, el backend decide esto basado en si locationId se envía y lines no.
  // O si queremos que el usuario elija "Conteo de Ubicación Completa" vs "Conteo Ad-hoc"
  countType: z
    .enum(["location_full", "adhoc"], {
      required_error: "Selecciona el tipo de conteo",
    })
    .default("location_full"),
});

type CreateStockCountFormValues = z.infer<typeof createStockCountSchema>;

interface CreateStockCountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (stockCountId: string) => void; // Para redirigir al detalle
}

export function CreateStockCountDialog({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateStockCountDialogProps) {
  const queryClient = useQueryClient();
  // const router = useRouter(); // Para redirigir

  const form = useForm<CreateStockCountFormValues>({
    resolver: zodResolver(createStockCountSchema),
    defaultValues: {
      locationId: undefined,
      notes: "",
      countType: "location_full",
    },
  });

  const watchedCountType = form.watch("countType");

  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationBasic[]
  >({
    queryKey: ["activeLocationsForStockCount"],
    queryFn: () =>
      apiClient
        .get("/inventory/locations?isActive=true&limit=500")
        .then((res) => res.data.data || res.data),
  });

  const mutation = useMutation<StockCount, Error, CreateStockCountFormValues>({
    mutationFn: async (data: CreateStockCountFormValues) => {
      const payload: CreateStockCountPayload = { notes: data.notes };
      if (data.countType === "location_full" && data.locationId) {
        payload.locationId = data.locationId;
        // El backend pre-poblará las líneas si locationId se envía y no se envía un array `lines`
      } else if (data.countType === "adhoc") {
        payload.locationId = null; // O undefined, el backend lo manejará
        payload.lines = []; // Iniciar con cero líneas para conteo adhoc
      }
      const response = await apiClient.post<StockCount>(
        "/inventory/stock-counts",
        payload
      );
      return response.data;
    },
    onSuccess: (createdStockCount) => {
      toast.success(
        `Sesión de conteo #${
          createdStockCount.stockCountNumber || createdStockCount.id.slice(-6)
        } iniciada.`
      );
      queryClient.invalidateQueries({ queryKey: ["stockCounts"] });
      onOpenChange(false);
      onSuccess(createdStockCount.id); // Pasar ID para redirección
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al iniciar el conteo de stock"
      );
      console.error(
        "Error al iniciar el conteo de stock",
        error || errorMessage
      );
      toast.error(errorMessage);
    },
  });

  function onSubmit(data: CreateStockCountFormValues) {
    if (data.countType === "location_full" && !data.locationId) {
      form.setError("locationId", {
        message:
          "Debes seleccionar una ubicación para un conteo de ubicación completa.",
      });
      return;
    }
    mutation.mutate(data);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!mutation.isPending) onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Nuevo Conteo de Stock</DialogTitle>
          <DialogDescription>
            Configura los detalles para la nueva sesión de conteo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="countType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  {" "}
                  <FormLabel>Tipo de Conteo*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="location_full" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Ubicación Completa (Recomendado)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="adhoc" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Ad-hoc / Manual (Añadir productos después)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>{" "}
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedCountType === "location_full" && (
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Ubicación para Conteo Completo*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={isLoadingLocations}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una ubicación..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingLocations && (
                          <SelectItem value="loading" disabled>
                            Cargando...
                          </SelectItem>
                        )}
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>{" "}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Conteo de fin de mes, sección A"
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
                {" "}
                Cancelar{" "}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Iniciar Conteo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
