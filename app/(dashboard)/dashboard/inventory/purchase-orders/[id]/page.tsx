// app/(dashboard)/inventory/purchase-orders/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  PurchaseOrderDetailed,
  PurchaseOrderFromAPI,
  PurchaseOrderLine,
  PurchaseOrderLineFromAPI,
  SupplierBasic,
} from "@/types/inventory.types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CheckCircle, PackageCheck } from "lucide-react"; // Iconos necesarios
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { PurchaseOrderStatus as PrismaPurchaseOrderStatus } from "@/types/prisma-enums";
import { toast } from "sonner"; // Asumo que usas sonner para notificaciones
import { useMemo, useState } from "react";
import { ReceiveStockDialog } from "@/components/inventory/purchase-orders/receive-stock-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const poStatusLabels: Record<PrismaPurchaseOrderStatus, string> = {
  DRAFT: "Borrador",
  ORDERED: "Ordenada",
  PARTIALLY_RECEIVED: "Recibida Parcialmente",
  RECEIVED: "Recibida Totalmente",
  CANCELLED: "Cancelada",
  CLOSED: "Cerrada",
};

// Interfaz para los detalles del proveedor como los esperamos del backend
interface SupplierDetailsForPO extends SupplierBasic {
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface SupplierDetailsForPO extends SupplierBasic {
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  // address?: string | null; // Si también lo necesitas
}

// Ajustar PurchaseOrderDetailed si el backend devuelve supplier con más campos
interface EnrichedPurchaseOrderLine extends PurchaseOrderLine {
  lineNumber: number;
  parsedUnitCost: number;
  calculatedLineTotal: number;
  pendingQuantity: number;
}

interface EnrichedPurchaseOrderDetailed
  extends Omit<
    PurchaseOrderDetailed,
    "lines" | "totalAmount" | "shippingCost" | "taxes" | "supplier"
  > {
  supplier: SupplierDetailsForPO | null;
  totalAmount: number | null;
  shippingCost: number | null;
  taxes: number | null;
  lines: EnrichedPurchaseOrderLine[]; // Usar el tipo de línea enriquecido
}

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poId = params.id as string;

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedLineToReceive, setSelectedLineToReceive] =
    useState<PurchaseOrderLine | null>(null);

  const {
    data: purchaseOrder, // purchaseOrder será de tipo EnrichedPurchaseOrderDetailed
    isLoading,
    isError,
    error,
    refetch: refetchPO,
  } = useQuery<EnrichedPurchaseOrderDetailed, Error>({
    queryKey: ["purchaseOrderDetails", poId],
    queryFn: async () => {
      if (!poId) throw new Error("ID de Orden de Compra no encontrado");
      const response = await apiClient.get<PurchaseOrderFromAPI>( // Espera el tipo de la API
        `/inventory/purchase-orders/${poId}`
      );
      const poDataFromApi = response.data;

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

      const parsedLines: EnrichedPurchaseOrderLine[] = poDataFromApi.lines.map(
        (lineFromApi: PurchaseOrderLineFromAPI): EnrichedPurchaseOrderLine => {
          // Tus cálculos de parseo están perfectos
          const unitCost = safeParseFloat(lineFromApi.unitCost, 0)!;
          const orderedQuantity = safeParseInt(lineFromApi.orderedQuantity, 0)!;
          const receivedQuantity = safeParseInt(
            lineFromApi.receivedQuantity,
            0
          )!;
          const pendingQuantity = orderedQuantity - receivedQuantity;
          const calculatedLineTotal = unitCost * orderedQuantity;

          // --- CONSTRUCCIÓN DEL OBJETO CORREGIDA ---
          // Construimos el objeto para que coincida EXACTAMENTE con la interfaz EnrichedPurchaseOrderLine
          return {
            // 1. Copiamos todas las propiedades originales de la línea que viene de la API.
            //    Esto satisface la parte 'extends PurchaseOrderLine' de tu tipo.
            ...lineFromApi,

            // 2. Sobrescribimos las propiedades que parseamos a número, si es necesario.
            //    (Aunque `...lineFromApi` ya las incluye como string, TypeScript permite
            //    sobrescribirlas con un tipo más específico si la interfaz lo define).
            orderedQuantity: orderedQuantity,
            receivedQuantity: receivedQuantity,

            // 3. Añadimos las nuevas propiedades calculadas con los NOMBRES CORRECTOS
            //    que tu interfaz EnrichedPurchaseOrderLine espera.
            parsedUnitCost: unitCost, // <-- Usamos el nombre 'parsedUnitCost'
            calculatedLineTotal: calculatedLineTotal, // <-- Usamos el nombre 'calculatedLineTotal'
            pendingQuantity: pendingQuantity,
          };
          // --- FIN DE LA CONSTRUCCIÓN ---
        }
      );

      return {
        // Mapear explícitamente los campos de poDataFromApi al tipo EnrichedPurchaseOrderDetailed
        id: poDataFromApi.id,
        poNumber: poDataFromApi.poNumber,
        storeId: poDataFromApi.storeId,
        supplierId: poDataFromApi.supplierId,
        supplier: poDataFromApi.supplier as SupplierDetailsForPO | null, // Casteo si es necesario
        status: poDataFromApi.status,
        orderDate: poDataFromApi.orderDate,
        expectedDate: poDataFromApi.expectedDate,
        receivedDate: poDataFromApi.receivedDate,
        notes: poDataFromApi.notes,
        userId: poDataFromApi.userId, // Asegúrate que tu tipo lo incluya si lo necesitas
        createdAt: poDataFromApi.createdAt,
        updatedAt: poDataFromApi.updatedAt,
        // Campos parseados
        totalAmount: safeParseFloat(poDataFromApi.totalAmount),
        shippingCost: safeParseFloat(poDataFromApi.shippingCost),
        taxes: safeParseFloat(poDataFromApi.taxes),
        lines: parsedLines,
      };
    },
    enabled: !!poId,
  });

  const handleOpenReceiveModal = (line: PurchaseOrderLine) => {
    setSelectedLineToReceive(line);
    setIsReceiveModalOpen(true);
  };

  // Lógica para calcular subtotal de la PO (suma de lineTotal)
  const poSubTotalLines = useMemo(() => {
    if (!purchaseOrder?.lines) return 0;
    return purchaseOrder.lines.reduce(
      (acc, line) => acc + (line.calculatedLineTotal || 0), // Usar el total de línea calculado
      0
    );
  }, [purchaseOrder?.lines]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cargando Orden de Compra..."
          actionButton={<Skeleton className="h-9 w-32" />}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
        <Skeleton className="h-16 w-full" /> {/* Para notas si las hay */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(8)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-5 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={`skel-line-${i}`}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-500">
        Error cargando orden de compra: {error?.message || "Error desconocido."}
      </div>
    );
  }

  if (!purchaseOrder) {
    // Esto podría pasar brevemente antes de que isLoading sea false pero data aún no esté
    // O si el ID no es válido y la API devuelve 404 (que query lo marcaría como error)
    return <div className="p-6">Orden de compra no encontrada o inválida.</div>;
  }

  const canReceiveStock =
    purchaseOrder.status === PrismaPurchaseOrderStatus.ORDERED ||
    purchaseOrder.status === PrismaPurchaseOrderStatus.PARTIALLY_RECEIVED;

  return (
    <>
      <PageHeader
        title={`Orden de Compra: ${purchaseOrder.poNumber}`}
        description={`Proveedor: ${
          purchaseOrder.supplier?.name || "N/A"
        } | Estado: ${
          poStatusLabels[purchaseOrder.status as PrismaPurchaseOrderStatus] ||
          purchaseOrder.status
        }`}
        actionButton={
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/inventory/purchase-orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la Lista
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Información del Proveedor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <strong>Nombre:</strong> {purchaseOrder.supplier?.name || "N/A"}
            </p>
            <p>
              <strong>Contacto:</strong>{" "}
              {purchaseOrder.supplier?.contactName || "N/A"}
            </p>
            <p>
              <strong>Teléfono:</strong>{" "}
              {purchaseOrder.supplier?.phone || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {purchaseOrder.supplier?.email || "N/A"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fechas y Referencias</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <strong>Fecha de Orden:</strong>{" "}
              {formatDate(purchaseOrder.orderDate)}
            </p>
            <p>
              <strong>Fecha Esperada:</strong>{" "}
              {formatDate(purchaseOrder.expectedDate)}
            </p>
            <p>
              <strong>Fecha Recibida (Completa):</strong>{" "}
              {formatDate(purchaseOrder.receivedDate)}
            </p>
            <p>
              <strong>Creada:</strong>{" "}
              {formatDate(purchaseOrder.createdAt, "dd/MM/yyyy HH:mm")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Totales de la Orden</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>
              <strong>Subtotal (Líneas):</strong>{" "}
              {formatCurrency(poSubTotalLines)}
            </p>
            <p>
              <strong>Costo Envío:</strong>{" "}
              {formatCurrency(purchaseOrder.shippingCost)}
            </p>
            <p>
              <strong>Impuestos:</strong> {formatCurrency(purchaseOrder.taxes)}
            </p>
            <p className="font-semibold text-lg mt-2">
              <strong>Total Orden:</strong>{" "}
              {formatCurrency(purchaseOrder.totalAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {purchaseOrder.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {purchaseOrder.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Líneas de Productos Ordenados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Costo Unit.</TableHead>
                <TableHead className="text-center">Cant. Ordenada</TableHead>
                <TableHead className="text-center">Cant. Recibida</TableHead>
                <TableHead className="text-center">Cant. Pendiente</TableHead>
                <TableHead className="text-right">Subtotal Línea</TableHead>
                <TableHead className="text-center w-[120px]">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrder.lines.map((line) => {
                const pendingQuantity =
                  line.orderedQuantity - line.receivedQuantity;
                return (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">
                      {line.product?.name || "Producto Desconocido"}
                    </TableCell>
                    <TableCell>{line.product?.sku || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(line.unitCost)}
                    </TableCell>
                    <TableCell className="text-center">
                      {line.orderedQuantity}
                    </TableCell>
                    <TableCell className="text-center">
                      {line.receivedQuantity}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {line.pendingQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(line.calculatedLineTotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      {canReceiveStock && pendingQuantity > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReceiveModal(line)}
                        >
                          <PackageCheck className="mr-1 h-4 w-4" /> Recibir
                        </Button>
                      )}
                      {pendingQuantity === 0 && (
                        // 2. Envuelve todo en un TooltipProvider
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {/* El <span> ayuda a posicionar el tooltip correctamente sobre el ícono */}
                              <span className="flex justify-center">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Completamente Recibido</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReceiveStockDialog
        line={selectedLineToReceive}
        isOpen={isReceiveModalOpen}
        onOpenChange={setIsReceiveModalOpen}
        poId={poId}
        onStockReceived={() => {
          setIsReceiveModalOpen(false);
          setSelectedLineToReceive(null);
          toast.info("Refrescando detalles de la Orden de Compra...");
          refetchPO(); // Refrescar los datos de la PO
        }}
      />
    </>
  );
}
