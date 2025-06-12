// app/(dashboard)/sales/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  EnrichedSaleLineItem,
  EnrichedSalePaymentItem,
  SaleFromAPI, // Para el casteo inicial de la respuesta de API
  SalePaymentFromAPI,
  SaleLineFromAPI,
  EnrichedSaleDetailed,
  EnrichedSale, // Tipo base de Supplier que usamos antes, asegurar que no haya confusión
} from "@/types/sales.types"; // O donde tengas EnrichedSale
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Printer,
  DollarSign,
  XCircle,
  RotateCcw,
  Loader2,
} from "lucide-react"; // Iconos
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import {
  SaleStatus as PrismaSaleStatus,
  PaymentMethod as PrismaPaymentMethod,
  PaymentMethod,
} from "@/types/prisma-enums";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo, useRef, useState } from "react";
import { AddSalePaymentDialog } from "@/components/sales/add-sale-payment-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { ProcessSaleReturnDialog } from "@/components/sales/process-sale-return-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import React from "react";
import { useAuthStore } from "@/stores/auth.store";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StoreSettings } from "@/types/settings.types";
import { ReceiptPaperSize } from "@/components/sales/printable-sale-receipt";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Mapeo para estados de Venta (ya lo teníamos en la página de listado)
const saleStatusLabels: Record<PrismaSaleStatus, string> = {
  PENDING_PAYMENT: "Pendiente Pago",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  RETURNED: "Devuelta",
  PARTIALLY_RETURNED: "Dev. Parcial",
};
// Mapeo para métodos de pago
const paymentMethodLabels: Record<PrismaPaymentMethod, string> = {
  CASH: "Efectivo",
  CARD_CREDIT: "Tarjeta Crédito",
  CARD_DEBIT: "Tarjeta Débito",
  TRANSFER: "Transferencia",
  MOBILE_WALLET: "Billetera Móvil",
  STORE_CREDIT: "Crédito Tienda",
  OTHER: "Otro",
};

const ALL_PAYMENT_METHODS = Object.values(PaymentMethod);

