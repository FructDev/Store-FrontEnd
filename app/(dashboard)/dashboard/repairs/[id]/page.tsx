// app/(dashboard)/repairs/[id]/page.tsx
"use client";

import React, { useState, useMemo } from "react"; // useEffect no es necesario por ahora
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  RepairOrder,
  RepairLineItem, // Para el tipo de repairOrder.lines
} from "@/types/repairs.types";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Edit,
  UserCheck,
  MessageSquare,
  PenTool,
  CheckCircle,
  XCircle,
  DollarSign,
  PlusCircle,
  Trash2,
  ClipboardList,
  PackageSearch,
  FileTextIcon,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
// No importamos Zod ni useForm aquí todavía, irán en los diálogos
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { RepairStatus as PrismaRepairStatus } from "@/types/prisma-enums";
import { DiagnosticNotesDialog } from "@/components/repairs/diagnostic-notes-dialog";
import { AssignTechnicianDialog } from "@/components/repairs/assign-technician-dialog";
import { UpdateStatusDialog } from "@/components/repairs/update-status-dialog";
import { AddEditRepairLineDialog } from "@/components/repairs/add-edit-repair-line-dialog";
import { UpdateQuoteStatusDialog } from "@/components/repairs/update-quote-status-dialog";
import { ProductType as PrismaProductType } from "@/types/prisma-enums";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConsumeRepairPartDialog } from "@/components/repairs/consume-repair-part-dialog";
import {
  CompletionDetailsDialog,
  postRepairChecklistItems,
} from "@/components/repairs/completion-details-dialog";
import { FactureRepairDialog } from "@/components/repairs/facture-repair-dialog";
// No importamos los diálogos aún, solo sus placeholders de acción

// Mapeo para estados de Reparación
export const repairStatusLabels: Record<PrismaRepairStatus, string> = {
  RECEIVED: "Recibido",
  DIAGNOSING: "Diagnosticando",
  QUOTE_PENDING: "Pend. Cotización",
  AWAITING_QUOTE_APPROVAL: "Esperando Aprob. Cotización",
  QUOTE_APPROVED: "Cotización Aprobada",
  QUOTE_REJECTED: "Cotización Rechazada",
  AWAITING_PARTS: "Esperando Repuestos",
  IN_REPAIR: "En Reparación",
  ASSEMBLING: "Ensamblando",
  TESTING_QC: "Pruebas C. Calidad",
  REPAIR_COMPLETED: "Reparación Interna OK",
  PENDING_PICKUP: "Listo para Entrega",
  COMPLETED_PICKED_UP: "Entregado",
  CANCELLED: "Cancelado",
  UNREPAIRABLE: "No Reparable",
};

const intakeChecklistDisplayConfig: Array<{ id: string; label: string }> = [
  { id: "screen_condition", label: "Pantalla (Rayones, Rotura)" },
  { id: "body_condition", label: "Carcasa (Golpes, Marcas)" },
  { id: "buttons_functional", label: "Botones Funcionales" },
  { id: "ports_clear", label: "Puertos Limpios" },
  { id: "has_sim", label: "Incluye Tarjeta SIM" },
  { id: "has_sd", label: "Incluye Tarjeta SD" },
  // ...Añade todos los ítems de tu checklist original aquí con sus labels correctos
];

