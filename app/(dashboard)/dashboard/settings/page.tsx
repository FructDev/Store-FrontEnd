// app/(dashboard)/settings/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  StoreSettings,
  InventoryLocationSetting, // O tu tipo InventoryLocationBasic
  PaymentMethod, // El enum local
} from "@/types/settings.types"; // Ajusta ruta si es necesario
import { useAuthStore } from "@/stores/auth.store";

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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/utils/get-error-message";
// import { Prisma } from '@prisma/client'; // No deberías necesitar Prisma aquí en el frontend

const ALL_PAYMENT_METHODS = Object.values(PaymentMethod);
const NULL_SELECT_VALUE = "__NULL__"; // Valor especial para "Ninguna" en Selects

// Schema Zod para el formulario (lo tenías en tu código completo anterior)
// Asegúrate que los coercers estén bien, especialmente para números opcionales/nulos
const storeSettingsFormSchema = z.object({
  name: z.string().min(3, "Nombre muy corto").max(100).optional(),
  address: z.string().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  defaultTaxRate: z.coerce
    .number()
    .min(0, "Tasa debe ser >= 0")
    .max(1, "Tasa debe ser <= 1")
    .optional()
    .nullable(),
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
    .min(0, "Días debe ser >= 0")
    .optional()
    .nullable(),

  saleNumberPrefix: z.string().max(10).optional().nullable(),
  saleNumberPadding: z.coerce
    .number()
    .int()
    .min(3)
    .max(10)
    .optional()
    .nullable(),
  lastSaleNumber: z.coerce.number().int().min(0).optional().nullable(),

  repairNumberPrefix: z.string().max(10).optional().nullable(),
  repairNumberPadding: z.coerce
    .number()
    .int()
    .min(3)
    .max(10)
    .optional()
    .nullable(),
  lastRepairNumber: z.coerce.number().int().min(0).optional().nullable(),

  poNumberPrefix: z.string().max(10).optional().nullable(),
  poNumberPadding: z.coerce.number().int().min(3).max(10).optional().nullable(),
  lastPoNumber: z.coerce.number().int().min(0).optional().nullable(),

  stockCountNumberPrefix: z.string().max(10).optional().nullable(),
  stockCountNumberPadding: z.coerce
    .number()
    .int()
    .min(3)
    .max(10)
    .optional()
    .nullable(),
  lastStockCountNumber: z.coerce.number().int().min(0).optional().nullable(),

  acceptedPaymentMethods: z.array(z.nativeEnum(PaymentMethod)).optional(),
  defaultReturnLocationId: z.string().optional().nullable(),
  defaultPoReceiveLocationId: z.string().optional().nullable(),
});
// Este tipo debe coincidir con los campos que realmente se envían o se manejan en el form
type FormValues = z.infer<typeof storeSettingsFormSchema>;

