// app/(dashboard)/pos/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form"; // Controller no se usa directamente aquí
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import {
  ProductBasic, // Asegúrate que este tipo incluya 'sellingPrice'
  InventoryItem,
  Sale,
  ProductStockInfo,
  // PaginatedProductsResponse, // No se usan directamente aquí
  // PaginatedCustomersResponse, // No se usan directamente aquí
} from "@/types/inventory.types"; // O tus archivos de tipos correspondientes
import { DiscountType } from "@/types/prisma-enums";
import {
  POSCartLineItem, // Renombrado de SaleLineItemFormValues
  //   POSPaymentItem, // Renombrado de PaymentFormValues
  //   Sale, // Para el tipo de respuesta de createSaleMutation
} from "@/types/sales.types"; // Asegúrate que estos tipos estén aquí
import {
  PaymentMethod,
  InventoryItemStatus,
  //   ProductType as PrismaProductType,
  //   InventoryItemStatus, // Importado para el filtro de availableSerials
} from "@/types/prisma-enums";
import { useAuthStore } from "@/stores/auth.store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  //   CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // No se usa aquí si el diálogo es controlado por estado
  // DialogFooter, // Usado dentro del DialogContent de SerialSelect
  // DialogClose, // Usado dentro del DialogContent de SerialSelect
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Loader2,
  Search,
  //   XCircle,
  PlusCircle,
  Trash2,
  UserPlus,
  //   Users,
  ChevronsUpDown,
  Check,
  DollarSign,
  // Calculator, // No se usa
  ArrowLeftRight,
  PercentCircle,
  TagIcon, // Para el botón Salir
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency } from "@/lib/utils/formatters";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation"; // <-- IMPORTAR useRouter
import { cn } from "@/lib/utils"; // <-- IMPORTAR cn
import { StoreSettings } from "@/types/settings.types";
import { Customer } from "@/types/customer.types";
import { NonSerializedProductToCartDialog } from "@/components/pos/non-serialized-product-to-cart-dialog";
import { CreateCustomerDialog } from "@/components/customers/create-customer-quick-dialog"; // Ajusta la ruta
import { Badge } from "@/components/ui/badge";

// Schemas Zod
const saleLineItemSchema = z.object({
  fieldId: z.string(), // Para el key de useFieldArray, no se envía al backend
  productId: z.string().min(1, "Producto es requerido."),
  productName: z.string(),
  sku: z.string().optional().nullable(),
  quantity: z.coerce.number().positive("Cantidad debe ser positiva."),
  unitPrice: z.coerce.number().min(0, "Precio no puede ser negativo."),
  lineDiscountType: z.nativeEnum(DiscountType).optional().nullable(),
  lineDiscountValue: z.coerce
    .number()
    .min(0, "Descuento no puede ser negativo.")
    .optional()
    .nullable(),
  lineTotal: z.coerce.number(),
  tracksImei: z.boolean().default(false),
  inventoryItemId: z.string().optional().nullable(),
  imei: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(), // <-- AÑADIR (será requerido condicionalmente)
  locationName: z.string().optional().nullable(),
});

const paymentSchema = z.object({
  fieldId: z.string(), // Para el key de useFieldArray
  method: z.nativeEnum(PaymentMethod, {
    required_error: "Método es requerido.",
  }),
  amount: z.coerce.number().min(0, "Monto no puede ser negativo."),
  reference: z
    .string()
    .max(100, "Máx 100 chars.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  cardLast4: z
    .string()
    .max(4, "Máx 4 chars.")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
});

const posFormSchema = z
  .object({
    customerId: z
      .string()
      .uuid("ID de cliente inválido.")
      .optional()
      .nullable(),
    customerNameDisplay: z.string().optional(), // Para UI, no se envía al backend

    isNewCustomer: z.boolean().optional().default(false), // Flag para el form de nuevo cliente
    newCustomerFirstName: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    newCustomerLastName: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    newCustomerPhone: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)),
    newCustomerEmail: z
      .string()
      .email("Email inválido.")
      .optional()
      .or(z.literal(""))
      .transform((val) => (val === "" ? undefined : val)),
    // Añadir más campos de newCustomer si son necesarios y están en el DTO de creación de cliente
    discountOnTotalType: z.nativeEnum(DiscountType).optional().nullable(),
    discountOnTotalValue: z.coerce.number().min(0).optional().nullable(),

    lines: z
      .array(saleLineItemSchema)
      .min(1, "El carrito no puede estar vacío."),
    payments: z
      .array(paymentSchema)
      .min(1, "Se requiere al menos un método de pago."),

    subTotal: z.number().default(0),
    taxAmount: z.number().default(0),
    discountAmount: z
      .number()
      .min(0, "Descuento no puede ser negativo.")
      .default(0),
    totalAmount: z.number().default(0),

    amountTenderedCash: z.coerce.number().min(0).optional().nullable(),
    changeGiven: z.number().optional().nullable(),
    notes: z
      .string()
      .max(500, "Máx 500 caracteres.")
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
  })
  .refine(
    (data) => {
      const totalPaid = data.payments.reduce(
        (acc, p) => acc + (Number(p.amount) || 0),
        0
      );
      return totalPaid >= data.totalAmount - 0.001;
    },
    {
      message: "El monto pagado es menor al total de la venta.",
      path: ["payments"],
    }
  );

// Type POSFormValues ya no se necesita inferir aquí si lo importamos de sales.types.ts
// PERO, para que Zod trabaje bien con RHF, es mejor inferirlo del schema definido en este archivo.
type POSFormValuesZod = z.infer<typeof posFormSchema>;

const ALL_PAYMENT_METHODS = Object.values(PaymentMethod);
const NO_DISCOUNT_TYPE_VALUE = "__NO_DISCOUNT_TYPE__";

