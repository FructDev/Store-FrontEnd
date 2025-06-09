// components/inventory/purchase-orders/edit-po-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { PurchaseOrder, SupplierBasic } from "@/types/inventory.types"; // Tus tipos
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker"; // Tu componente DatePicker
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { format } from "date-fns"; // Para formatear fechas para el DTO backend

const NULL_SELECT_VALUE = "__NULL_VALUE__"; // Para Selects opcionales

// Schema Zod para el formulario de edición de PO (campos generales)
const editPOFormSchema = z.object({
  supplierId: z.string().uuid("Proveedor es requerido.").nullable(), // Puede ser null
  orderDate: z.date({ required_error: "Fecha de orden es requerida." }),
  expectedDate: z.date().optional().nullable(),
  notes: z
    .string()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});
type EditPOFormValues = z.infer<typeof editPOFormSchema>;

interface EditPODialogProps {
  po: PurchaseOrder | null; // La PO a editar
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void; // Callback opcional
}

export function EditPODialog({
  po,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditPODialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<EditPOFormValues>({
    resolver: zodResolver(editPOFormSchema),
    defaultValues: {
      // Se llenarán en useEffect
      supplierId: null,
      orderDate: new Date(),
      expectedDate: null,
      notes: "",
    },
  });

  // Fetch de proveedores para el Select
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<
    SupplierBasic[]
  >({
    queryKey: ["allSuppliersForPOEditForm"],
    queryFn: () =>
      apiClient
        .get("/inventory/suppliers?isActive=true&limit=100")
        .then((res) => res.data.data || res.data),
  });

  useEffect(() => {
    if (po && isOpen) {
      form.reset({
        supplierId: po.supplierId || null,
        orderDate: po.orderDate ? new Date(po.orderDate) : new Date(),
        expectedDate: po.expectedDate ? new Date(po.expectedDate) : null,
        notes: po.notes || "",
      });
    } else if (!po && isOpen) {
      // Si se abre sin PO (no debería pasar para editar)
      form.reset({
        supplierId: null,
        orderDate: new Date(),
        expectedDate: null,
        notes: "",
      });
    }
  }, [po, isOpen, form]);

  const updatePOMutation = useMutation<
    PurchaseOrder, // Asume que el backend devuelve la PO actualizada
    Error,
    EditPOFormValues // Los datos del formulario
  >({
    mutationFn: async (data: EditPOFormValues) => {
      if (!po?.id)
        throw new Error(
          "ID de Orden de Compra no disponible para actualización."
        );

      const payload = {
        ...data,
        // Formatear fechas a string YYYY-MM-DD si el backend lo espera así para PATCH
        // o asegurarse que el backend DTO con @Type(() => Date) maneje bien el objeto Date.
        // Si el backend espera string:
        orderDate: data.orderDate
          ? format(data.orderDate, "yyyy-MM-dd")
          : undefined, // o enviar como Date
        expectedDate: data.expectedDate
          ? format(data.expectedDate, "yyyy-MM-dd")
          : null,
        // supplierId ya está como string o null
      };
      // Remover campos que no se envían si son undefined (opcional, Prisma los ignora)
      // if (payload.expectedDate === undefined) delete payload.expectedDate;

      const response = await apiClient.patch<PurchaseOrder>(
        `/inventory/purchase-orders/${po.id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (updatedPO) => {
      toast.success(`Orden de Compra #${updatedPO.poNumber} actualizada.`);
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] }); // Refrescar lista
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrderDetails", po?.id],
      }); // Refrescar detalle si está abierto
      onOpenChange(false); // Cerrar diálogo
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "Error al actualizar la Orden de Compra.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    },
  });

  function onSubmit(data: EditPOFormValues) {
    updatePOMutation.mutate(data);
  }

  if (!po) return null; // No renderizar si no hay PO

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Orden de Compra: {po.poNumber}</DialogTitle>
          <DialogDescription>
            Modifica los detalles generales de la PO. Las líneas de producto se
            gestionan por separado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="supplierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor*</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === NULL_SELECT_VALUE ? null : value)
                    }
                    value={
                      field.value === null
                        ? NULL_SELECT_VALUE
                        : field.value || undefined
                    }
                    disabled={isLoadingSuppliers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un proveedor..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NULL_SELECT_VALUE}>
                        <em>Mantener actual / Ninguno si es posible</em>
                      </SelectItem>
                      {isLoadingSuppliers && (
                        <SelectItem value="loading-sup" disabled>
                          Cargando...
                        </SelectItem>
                      )}
                      {suppliers?.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="orderDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Orden*</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholderText="Fecha de Orden"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Entrega Esperada</FormLabel>
                    <DatePicker
                      selected={field.value}
                      onSelect={field.onChange}
                      placeholderText="Fecha Esperada"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas internas o para el proveedor..."
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
                disabled={updatePOMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updatePOMutation.isPending || !form.formState.isDirty}
              >
                {updatePOMutation.isPending && (
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
