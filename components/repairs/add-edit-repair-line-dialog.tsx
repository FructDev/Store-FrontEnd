// components/repairs/add-edit-repair-line-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { ProductBasic } from "@/types/inventory.types"; // O desde repairs.types
import { ProductType as PrismaProductType } from "@/types/prisma-enums"; // Para filtrar productos
import { RepairLineItem } from "@/types/repairs.types"; // O desde inventory.types

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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import React, { useEffect, useState } from "react"; // React import
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

// Schema Zod para el formulario de línea de reparación
// (Asegúrate que coincida con AddRepairLineDto y UpdateRepairLineDto del backend)
const repairLineFormSchema = z
  .object({
    id: z.string().optional(), // Solo para modo edición
    productId: z.string().optional().nullable(),
    productName: z.string().optional().nullable(),
    miscDescription: z.string().max(255, "Máx 255 chars").optional().nullable(),
    quantity: z.coerce
      .number()
      .int("Debe ser entero.")
      .positive("Cantidad debe ser mayor a 0."),
    unitPrice: z.coerce.number().min(0, "Precio no puede ser negativo."),
    unitCost: z.coerce.number().min(0).optional().nullable(),
  })
  .refine(
    (data) =>
      data.productId ||
      (data.miscDescription && data.miscDescription.trim() !== ""),
    {
      message:
        "Debe seleccionar un Producto/Servicio del catálogo o ingresar una Descripción Manual.",
      path: ["productId"], // Aplicar el error a productId o a un path general
    }
  )
  .refine(
    (data) =>
      !(
        data.productId &&
        data.miscDescription &&
        data.miscDescription.trim() !== ""
      ),
    {
      message:
        "No puede seleccionar un Producto del catálogo Y tener una Descripción Manual al mismo tiempo.",
      path: ["miscDescription"],
    }
  );

type RepairLineFormValues = z.infer<typeof repairLineFormSchema>;

interface AddEditRepairLineDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  repairId: string;
  lineData?: RepairLineItem | null; // Datos de la línea si es modo edición
  onSuccess: () => void; // Para refrescar la lista de líneas en la página padre
}