export default function POSPage() {
  const router = useRouter(); // <-- DEFINIR ROUTER
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);

  const { data: currentStoreSettings } = useQuery<StoreSettings, Error>({
    // Asumiendo que tienes StoreSettings
    queryKey: ["storeSettingsForPOS"],
    queryFn: async () => {
      if (!authUser?.storeId) throw new Error("ID de tienda no disponible.");
      return apiClient
        .get<StoreSettings>("/stores/settings")
        .then((res) => res.data);
    },
    enabled: !!authUser?.storeId,
    staleTime: Infinity, // La config de tienda no cambia tan a menudo en una sesión de POS
  });

  const storeSettings = useMemo(
    () => ({
      defaultTaxRate:
        currentStoreSettings?.defaultTaxRate !== null &&
        currentStoreSettings?.defaultTaxRate !== undefined
          ? Number(currentStoreSettings.defaultTaxRate)
          : 0.18,
      currencySymbol: currentStoreSettings?.currencySymbol ?? "RD$",
      acceptedPaymentMethods: currentStoreSettings?.acceptedPaymentMethods
        ?.length
        ? currentStoreSettings.acceptedPaymentMethods
        : ALL_PAYMENT_METHODS,
    }),
    [currentStoreSettings]
  );

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const debouncedProductSearchTerm = useDebounce(productSearchTerm, 300);

  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const debouncedCustomerSearchTerm = useDebounce(customerSearchTerm, 300);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isCreateCustomerDialogOpen, setIsCreateCustomerDialogOpen] =
    useState(false);

  const [selectedProductForSerial, setSelectedProductForSerial] =
    useState<ProductBasic | null>(null);
  const [isSerialSelectOpen, setIsSerialSelectOpen] = useState(false);

  const form = useForm<POSFormValuesZod>({
    // Usar el tipo inferido localmente
    resolver: zodResolver(posFormSchema),
    defaultValues: {
      lines: [],
      payments: [
        {
          fieldId: crypto.randomUUID(),
          method: undefined,
          amount: 0,
          reference: "",
          cardLast4: "",
        },
      ],
      subTotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 0,
      customerId: null,
      customerNameDisplay: "Cliente Genérico",
      isNewCustomer: false,
      newCustomerFirstName: "",
      newCustomerLastName: "",
      newCustomerPhone: "",
      newCustomerEmail: "",
      notes: "",
      amountTenderedCash: undefined, // Iniciar como undefined para que el placeholder del input funcione
      changeGiven: undefined,
    },
  });

  const {
    fields: cartLines,
    append: appendCartLine,
    remove: removeCartLine,
    update: updateCartLine,
  } = useFieldArray({
    control: form.control,
    name: "lines",
    keyName: "fieldId",
  });
  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: form.control,
    name: "payments",
    keyName: "fieldId",
  });

  // --- DATA FETCHING ---
  const { data: searchedProducts, isLoading: isLoadingSearchedProducts } =
    useQuery<ProductBasic[]>({
      queryKey: ["posProductSearch", debouncedProductSearchTerm],
      queryFn: async () => {
        if (
          !debouncedProductSearchTerm ||
          debouncedProductSearchTerm.length < 2
        )
          return [];
        // Asegúrate que ProductBasic incluya 'sellingPrice'
        return apiClient
          .get(
            `/inventory/products?search=${debouncedProductSearchTerm}&isActive=true&limit=10`
          )
          .then((res) => res.data.data || []);
      },
      enabled: debouncedProductSearchTerm.length >= 2,
    });

  const { data: searchedCustomers, isLoading: isLoadingSearchedCustomers } =
    useQuery<Customer[]>({
      // Customer debe tener los campos que usas
      queryKey: ["posCustomerSearch", debouncedCustomerSearchTerm],
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
      enabled: debouncedCustomerSearchTerm.length >= 2 && isCustomerSearchOpen,
    });

  const { data: availableSerials, isLoading: isLoadingSerials } = useQuery<
    InventoryItem[]
  >({
    queryKey: ["availableSerialsForProduct", selectedProductForSerial?.id],
    queryFn: async () => {
      if (!selectedProductForSerial?.id) return [];
      const response = await apiClient.get<ProductStockInfo>(
        `/inventory/stock/product/${selectedProductForSerial.id}`
      );
      return response.data.items.filter(
        (item) => item.status === InventoryItemStatus.AVAILABLE && !!item.imei
      ); // Usar PrismaInventoryItemStatus
    },
    enabled: !!selectedProductForSerial && isSerialSelectOpen,
  });

  // --- CALCULATIONS ---
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      const localValues = values as POSFormValuesZod; // Tu tipo de Zod

      const needsRecalculation = false;
      // --- (1) SECCIÓN DE CÁLCULO DE TOTALES DE LÍNEAS Y VENTA ---
      if (
        name?.startsWith("lines") || // Si cambia algo en una línea
        name === "discountOnTotalType" || // Si cambia el tipo de descuento general
        name === "discountOnTotalValue" || // Si cambia el valor del descuento general
        // (Quitamos 'name === "discountAmount"' si 'discountAmount' es ahora solo para el MONTO calculado del descuento general)
        (type === "change" && name === undefined) // Al cargar o resetear
      ) {
        const currentLines = localValues.lines || [];
        let calculatedSubTotalAfterLineDiscounts = 0; // Este es el subtotal después de descuentos de línea

        // Recalcular el lineTotal para cada línea CON su descuento y acumular
        const linesWithRecalculatedTotals = currentLines.map((line, index) => {
          const unitPrice = Number(line.unitPrice) || 0;
          const quantity = Number(line.quantity) || 0;
          const lineBaseTotal = unitPrice * quantity; // Subtotal de la línea antes de su descuento
          let lineDiscountAmountNum = 0;

          // Aplicar descuento de línea
          if (
            line.lineDiscountType &&
            line.lineDiscountValue !== null &&
            line.lineDiscountValue !== undefined &&
            line.lineDiscountValue > 0
          ) {
            const discountVal = Number(line.lineDiscountValue) || 0;
            if (line.lineDiscountType === DiscountType.PERCENTAGE) {
              if (discountVal > 100) lineDiscountAmountNum = lineBaseTotal;
              else lineDiscountAmountNum = lineBaseTotal * (discountVal / 100);
            } else {
              // FIXED
              lineDiscountAmountNum = discountVal;
            }
            lineDiscountAmountNum = Math.min(
              lineBaseTotal,
              lineDiscountAmountNum
            );
          }

          const lineTotalAfterIndividualDiscount =
            lineBaseTotal - lineDiscountAmountNum;
          calculatedSubTotalAfterLineDiscounts +=
            lineTotalAfterIndividualDiscount;

          // Actualizar el lineTotal en el estado del formulario para esta línea
          // Hacemos esto para que la tabla muestre el total de línea correcto y para que el payload sea correcto
          // Comprobar si realmente cambió para evitar re-renders innecesarios del setValue
          if (
            form.getValues(`lines.${index}.lineTotal`) !==
            parseFloat(lineTotalAfterIndividualDiscount.toFixed(2))
          ) {
            form.setValue(
              `lines.${index}.lineTotal`,
              parseFloat(lineTotalAfterIndividualDiscount.toFixed(2)),
              { shouldValidate: false }
            );
          }
          return {
            ...line,
            lineTotal: parseFloat(lineTotalAfterIndividualDiscount.toFixed(2)),
          }; // Retornar la línea con su total actualizado
        });

        // --- (2) APLICAR DESCUENTO GENERAL ---
        let actualGeneralDiscountAmount = 0;
        // 'discountAmount' en tu form es para el MONTO del descuento general.
        // 'discountOnTotalType' y 'discountOnTotalValue' son para CALCULAR ese monto.
        if (
          localValues.discountOnTotalType &&
          localValues.discountOnTotalValue !== undefined &&
          localValues.discountOnTotalValue > 0
        ) {
          const discountValue = Number(localValues.discountOnTotalValue) || 0;
          if (localValues.discountOnTotalType === DiscountType.PERCENTAGE) {
            actualGeneralDiscountAmount =
              calculatedSubTotalAfterLineDiscounts * (discountValue / 100);
          } else {
            // FIXED
            actualGeneralDiscountAmount = discountValue;
          }
          actualGeneralDiscountAmount = Math.min(
            calculatedSubTotalAfterLineDiscounts,
            actualGeneralDiscountAmount
          ); // No exceder el subtotal

          // Actualizar el campo 'discountAmount' del formulario (que es el MONTO)
          if (
            form.getValues("discountAmount") !==
            parseFloat(actualGeneralDiscountAmount.toFixed(2))
          ) {
            form.setValue(
              "discountAmount",
              parseFloat(actualGeneralDiscountAmount.toFixed(2)),
              { shouldValidate: false }
            );
          }
        } else if (
          localValues.discountOnTotalType === "" ||
          localValues.discountOnTotalValue === 0 ||
          localValues.discountOnTotalValue === null
        ) {
          // Si se quita el tipo de descuento o el valor es 0, el monto del descuento es 0
          actualGeneralDiscountAmount = 0;
          if (form.getValues("discountAmount") !== 0) {
            form.setValue("discountAmount", 0, { shouldValidate: false });
          }
        } else {
          // Si no hay tipo/valor, pero hay un monto en discountAmount, lo usamos
          actualGeneralDiscountAmount = Number(localValues.discountAmount) || 0;
        }

        // --- (3) CALCULAR IMPUESTOS Y TOTAL FINAL ---
        const taxRate = storeSettings.defaultTaxRate; // Ya es número
        // El impuesto se calcula sobre el subtotal DESPUÉS del descuento general
        const taxableAmount =
          calculatedSubTotalAfterLineDiscounts - actualGeneralDiscountAmount;
        const newTaxAmount = taxableAmount * taxRate;
        const newTotalAmount = taxableAmount + newTaxAmount;

        // Actualizar los campos de totales en el formulario
        if (
          form.getValues("subTotal") !==
          parseFloat(calculatedSubTotalAfterLineDiscounts.toFixed(2))
        ) {
          form.setValue(
            "subTotal",
            parseFloat(calculatedSubTotalAfterLineDiscounts.toFixed(2))
          );
        }
        if (
          form.getValues("taxAmount") !== parseFloat(newTaxAmount.toFixed(2))
        ) {
          form.setValue("taxAmount", parseFloat(newTaxAmount.toFixed(2)));
        }
        if (
          form.getValues("totalAmount") !==
          parseFloat(newTotalAmount.toFixed(2))
        ) {
          form.setValue("totalAmount", parseFloat(newTotalAmount.toFixed(2)), {
            shouldValidate: true,
          });
        }

        const currentTotalAmountInForm = form.getValues("totalAmount");
        const newTotalAmountRounded = parseFloat(newTotalAmount.toFixed(2));

        if (currentTotalAmountInForm !== newTotalAmountRounded) {
          form.setValue("totalAmount", newTotalAmountRounded, {
            shouldValidate: true,
          });

          // Si el total de la venta CAMBIÓ y solo hay UN método de pago,
          // actualizamos su monto para que coincida con el nuevo total.
          // Esto permite que el usuario edite, pero si el total de la venta cambia, el monto del pago se ajusta.
          const currentPayments = form.getValues("payments");
          if (currentPayments.length === 1) {
            // Solo actualiza si el monto actual del pago es diferente al nuevo total de la venta,
            // O si el monto del pago era 0 (para el caso inicial).
            // Esto es un intento de no sobrescribir una edición manual si el total no ha cambiado drásticamente.
            // Una lógica más compleja podría requerir un estado para saber si el usuario editó manualmente.
            if (
              currentPayments[0].amount !== newTotalAmountRounded ||
              currentPayments[0].amount === 0
            ) {
              console.log(
                `AUTO-UPDATING payment 0 amount to: ${newTotalAmountRounded} because totalAmount changed.`
              );
              form.setValue(`payments.0.amount`, newTotalAmountRounded, {
                shouldValidate: false,
              });
            }
          }
        }
      }

      // --- (4) SECCIÓN DE CÁLCULO DE PAGOS Y CAMBIO ---
      if (
        name?.startsWith("payments") ||
        name === "totalAmount" ||
        name === "amountTenderedCash" ||
        needsRecalculation || // Esta variable la definiste como 'false' y no parece cambiar. ¿Es necesaria?
        (type === "change" && name === undefined)
      ) {
        console.log("--- INICIO CÁLCULO DE CAMBIO ---");
        console.log(
          "Campo que cambió (name):",
          name,
          "Tipo de evento (type):",
          type
        );

        const currentFormValues = form.getValues();
        const saleTotalAmount = Number(currentFormValues.totalAmount) || 0;
        const tenderedCash = Number(currentFormValues.amountTenderedCash) || 0;
        const currentPaymentsArray = currentFormValues.payments || [];

        console.log(
          "Valores actuales del formulario:",
          JSON.stringify(currentFormValues, null, 2)
        );
        console.log("Total Venta (saleTotalAmount):", saleTotalAmount);
        console.log("Efectivo Recibido (tenderedCash):", tenderedCash);
        console.log(
          "Pagos Actuales (currentPaymentsArray):",
          JSON.stringify(currentPaymentsArray, null, 2)
        );

        let totalPaidByOtherMethods = 0;
        let cashPaymentIndex = -1;
        let originalCashPaymentAmount = 0; // Para saber cuánto era antes de nuestro cálculo

        currentPaymentsArray.forEach((payment, index) => {
          if (
            payment.method === PaymentMethod.CASH &&
            cashPaymentIndex === -1
          ) {
            cashPaymentIndex = index;
            originalCashPaymentAmount = Number(payment.amount) || 0; // Guardar monto original del pago en efectivo
          } else {
            totalPaidByOtherMethods += Number(payment.amount) || 0;
          }
        });
        console.log(
          "Índice Pago Efectivo (cashPaymentIndex):",
          cashPaymentIndex
        );
        console.log("Total Pagado por Otros Métodos:", totalPaidByOtherMethods);
        console.log("Monto Original Pago Efectivo:", originalCashPaymentAmount);

        let amountDueAfterOtherPayments = Math.max(
          0,
          saleTotalAmount - totalPaidByOtherMethods
        );
        console.log(
          "Monto Pendiente Después de Otros Pagos:",
          amountDueAfterOtherPayments
        );

        let cashPaymentAmountApplied = 0;
        let calculatedChange = 0;

        if (tenderedCash > 0) {
          if (cashPaymentIndex !== -1) {
            // Hay una línea de pago en efectivo
            cashPaymentAmountApplied = Math.min(
              tenderedCash,
              amountDueAfterOtherPayments
            );
            console.log(
              "Monto Efectivo Aplicado (cashPaymentAmountApplied):",
              cashPaymentAmountApplied
            );

            // Actualizar el monto del pago en efectivo
            const currentCashPaymentAmountInForm = form.getValues(
              `payments.${cashPaymentIndex}.amount`
            );
            if (
              currentCashPaymentAmountInForm !==
              parseFloat(cashPaymentAmountApplied.toFixed(2))
            ) {
              console.log(
                `Actualizando payments.${cashPaymentIndex}.amount de ${currentCashPaymentAmountInForm} a ${cashPaymentAmountApplied.toFixed(
                  2
                )}`
              );
              form.setValue(
                `payments.${cashPaymentIndex}.amount`,
                parseFloat(cashPaymentAmountApplied.toFixed(2)),
                { shouldValidate: false }
              );
            }

            if (tenderedCash >= amountDueAfterOtherPayments) {
              calculatedChange = tenderedCash - amountDueAfterOtherPayments;
            }
          } else if (
            currentPaymentsArray.length === 0 &&
            tenderedCash >= saleTotalAmount
          ) {
            // Caso: no hay pagos, se ingresa efectivo para cubrir todo
            calculatedChange = tenderedCash - saleTotalAmount;
            cashPaymentAmountApplied = saleTotalAmount; // Todo el total se "aplica" del efectivo
            console.log(
              "Caso: Sin pagos previos, efectivo cubre todo. Monto aplicado:",
              cashPaymentAmountApplied
            );
          }
        } else {
          // tenderedCash es 0 o null
          if (cashPaymentIndex !== -1) {
            // Si se borra el efectivo recibido, el monto del pago en efectivo vuelve a ser lo que falta
            // (o 0 si el total ya está cubierto por otros pagos)
            cashPaymentAmountApplied = Math.max(0, amountDueAfterOtherPayments);
            console.log(
              "Efectivo recibido es 0, ajustando pago en efectivo a:",
              cashPaymentAmountApplied
            );
            if (
              form.getValues(`payments.${cashPaymentIndex}.amount`) !==
              parseFloat(cashPaymentAmountApplied.toFixed(2))
            ) {
              form.setValue(
                `payments.${cashPaymentIndex}.amount`,
                parseFloat(cashPaymentAmountApplied.toFixed(2)),
                { shouldValidate: false }
              );
            }
          }
        }
        console.log("Cambio Calculado (antes de Math.max):", calculatedChange);

        const finalChange = parseFloat(
          Math.max(0, calculatedChange).toFixed(2)
        );
        console.log("Cambio Final a Establecer (finalChange):", finalChange);

        const currentChangeInForm = form.getValues("changeGiven");
        console.log(
          "Valor Actual de changeGiven en Formulario:",
          currentChangeInForm
        );

        if (currentChangeInForm !== finalChange) {
          console.log(
            `Actualizando changeGiven de ${currentChangeInForm} a ${finalChange}`
          );
          form.setValue("changeGiven", finalChange, { shouldValidate: false });
        } else {
          console.log(
            "changeGiven no necesita actualizarse, ya es:",
            finalChange
          );
        }
        console.log("--- FIN CÁLCULO DE CAMBIO ---");
      }
    });
    return () => subscription.unsubscribe();
  }, [form, storeSettings.defaultTaxRate]);

  // --- CART ACTIONS ---
  const addProductToCart = (
    product: ProductBasic,
    imeiDetails?: { inventoryItemId: string; imei: string },
    sourceLocation?: { locationId: string; locationName: string }
  ) => {
    const sellingPriceNum = Number(product.sellingPrice) || 0; // Asegurar que sellingPrice exista en ProductBasic
    const existingLineIndex = cartLines.findIndex(
      (line) =>
        line.productId === product.id &&
        (product.tracksImei
          ? line.inventoryItemId === imeiDetails?.inventoryItemId
          : true)
    );

    if (existingLineIndex > -1 && !product.tracksImei) {
      const existingLine = cartLines[existingLineIndex];
      updateCartLine(existingLineIndex, {
        ...existingLine,
        quantity: existingLine.quantity + 1,
        lineTotal: (existingLine.quantity + 1) * sellingPriceNum,
      });
    } else {
      appendCartLine({
        fieldId: crypto.randomUUID(), // Añadir fieldId
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: sellingPriceNum,
        lineTotal: sellingPriceNum,
        tracksImei: product.tracksImei,
        inventoryItemId: product.tracksImei
          ? imeiDetails?.inventoryItemId
          : null,
        imei: product.tracksImei ? imeiDetails?.imei : null,
        locationId: !product.tracksImei ? sourceLocation?.locationId : null, // <-- AÑADIR
        locationName: !product.tracksImei ? sourceLocation?.locationName : null,
      });
    }
    setProductSearchTerm("");
    if (isSerialSelectOpen) setIsSerialSelectOpen(false);
    setSelectedProductForSerial(null);
  };

  const handleProductSelectFromSearch = (product: ProductBasic) => {
    console.log("Producto seleccionado de búsqueda:", product); // DEBUG
    setProductSearchTerm(""); // Limpiar resultados de búsqueda (esto está bien)

    if (product.tracksImei) {
      console.log("Es serializado, abriendo diálogo de serial..."); // DEBUG
      setSelectedProductForSerial(product); // Para el diálogo de selección de IMEI
      setIsSerialSelectOpen(true);
    } else {
      console.log(
        "NO es serializado, abriendo diálogo de cantidad/ubicación..."
      ); // DEBUG
      setProductForNonSerializedDialog(product); // Para el nuevo diálogo
      setIsNonSerializedDialogOpen(true); // <-- ESTO DEBERÍA PONER EL ESTADO EN TRUE
    }
  };

  const handleSerialSelect = (inventoryItem: InventoryItem) => {
    if (selectedProductForSerial && inventoryItem.imei && inventoryItem.id) {
      const alreadyInCart = cartLines.some(
        (line) => line.inventoryItemId === inventoryItem.id
      );
      if (alreadyInCart) {
        toast.warning(
          `El ítem con IMEI ${inventoryItem.imei} ya está en el carrito.`
        );
        return;
      }
      addProductToCart(selectedProductForSerial, {
        inventoryItemId: inventoryItem.id,
        imei: inventoryItem.imei,
      });
    }
    // No cerrar aquí si el usuario quiere añadir más seriales del mismo producto
    // setIsSerialSelectOpen(false);
    // setSelectedProductForSerial(null);
  };

  const updateCartQuantity = (index: number, newQuantity: number) => {
    const line = cartLines[index];
    if (newQuantity <= 0) {
      removeCartLine(index);
    } else {
      updateCartLine(index, {
        ...line,
        quantity: newQuantity,
        lineTotal: newQuantity * line.unitPrice,
      });
    }
  };

  const [isNonSerializedDialogOpen, setIsNonSerializedDialogOpen] =
    useState(false);
  const [productForNonSerializedDialog, setProductForNonSerializedDialog] =
    useState<ProductBasic | null>(null);

  const handleSelectCustomer = (customer: Customer) => {
    // Customer es tu tipo completo
    form.setValue("customerId", customer.id);
    form.setValue(
      "customerNameDisplay",
      `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
        customer.email ||
        `ID: ${customer.id.slice(-6)}` // Fallback si no hay nombre/email
    );
    setIsCustomerSearchOpen(false); // Cierra el popover de búsqueda
    setCustomerSearchTerm("");

    // Si el diálogo de creación rápida estaba abierto, ciérralo.
    if (isCreateCustomerDialogOpen) {
      setIsCreateCustomerDialogOpen(false);
    }
    // Resetear campos de nuevo cliente en el formulario del POS
    form.setValue("isNewCustomer", false);
    form.setValue("newCustomerFirstName", "");
    form.setValue("newCustomerLastName", "");
    form.setValue("newCustomerPhone", "");
    form.setValue("newCustomerEmail", "");
    // Resetear otros campos de newCustomer si los tienes
  };

  // --- SALE MUTATION ---
  const createSaleMutation = useMutation<Sale, Error, POSFormValuesZod>({
    // Usa POSFormValuesZod
    mutationFn: async (formData: POSFormValuesZod) => {
      // NO enviar storeId ni userId, el backend los toma del token
      const payload = {
        customerId: formData.customerId,
        notes: formData.notes,
        // Si tienes newCustomer y isNewCustomer, aquí deberías manejar la creación del cliente
        // o enviar los datos del nuevo cliente al backend para que los cree con la venta.
        // Por ahora, solo customerId.
        discountOnTotalType: formData.discountOnTotalType,
        discountOnTotalValue: formData.discountOnTotalValue,

        lines: formData.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discountType: line.lineDiscountType, // El DTO espera 'discountType'
          discountValue: line.lineDiscountValue,
          inventoryItemId: line.inventoryItemId, // Importante para serializados
          description: !line.productId ? line.productName : undefined, // Para venta libre
          imei: line.tracksImei ? line.imei : undefined, // Opcional, si el backend necesita el IMEI aquí
          locationId: !line.tracksImei ? line.locationId : undefined,
        })),
        payments: formData.payments.map((p) => ({
          paymentMethod: p.method!, // <-- CAMBIAR A 'paymentMethod'
          amount: p.amount,
          reference: p.reference || null, // Enviar null si está vacío y el DTO lo espera
          cardLast4: p.cardLast4 || null, // Enviar null si está vacío
        })),
        // El backend recalculará los totales, no es necesario enviarlos.
        // subTotal: formData.subTotal,
        // taxAmount: formData.taxAmount,
        // discountOnTotal: formData.discountAmount,
        // totalAmount: formData.totalAmount,
        // amountPaid: formData.payments.reduce((acc, p) => acc + p.amount, 0),
        // changeGiven: formData.changeGiven,
      };
      console.log("Enviando Venta al Backend:", payload);
      const response = await apiClient.post<Sale>("/sales", payload);
      return response.data;
    },
    onSuccess: (createdSale) => {
      toast.success(`Venta #${createdSale.saleNumber} creada.`);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      createdSale.lines.forEach((line) => {
        if (line.productId)
          queryClient.invalidateQueries({
            queryKey: ["inventoryProductStock", line.productId],
          });
        if (line.inventoryItemId)
          queryClient.invalidateQueries({
            queryKey: ["availableSerialsForProduct", line.productId],
          });
      });
      form.reset({
        lines: [],
        payments: [
          {
            fieldId: crypto.randomUUID(),
            method: undefined,
            amount: 0,
            reference: "",
            cardLast4: "",
          },
        ],
        subTotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        customerId: null,
        customerNameDisplay: "Cliente Genérico",
        isNewCustomer: false,
        newCustomerFirstName: "",
        newCustomerLastName: "",
        newCustomerPhone: "",
        newCustomerEmail: "",
        notes: "",
        amountTenderedCash: undefined,
        changeGiven: undefined,
      });
      router.push(`/dashboard/sales/${createdSale.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error al crear la venta.");
    },
  });

  function onSubmitPOS(data: POSFormValuesZod) {
    console.log("onSubmitPOS fue llamado");
    // Usa POSFormValuesZod
    const totalPaid = data.payments.reduce(
      (acc, p) => acc + (Number(p.amount) || 0),
      0
    );
    if (totalPaid < data.totalAmount - 0.001) {
      // Pequeño margen para errores de flotantes
      toast.error("El monto pagado es menor al total de la venta.");
      form.setError(`payments.${data.payments.length - 1}.amount`, {
        message: "Monto total de pagos insuficiente.",
      });
      return;
    }
    createSaleMutation.mutate(data);
  }

  //   const handleProductSelectFromSearch = (product: ProductBasic) => {
  //     setProductSearchTerm(""); // Limpiar resultados de búsqueda
  //     if (product.tracksImei) {
  //       setSelectedProductForSerial(product); // Para el diálogo de selección de IMEI
  //       setIsSerialSelectOpen(true);
  //     } else {
  //       setProductForNonSerializedDialog(product); // Para el nuevo diálogo
  //       setIsNonSerializedDialogOpen(true);
  //     }
  //   };

  // --- JSX ---
  return (
    <>
      <div className="h-screen flex flex-col fixed inset-0 md:ml-60 bg-muted/20">
        {/* Ajustar ml-60 si el sidebar tiene otro ancho */}
        <header className="bg-background border-b p-3 h-14 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold">Punto de Venta (POS)</h1>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeftRight className="mr-2 h-4 w-4" /> Salir del POS
          </Button>
        </header>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitPOS)}
            className="flex-1 grid grid-cols-12 gap-0 overflow-hidden"
          >
            {/* --- Columna de Productos y Carrito (Izquierda) --- */}
            <div className="col-span-12 md:col-span-7 lg:col-span-8 p-3 flex flex-col gap-3 overflow-y-auto">
              {/* Búsqueda de Productos */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar producto por nombre, SKU..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
                {isLoadingSearchedProducts && (
                  <p className="text-xs text-muted-foreground absolute mt-1 ml-3">
                    Buscando...
                  </p>
                )}
                {debouncedProductSearchTerm.length >= 2 &&
                  searchedProducts &&
                  !isLoadingSearchedProducts && (
                    <Card className="absolute z-20 w-full mt-1 shadow-lg max-h-80 overflow-y-auto">
                      <CardContent className="p-1">
                        {searchedProducts.length === 0 && (
                          <p className="text-sm text-muted-foreground p-3 text-center">
                            No se encontraron productos.
                          </p>
                        )}
                        {searchedProducts.map((product) => (
                          <Button
                            key={product.id}
                            variant="ghost"
                            className="w-full justify-start h-auto py-1.5 px-2 mb-0.5 text-left"
                            type="button"
                            onClick={() =>
                              handleProductSelectFromSearch(product)
                            }
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku || "N/A"} - Precio:{" "}
                                {formatCurrency(
                                  Number(product.sellingPrice) || 0
                                )}
                              </p>
                            </div>
                          </Button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
              </div>
              {/* Carrito de Compras */}
              <Card className="flex-1 flex flex-col min-h-[300px]">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-md">
                    Carrito ({cartLines.length} ítems)
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="flex-1">
                  <CardContent className="p-0">
                    {cartLines.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-10">
                        Carrito vacío.
                      </p>
                    )}
                    {cartLines.length > 0 && (
                      <Table className="text-xs sm:text-sm">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[45%] pl-3">
                              Producto
                            </TableHead>
                            <TableHead className="w-[15%] text-center">
                              Cant.
                            </TableHead>
                            <TableHead className="w-[20%] text-right">
                              P.Unit.
                            </TableHead>
                            <TableHead className="w-[20%] text-right pr-3">
                              Subtotal
                            </TableHead>
                            <TableHead className="w-10 p-0"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cartLines.map((line, index) => (
                            <TableRow key={line.fieldId}>
                              <TableCell className="font-medium py-2 pl-3">
                                {line.productName}
                                {/* Mostrar descuento aplicado a la línea */}
                                {line.lineDiscountValue &&
                                  line.lineDiscountValue > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-xs border-green-500 text-green-600"
                                    >
                                      Desc:{" "}
                                      {line.lineDiscountType ===
                                      DiscountType.PERCENTAGE
                                        ? `${line.lineDiscountValue}%`
                                        : formatCurrency(
                                            line.lineDiscountValue
                                          )}
                                    </Badge>
                                  )}
                                {line.tracksImei && (
                                  <p className="text-xs text-muted-foreground">
                                    S/N: {line.imei || "PENDIENTE"}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-center py-2">
                                {/* Cantidad */}
                                {!line.tracksImei ? (
                                  <Input
                                    type="number"
                                    value={line.quantity}
                                    onChange={(e) =>
                                      updateCartQuantity(
                                        index,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="h-8 w-16 text-center"
                                    min={1}
                                  />
                                ) : (
                                  line.quantity
                                )}
                              </TableCell>
                              <TableCell className="text-right py-2">
                                {formatCurrency(line.unitPrice)}
                              </TableCell>
                              <TableCell className="text-right py-2 pr-1">
                                {formatCurrency(line.lineTotal)}
                              </TableCell>{" "}
                              {/* Ajustar padding si es necesario */}
                              {/* --- NUEVA CELDA Y POPOVER PARA DESCUENTO DE LÍNEA --- V V V */}
                              <TableCell className="p-0 py-1 text-center w-12">
                                {/* Celda más pequeña para acciones */}
                                <div className="flex items-center justify-center">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                      >
                                        <PercentCircle className="h-4 w-4" />{" "}
                                        {/* O PercentCircle */}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      className="w-64 p-3"
                                      side="left"
                                      align="start"
                                    >
                                      <div className="space-y-3">
                                        <p className="text-sm font-medium text-center border-b pb-2">
                                          Descuento en Línea
                                        </p>
                                        <FormField
                                          control={form.control}
                                          name={`lines.${index}.lineDiscountType`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-xs">
                                                Tipo
                                              </FormLabel>
                                              <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ""}
                                              >
                                                <FormControl>
                                                  <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Tipo..." />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  <SelectItem value="NO_DISCOUNTS">
                                                    Sin Descuento
                                                  </SelectItem>
                                                  <SelectItem
                                                    value={
                                                      DiscountType.PERCENTAGE
                                                    }
                                                  >
                                                    Porcentaje (%)
                                                  </SelectItem>
                                                  <SelectItem
                                                    value={DiscountType.FIXED}
                                                  >
                                                    Monto Fijo (
                                                    {
                                                      storeSettings.currencySymbol
                                                    }
                                                    )
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </FormItem>
                                          )}
                                        />
                                        {form.watch(
                                          `lines.${index}.lineDiscountType`
                                        ) && ( // Solo mostrar valor si hay tipo
                                          <FormField
                                            control={form.control}
                                            name={`lines.${index}.lineDiscountValue`}
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel className="text-xs">
                                                  Valor
                                                </FormLabel>
                                                <FormControl>
                                                  <Input
                                                    type="number"
                                                    step="0.01"
                                                    min={0}
                                                    className="h-9"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) =>
                                                      field.onChange(
                                                        e.target.value === ""
                                                          ? null
                                                          : parseFloat(
                                                              e.target.value
                                                            )
                                                      )
                                                    }
                                                  />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                              </FormItem>
                                            )}
                                          />
                                        )}
                                        {/* Botón para aplicar o simplemente cerrar el popover (se aplica con onChange) */}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={() => removeCartLine(index)}
                                    className="h-8 w-8 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                              {/* --- FIN NUEVA CELDA --- V V V */}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            </div>
            {/* --- Columna de Cliente, Totales y Pago (Derecha) --- */}
            <div className="col-span-12 md:col-span-5 lg:col-span-4 bg-slate-100 dark:bg-slate-800/50 p-3 flex flex-col gap-3 overflow-y-auto border-l">
              {/* Selección de Cliente */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-md flex justify-between items-center">
                    Cliente
                    {/* TODO: Implementar diálogo de creación de cliente */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log(
                          "Botón 'Nuevo Cliente' presionado (sin abrir diálogo)"
                        );
                        form.setValue("isNewCustomer", true, {
                          shouldValidate: true,
                        });
                        form.setValue("customerId", null, {
                          shouldValidate: true,
                        });
                        setIsCreateCustomerDialogOpen(true); // <--- COMENTADO
                      }}
                      className="text-xs"
                    >
                      <UserPlus className="mr-1 h-3 w-3" /> Nuevo
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 px-4">
                  <Popover
                    open={isCustomerSearchOpen}
                    onOpenChange={setIsCustomerSearchOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isCustomerSearchOpen}
                        type="button"
                        className="w-full justify-between h-10"
                      >
                        {form.getValues("customerNameDisplay") ||
                          "Seleccionar cliente..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[calc(100vw-40px-theme(space.60))] sm:w-[350px] p-0">
                      {/* Ajustar ancho Popover */}
                      <Command
                        filter={(value, search) =>
                          value.toLowerCase().indexOf(search.toLowerCase()) > -1
                            ? 1
                            : 0
                        }
                      >
                        {/* Mejor filtro */}
                        <CommandInput
                          placeholder="Buscar cliente..."
                          value={customerSearchTerm}
                          onValueChange={setCustomerSearchTerm}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isLoadingSearchedCustomers
                              ? "Buscando..."
                              : "No se encontraron clientes."}
                          </CommandEmpty>
                          <CommandGroup>
                            {searchedCustomers?.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={`${customer.firstName || ""} ${
                                  customer.lastName || ""
                                } ${customer.email || ""} ${
                                  customer.phone || ""
                                }`}
                                onSelect={() => handleSelectCustomer(customer)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    form.getValues("customerId") === customer.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div>
                                  <p className="text-sm">
                                    {customer.firstName} {customer.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {customer.phone || customer.email}
                                  </p>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {form.getValues("customerId") && (
                    <Button
                      variant="link"
                      size="sm"
                      type="button"
                      className="p-0 h-auto mt-1 text-xs"
                      onClick={() => {
                        form.setValue("customerId", null);
                        form.setValue(
                          "customerNameDisplay",
                          "Cliente Genérico"
                        );
                      }}
                    >
                      Usar Cliente Genérico
                    </Button>
                  )}
                </CardContent>
              </Card>
              {/* Resumen y Totales */}
              <Card className="flex-1">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-md">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm px-4 pb-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>{" "}
                    <span>{formatCurrency(form.getValues("subTotal"))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Impuestos (
                      {((storeSettings.defaultTaxRate || 0) * 100).toFixed(0)}
                      %):
                    </span>
                    <span>{formatCurrency(form.getValues("taxAmount"))}</span>
                  </div>
                  <FormField // Para el TIPO de descuento general
                    control={form.control}
                    name="discountOnTotalType" // Este campo en Zod es z.nativeEnum(DiscountType).optional().nullable()
                    render={({ field }) => (
                      <FormItem className="flex justify-between items-center">
                        <FormLabel className="text-sm">
                          Tipo Descuento Total:
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            // Convertir el valor especial a null para el estado del formulario
                            // Si se selecciona un tipo de descuento real, también limpiar el valor del descuento
                            // para evitar inconsistencias si el usuario cambia de tipo.
                            if (value === NO_DISCOUNT_TYPE_VALUE) {
                              field.onChange(null);
                              form.setValue("discountOnTotalValue", null, {
                                shouldValidate: true,
                              }); // Limpiar valor también
                            } else {
                              field.onChange(value as DiscountType); // Castear a DiscountType
                              // Opcional: podrías querer resetear discountOnTotalValue si el tipo cambia
                              // form.setValue("discountOnTotalValue", 0, { shouldValidate: true });
                            }
                          }}
                          // Si field.value es null o undefined, usa el valor especial para seleccionar "Ninguno"
                          // o deja que el placeholder del SelectTrigger actúe si es undefined y no hay "Ninguno"
                          value={field.value || NO_DISCOUNT_TYPE_VALUE} // Si es null/undefined, selecciona "Ninguno"
                        >
                          <FormControl>
                            <SelectTrigger className="h-8 w-[160px] sm:w-[180px]">
                              {/* Ajustar ancho */}
                              <SelectValue placeholder="Tipo..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NO_DISCOUNT_TYPE_VALUE}>
                              {/* Usar valor no vacío */}
                              Ninguno
                            </SelectItem>
                            <SelectItem value={DiscountType.PERCENTAGE}>
                              Porcentaje (%)
                            </SelectItem>
                            <SelectItem value={DiscountType.FIXED}>
                              Monto Fijo ({storeSettings.currencySymbol})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {/* FormMessage no es usualmente necesario para un Select así si la validación es opcional */}
                      </FormItem>
                    )}
                  />
                  <FormField // Para el VALOR del descuento general
                    name="discountOnTotalValue"
                    control={form.control}
                    // name="discountOnTotalValue" // Debe estar en posFormSchema y POSFormValuesZod
                    render={({ field }) => (
                      <FormItem className="flex justify-between items-center">
                        <FormLabel className="text-sm whitespace-nowrap mr-2">
                          Valor Descuento Total:
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min={0}
                            className="h-8 text-right w-24"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || null)
                            } // Enviar null si está vacío
                            disabled={!form.watch("discountOnTotalType")} // Deshabilitar si no hay tipo
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {/* Mostrar el monto del descuento general calculado */}
                  <div className="flex justify-between">
                    <span>Monto Descuento Total:</span>
                    <span>
                      {formatCurrency(
                        form.getValues("discountAmount") // Este campo 'discountAmount' debe ser el MONTO CALCULADO
                      )}
                    </span>
                  </div>
                  <Separator />
                  <FormMessage>
                    {form.formState.errors.discountAmount?.message}
                  </FormMessage>
                  <Separator />
                  <div className="flex justify-between font-bold text-xl pt-1">
                    <span>TOTAL:</span>{" "}
                    <span>{formatCurrency(form.getValues("totalAmount"))}</span>
                  </div>
                </CardContent>
              </Card>
              {/* Sección de Pago */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">Forma de Pago</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentTotalSale =
                          form.getValues("totalAmount") || 0;
                        const currentTotalPaid = form
                          .getValues("payments")
                          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
                        const amountStillDue = Math.max(
                          0,
                          currentTotalSale - currentTotalPaid
                        );

                        appendPayment({
                          fieldId: crypto.randomUUID(),
                          method: undefined, // O un default como CASH
                          amount: parseFloat(amountStillDue.toFixed(2)), // <-- AUTOCOMPLETA CON LO QUE FALTA
                          reference: "",
                          cardLast4: "",
                          // notes: "" // Si tienes notes en paymentSchema
                        });
                      }}
                      disabled={paymentFields.length >= 3}
                    >
                      <PlusCircle className="mr-1 h-3 w-3" /> Añadir
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-4 pb-3">
                  {paymentFields.map(
                    (
                      paymentItem,
                      index // <-- Asegúrate que aquí haya un PARÉNTESIS
                    ) => (
                      <div // Este div es el elemento raíz retornado por cada iteración del map
                        key={paymentItem.fieldId} // Usar la keyName que definiste para useFieldArray
                        className="space-y-2 border-b pb-2 last:border-b-0 last:pb-0 mb-2" // Añadí mb-2 para separar visualmente los métodos de pago
                      >
                        <div className="grid grid-cols-[1fr_110px_min-content] gap-2 items-start">
                          <FormField
                            control={form.control}
                            name={`payments.${index}.method`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sr-only">
                                  Método
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || ""}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Método..." />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {storeSettings.acceptedPaymentMethods.map(
                                      (m) => (
                                        <SelectItem key={m} value={m}>
                                          {m.replace("_", " ")}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`payments.${index}.amount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs sr-only">
                                  Monto
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    className="h-9 text-right"
                                    {...field}
                                    value={field.value ?? ""} // Para evitar input no controlado si es 0
                                    onChange={(e) =>
                                      field.onChange(
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removePayment(index)}
                            className="h-9 w-9 text-destructive self-center" // self-center para alinear con inputs
                            disabled={paymentFields.length <= 1} // No permitir eliminar si solo hay un pago
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Campos condicionales para Efectivo Recibido y Referencia */}
                        {form.watch(`payments.${index}.method`) ===
                          PaymentMethod.CASH &&
                          index === 0 && (
                            <FormField
                              control={form.control}
                              name="amountTenderedCash"
                              render={({ field }) => (
                                <FormItem className="mt-1">
                                  {" "}
                                  {/* col-span-full para que ocupe todo el ancho del grid padre si fuera necesario */}
                                  <FormLabel className="text-xs">
                                    Efectivo Recibido
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Monto recibido"
                                      className="h-9"
                                      {...field}
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(
                                          parseFloat(e.target.value) ||
                                            undefined
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}
                        {form.watch(`payments.${index}.method`) &&
                          form.watch(`payments.${index}.method`) !==
                            PaymentMethod.CASH &&
                          form.watch(`payments.${index}.method`) !==
                            PaymentMethod.STORE_CREDIT && // Asumiendo que crédito de tienda no necesita ref
                          form.watch(`payments.${index}.method`) !==
                            PaymentMethod.OTHER && ( // Asumiendo que "Otro" no necesita ref
                            <FormField
                              control={form.control}
                              name={`payments.${index}.reference`}
                              render={({ field }) => (
                                <FormItem className="mt-1">
                                  <FormLabel className="text-xs">
                                    Referencia
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Últimos 4, Nro. Ref, etc."
                                      className="h-9"
                                      {...field}
                                      value={field.value ?? ""}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          )}
                      </div> // Cierre del div principal para cada paymentItem
                    )
                  )}
                  <FormMessage>
                    {form.formState.errors.payments?.message ||
                      form.formState.errors.payments?.root?.message}
                  </FormMessage>
                  <Separator className="my-2" />
                  <div className="text-sm space-y-0.5">
                    <div className="flex justify-between">
                      <span>Total Pagado:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          paymentFields.reduce(
                            (acc, p) => acc + (Number(p.amount) || 0),
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pendiente por Pagar:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          Math.max(
                            0,
                            form.getValues("totalAmount") -
                              paymentFields.reduce(
                                (acc, p) => acc + (Number(p.amount) || 0),
                                0
                              )
                          )
                        )}
                      </span>
                    </div>
                    {form.watch(`payments.0.method`) === PaymentMethod.CASH &&
                      (form.getValues("amountTenderedCash") || 0) > 0 && (
                        <div className="flex justify-between text-green-600 font-semibold">
                          <span>Cambio:</span>
                          <span>
                            {formatCurrency(form.watch("changeGiven"))}
                          </span>
                        </div>
                      )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full text-lg py-6"
                    disabled={
                      createSaleMutation.isPending || cartLines.length === 0
                    }
                  >
                    {createSaleMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <DollarSign className="mr-2" /> Cobrar / Finalizar Venta
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </Form>
        {/* Diálogo para seleccionar IMEI/Serial */}
        <Dialog
          open={isSerialSelectOpen}
          onOpenChange={(open) => {
            if (!open) setSelectedProductForSerial(null);
            setIsSerialSelectOpen(open);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Seleccionar IMEI/Serial para: {selectedProductForSerial?.name}
              </DialogTitle>
            </DialogHeader>
            {isLoadingSerials && (
              <div className="py-4 text-center">
                Cargando seriales...
                <Loader2 className="inline-block h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoadingSerials &&
              (!availableSerials || availableSerials.length === 0) && (
                <p className="py-4 text-center text-muted-foreground">
                  No hay stock serializado disponible para este producto en
                  estado Disponible.
                </p>
              )}
            {availableSerials && availableSerials.length > 0 && (
              <ScrollArea className="max-h-64 my-4">
                <div className="space-y-1">
                  {availableSerials.map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      type="button"
                      className="w-full justify-start flex gap-2 items-center"
                      onClick={() => handleSerialSelect(item)}
                    >
                      <Checkbox
                        checked={cartLines.some(
                          (line) => line.inventoryItemId === item.id
                        )}
                        readOnly
                        className="mr-2"
                      />
                      <span>{item.imei}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        (Ubic: {item.location?.name}, Cond:{" "}
                        {item.condition || "N/A"})
                      </span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSerialSelectOpen(false);
                  setSelectedProductForSerial(null);
                }}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* TODO: Diálogo para Crear Cliente Rápido (isCreateCustomerDialogOpen) */}
        <NonSerializedProductToCartDialog
          product={productForNonSerializedDialog}
          isOpen={isNonSerializedDialogOpen}
          onOpenChange={setIsNonSerializedDialogOpen}
          onAddToCart={(product, location) => {
            addProductToCart(product, null, {
              locationId: location.locationId,
              locationName: location.locationName,
            });
          }}
        />
        {/* --- DIÁLOGO PARA CREAR CLIENTE RÁPIDO --- V V V */}
        <CreateCustomerDialog
          isOpen={isCreateCustomerDialogOpen}
          onOpenChange={setIsCreateCustomerDialogOpen}
          onSuccess={(newlyCreatedCustomer) => {
            // Cuando el cliente se crea exitosamente desde el diálogo,
            // selecciónalo automáticamente en el formulario del POS.
            handleSelectCustomer(newlyCreatedCustomer);
            // El diálogo se cierra a sí mismo a través de su onOpenChange y el onSuccess de su propia mutación.
            // No es necesario setIsCreateCustomerDialogOpen(false) aquí si el diálogo lo hace.
          }}
        />
      </div>
    </>
  );
}
