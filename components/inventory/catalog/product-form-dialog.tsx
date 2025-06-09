// components/inventory/catalog/product-form-dialog.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { Product, Category, Supplier } from "@/types/inventory.types";
import { ProductType as PrismaProductType } from "@/types/prisma-enums"; // Usa tu enum local
import { Prisma } from "@prisma/client"; // Para Prisma.JsonNull

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const productTypeLabels: Record<PrismaProductType, string> = {
  GENERAL: "General",
  NEW: "Nuevo (Serializado)", // Etiqueta más descriptiva
  USED: "Usado (Serializado)",
  REFURBISHED: "Reacondicionado (Serializado)",
  ACCESSORY: "Accesorio",
  SPARE_PART: "Repuesto",
  SERVICE: "Servicio",
  BUNDLE: "Bundle/Kit",
  OTHER: "Otro",
};
const ALL_PRODUCT_TYPES = Object.values(PrismaProductType);
const NULL_SELECT_VALUE = "__NULL__";

const productFormSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres.").max(100),
  sku: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  description: z
    .string()
    .max(500)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  brand: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  model: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  productType: z.nativeEnum(PrismaProductType, {
    required_error: "Tipo es requerido.",
  }),
  tracksImei: z.boolean().default(false),
  costPrice: z.coerce
    .number()
    .min(0, "Costo debe ser >= 0.")
    .optional()
    .nullable(),
  sellingPrice: z.coerce
    .number()
    .min(0, "Precio debe ser >= 0.")
    .optional()
    .nullable(),
  reorderLevel: z.coerce
    .number()
    .int("Debe ser entero.")
    .min(0)
    .optional()
    .nullable(),
  idealStockLevel: z.coerce
    .number()
    .int("Debe ser entero.")
    .min(0)
    .optional()
    .nullable(),
  attributesArray: z
    .array(
      z.object({
        key: z
          .string()
          .min(1, "Nombre de atributo no puede estar vacío.")
          .max(50),
        value: z
          .string()
          .min(1, "Valor de atributo no puede estar vacío.")
          .max(100),
      })
    )
    .optional()
    .default([]),
  isActive: z.boolean().default(true),
  categoryId: z
    .string()
    .min(1, "Debe seleccionar una categoría o ninguna")
    .optional()
    .nullable(), // Quita .uuid() temporalmente
  supplierId: z
    .string()
    .min(1, "Debe seleccionar un proveedor o ninguno")
    .optional()
    .nullable(),
  bundleComponentsData: z
    .array(
      z.object({
        componentProductId: z
          .string()
          .min(1, { message: "Debe seleccionar un producto componente." }),
        quantity: z.coerce.number().int().positive("Cantidad debe ser > 0."),
      })
    )
    .optional()
    .default([]),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormDialogProps {
  product?: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductFormDialog({
  product,
  isOpen,
  onOpenChange,
  onSuccess,
}: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!product?.id;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      // Estos se sobrescribirán por el useEffect al abrir/cambiar producto
      name: "",
      sku: null,
      description: null,
      brand: null,
      model: null,
      productType: PrismaProductType.GENERAL,
      tracksImei: false,
      costPrice: null,
      sellingPrice: null,
      reorderLevel: null,
      idealStockLevel: null,
      attributes: null,
      isActive: true,
      categoryId: null,
      supplierId: null,
      bundleComponentsData: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    // Añadir replace
    control: form.control,
    name: "bundleComponentsData",
  });

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control: form.control,
    name: "attributesArray",
  });

  const [productToAction, setProductToAction] = useState<Product | null>(null);
  const [isDeactivateActivateDialogOpen, setIsDeactivateActivateDialogOpen] =
    useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const watchedProductType = form.watch("productType");

  // Fetch para Categorías
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[], // <-- Esperamos un array de Category
    Error
  >({
    queryKey: ["allCategoriesForProductForm"],
    queryFn: async () => {
      console.log(
        "FETCHING Categories: /inventory/categories?limit=500&page=1"
      );
      const response = await apiClient.get(
        "/inventory/categories?limit=500&page=1"
      ); // Añadir page=1
      console.log("RAW Category Response:", response.data);
      // Asumimos que el backend devuelve { data: Category[], ... }
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      // Si la respuesta no tiene .data.data pero response.data es el array (menos probable con paginación)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn(
        "Formato inesperado de respuesta para categorías:",
        response.data
      );
      return []; // Devolver array vacío si el formato no es el esperado
    },
  });

  // Fetch para Proveedores
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<
    Supplier[], // <-- Esperamos un array de Supplier
    Error
  >({
    queryKey: ["allSuppliersForProductForm"],
    queryFn: async () => {
      console.log("FETCHING Suppliers: /inventory/suppliers?limit=100&page=1");
      const response = await apiClient.get(
        "/inventory/suppliers?limit=100&page=1"
      ); // Añadir page=1
      console.log("RAW Supplier Response:", response.data);
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn(
        "Formato inesperado de respuesta para proveedores:",
        response.data
      );
      return [];
    },
  });

  // Fetch para Productos (para el selector de componentes del bundle)
  const { data: allProducts, isLoading: isLoadingAllProducts } = useQuery<
    Product[], // <-- Esperamos un array de Product
    Error
  >({
    queryKey: ["allProductsForBundleComponents"],
    queryFn: async () => {
      console.log(
        "FETCHING Products: /inventory/products?limit=1000&isActive=true&page=1"
      );
      const response = await apiClient.get(
        "/inventory/products?limit=1000&isActive=true&page=1"
      ); // Añadir page=1
      console.log("RAW All Products Response:", response.data);
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn(
        "Formato inesperado de respuesta para todos los productos:",
        response.data
      );
      return [];
    },
    enabled: watchedProductType === PrismaProductType.BUNDLE,
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && product) {
        form.reset({
          name: product.name,
          sku: product.sku || null,
          description: product.description || null,
          brand: product.brand || null,
          model: product.model || null,
          productType: product.productType,
          tracksImei: product.tracksImei,
          costPrice:
            product.costPrice !== null && product.costPrice !== undefined
              ? parseFloat(String(product.costPrice))
              : null,
          sellingPrice:
            product.sellingPrice !== null && product.sellingPrice !== undefined
              ? parseFloat(String(product.sellingPrice))
              : null,
          reorderLevel: product.reorderLevel ?? null,
          idealStockLevel: product.idealStockLevel ?? null,
          attributesArray: product.attributes // Asumimos que product.attributes es Record<string, any>
            ? Object.entries(product.attributes as Record<string, any>).map(
                ([key, value]) => ({ key, value: String(value) })
              )
            : [],
          isActive: product.isActive,
          categoryId: product.categoryId || null,
          supplierId: product.supplierId || null,
          bundleComponentsData:
            product.bundleComponents?.map((c) => ({
              componentProductId: c.componentProductId,
              quantity: c.quantity,
            })) || [],
        });
      } else {
        // Modo Creación o si product es null
        form.reset({
          name: "",
          sku: null,
          description: null,
          brand: null,
          model: null,
          productType: PrismaProductType.GENERAL,
          tracksImei: false,
          costPrice: null,
          sellingPrice: null,
          reorderLevel: null,
          idealStockLevel: null,
          attributes: null,
          isActive: true,
          categoryId: null,
          supplierId: null,
          bundleComponentsData: [],
        });
      }
    }
  }, [product, isEditMode, isOpen, form]);

  const mutation = useMutation<Product, Error, ProductFormValues>({
    mutationFn: async (formData: ProductFormValues) => {
      const apiData: any = { ...formData };
      delete apiData.attributesArray;

      if (formData.attributesArray && formData.attributesArray.length > 0) {
        apiData.attributes = formData.attributesArray.reduce((obj, item) => {
          if (item.key) {
            // Solo añadir si la clave tiene un valor
            obj[item.key.trim()] = item.value;
          }
          return obj;
        }, {} as Record<string, unknown>);
      } else {
        apiData.attributes = Prisma.JsonNull; // O null si prefieres
      }

      if (apiData.productType !== PrismaProductType.BUNDLE) {
        apiData.bundleComponentsData = [];
      } else {
        // Asegurar que los componentes no estén vacíos si es bundle
        if (
          !apiData.bundleComponentsData ||
          apiData.bundleComponentsData.length === 0
        ) {
          // No lanzar error, el backend lo validará si es mandatorio
          // O puedes añadir una validación Zod con refine al schema principal
        }
      }

      // Convertir campos numéricos opcionales a null si están vacíos
      (
        [
          "costPrice",
          "sellingPrice",
          "reorderLevel",
          "idealStockLevel",
        ] as const
      ).forEach((key) => {
        if (apiData[key] === "") apiData[key] = null;
      });

      const url =
        isEditMode && product
          ? `/inventory/products/${product.id}`
          : "/inventory/products";
      const method = isEditMode ? "patch" : "post";

      const response = await apiClient[method]<Product>(url, apiData);
      return response.data;
    },
    onSuccess: (savedProduct) => {
      toast.success(
        `Producto "${savedProduct.name}" ${
          isEditMode ? "actualizado" : "creado"
        }.`
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryProducts"] });
      queryClient.invalidateQueries({
        queryKey: ["allProductsForBundleComponents"],
      });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        `Error al ${isEditMode ? "actualizar" : "crear"} producto.`;
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    },
  });

  function onSubmit(data: ProductFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Producto" : "Crear Nuevo Producto"}
          </DialogTitle>
          <DialogDescription>
            Completa la información del producto. Los campos marcados con * son
            requeridos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            {/* --- Información General --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Nombre*</FormLabel>{" "}
                      <FormControl>
                        <Input placeholder="Ej: iPhone 15 Pro Max" {...field} />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>SKU</FormLabel>{" "}
                        <FormControl>
                          <Input
                            placeholder="Ej: APP-IP15PM-256"
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
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Marca</FormLabel>{" "}
                        <FormControl>
                          <Input
                            placeholder="Ej: Apple"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Modelo</FormLabel>{" "}
                      <FormControl>
                        <Input
                          placeholder="Ej: A2849"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Descripción</FormLabel>{" "}
                      <FormControl>
                        <Textarea
                          placeholder="Descripción detallada..."
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* --- Tipo y Seguimiento --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipo y Seguimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Tipo de Producto*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ALL_PRODUCT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {productTypeLabels[type] || type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>{" "}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tracksImei"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        {" "}
                        <FormLabel>Rastrea IMEI/Serial</FormLabel>{" "}
                        <FormDescription>
                          Marcar si tiene serial único.
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
              </CardContent>
            </Card>

            {/* --- Precios y Stock --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Precios y Niveles de Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Precio Venta</FormLabel>{" "}
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
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
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Precio Costo</FormLabel>{" "}
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
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
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reorderLevel"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Nivel Reorden</FormLabel>{" "}
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : parseInt(e.target.value, 10)
                              )
                            }
                          />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idealStockLevel"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Stock Ideal</FormLabel>{" "}
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : parseInt(e.target.value, 10)
                              )
                            }
                          />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* --- Clasificación y Estado --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Clasificación y Estado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(
                            value === NULL_SELECT_VALUE ? null : value
                          )
                        }
                        value={
                          field.value === null
                            ? NULL_SELECT_VALUE
                            : field.value || undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona categoría..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NULL_SELECT_VALUE}>
                            <em>Ninguna</em>
                          </SelectItem>
                          {isLoadingCategories && (
                            <SelectItem value="loading-cat" disabled>
                              Cargando...
                            </SelectItem>
                          )}
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>{" "}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Proveedor</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(
                            value === NULL_SELECT_VALUE ? null : value
                          )
                        }
                        value={
                          field.value === null
                            ? NULL_SELECT_VALUE
                            : field.value || undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona proveedor..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={NULL_SELECT_VALUE}>
                            <em>Ninguno</em>
                          </SelectItem>
                          {isLoadingSuppliers && (
                            <SelectItem value="loading-sup" disabled>
                              Cargando...
                            </SelectItem>
                          )}
                          {suppliers?.map((sup) => (
                            <SelectItem key={sup.id} value={sup.id}>
                              {sup.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>{" "}
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
                        {" "}
                        <FormLabel>Activo</FormLabel>{" "}
                        <FormDescription>
                          Disponible para venta/uso.
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
              </CardContent>
            </Card>

            {/* --- Atributos JSON --- */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atributos Adicionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {attributeFields.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 border p-3 rounded-md relative"
                  >
                    <FormField
                      control={form.control}
                      name={`attributesArray.${index}.key`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Nombre Atributo
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Color" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`attributesArray.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className={index !== 0 ? "sr-only" : ""}>
                            Valor Atributo
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Rojo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(index)}
                      className="shrink-0 text-destructive hover:text-destructive/80 mt-7"
                    >
                      {" "}
                      {/* Ajustar margen si FormLabel es sr-only */}
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAttribute({ key: "", value: "" })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Añadir Atributo
                </Button>
              </CardContent>
            </Card>

            {/* --- SECCIÓN CONDICIONAL PARA BUNDLES --- */}
            {watchedProductType === PrismaProductType.BUNDLE && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Componentes del Bundle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-end gap-2 border p-3 rounded-md relative"
                    >
                      <FormField
                        control={form.control}
                        name={`bundleComponentsData.${index}.componentProductId`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Componente*</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona componente..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* No añadir un SelectItem con value="" aquí si el campo es requerido */}
                                {isLoadingAllProducts && (
                                  <SelectItem value="loading-bprod" disabled>
                                    Cargando productos...
                                  </SelectItem>
                                )}
                                {allProducts
                                  ?.filter(
                                    (p) =>
                                      p.id !== product?.id &&
                                      p.productType !== PrismaProductType.BUNDLE
                                  )
                                  .map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {" "}
                                      {/* value es p.id (string UUID) */}
                                      {p.name} ({p.sku || "N/A"})
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>{" "}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`bundleComponentsData.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-28">
                            {" "}
                            <FormLabel>Cantidad*</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                value={field.value || ""}
                                onChange={(e) =>
                                  field.onChange(
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="shrink-0 text-destructive hover:text-destructive/80 absolute top-1 right-1 h-6 w-6"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ componentProductId: "", quantity: 1 })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Componente
                  </Button>
                </CardContent>
              </Card>
            )}

            <DialogFooter className="pt-6 sticky bottom-0 bg-background py-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  mutation.isPending || (!form.formState.isDirty && isEditMode)
                }
              >
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