export default function StoreSettingsPage() {
  const queryClient = useQueryClient();
  const { user, setStoreName: setAuthStoreName } = useAuthStore(); // Para actualizar nombre en sidebar

  const {
    data: currentSettings,
    isLoading: isLoadingSettings,
    isError,
    error,
  } = useQuery<StoreSettings, Error>({
    queryKey: ["storeSettings"],
    queryFn: async () =>
      apiClient.get<StoreSettings>("/stores/settings").then((res) => res.data),
  });

  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    InventoryLocationSetting[],
    Error
  >({
    queryKey: ["inventoryLocationsListForSettings"],
    queryFn: async () =>
      apiClient
        .get<InventoryLocationSetting[]>(
          "/inventory/locations?limit=500&fields=id,name"
        )
        .then((res) => res.data),
    enabled: !!currentSettings,
  });

  const form = useForm<FormValues>({
    // Usar FormValues inferido de Zod
    resolver: zodResolver(storeSettingsFormSchema),
    // --- VALORES INICIALES DEFINIDOS para evitar inputs no controlados ---
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      defaultTaxRate: 0.18,
      contactEmail: "",
      website: "",
      currencySymbol: "$",
      quoteTerms: "",
      repairTerms: "",
      defaultRepairWarrantyDays: 30,
      saleNumberPrefix: "VTA-",
      saleNumberPadding: 5,
      lastSaleNumber: 0,
      repairNumberPrefix: "REP-",
      repairNumberPadding: 5,
      lastRepairNumber: 0,
      poNumberPrefix: "PO-",
      poNumberPadding: 5,
      lastPoNumber: 0,
      stockCountNumberPrefix: "SC-",
      stockCountNumberPadding: 5,
      lastStockCountNumber: 0,
      acceptedPaymentMethods: [],
      defaultReturnLocationId: null,
      defaultPoReceiveLocationId: null,
    },
  });

  useEffect(() => {
    if (currentSettings) {
      form.reset({
        name: currentSettings.name || "",
        address: currentSettings.address || "",
        phone: currentSettings.phone || "",
        defaultTaxRate:
          currentSettings.defaultTaxRate !== null &&
          currentSettings.defaultTaxRate !== undefined
            ? parseFloat(String(currentSettings.defaultTaxRate))
            : 0.18,
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

  const updateSettingsMutation = useMutation<StoreSettings, Error, FormValues>({
    mutationFn: async (data) => {
      const cleanData: Partial<FormValues> = {}; // Usar Partial para enviar solo lo que cambió
      (Object.keys(data) as Array<keyof FormValues>).forEach((key) => {
        const formValue = data[key];
        // Comparamos con el valor inicial obtenido de currentSettings para enviar solo lo que cambió
        // O, si currentSettings no está disponible, asumimos que queremos enviar el valor si está definido.
        // Para simplificar, enviamos si no es undefined, el backend maneja si no hay cambios.
        // Pero para los `nullable` string que el input convierte a "", los volvemos null.
        if (
          formValue === "" &&
          [
            "address",
            "phone",
            "contactEmail",
            "website",
            "currencySymbol",
            "quoteTerms",
            "repairTerms",
          ].includes(key)
        ) {
          // @ts-expect-error An Error may be occur
          cleanData[key] = null;
        } else if (formValue !== undefined) {
          // @ts-expect-error Another error may occur
          cleanData[key] = formValue;
        }

        // Específicamente para IDs de ubicación, si es el valor especial, enviar null
        if (
          key === "defaultReturnLocationId" &&
          formValue === NULL_SELECT_VALUE
        )
          cleanData[key] = null;
        if (
          key === "defaultPoReceiveLocationId" &&
          formValue === NULL_SELECT_VALUE
        )
          cleanData[key] = null;
      });

      const response = await apiClient.patch<StoreSettings>(
        "/stores/settings",
        cleanData
      );
      return response.data;
    },
    onSuccess: (updatedData) => {
      toast.success("Configuración actualizada.");
      queryClient.setQueryData(["storeSettings"], updatedData);
      if (updatedData.name && user?.storeName !== updatedData.name) {
        setAuthStoreName(updatedData.name);
      }
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error actualizando configuración"
      );
      toast.error(
        Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage
      );
    },
  });

  function onSubmit(data: FormValues) {
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
                      {" "}
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
                          value={field.value ?? ""}
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
                      <FormLabel>
                        Tasa de Impuesto General (Ej: 0.18 para 18%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          // El valor del input es string o number. Si field.value es null/undefined, usa ""
                          value={
                            field.value === null || field.value === undefined
                              ? ""
                              : String(field.value)
                          }
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
                        <FormLabel>Prefijo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saleNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relleno (dígitos)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastSaleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Último Número Usado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
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
                        <FormLabel>Prefijo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="repairNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relleno</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastRepairNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Último Usado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
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
                        <FormLabel>Prefijo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="poNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relleno</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastPoNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Último Usado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
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
                        <FormLabel>Prefijo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stockCountNumberPadding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relleno</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastStockCountNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Último Usado</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        </FormControl>
                        <FormMessage />
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
                              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(method)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([
                                            ...currentValue,
                                            method,
                                          ])
                                        : field.onChange(
                                            currentValue.filter(
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
                      onValueChange={(value) =>
                        field.onChange(
                          value === NULL_SELECT_VALUE ? null : value
                        )
                      }
                      value={
                        field.value === null
                          ? NULL_SELECT_VALUE
                          : field.value || undefined
                      } // Muestra placeholder si es undefined
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ubicación..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NULL_SELECT_VALUE}>
                          <em>Ninguna</em>
                        </SelectItem>
                        {isLoadingLocations && (
                          <SelectItem value="loading_loc_ret" disabled>
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
                          <SelectValue placeholder="Selecciona ubicación..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NULL_SELECT_VALUE}>
                          <em>Ninguna</em>
                        </SelectItem>
                        {isLoadingLocations && (
                          <SelectItem value="loading_loc_po" disabled>
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
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending || isLoadingSettings}
            >
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