export default function SaleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.id as string;
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);

  // TODO: Estados para diálogos de acciones
  // En SaleDetailPage
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [isCancelSaleDialogOpen, setIsCancelSaleDialogOpen] = useState(false);
  const [isReturnSaleDialogOpen, setIsReturnSaleDialogOpen] = useState(false);

  // const receiptRef = React.useRef<HTMLDivElement>(null);
  // const [isPreviewReceiptOpen, setIsPreviewReceiptOpen] = useState(false); // O isReceiptDialogOpen
  // const [isReceiptMounted, setIsReceiptMounted] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedPaperSize, setSelectedPaperSize] =
    useState<ReceiptPaperSize>("POS_RECEIPT_80MM"); // Default a 80mm
  // const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewSrc, setPdfPreviewSrc] = useState<string | null>(null); // Estado solo para el 'src' del iframe
  const pdfUrlRef = useRef<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      name: currentStoreSettings?.name ?? "Tienda Genérica",
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
  console.log(typeof storeSettings.defaultTaxRate);

  const {
    data: sale, // sale será de tipo EnrichedSaleDetailed
    isLoading,
    isError,
    error,
    refetch: refetchSale,
  } = useQuery<EnrichedSaleDetailed, Error>({
    // Usar EnrichedSaleDetailed
    queryKey: ["saleDetails", saleId],
    queryFn: async () => {
      if (!saleId) throw new Error("ID de Venta no encontrado");
      const response = await apiClient.get<SaleFromAPI>(`/sales/${saleId}`);
      const saleFromApi = response.data;

      const safeParseFloat = (
        val: unknown,
        defaultValueIfNaN: number | null = 0
      ): number | null => {
        if (val === null || val === undefined || String(val).trim() === "")
          return defaultValueIfNaN;
        const num = parseFloat(String(val));
        return isNaN(num) ? defaultValueIfNaN : num;
      };
      const safeParseInt = (
        val: unknown,
        defaultValueIfNaN: number = 0
      ): number => {
        if (val === null || val === undefined || String(val).trim() === "")
          return defaultValueIfNaN;
        const num = parseInt(String(val), 10);
        return isNaN(num) ? defaultValueIfNaN : num;
      };

      let calculatedGrossSubTotal = 0; // Subtotal bruto, suma de (precio * cantidad) de líneas
      let calculatedTotalLineDiscounts = 0;

      const enrichedLines: EnrichedSaleLineItem[] = saleFromApi.lines.map(
        (lineFromApi: SaleLineFromAPI) => {
          const unitPriceNum = safeParseFloat(lineFromApi.unitPrice, 0)!;
          const quantityNum = safeParseInt(lineFromApi.quantity, 0)!;
          const lineGrossTotal = unitPriceNum * quantityNum;
          calculatedGrossSubTotal += lineGrossTotal; // Acumular subtotal bruto

          const discountAmountNum = safeParseFloat(
            lineFromApi.discountAmount,
            0
          )!;
          calculatedTotalLineDiscounts += discountAmountNum; // Acumular descuentos de línea

          const taxAmountNum = safeParseFloat(lineFromApi.taxAmount, 0)!;
          const lineTotalNum = safeParseFloat(lineFromApi.lineTotal, 0)!;

          return {
            // ... (otros campos de EnrichedSaleLineItem que ya tenías)
            id: lineFromApi.id,
            saleId: lineFromApi.saleId,
            productId: lineFromApi.productId,
            product: lineFromApi.product,
            inventoryItemId: lineFromApi.inventoryItemId,
            imei: lineFromApi.imei ?? null,
            miscItemDescription: lineFromApi.description, // Asumiendo que description es miscItemDescription
            quantity: quantityNum,
            unitPrice: unitPriceNum,
            discountType: lineFromApi.discountType, // Añadir discountType si lo necesitas en EnrichedSaleLineItem
            // discountValue: safeParseFloat(lineFromApi.discountValue, null), // Si lo tienes
            discountAmount: discountAmountNum,
            taxAmount: taxAmountNum,
            lineTotal: lineTotalNum, // Este es el total de línea después de su descuento y su impuesto (si aplica)
            // costPriceAtSale: safeParseFloat(lineFromApi.costPriceAtSale, null), // si lo tienes y lo necesitas
          };
        }
      );

      const enrichedPayments: EnrichedSalePaymentItem[] =
        saleFromApi.payments.map((paymentFromApi: SalePaymentFromAPI) => ({
          /* ... tu mapeo de pagos ... */ id: paymentFromApi.id,
          saleId: paymentFromApi.saleId,
          paymentMethod: paymentFromApi.paymentMethod,
          amount: safeParseFloat(paymentFromApi.amount, 0)!,
          reference: paymentFromApi.reference,
          amountTendered: safeParseFloat(paymentFromApi.amountTendered, null),
          changeGiven: safeParseFloat(paymentFromApi.changeGiven, null),
          cardLast4: paymentFromApi.cardLast4,
          cardBrand: paymentFromApi.cardBrand,
          cardAuthCode: paymentFromApi.cardAuthCode,
          transferConfirmation: paymentFromApi.transferConfirmation,
          paymentDate: paymentFromApi.paymentDate,
          isRefund: paymentFromApi.isRefund,
          userId: paymentFromApi.userId,
          user: paymentFromApi.user,
          createdAt: paymentFromApi.createdAt,
          updatedAt: paymentFromApi.updatedAt,
        }));

      // Usar los valores de la BD como base, pero recalcular si es necesario para consistencia del DTO
      const subTotalFromDB = safeParseFloat(saleFromApi.subTotal, 0)!; // Este es el subtotal DESPUÉS de descuentos de línea
      const discountOnTotalAmountFromDB = safeParseFloat(
        saleFromApi.discountTotal,
        0
      )!;

      // Recalcular taxableAmount para el DTO
      const calculatedTaxableAmount =
        subTotalFromDB - discountOnTotalAmountFromDB;
      const taxTotalFromDB = safeParseFloat(saleFromApi.taxTotal, 0)!;

      // Recalcular totalAmount para el DTO (o usar el de la BD si confías en él)
      const calculatedTotalAmount = calculatedTaxableAmount + taxTotalFromDB;

      // Construir el objeto EnrichedSaleDetailed final
      const enrichedSaleData: EnrichedSaleDetailed = {
        id: saleFromApi.id,
        saleNumber: saleFromApi.saleNumber,
        storeId: saleFromApi.storeId,
        customerId: saleFromApi.customerId,
        customer: saleFromApi.customer,
        userId: saleFromApi.userId,
        user: saleFromApi.user,
        status: saleFromApi.status,
        saleDate: saleFromApi.saleDate,
        notes: saleFromApi.notes,

        subTotal: calculatedGrossSubTotal, // Subtotal BRUTO (suma de precio*cantidad de líneas)
        totalLineDiscounts: calculatedTotalLineDiscounts, // Suma de descuentos APLICADOS a las líneas
        subTotalAfterLineDiscounts: subTotalFromDB, // El subtotal que ya tiene los descuentos de línea restados

        discountOnTotalType: saleFromApi.discountOnTotalType, // Añadir si lo tienes en SaleFromAPI y EnrichedSaleDetailed
        discountOnTotalValue: safeParseFloat(
          saleFromApi.discountOnTotalValue,
          null
        ), // Añadir si lo tienes
        discountOnTotalAmount: discountOnTotalAmountFromDB,

        taxableAmount: calculatedTaxableAmount, // <--- AÑADIDO Y CALCULADO
        taxTotal: taxTotalFromDB, // Mapear taxTotal de la API
        // 'taxes' (si lo tenías en EnrichedSaleDetailed) podría ser un alias de taxTotal o algo diferente
        // Asegúrate que EnrichedSaleDetailed defina 'taxTotal'

        totalAmount: calculatedTotalAmount, // Usar el calculado para consistencia con taxable y taxTotal
        amountPaid: safeParseFloat(saleFromApi.amountPaid, 0)!,
        amountDue: safeParseFloat(saleFromApi.amountDue, 0)!,
        changeGiven: safeParseFloat(saleFromApi.changeGiven, null),

        createdAt: saleFromApi.createdAt,
        updatedAt: saleFromApi.updatedAt,
        lines: enrichedLines,
        payments: enrichedPayments,
        linkedRepairId: saleFromApi.linkedRepairId,
        // Asegúrate de que totalCostOfGoodsSold y totalSaleProfit también se calculen y añadan aquí
        // si son parte de EnrichedSaleDetailed
      };
      // console.log("Enriched Sale Data being returned:", enrichedSaleData);
      return enrichedSaleData;
    },
    enabled: !!saleId,
  });

  const cancelSaleMutation = useMutation<
    EnrichedSale, // Asume que el backend devuelve la venta actualizada
    Error,
    string // saleId a cancelar
  >({
    mutationFn: (saleIdToCancel: string) =>
      apiClient.patch(`/sales/${saleIdToCancel}/cancel`, {}), // No se necesita body si el backend no lo espera
    onSuccess: (cancelledSale) => {
      toast.success(`Venta #${cancelledSale.saleNumber} ha sido cancelada.`);
      refetchSale(); // Refrescar los datos de la venta actual para mostrar el nuevo estado
      queryClient.invalidateQueries({ queryKey: ["salesList"] }); // Refrescar la lista de ventas general
      setIsCancelSaleDialogOpen(false); // Cerrar el diálogo de confirmación
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al generar el PDF.");
      toast.error(errorMessage);
      setIsCancelSaleDialogOpen(false);
    },
  });

  // TODO: Mutaciones para Añadir Pago, Cancelar Venta, Procesar Devolución

  const handleOpenReturnSaleDialog = () => {
    if (!sale) {
      // 'sale' es la data de tu useQuery para los detalles de la venta
      toast.error(
        "No se pueden cargar los detalles de la venta para procesar la devolución."
      );
      return;
    }
    // Verificar si la venta está en un estado que permita devoluciones
    if (
      sale.status !== PrismaSaleStatus.COMPLETED &&
      sale.status !== PrismaSaleStatus.PARTIALLY_RETURNED
    ) {
      toast.info(
        `No se pueden procesar devoluciones para una venta en estado: ${
          saleStatusLabels[sale.status]
        }.`
      );
      return;
    }
    console.log(
      "Abriendo diálogo para procesar devolución de la venta:",
      sale.saleNumber
    );
    setIsReturnSaleDialogOpen(true);
  };

  const handleOpenCancelSaleDialog = () => {
    if (!sale) return; // No debería pasar si el botón está visible
    console.log("Abriendo AlertDialog para cancelar Venta:", sale.saleNumber);
    setIsCancelSaleDialogOpen(true);
  };

  const confirmCancelSale = () => {
    if (sale) {
      cancelSaleMutation.mutate(sale.id);
    }
  };

  useEffect(() => {
    // Si el diálogo no está abierto, no hacemos nada.
    if (!isPrintDialogOpen) {
      return;
    }

    // Si no hay venta, tampoco hacemos nada (mostraremos un mensaje en el UI)
    if (!sale?.id) {
      setPdfPreviewSrc(null); // Asegurarse de limpiar la vista previa
      return;
    }

    const generatePdfForPreview = async () => {
      setIsGeneratingPdf(true);
      setPdfPreviewSrc(null); // Limpiar la vista previa mientras carga

      try {
        const apiUrlBase = apiClient.defaults.baseURL || "";
        const endpointUrl = `${apiUrlBase}/sales/${sale.id}/printable-document?format=${selectedPaperSize}`;

        const response = await apiClient.get(endpointUrl, {
          responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });

        // Limpiar la URL de objeto ANTERIOR antes de crear una nueva
        if (pdfUrlRef.current) {
          URL.revokeObjectURL(pdfUrlRef.current);
        }

        const url = URL.createObjectURL(blob);
        pdfUrlRef.current = url; // Guardar la nueva URL en la ref
        setPdfPreviewSrc(url); // Actualizar el estado del 'src' para que el iframe se re-renderice
      } catch (err: unknown) {
        const errorMessage = await getErrorMessage(
          err,
          "Error al generar el PDF."
        );
        toast.error(errorMessage);
        setIsPrintDialogOpen(false);
      } finally {
        setIsGeneratingPdf(false);
      }
    };

    generatePdfForPreview();

    // La función de limpieza principal se ejecuta solo cuando el diálogo se cierra
    // (cuando isPrintDialogOpen cambia de true a false)
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }
    };
  }, [isPrintDialogOpen, selectedPaperSize, sale?.id]); // Las dependencias son correctas y no causan bucle

  const handleFinalPrint = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      toast.error("La vista previa del documento no está lista.");
      return;
    }

    // Llama a la función de impresión del contenido del iframe
    try {
      iframe.contentWindow?.print();
    } catch (err) {
      console.error("Error al intentar imprimir el iframe:", err);
      toast.error(
        "No se pudo abrir el diálogo de impresión. Intenta descargar el PDF."
      );
    }
  };

  if (isLoading) {
    /* ... Skeleton UI ... */
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cargando Detalles de Venta..."
          actionButton={<Skeleton className="h-9 w-32" />}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-6 text-red-500">
        Error cargando detalles de la venta:{" "}
        {error?.message || "Error desconocido."}
      </div>
    );
  }
  if (!sale) {
    return <div className="p-6">Venta no encontrada o inválida.</div>;
  }

  const canAddPayment =
    sale.status === PrismaSaleStatus.PENDING_PAYMENT &&
    (sale.amountDue ?? 0) > 0;
  const canCancelSale =
    sale.status === PrismaSaleStatus.PENDING_PAYMENT ||
    sale.status === PrismaSaleStatus.COMPLETED; // Lógica de negocio
  const canProcessReturn =
    sale.status === PrismaSaleStatus.COMPLETED ||
    sale.status === PrismaSaleStatus.PARTIALLY_RETURNED;

  return (
    <>
      <PageHeader
        title={`Detalle de Venta: #${sale.saleNumber}`}
        description={`Realizada el ${formatDate(
          sale.saleDate,
          "dd/MM/yyyy 'a las' HH:mm"
        )}`}
        actionButton={
          <div className="flex gap-2">
            {/* TODO: Botones de Acción: Añadir Pago, Cancelar, Devolución, Imprimir */}
            {canAddPayment && (
              <Button size="sm" onClick={() => setIsAddPaymentDialogOpen(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                Añadir Pago
              </Button>
            )}
            {canCancelSale && (
              <Button
                variant="destructive" // O "outline" con color rojo
                size="sm"
                onClick={handleOpenCancelSaleDialog} // <-- CONECTAR HANDLER
                disabled={cancelSaleMutation.isPending}
              >
                {cancelSaleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar Venta
              </Button>
            )}
            {canProcessReturn && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenReturnSaleDialog} // <-- CONECTAR HANDLER
                // disabled={algunaCondicionDeMutacionSiLaHay} // Si hay una mutación global para la página
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Procesar Devolución
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrintDialogOpen(true)}
              disabled={!sale}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir / Descargar...
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/sales")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Información de la Venta</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <strong>Nº Venta:</strong> {sale.saleNumber}
            </div>
            <div>
              <strong>Fecha:</strong> {formatDate(sale.saleDate)}
            </div>
            <div>
              <strong>Estado:</strong>{" "}
              <Badge variant="outline">
                {saleStatusLabels[sale.status] || sale.status}
              </Badge>
            </div>
            <div>
              <strong>Vendedor:</strong>{" "}
              {sale.user
                ? `${sale.user.firstName || ""} ${
                    sale.user.lastName || ""
                  }`.trim()
                : "N/A"}
            </div>
            <div className="col-span-full">
              <strong>Cliente:</strong>{" "}
              {sale.customer
                ? `${sale.customer.firstName || ""} ${
                    sale.customer.lastName || ""
                  } (${
                    sale.customer.email || sale.customer.phone || "N/A"
                  })`.trim()
                : "Cliente Genérico"}
            </div>
            {sale.notes && (
              <div className="col-span-full">
                <strong>Notas:</strong>{" "}
                <p className="text-muted-foreground whitespace-pre-wrap text-xs">
                  {sale.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>{" "}
              <span>{formatCurrency(sale.subTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuestos:</span>{" "}
              <span>{formatCurrency(sale.taxTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento Total:</span>{" "}
              <span>{formatCurrency(sale.discountOnTotalAmount)}</span>
            </div>
            <Separator className="my-1.5" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total Venta:</span>{" "}
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Pagado:</span>{" "}
              <span>{formatCurrency(sale.amountPaid)}</span>
            </div>
            <div
              className={`flex justify-between font-semibold ${
                (sale.amountDue ?? 0) > 0
                  ? "text-destructive"
                  : "text-green-600"
              }`}
            >
              <span>
                {(sale.amountDue ?? 0) > 0
                  ? "Monto Pendiente:"
                  : "Pagado Completo:"}
              </span>
              <span>{formatCurrency(sale.amountDue)}</span>
            </div>
            {sale.changeGiven !== null &&
              sale.changeGiven !== undefined &&
              sale.changeGiven > 0 && (
                <div className="flex justify-between">
                  <span>Cambio Entregado:</span>{" "}
                  <span>{formatCurrency(sale.changeGiven)}</span>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productos Vendidos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>IMEI/Serial</TableHead>
                  <TableHead className="text-center">Cant.</TableHead>
                  <TableHead className="text-right">P.Unit.</TableHead>
                  <TableHead className="text-right">Total Línea</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.lines.map((line) => {
                  // 'line' es ahora EnrichedSaleLineItem
                  // const pendingQuantity = line.orderedQuantity - line.receivedQuantity; // Esto era de PO
                  return (
                    <TableRow key={line.id}>
                      <TableCell className="font-medium">
                        {line.product?.name ||
                          line.miscItemDescription ||
                          "N/A"}
                      </TableCell>
                      <TableCell>{line.product?.sku || "-"}</TableCell>
                      <TableCell>
                        {line.imei || (line.product?.tracksImei ? "N/A" : "-")}
                      </TableCell>
                      <TableCell className="text-center">
                        {line.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(line.lineTotal)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagos Realizados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.payments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-4"
                    >
                      No hay pagos.
                    </TableCell>
                  </TableRow>
                )}
                {sale.payments.map(
                  (
                    payment // payment es EnrichedSalePaymentItem
                  ) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {formatDate(payment.paymentDate, "dd/MM/yy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {paymentMethodLabels[payment.paymentMethod] ||
                            payment.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.reference || "-"}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Diálogos para Añadir Pago, Cancelar Venta, etc. */}
      {/* <AddPaymentDialog isOpen={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen} saleId={sale.id} amountDue={sale.amountDue ?? 0} onSuccess={refetchSale} /> */}
      {sale && ( // Asegurarse de que 'sale' exista antes de pasarla
        <ProcessSaleReturnDialog
          sale={sale} // Pasar el objeto 'sale' completo (EnrichedSaleDetailed)
          isOpen={isReturnSaleDialogOpen}
          onOpenChange={setIsReturnSaleDialogOpen}
          onReturnProcessed={() => {
            // setIsReturnSaleDialogOpen(false); // El diálogo debería cerrarse a sí mismo en su onSuccess
            toast.info(
              "Refrescando detalles de la venta después de la devolución..."
            );
            refetchSale(); // Refrescar los datos de la venta actual
          }}
        />
      )}

      <AddSalePaymentDialog
        saleId={sale.id}
        amountDue={sale.amountDue ?? 0} // Asegúrate que sale.amountDue sea number
        isOpen={isAddPaymentDialogOpen}
        onOpenChange={setIsAddPaymentDialogOpen}
        onPaymentAdded={() => {
          setIsAddPaymentDialogOpen(false); // El diálogo se cierra a sí mismo, pero por si acaso
          toast.info("Refrescando detalles de la venta...");
          refetchSale(); // Refrescar los datos de la venta actual
        }}
      />

      {sale && ( // Solo renderizar si 'sale' existe
        <AlertDialog
          open={isCancelSaleDialogOpen}
          onOpenChange={setIsCancelSaleDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de cancelar la Venta #{sale.saleNumber}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción cambiará el estado de la venta a Cancelada. El stock
                asociado a esta venta será reversado (si aplica según la lógica
                del backend). Esta acción no se puede deshacer fácilmente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setIsCancelSaleDialogOpen(false)}
              >
                No, mantener venta
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelSale}
                disabled={cancelSaleMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {cancelSaleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sí, Cancelar Venta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-4 sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle>Imprimir / Descargar Factura</DialogTitle>
            <DialogDescription>
              Selecciona el formato deseado. Puedes imprimir directamente o usar
              la opción Guardar como PDF de tu navegador.
            </DialogDescription>
          </DialogHeader>

          {/* Controles de Formato */}
          <div className="py-2 border-y shrink-0">
            <Label className="text-sm font-medium">Formato de Papel:</Label>
            <RadioGroup
              value={selectedPaperSize}
              onValueChange={(value) =>
                setSelectedPaperSize(value as ReceiptPaperSize)
              }
              className="flex items-center space-x-4 pt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="POS_RECEIPT_80MM" id="size-80mm" />
                <Label htmlFor="size-80mm" className="text-sm font-normal">
                  Recibo POS (80mm)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="POS_RECEIPT_58MM" id="size-58mm" />
                <Label htmlFor="size-58mm" className="text-sm font-normal">
                  Recibo POS (58mm)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A4_INVOICE" id="size-a4" />
                <Label htmlFor="size-a4" className="text-sm font-normal">
                  Factura A4/Carta
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Área de Previsualización del PDF */}
          <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden relative">
            {isGeneratingPdf && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-3">Generando documento...</p>
              </div>
            )}
            {pdfPreviewSrc ? (
              <iframe
                ref={iframeRef}
                src={pdfPreviewSrc}
                className="w-full h-full border-0"
                title={`Vista previa de ${sale?.saleNumber}`}
              ></iframe>
            ) : (
              !isGeneratingPdf && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Selecciona un formato para ver la vista previa.
                </div>
              )
            )}
          </div>

          <DialogFooter className="shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPrintDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button
              type="button"
              onClick={handleFinalPrint}
              disabled={isGeneratingPdf || !pdfPreviewSrc}
            >
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