export default function RepairOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const repairId = params.id as string;
  // const queryClient = useQueryClient();

  // --- Estados para controlar la APERTURA de futuros diálogos ---
  // (Se usarán cuando integremos los componentes de diálogo)
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] =
    useState(false);
  const [isAssignTechnicianDialogOpen, setIsAssignTechnicianDialogOpen] =
    useState(false);
  const [isDiagnosticNotesDialogOpen, setIsDiagnosticNotesDialogOpen] =
    useState(false);
  const [isAddLineEditDialogOpen, setIsAddLineEditDialogOpen] = useState(false);
  const [editingRepairLine, setEditingRepairLine] =
    useState<RepairLineItem | null>(null);
  const [isUpdateQuoteStatusDialogOpen, setIsUpdateQuoteStatusDialogOpen] =
    useState(false);
  const [quoteDecision, setQuoteDecision] = useState<boolean | null>(null);
  const [isDeleteLineDialogOpen, setIsDeleteLineDialogOpen] = useState(false);
  const [lineToDelete, setLineToDelete] = useState<RepairLineItem | null>(null);
  const [isConsumePartDialogOpen, setIsConsumePartDialogOpen] = useState(false);
  const [lineToConsumePart, setLineToConsumePart] =
    useState<RepairLineItem | null>(null);
  const [isCompletionDetailsDialogOpen, setIsCompletionDetailsDialogOpen] =
    useState(false);
  const [isFactureRepairDialogOpen, setIsFactureRepairDialogOpen] =
    useState(false);
  // const [isFactureRepairDialogOpen, setIsFactureRepairDialogOpen] = useState(false);

  const {
    data: repairOrder,
    isLoading,
    isError,
    error,
    refetch: refetchRepairOrder,
  } = useQuery<RepairOrder, Error>({
    // Usar RepairOrder, el tipo que definimos para la respuesta de la API
    queryKey: ["repairOrderDetails", repairId],
    queryFn: async () => {
      if (!repairId) throw new Error("ID de Orden de Reparación no encontrado");
      const response = await apiClient.get(`/repairs/${repairId}`);
      const data = response.data;

      // Parsear montos que vienen como string del backend (si es el caso)
      const safeParse = (val: any, def: number | null = null): number | null =>
        val !== null && val !== undefined ? parseFloat(String(val)) : def;

      data.quotedAmount = safeParse(data.quotedAmount);
      data.totalServiceAmount = safeParse(data.totalServiceAmount);
      data.totalPartsAmount = safeParse(data.totalPartsAmount);
      data.totalRepairAmount = safeParse(data.totalRepairAmount);

      if (data.lines) {
        data.lines = data.lines.map((line: RepairLineItem) => ({
          ...line,
          unitPrice: safeParse(line.unitPrice, 0)!, // Asumir que unitPrice no será null
          unitCost: safeParse(line.unitCost),
          lineTotal: safeParse(line.lineTotal, 0)!, // Asumir que lineTotal no será null
        }));
      }
      return data;
    },
    enabled: !!repairId,
  });

  const repairLinesSubtotal = useMemo(() => {
    return (
      repairOrder?.lines?.reduce(
        (acc, line) => acc + (Number(line.lineTotal) || 0),
        0
      ) || 0
    );
  }, [repairOrder?.lines]);

  const deleteRepairLineMutation = useMutation<void, Error, string>({
    mutationFn: (lineId) =>
      apiClient.delete(`/repairs/${repairId}/lines/${lineId}`),
    onSuccess: () => {
      toast.success("Línea de reparación eliminada.");
      refetchRepairOrder(); // Refrescar para actualizar la lista de líneas
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Error al eliminar línea."),
  });

  // --- Handlers para Abrir Diálogos ---
  const handleOpenAddLineDialog = () => {
    setEditingRepairLine(null); // Asegurar que no haya datos de edición
    setIsAddLineEditDialogOpen(true);
  };

  const handleOpenEditLineDialog = (line: RepairLineItem) => {
    setEditingRepairLine(line); // Pasar los datos de la línea a editar
    setIsAddLineEditDialogOpen(true);
  };

  // const handleOpenUpdateQuoteDialog = (approved: boolean) => {
  //   setQuoteDecision(approved);
  //   setIsUpdateQuoteStatusDialogOpen(true);
  // };

  const handleOpenDeleteLineDialog = (line: RepairLineItem) => {
    setLineToDelete(line);
    setIsDeleteLineDialogOpen(true);
  };

  const confirmDeleteLine = () => {
    if (lineToDelete) {
      deleteRepairLineMutation.mutate(lineToDelete.id); // Asumiendo que deleteRepairLineMutation ya existe
    }
    // El onSuccess de deleteRepairLineMutation ya debería cerrar el diálogo y refrescar
  };

  const handleOpenConsumePartDialog = (line: RepairLineItem) => {
    if (
      !line.productId ||
      line.product?.productType === PrismaProductType.SERVICE
    ) {
      toast.info(
        "Esta línea es un servicio o descripción manual, no se consume stock del inventario."
      );
      return;
    }
    // TODO: Verificar si la línea ya tiene un inventoryItemId consumido
    // if (line.inventoryItemIdConsumed) {
    //    toast.info("El repuesto para esta línea ya fue consumido.");
    //    return;
    // }
    setLineToConsumePart(line);
    setIsConsumePartDialogOpen(true);
  };

  // --- Skeleton UI ---
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <PageHeader
          title="Cargando Detalles de Reparación..."
          description="Por favor espere..."
          actionButton={<Skeleton className="h-9 w-24" />}
        />
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(5)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-5 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  {[...Array(5)].map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error cargando detalles de la reparación:{" "}
        {error?.message || "Error desconocido."}
      </div>
    );
  }
  if (!repairOrder) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Orden de reparación no encontrada.
      </div>
    );
  }

  // Estados finales donde la mayoría de las acciones están bloqueadas
  const isClosedOrCancelledOrUnrepairable =
    repairOrder.status === PrismaRepairStatus.COMPLETED_PICKED_UP ||
    repairOrder.status === PrismaRepairStatus.CANCELLED ||
    repairOrder.status === PrismaRepairStatus.UNREPAIRABLE;

  // 1. ¿Se puede actualizar el estado general?
  // Generalmente sí, a menos que esté en un estado final.
  // El diálogo de cambio de estado podría tener su propia lógica para restringir transiciones inválidas.
  const canUpdateStatus = !isClosedOrCancelledOrUnrepairable;

  // 2. ¿Se puede asignar o cambiar un técnico?
  // Sí, a menos que esté en un estado final. El flujo sugerido es hacerlo temprano.
  const canAssignTechnician = !isClosedOrCancelledOrUnrepairable;

  // 3. ¿Se puede editar el diagnóstico Y añadir/editar líneas?
  // Condición: Debe haber un técnico asignado Y el estado debe ser DIAGNOSING.
  const canEditDiagnosticAndLines =
    !!repairOrder.technicianId && // Debe tener técnico
    !!PrismaRepairStatus.QUOTE_PENDING &&
    repairOrder.status === PrismaRepairStatus.DIAGNOSING &&
    !isClosedOrCancelledOrUnrepairable;

  // 4. ¿Se puede gestionar la cotización (aprobar/rechazar)?
  // Condición: El estado debe ser QUOTE_PENDING o AWAITING_QUOTE_APPROVAL.
  // Implica que el diagnóstico y las líneas ya se ingresaron y se marcó como listo para cotizar.
  const canManageQuote =
    [
      PrismaRepairStatus.QUOTE_PENDING,
      PrismaRepairStatus.AWAITING_QUOTE_APPROVAL,
    ].includes(repairOrder.status) && !isClosedOrCancelledOrUnrepairable;

  // 5. ¿Se pueden realizar acciones de reparación (ej. consumir repuestos)?
  // Renombrada de 'canStartRepairActions' para mayor claridad.
  // Condición: Cotización aprobada, o esperando partes, o ya en reparación/ensamblaje/QC.
  const canPerformRepairActions = // Usarías esta para el botón "Consumir Repuesto" por línea, por ejemplo
    [
      PrismaRepairStatus.QUOTE_APPROVED,
      PrismaRepairStatus.AWAITING_PARTS,
      PrismaRepairStatus.IN_REPAIR,
      PrismaRepairStatus.ASSEMBLING,
      PrismaRepairStatus.TESTING_QC, // Aún se podrían consumir partes si algo falló y se re-repara
    ].includes(repairOrder.status) && !isClosedOrCancelledOrUnrepairable;

  // 6. ¿Se pueden registrar detalles de finalización (notas, garantía, checklist post-reparación)?
  // Condición: Desde que está en reparación hasta que se completa internamente.
  const canRegisterCompletionDetails =
    [
      PrismaRepairStatus.IN_REPAIR,
      PrismaRepairStatus.ASSEMBLING,
      PrismaRepairStatus.TESTING_QC,
      PrismaRepairStatus.REPAIR_COMPLETED,
    ].includes(repairOrder.status) && !isClosedOrCancelledOrUnrepairable;

  // 7. ¿Se puede marcar como "Listo para Entrega" (cambiar estado a PENDING_PICKUP)?
  // Esto usualmente lo hace el botón "Actualizar Estado" abriendo el diálogo.
  // La lógica de qué estados pueden transicionar a PENDING_PICKUP estaría en el diálogo o backend.
  // Pero si tienes un botón específico "Marcar como Listo para Retiro":
  const canMarkReadyForPickup = // Esta variable controla la visibilidad de ESE botón específico
    repairOrder.status === PrismaRepairStatus.REPAIR_COMPLETED && // Solo si la reparación está internamente completa
    !isClosedOrCancelledOrUnrepairable;

  // 8. ¿Se puede facturar y entregar al cliente?
  // Condición: Estado es PENDING_PICKUP y aún no se ha facturado (no hay saleId).
  const canFactureAndDeliver =
    repairOrder.status === PrismaRepairStatus.PENDING_PICKUP &&
    !repairOrder.saleId &&
    !isClosedOrCancelledOrUnrepairable;

  return (
    <>
      <PageHeader
        title={`Reparación: #${repairOrder.repairNumber}`}
        description={`Dispositivo: ${repairOrder.deviceBrand} ${
          repairOrder.deviceModel
        } (IMEI/SN: ${repairOrder.deviceImei || "N/A"})`}
        actionButton={
          <div className="flex flex-wrap gap-2">
            {canUpdateStatus && ( // 'canUpdateStatus' es tu booleano condicional
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsUpdateStatusDialogOpen(true)}
                // disabled={/* alguna mutación general de la página si aplica */}
              >
                <Edit className="mr-2 h-4 w-4" />
                Estado:{" "}
                {repairStatusLabels[repairOrder.status] || repairOrder.status}
              </Button>
            )}
            {canAssignTechnician && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAssignTechnicianDialogOpen(true)} // <-- ABRE EL DIÁLOGO
                // disabled={assignTechnicianMutationEnPagina?.isPending} // Si la mutación estuviera en esta página
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Técnico:{" "}
                {repairOrder.technician
                  ? `${repairOrder.technician.firstName || ""} ${
                      repairOrder.technician.lastName || ""
                    }`.trim()
                  : "Asignar"}
              </Button>
            )}
            {canFactureAndDeliver && ( // 'canFactureAndDeliver' ya debe estar definido y ser correcto
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white" // Añadido text-white para contraste
                onClick={() => setIsFactureRepairDialogOpen(true)} // <-- ABRE EL DIÁLOGO
                // disabled={factureRepairMutation?.isPending} // Deshabilitar si la mutación (definida en el diálogo) está activa
                // O si tienes una mutación global para la página
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Facturar y Entregar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/repairs")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Lista
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Columna Izquierda: Info Cliente, Dispositivo, Problema */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>
                <strong>Nombre:</strong>{" "}
                {repairOrder.customer
                  ? `${repairOrder.customer.firstName || ""} ${
                      repairOrder.customer.lastName || ""
                    }`.trim()
                  : "N/A"}
              </p>
              <p>
                <strong>Teléfono:</strong>{" "}
                {repairOrder.customer?.phone || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {repairOrder.customer?.email || "N/A"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Detalles del Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>
                <strong>Marca:</strong> {repairOrder.deviceBrand}
              </p>
              <p>
                <strong>Modelo:</strong> {repairOrder.deviceModel}
              </p>
              <p>
                <strong>Color:</strong> {repairOrder.deviceColor || "-"}
              </p>
              <p>
                <strong>IMEI/Serial:</strong> {repairOrder.deviceImei || "-"}
              </p>
              <p>
                <strong>Contraseña/Patrón:</strong>{" "}
                {repairOrder.devicePassword ? "Proporcionada" : "-"}
              </p>
              <p>
                <strong>Accesorios Recibidos:</strong>{" "}
                {repairOrder.accessoriesReceived || "-"}
              </p>
            </CardContent>
          </Card>
          <Card>
            {" "}
            {/* Esta es tu Card existente para "Recepción" */}
            <CardHeader>
              <CardTitle className="text-base">
                Recepción del Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              {" "}
              {/* Aumentar space-y si es necesario */}
              <div>
                <strong className="block mb-1">
                  Problema Reportado por Cliente:
                </strong>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {repairOrder.reportedIssue}
                </p>
              </div>
              {repairOrder.intakeNotes && (
                <div>
                  <strong className="block mb-1">
                    Notas de Ingreso (Técnico):
                  </strong>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {repairOrder.intakeNotes}
                  </p>
                </div>
              )}
              {/* --- MOSTRAR INTAKE CHECKLIST FORMATEADO AQUÍ DENTRO --- V V V */}
              {repairOrder.intakeChecklist &&
                typeof repairOrder.intakeChecklist === "object" &&
                Object.keys(repairOrder.intakeChecklist).length > 0 && (
                  <div className="pt-2">
                    {" "}
                    {/* Separador visual o padding */}
                    <strong className="block mb-1.5 text-sm font-medium">
                      Checklist de Ingreso:
                    </strong>
                    <ul className="space-y-1 text-xs list-disc list-inside pl-1">
                      {intakeChecklistDisplayConfig.map((configItem) => {
                        const isChecked = (
                          repairOrder.intakeChecklist as unknown as Record<
                            string,
                            boolean
                          >
                        )[configItem.id];
                        if (isChecked !== undefined) {
                          return (
                            <li
                              key={configItem.id}
                              className="flex items-center"
                            >
                              {isChecked ? (
                                <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-500 mr-2 shrink-0" />
                              )}
                              <span
                                className={cn(
                                  isChecked
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {configItem.label}:{" "}
                                <span className="font-semibold">
                                  {isChecked ? "Sí" : "No"}
                                </span>
                              </span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      {/* Opcional: Mostrar claves del JSON que no estén en intakeChecklistDisplayConfig */}
                      {Object.entries(
                        repairOrder.intakeChecklist as unknown as Record<
                          string,
                          boolean
                        >
                      )
                        .filter(
                          ([key]) =>
                            !intakeChecklistDisplayConfig.find(
                              (item) => item.id === key
                            )
                        )
                        .map(([key, value]) => (
                          <li key={key} className="flex items-center">
                            {value ? (
                              <CheckCircle className="h-3.5 w-3.5 text-green-600 mr-2 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500 mr-2 shrink-0" />
                            )}
                            <span
                              className={cn(
                                value
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {key.replace(/_/g, " ")}:{" "}
                              <span className="font-semibold">
                                {value ? "Sí" : "No"}
                              </span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              {/* --- FIN MOSTRAR INTAKE CHECKLIST --- */}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Diagnóstico, Líneas, Cotización, Progreso */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                Diagnóstico Técnico
              </CardTitle>
              {/* Mostrar botón solo si se puede editar el diagnóstico */}
              {canEditDiagnosticAndLines &&
                !isClosedOrCancelledOrUnrepairable && ( // 'canEditDiagnostic' y 'isClosedOrCancelled' ya los definimos
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setIsDiagnosticNotesDialogOpen(true)} // Abre el diálogo
                    title="Editar Diagnóstico"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
            </CardHeader>
            <CardContent className="text-sm min-h-[60px]">
              {" "}
              {/* min-h para que no colapse si está vacío */}
              {repairOrder.diagnosticNotes ? (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {repairOrder.diagnosticNotes}
                </p>
              ) : (
                <p className="text-muted-foreground italic">
                  Aún no hay diagnóstico registrado.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <PenTool className="mr-2 h-5 w-5 text-orange-600" />
                Líneas de Servicio / Repuestos
              </CardTitle>
              {canEditDiagnosticAndLines &&
                !isClosedOrCancelledOrUnrepairable && ( // canAddEditLines debe estar definido
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOpenAddLineDialog}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Línea
                  </Button>
                )}
            </CardHeader>
            <CardContent className="p-0">
              {repairOrder.lines && repairOrder.lines.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Descripción</TableHead>
                      <TableHead className="text-center">Cant.</TableHead>
                      <TableHead className="text-right">P.Unit</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      {canEditDiagnosticAndLines &&
                        !isClosedOrCancelledOrUnrepairable && (
                          <TableHead className="w-[80px] text-right">
                            Acciones
                          </TableHead>
                        )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repairOrder.lines.map((line) => {
                      const isInventoryPart =
                        !!line.productId &&
                        line.product?.productType !==
                          PrismaProductType.SERVICE &&
                        !line.miscDescription;

                      // Condición para mostrar el botón "Consumir"
                      // (es un repuesto, la orden está en un estado que permite consumir, y ESTA LÍNEA AÚN NO TIENE UN ITEM CONSUMIDO)
                      const showConsumeButton =
                        isInventoryPart &&
                        !isClosedOrCancelledOrUnrepairable &&
                        [
                          PrismaRepairStatus.QUOTE_APPROVED,
                          PrismaRepairStatus.AWAITING_PARTS,
                          PrismaRepairStatus.IN_REPAIR,
                          PrismaRepairStatus.ASSEMBLING,
                        ].includes(repairOrder.status) &&
                        !line.inventoryItemId; // Si 'inventoryItemId' en la línea significa "consumido"

                      return (
                        <TableRow key={line.id}>
                          <TableCell>
                            {line.product?.name || line.miscDescription}
                            {/* Mostrar si ya fue consumido y qué IMEI/Lote */}
                            {isInventoryPart &&
                              line.inventoryItemId && ( // Si line.inventoryItemId tiene valor, se consumió/asignó
                                <Badge
                                  variant="default"
                                  className="ml-2 text-xs mt-1 block w-fit"
                                >
                                  {" "}
                                  {/* success no existe, usa default o custom */}
                                  <PackageCheck className="h-3 w-3 mr-1" />{" "}
                                  Consumido
                                  {/* Si quieres mostrar el IMEI del item consumido, necesitarías que `line.inventoryItem.imei` venga del backend */}
                                  {line.inventoryItem?.imei && (
                                    <span className="ml-1 text-gray-600">
                                      (S/N: {line.inventoryItem.imei})
                                    </span>
                                  )}
                                </Badge>
                              )}
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
                          <TableCell className="p-1">
                            {" "}
                            {/* Quitar text-right, ajustar padding si es necesario */}
                            <div className="flex items-center justify-end space-x-0.5">
                              {" "}
                              {/* Contenedor Flex, alinear a la derecha, espacio pequeño */}
                              {/* Botón Editar Línea */}
                              {canEditDiagnosticAndLines &&
                                !isClosedOrCancelledOrUnrepairable && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-muted" // Clase para hover
                                    onClick={() =>
                                      handleOpenEditLineDialog(line)
                                    }
                                    title="Editar Línea"
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                              {/* Botón Consumir Repuesto */}
                              {showConsumeButton && (
                                <Button
                                  variant="ghost" // Cambiar a ghost para consistencia o mantener outline
                                  size="icon"
                                  className="h-7 w-7 hover:bg-muted"
                                  onClick={() =>
                                    handleOpenConsumePartDialog(line)
                                  }
                                  title="Consumir Repuesto"
                                >
                                  <PackageSearch className="h-4 w-4 text-green-600" />
                                </Button>
                              )}
                              {/* Botón Eliminar Línea */}
                              {canEditDiagnosticAndLines &&
                                !isClosedOrCancelledOrUnrepairable && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10" // Hover para el destructivo
                                    onClick={() =>
                                      handleOpenDeleteLineDialog(line)
                                    } // Asume que este handler abre el AlertDialog
                                    disabled={
                                      deleteRepairLineMutation.status ===
                                        "pending" &&
                                      deleteRepairLineMutation.variables ===
                                        line.id
                                    }
                                    title="Eliminar Línea"
                                  >
                                    {deleteRepairLineMutation.status ===
                                      "pending" &&
                                    deleteRepairLineMutation.variables ===
                                      line.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No hay líneas de servicio o repuestos añadidas.
                </p>
              )}
            </CardContent>
            {repairOrder.lines && repairOrder.lines.length > 0 && (
              <CardFooter className="text-right font-semibold pt-2 pr-4 pb-3 border-t mt-2">
                Subtotal Servicios/Repuestos:{" "}
                {formatCurrency(repairLinesSubtotal)}
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <FileTextIcon className="mr-2 h-5 w-5 text-purple-600" />
                Cotización al Cliente
              </CardTitle>
              {/* Botón para enviar cotización podría ir aquí */}
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>
                <strong>Monto Cotizado:</strong>{" "}
                {formatCurrency(
                  repairOrder.quotedAmount ?? repairLinesSubtotal
                )}
              </p>
              <p>
                <strong>Estado Cotización:</strong>{" "}
                {repairOrder.quoteApproved === null ? (
                  <Badge variant="outline">Pendiente Decisión</Badge>
                ) : repairOrder.quoteApproved ? (
                  <Badge className="bg-green-100 text-green-700">
                    Aprobada
                  </Badge>
                ) : (
                  <Badge variant="destructive">Rechazada</Badge>
                )}
              </p>
              {repairOrder.quoteStatusDate && (
                <p>
                  <strong>Fecha Decisión:</strong>{" "}
                  {formatDate(repairOrder.quoteStatusDate)}
                </p>
              )}
              {canManageQuote && !isClosedOrCancelledOrUnrepairable && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setQuoteDecision(true); // Indicar que se está APROBANDO
                      setIsUpdateQuoteStatusDialogOpen(true);
                    }}
                    // disabled={genericUpdateMutation?.isPending} // O la mutación específica
                  >
                    Aprobar Cotización
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setQuoteDecision(false); // Indicar que se está RECHAZANDO
                      setIsUpdateQuoteStatusDialogOpen(true);
                    }}
                    // disabled={genericUpdateMutation?.isPending}
                  >
                    Rechazar Cotización
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sección Placeholder para Notas de Finalización y Checklist Post-Reparación */}
          {canRegisterCompletionDetails &&
            !isClosedOrCancelledOrUnrepairable && ( // 'canRegisterCompletionDetails' ya definido
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5 text-cyan-600" />
                    Finalización y Checklist Post-Reparación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Notas de Finalización:
                    </h4>
                    {repairOrder.completionNotes ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {repairOrder.completionNotes}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Pendiente.
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Garantía Otorgada:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {repairOrder.warrantyPeriodDays !== null
                        ? `${repairOrder.warrantyPeriodDays} días`
                        : "No especificada"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">
                      Checklist Post-Reparación:
                    </h4>
                    {repairOrder.postRepairChecklist &&
                    typeof repairOrder.postRepairChecklist === "object" &&
                    Object.keys(repairOrder.postRepairChecklist).length > 0 ? (
                      <ul className="list-disc list-inside pl-1 text-xs space-y-1">
                        {postRepairChecklistItems.map((item) => {
                          const isChecked = (
                            repairOrder.postRepairChecklist as Record<
                              string,
                              boolean
                            >
                          )[item.id];
                          if (isChecked !== undefined) {
                            // Solo mostrar si la clave existe
                            return (
                              <li
                                key={item.id}
                                className={cn(
                                  isChecked ? "text-green-600" : "text-red-500"
                                )}
                              >
                                {item.label}: {isChecked ? "OK" : "No OK"}
                              </li>
                            );
                          }
                          return null;
                        })}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Pendiente.
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3"
                    onClick={() => setIsCompletionDetailsDialogOpen(true)}
                  >
                    Registrar/Editar Detalles de Finalización
                  </Button>
                </CardContent>
              </Card>
            )}
          {repairOrder.saleId && (
            <Card className="mt-6 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700">
              <CardHeader>
                <CardTitle className="text-md text-green-700">
                  Reparación Facturada
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  Esta reparación fue facturada. Venta #:
                  <Button
                    variant="link"
                    className="p-0 h-auto ml-1 text-green-700 dark:text-green-400"
                    onClick={() =>
                      router.push(`/dashboard/sales/${repairOrder.saleId}`)
                    }
                  >
                    {repairOrder.sale?.saleNumber ||
                      repairOrder.saleId.slice(-6)}
                  </Button>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- DIÁLOGOS MODALES (Placeholders o llamados a componentes que crearemos después) --- */}
      {repairOrder && (
        <>
          {isUpdateStatusDialogOpen && (
            <UpdateStatusDialog
              isOpen={isUpdateStatusDialogOpen}
              onOpenChange={setIsUpdateStatusDialogOpen}
              currentStatus={repairOrder.status}
              repairId={repairOrder.id}
              onSuccess={refetchRepairOrder}
            />
          )}
          {isAssignTechnicianDialogOpen && (
            <AssignTechnicianDialog
              isOpen={isAssignTechnicianDialogOpen}
              onOpenChange={setIsAssignTechnicianDialogOpen}
              repairId={repairOrder.id}
              currentTechnicianId={repairOrder.technicianId}
              onSuccess={refetchRepairOrder}
            />
          )}

          {/* Los siguientes diálogos se crearán como componentes separados y se importarán */}
          {/* <DiagnosticNotesDialog isOpen={isDiagnosticNotesDialogOpen} onOpenChange={setIsDiagnosticNotesDialogOpen} repairId={repairOrder.id} currentNotes={repairOrder.diagnosticNotes} onSuccess={refetchRepairOrder}/> */}
          <DiagnosticNotesDialog
            isOpen={isDiagnosticNotesDialogOpen}
            onOpenChange={setIsDiagnosticNotesDialogOpen}
            repairId={repairOrder.id}
            currentNotes={repairOrder.diagnosticNotes}
            onSuccess={refetchRepairOrder} // Para refrescar los datos de la página
          />
          {/* <AddEditRepairLineDialog isOpen={isAddLineEditDialogOpen} onOpenChange={setIsAddLineEditDialogOpen} repairId={repairOrder.id} lineData={editingRepairLine} onSuccess={refetchRepairOrder} /> */}
          <AddEditRepairLineDialog
            isOpen={isAddLineEditDialogOpen}
            onOpenChange={setIsAddLineEditDialogOpen}
            repairId={repairOrder.id}
            lineData={editingRepairLine} // Pasa la línea a editar, o null para crear
            onSuccess={() => {
              refetchRepairOrder(); // Refrescar la lista de líneas en la página de detalle
              setEditingRepairLine(null); // Limpiar la línea en edición
            }}
          />
          {/* <UpdateQuoteStatusDialog isOpen={isUpdateQuoteStatusDialogOpen} onOpenChange={setIsUpdateQuoteStatusDialogOpen} repairId={repairOrder.id} currentQuotedAmount={repairOrder.quotedAmount ?? repairLinesSubtotal} currentApproval={quoteDecision} onSuccess={refetchRepairOrder}/> */}
          <UpdateQuoteStatusDialog
            isOpen={isUpdateQuoteStatusDialogOpen}
            onOpenChange={setIsUpdateQuoteStatusDialogOpen}
            repairId={repairOrder.id}
            currentQuotedAmount={
              repairOrder.quotedAmount ?? repairLinesSubtotal
            }
            initialApprovalStatus={repairOrder.quoteApproved}
            decisionToSet={quoteDecision!} // 'quoteDecision' no será null cuando el diálogo se abra
            onSuccess={refetchRepairOrder}
          />

          {lineToDelete && ( // Solo renderizar si hay una línea para eliminar
            <AlertDialog
              open={isDeleteLineDialogOpen}
              onOpenChange={(open) => {
                setIsDeleteLineDialogOpen(open);
                if (!open) {
                  setLineToDelete(null); // Limpiar al cerrar
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Estás a punto de eliminar la línea: <br />
                    <span className="font-semibold">
                      {lineToDelete.product?.name ||
                        lineToDelete.miscDescription}
                    </span>{" "}
                    (Cantidad: {lineToDelete.quantity}).
                    <br />
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      // onOpenChange ya se encarga de setIsDeleteLineDialogOpen(false)
                      setLineToDelete(null); // Limpiar explícitamente
                    }}
                  >
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDeleteLine}
                    disabled={deleteRepairLineMutation.isPending}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleteRepairLineMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sí, Eliminar Línea
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {repairOrder && lineToConsumePart && (
            <ConsumeRepairPartDialog
              isOpen={isConsumePartDialogOpen}
              onOpenChange={(open) => {
                setIsConsumePartDialogOpen(open);
                if (!open) setLineToConsumePart(null);
              }}
              repairId={repairOrder.id}
              repairLine={lineToConsumePart}
              onSuccess={refetchRepairOrder}
            />
          )}

          {repairOrder && (
            <CompletionDetailsDialog
              isOpen={isCompletionDetailsDialogOpen}
              onOpenChange={setIsCompletionDetailsDialogOpen}
              repairId={repairOrder.id}
              currentData={{
                completionNotes: repairOrder.completionNotes,
                warrantyPeriodDays: repairOrder.warrantyPeriodDays,
                postRepairChecklist: repairOrder.postRepairChecklist,
              }}
              onSuccess={refetchRepairOrder}
            />
          )}
          {/* <FactureRepairDialog isOpen={isFactureRepairDialogOpen} onOpenChange={setIsFactureRepairDialogOpen} repairOrderData={repairOrder} onSuccess={(createdSale) => { refetchRepairOrder(); router.push(`/dashboard/sales/${createdSale.id}`);}} /> */}
          {repairOrder && (
            <FactureRepairDialog
              isOpen={isFactureRepairDialogOpen}
              onOpenChange={setIsFactureRepairDialogOpen}
              repairOrderData={repairOrder}
              onSuccess={(createdSale) => {
                toast.success(
                  `Venta #${createdSale.saleNumber} creada para la reparación.`
                );
                refetchRepairOrder(); // Para actualizar saleId y estado en la reparación
                router.push(`/dashboard/sales/${createdSale.id}`); // Ir al detalle de la nueva venta
              }}
            />
          )}
        </>
      )}
    </>
  );
}