export function AddEditRepairLineDialog({
  isOpen,
  onOpenChange,
  repairId,
  lineData,
  onSuccess,
}: AddEditRepairLineDialogProps) {
  const isEditMode = !!lineData?.id;
  const queryClient = useQueryClient();

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearchTerm = useDebounce(productSearchTerm, 300);
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);

  const form = useForm<RepairLineFormValues>({
    resolver: zodResolver(repairLineFormSchema),
    defaultValues: {
      productId: null,
      productName: null,
      miscDescription: "",
      quantity: 1,
      unitPrice: 0,
      unitCost: null,
      ...(lineData && {
        // Si estamos editando, poblar con lineData
        id: lineData.id,
        productId: lineData.productId || null,
        miscDescription: lineData.miscDescription || "",
        quantity: lineData.quantity,
        unitPrice: Number(lineData.unitPrice) || 0, // Asegurar que sea número
        unitCost:
          lineData.unitCost !== null && lineData.unitCost !== undefined
            ? Number(lineData.unitCost)
            : null,
      }),
    },
  });

  // Resetear y poblar el form cuando el diálogo se abre o lineData cambia
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && lineData) {
        form.reset({
          id: lineData.id,
          productId: lineData.productId || null,
          productName: lineData.product?.name || null,
          miscDescription: lineData.miscDescription || "",
          quantity: lineData.quantity,
          unitPrice: Number(lineData.unitPrice) || 0,
          unitCost:
            lineData.unitCost !== null && lineData.unitCost !== undefined
              ? Number(lineData.unitCost)
              : null,
        });
      } else {
        // Modo creación
        form.reset({
          productId: null,
          productName: null,
          miscDescription: "",
          quantity: 1,
          unitPrice: 0,
          unitCost: null,
        });
      }
    }
  }, [isOpen, lineData, isEditMode, form]);

  // Fetch de productos/servicios para el selector
  const { data: productsForSelect, isLoading: isLoadingProducts } = useQuery<
    ProductBasic[]
  >({
    queryKey: ["productsForRepairLineSelect", debouncedProductSearchTerm],
    queryFn: async () => {
      if (
        !debouncedProductSearchTerm &&
        !isEditMode &&
        !form.getValues("productId")
      )
        return []; // No buscar si no hay término y no estamos editando con un producto ya seleccionado
      const params: Record<string, any> = {
        isActive: true,
        limit: 15,
        // No incluir BUNDLES como repuestos o servicios directos, a menos que se maneje su stock
        // productType_not_in: [PrismaProductType.BUNDLE],
      };
      if (debouncedProductSearchTerm)
        params.search = debouncedProductSearchTerm;

      const desiredProductTypes = [
        PrismaProductType.SERVICE,
        PrismaProductType.SPARE_PART, // Asumiendo que tienes este tipo en tu enum
        // Podrías añadir ProductType.GENERAL si los repuestos generales caen ahí
        // O ProductType.ACCESSORY si los accesorios se usan como repuestos
      ];
      params.productTypes_in = desiredProductTypes.join(","); // Enviar como "SERVICE,SPARE_PART"
      // params.productType_not_in = [PrismaProductType.BUNDLE].join(','); // Ya no necesitamos esto si especificamos los que queremos
      // --- FIN CAMBIO ---

      const response = await apiClient.get("/inventory/products", { params });
      return response.data.data || (response.data as ProductBasic[]) || [];
    },
    enabled: isOpen, // Solo buscar cuando el diálogo esté abierto
  });

  const saveLineMutation = useMutation<
    RepairLineItem, // Tipo de respuesta del backend
    Error,
    RepairLineFormValues // Datos del formulario
  >({
    mutationFn: async (data: RepairLineFormValues) => {
      const payload = {
        // Construir payload para AddRepairLineDto o UpdateRepairLineDto
        productId: data.productId || null,
        miscDescription: data.productId ? null : data.miscDescription, // Si hay productId, miscDescription es null
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        unitCost: data.unitCost,
      };

      if (isEditMode && lineData?.id) {
        const response = await apiClient.patch<RepairLineItem>(
          `/repairs/${repairId}/lines/${lineData.id}`,
          payload
        );
        return response.data;
      } else {
        const response = await apiClient.post<RepairLineItem>(
          `/repairs/${repairId}/lines`,
          payload
        );
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(
        `Línea de reparación ${
          isEditMode ? "actualizada" : "añadida"
        } exitosamente.`
      );
      onSuccess(); // Llama al callback para refrescar la lista de líneas en la página padre
      onOpenChange(false); // Cierra este diálogo
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        `Error al ${isEditMode ? "actualizar" : "añadir"} la línea.`;
      toast.error(
        Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg.toString()
      );
    },
  });

  function onSubmit(data: RepairLineFormValues) {
    saveLineMutation.mutate(data);
  }

  const handleProductSelection = (product: ProductBasic) => {
    form.setValue("productId", product.id, { shouldValidate: true });
    form.setValue("productName", product.name, { shouldValidate: true });
    form.setValue("miscDescription", "", { shouldValidate: true }); // Limpiar descripción manual
    form.setValue("unitPrice", Number(product.sellingPrice) || 0, {
      shouldValidate: true,
    });
    // Opcional: setear unitCost si el producto lo tiene
    // form.setValue("unitCost", Number(product.costPrice) || null, { shouldValidate: true });
    setIsProductSearchOpen(false);
    setProductSearchTerm(product.name); // Mostrar nombre en input de búsqueda
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar" : "Añadir"} Línea de Servicio/Repuesto
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica los detalles de la línea."
              : "Añade un nuevo servicio o repuesto a la orden de reparación."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* Selector de Producto/Servicio */}
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Producto/Servicio del Catálogo (Opcional)
                  </FormLabel>
                  <Popover
                    open={isProductSearchOpen}
                    onOpenChange={setIsProductSearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {/* --- CORRECCIÓN AQUÍ --- V V V */}
                          {form.watch("productName") || // Usa el productName del estado del formulario
                            (field.value
                              ? "Producto seleccionado (ID)"
                              : "Seleccionar producto/servicio...")}
                          {/* El fallback 'productSearchTerm' podría ser confuso aquí si no se limpió */}
                          {/* --- FIN CORRECCIÓN --- V V V */}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command
                        filter={(value, search) =>
                          value.toLowerCase().includes(search.toLowerCase())
                            ? 1
                            : 0
                        }
                      >
                        <CommandInput
                          placeholder="Buscar producto/servicio..."
                          value={productSearchTerm}
                          onValueChange={(search) => {
                            setProductSearchTerm(search);
                            // Si el usuario borra la búsqueda, limpiar productId
                            if (search === "") form.setValue("productId", null);
                          }}
                        />
                        <CommandList>
                          {isLoadingProducts && (
                            <CommandItem disabled>Buscando...</CommandItem>
                          )}
                          <CommandEmpty>
                            No se encontraron productos/servicios.
                          </CommandEmpty>
                          {(productsForSelect || []).map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.name + (product.sku || "")} // Valor para la búsqueda
                              onSelect={() => handleProductSelection(product)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  product.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {product.name} {product.sku && `(${product.sku})`}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Deja vacío si es una descripción manual.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descripción Manual */}
            <FormField
              control={form.control}
              name="miscDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    O Descripción Manual (si no es de catálogo)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Limpieza de contactos, Resistencia XYZ"
                      {...field}
                      value={field.value ?? ""}
                      disabled={!!form.watch("productId")} // Deshabilitar si se seleccionó un producto
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        if (e.target.value) form.setValue("productId", null); // Limpiar productId si se escribe aquí
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Cantidad*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Precio Unitario*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="unitCost"
              render={({ field }) => (
                <FormItem>
                  {" "}
                  <FormLabel>
                    Costo Unitario (Opcional, para repuestos)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={0}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? null
                            : parseFloat(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saveLineMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  saveLineMutation.isPending ||
                  (!form.formState.isDirty && isEditMode)
                }
              >
                {saveLineMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Guardar Cambios" : "Añadir Línea"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
