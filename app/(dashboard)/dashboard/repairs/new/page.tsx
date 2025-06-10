// app/(dashboard)/repairs/new/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { CustomerBasic } from "@/types/customer.types"; // Asegúrate que CustomerBasic esté en customer.types
import { CreateRepairOrderPayload, RepairOrder } from "@/types/repairs.types";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
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
import { Checkbox } from "@/components/ui/checkbox"; // Para "Nuevo Cliente"
import { Loader2, Save, X, ChevronsUpDown, Check } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// --- SCHEMAS ZOD Y TIPOS (COPIARLOS AQUÍ DESDE EL PASO 1 DE ARRIBA) ---
// Schema Zod para la creación rápida de cliente (si se usa dentro de este form)
const newCustomerFieldsSchema = z.object({
  firstName: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  lastName: z
    .string()
    .max(50)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  phone: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  email: z
    .string()
    .max(100)
    // Hacer que .email() solo se aplique si el string no está vacío y no es null/undefined
    // O, si el campo es verdaderamente opcional, .optional() debe ir antes de .email() si el string puede estar vacío.
    // Zod v3: .optional().or(z.literal("")).or(z.string().email("Email inválido.")) es complicado.
    // Mejor enfoque: permitir string vacío, y el .transform lo convierte a null.
    // La validación .email() fallará para string vacío.
    // La solución es refinarlo para que solo valide .email() si el string tiene contenido.
    .refine(
      (val) =>
        val === null ||
        val === undefined ||
        val === "" ||
        z.string().email().safeParse(val).success,
      {
        message: "Email inválido.",
      }
    )
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  rnc: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  address: z
    .string()
    .max(255)
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

const createRepairOrderFormSchema = z
  .object({
    customerId: z.string().optional().nullable(),
    isNewCustomer: z.boolean().default(false),
    newCustomer: newCustomerFieldsSchema.optional(), // Ahora quickCreateCustomerSchema está definido

    deviceBrand: z.string().min(1, "Marca es requerida.").max(100),
    deviceModel: z.string().min(1, "Modelo es requerido.").max(100),
    deviceColor: z
      .string()
      .max(50)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    deviceImei: z
      .string()
      .max(50)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    devicePassword: z
      .string()
      .max(100)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
    customerNameDisplay: z.string().optional(),
    accessoriesReceived: z
      .string()
      .max(500)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),

    reportedIssue: z
      .string()
      .min(5, "Problema reportado es requerido (mín. 5 caracteres).")
      .max(1000),
    intakeNotes: z
      .string()
      .max(1000)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),

    intakeChecklist: z.any().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.isNewCustomer) {
        // Si es nuevo cliente, customerId debe ser null o undefined
        // Y newCustomer debe tener al menos firstName y lastName
        return (
          !data.customerId &&
          data.newCustomer &&
          data.newCustomer.firstName &&
          data.newCustomer.lastName
        );
      } else {
        // Si no es nuevo cliente, customerId debe estar presente
        return !!data.customerId;
      }
    },
    {
      message:
        "Debe seleccionar un cliente existente o ingresar los datos obligatorios (nombre, apellido) de un nuevo cliente.",
      path: ["customerId"], // O un path más general como "customerSection" si tuvieras uno
    }
  )
  .superRefine((data, ctx) => {
    // superRefine para validar newCustomer solo si isNewCustomer es true
    if (data.isNewCustomer) {
      // Schema estricto para cuando SÍ es un nuevo cliente
      const strictNewCustomerSchema = z.object({
        firstName: z
          .string()
          .min(2, "Nombre de nuevo cliente es requerido (mín. 2 caracteres).")
          .max(50),
        lastName: z
          .string()
          .min(2, "Apellido de nuevo cliente es requerido (mín. 2 caracteres).")
          .max(50),
        phone: z.string().max(20).optional().nullable(),
        email: z
          .string()
          .email("Email inválido.")
          .max(100)
          .optional()
          .nullable(),
        rnc: z.string().max(20).optional().nullable(),
        address: z.string().max(255).optional().nullable(),
      });

      const newCustomerResult = strictNewCustomerSchema.safeParse(
        data.newCustomer
      );
      if (!newCustomerResult.success) {
        newCustomerResult.error.errors.forEach((err) => {
          ctx.addIssue({
            ...err,
            path: ["newCustomer", ...err.path],
          });
        });
      }
    }
    // No es necesario un 'else' aquí; si no es nuevo cliente, no se valida newCustomer con el schema estricto.
    // El schema base 'newCustomerFieldsSchema' permite que los campos estén vacíos o nulos.
  });

