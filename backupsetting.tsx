// app/(dashboard)/settings/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  Store,
  StoreCounter,
  InventoryLocation,
  PaymentMethod as PrismaPaymentMethod,
} from "@/types/settings.types"; // Asumiendo acceso a estos tipos o definiendo equivalentes

import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox"; // Para métodos de pago
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth.store";

// Tipos para la respuesta de GET /stores/settings (simplificado, ajusta según tu backend)
interface StoreSettingsResponse extends Store {
  counter: StoreCounter | null;
  defaultReturnLocation: Pick<InventoryLocation, "id" | "name"> | null;
  defaultPoReceiveLocation: Pick<InventoryLocation, "id" | "name"> | null;
}

// Schema Zod para el formulario de configuración (refleja UpdateStoreSettingsDto)
const storeSettingsFormSchema = z.object({
  name: z.string().min(3, "Nombre muy corto").max(100).optional(),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  defaultTaxRate: z.coerce.number().min(0).max(1).optional().nullable(), // coerce para convertir string de input a number
  contactEmail: z
    .string()
    .email("Email inválido")
    .max(100)
    .optional()
    .nullable(),
  website: z.string().url("URL inválida").max(100).optional().nullable(),
  currencySymbol: z.string().max(5).optional().nullable(),
  quoteTerms: z.string().optional().nullable(),
  repairTerms: z.string().optional().nullable(),
  defaultRepairWarrantyDays: z.coerce
    .number()
    .int()
    .min(0)
    .optional()
    .nullable(),

  // Secuencias de Numeración (StoreCounter)
  saleNumberPrefix: z.string().max(10).optional(),
  saleNumberPadding: z.coerce.number().int().min(3).max(10).optional(),
  lastSaleNumber: z.coerce.number().int().min(0).optional(),

  repairNumberPrefix: z.string().max(10).optional(),
  repairNumberPadding: z.coerce.number().int().min(3).max(10).optional(),
  lastRepairNumber: z.coerce.number().int().min(0).optional(),

  poNumberPrefix: z.string().max(10).optional(),
  poNumberPadding: z.coerce.number().int().min(3).max(10).optional(),
  lastPoNumber: z.coerce.number().int().min(0).optional(),

  stockCountNumberPrefix: z.string().max(10).optional(),
  stockCountNumberPadding: z.coerce.number().int().min(3).max(10).optional(),
  lastStockCountNumber: z.coerce.number().int().min(0).optional(),

  // Métodos de Pago y Ubicaciones Default
  acceptedPaymentMethods: z.array(z.nativeEnum(PrismaPaymentMethod)).optional(),
  defaultReturnLocationId: z
    .string()
    .uuid("ID de ubicación inválido")
    .optional()
    .nullable(),
  defaultPoReceiveLocationId: z
    .string()
    .uuid("ID de ubicación inválido")
    .optional()
    .nullable(),
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsFormSchema>;

// Todos los métodos de pago disponibles del Enum de Prisma
const ALL_PAYMENT_METHODS = Object.values(PrismaPaymentMethod);

export default function StoreSettingsPage() {
  const queryClient = useQueryClient();

  // 1. Fetch de la configuración actual
  const {
    data: currentSettings,
    isLoading: isLoadingSettings,
    isError,
    error,
  } = useQuery<StoreSettingsResponse, Error>({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const response = await apiClient.get<StoreSettingsResponse>(
        "/stores/settings"
      );
      return response.data;
    },
  });

  // 2. Fetch de ubicaciones para los Selects
  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocation[],
    Error
  >({
    queryKey: ["inventoryLocationsList"], // Usar una key diferente
    queryFn: async () => {
      const response = await apiClient.get<InventoryLocation[]>(
        "/inventory/locations"
      ); // Asume que lista todas
      return response.data;
    },
    enabled: !!currentSettings, // Solo ejecutar si currentSettings ya cargó
  });

  const form = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsFormSchema),
    defaultValues: {
      name: "", // Usar "" en lugar de currentSettings.name || "" directamente aquí
      address: "",
      phone: "",
      defaultTaxRate: 0.18, // Un valor numérico inicial
      contactEmail: "",
      website: "",
      currencySymbol: "$",
      quoteTerms: "",
      repairTerms: "",
      defaultRepairWarrantyDays: 30, // Valor numérico

      saleNumberPrefix: "VTA-", // Valores iniciales definidos
      saleNumberPadding: 5,
      lastSaleNumber: 0,
      // ... etc. para todos los campos del Zod schema
      repairNumberPrefix: "REP-" /*...*/,
      poNumberPrefix: "PO-" /*...*/,
      stockCountNumberPrefix: "SC-" /*...*/,

      acceptedPaymentMethods: [], // Inicializar como array vacío
      defaultReturnLocationId: null, // 'null' es un valor definido, pero el input lo tratará como ""
      defaultPoReceiveLocationId: null,
    },
  });

  // Poblar el formulario cuando currentSettings cargue
  useEffect(() => {
    if (currentSettings) {
      form.reset({
        name: currentSettings.name || "",
        address: currentSettings.address || "",
        phone: currentSettings.phone || "",
        defaultTaxRate:
          currentSettings.defaultTaxRate !== null &&
          currentSettings.defaultTaxRate !== undefined
            ? parseFloat(String(currentSettings.defaultTaxRate)) // Convertir a string primero por si es número
            : 0.18, // Default si es null o undefined
        contactEmail: currentSettings.contactEmail || "",
        website: currentSettings.website || "",
        currencySymbol: currentSettings.currencySymbol || "$",
        quoteTerms: currentSettings.quoteTerms || "",
        repairTerms: currentSettings.repairTerms || "",
        defaultRepairWarrantyDays:
          currentSettings.defaultRepairWarrantyDays ?? 30,

        saleNumberPrefix: currentSettings.counter?.saleNumberPrefix || "VTA-",
        saleNumberPadding: currentSettings.counter?.saleNumberPadding || 5,
        lastSaleNumber: currentSettings.counter?.lastSaleNumber || 0,

        repairNumberPrefix:
          currentSettings.counter?.repairNumberPrefix || "REP-",
        repairNumberPadding: currentSettings.counter?.repairNumberPadding || 5,
        lastRepairNumber: currentSettings.counter?.lastRepairNumber || 0,

        poNumberPrefix: currentSettings.counter?.poNumberPrefix || "PO-",
        poNumberPadding: currentSettings.counter?.poNumberPadding || 5,
        lastPoNumber: currentSettings.counter?.lastPoNumber || 0,

        stockCountNumberPrefix:
          currentSettings.counter?.stockCountNumberPrefix || "SC-",
        stockCountNumberPadding:
          currentSettings.counter?.stockCountNumberPadding || 5,
        lastStockCountNumber:
          currentSettings.counter?.lastStockCountNumber || 0,

        acceptedPaymentMethods: currentSettings.acceptedPaymentMethods || [],
        defaultReturnLocationId:
          currentSettings.defaultReturnLocationId || null,
        defaultPoReceiveLocationId:
          currentSettings.defaultPoReceiveLocationId || null,
      });
    }
  }, [currentSettings, form]);

  const updateSettingsMutation = useMutation<
    StoreSettingsResponse,
    Error,
    StoreSettingsFormValues
  >({
    mutationFn: async (data) => {
      // Filtrar campos que son undefined o string vacío para no enviar actualizacion innecesaria
      // o si el backend los maneja como "no cambiar". Prisma los ignora si son undefined.
      const cleanData: Partial<StoreSettingsFormValues> = {};
      (Object.keys(data) as Array<keyof StoreSettingsFormValues>).forEach(
        (key) => {
          if (
            data[key] !== undefined &&
            data[key] !== null &&
            data[key] !== ""
          ) {
            // @ts-expect-error May accur an error
            cleanData[key] = data[key];
          } else if (
            data[key] === null &&
            (key === "defaultReturnLocationId" ||
              key === "defaultPoReceiveLocationId")
          ) {
            // Permitir enviar null para desvincular ubicaciones
            cleanData[key] = null;
          }
        }
      );

      const response = await apiClient.patch<StoreSettingsResponse>(
        "/stores/settings",
        cleanData
      );
      return response.data;
    },
    onSuccess: (updatedData) => {
      toast.success("Configuración de la tienda actualizada exitosamente.");
      queryClient.setQueryData(["storeSettings"], updatedData); // Actualizar caché de React Query
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] }); // Opcional: forzar re-fetch
      // Actualizar el nombre de la tienda en el authStore si cambió
      if (
        updatedData.name &&
        useAuthStore.getState().user?.storeName !== updatedData.name
      ) {
        useAuthStore.getState().setStoreName(updatedData.name);
      }
    },
    onError: (error: any) => {
      const errorMsg =
        error.response?.data?.message ||
        "Error al actualizar la configuración.";
      toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
    },
  });

  function onSubmit(data: StoreSettingsFormValues) {
    console.log("Datos a enviar para settings:", data);
    updateSettingsMutation.mutate(data);
  }

  if (isLoadingSettings) {
    return (
      <div className="space-y-4">
        <PageHeader
          title="Configuración de la Tienda"
          description="Cargando configuración..."
        />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500">
        Error cargando configuración: {error.message}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Configuración de la Tienda"
        description="Personaliza la información y el funcionamiento de tu tienda."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Información General --- */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Tienda</FormLabel>{" "}
                      <FormControl>
                        <Input {...field} />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Email de Contacto</FormLabel>{" "}
                      <FormControl>
                        <Input
                          type="email"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Dirección</FormLabel>{" "}
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Teléfono</FormLabel>{" "}
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Sitio Web</FormLabel>{" "}
                      <FormControl>
                        <Input
                          type="url"
                          {...field}
                          value={field.value ?? ""}
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
                  name="currencySymbol"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>Símbolo de Moneda</FormLabel>{" "}
                      <FormControl>
                        <Input
                          maxLength={5}
                          {...field}
                          value={field.value ?? "$"}
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="defaultTaxRate"
                  render={({ field }) => (
                    <FormItem>
                      {" "}
                      <FormLabel>
                        Tasa de Impuesto General (Ej: 0.18 para 18%)
                      </FormLabel>{" "}
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value ?? ""} // Convertir null/undefined a string vacío
                          onChange={(e) => {
                            const value = e.target.value;
                            // Permitir string vacío o convertir a número, Zod se encargará de la validación final
                            field.onChange(
                              value === "" ? null : parseFloat(value)
                            );
                          }}
                        />
                      </FormControl>{" "}
                      <FormMessage />{" "}
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* --- Secuencias de Numeración --- */}
          <Card>
            <CardHeader>
              <CardTitle>Secuencias de Numeración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ventas */}
              <div>
                <h4 className="font-medium mb-2">Ventas</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="saleNumberPrefix"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Prefijo</FormLabel>{" "}
                        <FormControl>
                          <Input {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saleNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Relleno (dígitos)</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastSaleNumber"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Último Número Usado</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Reparaciones */}
              <div>
                <h4 className="font-medium mb-2">Reparaciones</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="repairNumberPrefix"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Prefijo</FormLabel>{" "}
                        <FormControl>
                          <Input {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="repairNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Relleno</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastRepairNumber"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Último Usado</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Órdenes de Compra */}
              <div>
                <h4 className="font-medium mb-2">Órdenes de Compra</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="poNumberPrefix"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Prefijo</FormLabel>{" "}
                        <FormControl>
                          <Input {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="poNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Relleno</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastPoNumber"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Último Usado</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Conteos de Stock */}
              <div>
                <h4 className="font-medium mb-2">Conteos de Stock</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="stockCountNumberPrefix"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Prefijo</FormLabel>{" "}
                        <FormControl>
                          <Input {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stockCountNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Relleno</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastStockCountNumber"
                    render={({ field }) => (
                      <FormItem>
                        {" "}
                        <FormLabel>Último Usado</FormLabel>{" "}
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>{" "}
                        <FormMessage />{" "}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- Métodos de Pago y Ubicaciones Default --- */}
          <Card>
            <CardHeader>
              <CardTitle>Operaciones y Pagos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="acceptedPaymentMethods"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">
                        Métodos de Pago Aceptados
                      </FormLabel>
                      <FormDescription>
                        Selecciona los métodos de pago que tu tienda aceptará.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {ALL_PAYMENT_METHODS.map((method) => (
                        <FormField
                          key={method}
                          control={form.control}
                          name="acceptedPaymentMethods"
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(method)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            method,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== method
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal capitalize">
                                  {method.toLowerCase().replace("_", " ")}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultReturnLocationId"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Ubicación Default para Devoluciones</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ubicación..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          <em>Ninguna</em>
                        </SelectItem>
                        {isLoadingLocations && (
                          <SelectItem value="loading" disabled>
                            Cargando ubicaciones...
                          </SelectItem>
                        )}
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultPoReceiveLocationId"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>
                      Ubicación Default para Recepción de PO
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ubicación..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          <em>Ninguna</em>
                        </SelectItem>
                        {isLoadingLocations && (
                          <SelectItem value="loading" disabled>
                            Cargando ubicaciones...
                          </SelectItem>
                        )}
                        {locations?.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* --- Términos y Condiciones --- */}
          <Card>
            <CardHeader>
              <CardTitle>Términos y Condiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="quoteTerms"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Términos para Cotizaciones</FormLabel>{" "}
                    <FormControl>
                      <Textarea rows={4} {...field} value={field.value ?? ""} />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repairTerms"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>Términos para Reparaciones</FormLabel>{" "}
                    <FormControl>
                      <Textarea rows={4} {...field} value={field.value ?? ""} />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="defaultRepairWarrantyDays"
                render={({ field }) => (
                  <FormItem>
                    {" "}
                    <FormLabel>
                      Días de Garantía Default para Reparaciones
                    </FormLabel>{" "}
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""} // Convertir null/undefined a string vacío
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? null : parseInt(value, 10)
                          );
                        }}
                      />
                    </FormControl>{" "}
                    <FormMessage />{" "}
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