type CreateRepairOrderFormValues = z.infer<typeof createRepairOrderFormSchema>;
// --- FIN SCHEMAS Y TIPOS ---

export default function CreateRepairOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const debouncedCustomerSearchTerm = useDebounce(customerSearchTerm, 300);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);

  // Ejemplo de checklist, esto podría venir de una configuración o ser más dinámico
  const intakeChecklistItems = [
    { id: "screen_condition", label: "Pantalla (Rayones, Rotura)" },
    { id: "body_condition", label: "Carcasa (Golpes, Marcas)" },
    { id: "buttons_functional", label: "Botones Funcionales" },
    { id: "ports_clear", label: "Puertos Limpios" },
    { id: "has_sim", label: "Tiene SIM" },
    { id: "has_sd", label: "Tiene Tarjeta SD" },
  ];

  const form = useForm<CreateRepairOrderFormValues>({
    resolver: zodResolver(createRepairOrderFormSchema),
    defaultValues: {
      customerId: null,
      isNewCustomer: false,
      newCustomer: {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        rnc: "",
        address: "",
      },
      deviceBrand: "",
      deviceModel: "",
      deviceColor: "",
      deviceImei: "",
      devicePassword: "",
      accessoriesReceived: "",
      reportedIssue: "",
      intakeNotes: "",
      intakeChecklist: intakeChecklistItems.reduce(
        (acc, item) => ({ ...acc, [item.id]: false }),
        {}
      ), // Inicializar checklist
    },
  });

  const isNewCustomerMode = form.watch("isNewCustomer");

  // Fetch para Clientes (para el selector/búsqueda)
  const { data: searchedCustomers, isLoading: isLoadingSearchedCustomers } =
    useQuery<CustomerBasic[]>({
      queryKey: ["repairCustomerSearch", debouncedCustomerSearchTerm],
      queryFn: async () => {
        if (
          !debouncedCustomerSearchTerm ||
          debouncedCustomerSearchTerm.length < 2
        )
          return [];
        return apiClient
          .get(
            `/customers?search=${debouncedCustomerSearchTerm}&isActive=true&limit=10`
          )
          .then((res) => res.data.data || []);
      },
      enabled:
        debouncedCustomerSearchTerm.length >= 2 &&
        isCustomerSearchOpen &&
        !isNewCustomerMode,
    });

  const createRepairMutation = useMutation<
    RepairOrder, // Asume que el backend devuelve la Orden de Reparación creada
    Error,
    CreateRepairOrderFormValues // El DTO del backend es CreateRepairOrderDto
  >({
    mutationFn: async (formData) => {
      const payload: CreateRepairOrderPayload = {
        // Construir el payload para CreateRepairOrderDto
        customerId: formData.isNewCustomer ? undefined : formData.customerId,
        newCustomer: formData.isNewCustomer ? formData.newCustomer : undefined,
        deviceBrand: formData.deviceBrand,
        deviceModel: formData.deviceModel,
        deviceColor: formData.deviceColor || null,
        deviceImei: formData.deviceImei || null,
        devicePassword: formData.devicePassword || null,
        accessoriesReceived: formData.accessoriesReceived || null,
        reportedIssue: formData.reportedIssue,
        intakeNotes: formData.intakeNotes || null,
        intakeChecklist: formData.intakeChecklist || null,
      };
      console.log("create");
      // Remover newCustomer si no es nuevo cliente para evitar enviar objeto vacío
      if (!formData.isNewCustomer) delete payload.newCustomer;
      // Remover customerId si es nuevo cliente
      if (formData.isNewCustomer) delete payload.customerId;

      console.log("Enviando payload de Reparación:", payload);
      const response = await apiClient.post<RepairOrder>("/repairs", payload);
      return response.data;
    },
    onSuccess: (createdRepairOrder) => {
      toast.success(
        `Orden de Reparación #${createdRepairOrder.repairNumber} creada exitosamente.`
      );
      queryClient.invalidateQueries({ queryKey: ["repairsList"] });
      router.push(`/dashboard/repairs/${createdRepairOrder.id}`); // Ir al detalle de la reparación
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar el estado del cliente."
      );
      toast.error(errorMessage);
      toast.error(
        Array.isArray(errorMessage)
          ? errorMessage.join(", ")
          : errorMessage.toString()
      );
      console.error("Error en createRepairMutation:", errorMessage || error);
    },
  });

  function onSubmit(data: CreateRepairOrderFormValues) {
    console.log("Datos Formulario Reparación:", data);
    createRepairMutation.mutate(data);
  }

  const handleSelectCustomer = (customer: CustomerBasic) => {
    form.setValue("customerId", customer.id, { shouldValidate: true });
    form.setValue("isNewCustomer", false); // Desmarcar nuevo cliente
    form.setValue(
      "customerNameDisplay",
      `${customer.firstName} ${customer.lastName}`
    );
    // Limpiar campos de nuevo cliente por si acaso
    form.setValue("newCustomer", {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      rnc: "",
      address: "",
    });
    setIsCustomerSearchOpen(false);
    setCustomerSearchTerm("");
  };

  return (
    <>
      <PageHeader
        title="Registrar Nueva Orden de Reparación"
        description="Completa los datos para ingresar un nuevo dispositivo a reparación."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Sección Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isNewCustomer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            // Si se marca nuevo cliente, limpiar customerId seleccionado
                            form.setValue("customerId", null);
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Registrar Nuevo Cliente
                    </FormLabel>
                  </FormItem>
                )}
              />

              {!isNewCustomerMode ? (
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      {" "}
                      <FormLabel>Cliente Existente*</FormLabel>
                      <Popover
                        open={isCustomerSearchOpen}
                        onOpenChange={setIsCustomerSearchOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={isCustomerSearchOpen}
                              className="w-full justify-between"
                            >
                              {/* --- CORRECCIÓN AQUÍ --- V V V */}
                              {/* Mostrar el valor de customerNameDisplay del formulario */}
                              {/* form.watch() asegura que el componente se re-renderice cuando este valor cambie */}
                              {form.watch("customerNameDisplay") ||
                                "Seleccionar cliente..."}
                              {/* --- FIN CORRECCIÓN --- V V V */}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command
                            filter={(value, search) =>
                              value
                                .toLowerCase()
                                .indexOf(search.toLowerCase()) > -1
                                ? 1
                                : 0
                            }
                          >
                            <CommandInput
                              placeholder="Buscar cliente..."
                              value={customerSearchTerm}
                              onValueChange={setCustomerSearchTerm}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {isLoadingSearchedCustomers
                                  ? "Buscando..."
                                  : "No clientes."}
                              </CommandEmpty>
                              {searchedCustomers?.map((customer) => (
                                <CommandItem
                                  key={customer.id}
                                  value={`${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone}`}
                                  onSelect={() => {
                                    field.onChange(customer.id);
                                    handleSelectCustomer(customer);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === customer.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div>
                                    <p>
                                      {customer.firstName} {customer.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {customer.phone || customer.email}
                                    </p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>{" "}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4 border p-4 rounded-md bg-muted/30">
                  <p className="text-sm font-medium text-foreground">
                    Datos del Nuevo Cliente
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="newCustomer.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre*</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newCustomer.lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido*</FormLabel>
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
                    name="newCustomer.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="809-123-4567"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newCustomer.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="juan.perez@email.com"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newCustomer.rnc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RNC/Cédula</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="RNC o Cédula"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newCustomer.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Dirección..."
                            {...field}
                            value={field.value ?? ""}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sección Dispositivo */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Dispositivo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="deviceBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Apple, Samsung" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deviceModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: iPhone 13, Galaxy S22"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deviceColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Negro Medianoche"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deviceImei"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IMEI / Número de Serie</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="IMEI o S/N del dispositivo"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="devicePassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña/Patrón</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Para acceso técnico"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Si es necesario para diagnóstico.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessoriesReceived"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accesorios Recibidos</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: SIM, Cargador, Caja"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Sección Problema y Notas */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Reparación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="reportedIssue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problema Reportado por el Cliente*</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe detalladamente el problema..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="intakeNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas de Recepción (Técnico)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observaciones al recibir el dispositivo, estado físico, etc."
                        {...field}
                        value={field.value ?? ""}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Checklist de Ingreso */}
              <div>
                <FormLabel className="text-sm font-medium">
                  Checklist de Ingreso (Condición)
                </FormLabel>
                <Card className="p-4 mt-2 space-y-2 border bg-muted/30">
                  {intakeChecklistItems.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name={`intakeChecklist.${item.id}`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createRepairMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button
              type="submit" // Mantenemos type="submit"
              onClick={() => {
                // Añadir este onClick para depuración
                console.log(
                  "Valores del formulario ANTES de handleSubmit:",
                  form.getValues()
                );
                console.log(
                  "Errores del formulario ANTES de handleSubmit:",
                  form.formState.errors
                );
                console.log(
                  "Formulario es válido ANTES de handleSubmit?:",
                  form.formState.isValid
                );
                // ¡OJO! isValid puede no estar completamente actualizado aquí
                // Es mejor ver los errores.
              }}
              disabled={createRepairMutation.isPending}
            >
              {createRepairMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" /> Registrar Orden de Reparación
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
