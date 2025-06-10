// app/(dashboard)/inventory/stock-counts/[id]/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { StockCount, StockCountLine } from "@/types/inventory.types"; // Product para line.product
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Loader2,
  // AlertCircle,
  FileX2,
  // Info,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { StockCountStatus as PrismaStockCountStatus } from "@/types/prisma-enums";
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
import { cn } from "@/lib/utils"; // Para clases condicionales
import { getErrorMessage } from "@/lib/utils/get-error-message";

const statusLabels: Record<PrismaStockCountStatus, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En Progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

const formatDateForDisplay = (
  dateInput?: string | Date | null,
  customFormat = "dd/MM/yyyy HH:mm"
) => {
  if (!dateInput) return "-";
  try {
    return format(new Date(dateInput), customFormat, { locale: es });
  } catch (e) {
    console.log(e);
    return String(dateInput);
  }
};

interface EditableStockCountLine extends StockCountLine {
  isDirty?: boolean;
  currentCountedQuantityString: string; // Usar string para el input, permite vacío
}

export default function StockCountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const stockCountId = params.id as string;

  const [editableLines, setEditableLines] = useState<EditableStockCountLine[]>(
    []
  );
  const [isFinalizeConfirmationOpen, setIsFinalizeConfirmationOpen] =
    useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false); // Para el botón "Guardar Todo"

  const {
    data: stockCount,
    isLoading,
    isError,
    error,
    refetch: refetchStockCount,
  } = useQuery<StockCount, Error>({
    queryKey: ["stockCountDetails", stockCountId],
    queryFn: async () => {
      if (!stockCountId) throw new Error("ID de Conteo de Stock no encontrado");
      const response = await apiClient.get(
        `/inventory/stock-counts/${stockCountId}`
      );
      const data = response.data;
      // Si el backend devuelve números como strings para los campos de conteo, parsearlos aquí
      if (data && data.lines) {
        data.lines = data.lines.map((line: StockCountLine) => ({
          ...line,
          systemQuantity: Number(line.systemQuantity),
          countedQuantity:
            line.countedQuantity === null || line.countedQuantity === undefined
              ? null
              : Number(line.countedQuantity),
          discrepancy:
            line.discrepancy === null || line.discrepancy === undefined
              ? null
              : Number(line.discrepancy),
        }));
      }
      return data;
    },
    enabled: !!stockCountId,
  });

  useEffect(() => {
    if (stockCount?.lines) {
      setEditableLines(
        stockCount.lines.map((line) => ({
          ...line,
          // Asegurar que product exista para evitar errores, o manejarlo en el render
          product: line.product || {
            id: "unknown",
            name: "Producto Desconocido",
            sku: "",
          },
          currentCountedQuantityString:
            line.countedQuantity === null || line.countedQuantity === undefined
              ? ""
              : String(line.countedQuantity),
          isDirty: false,
        }))
      );
    } else {
      setEditableLines([]); // Si no hay stockCount o líneas, array vacío
    }
  }, [stockCount]);

  const updateLineMutation = useMutation<
    StockCountLine,
    Error,
    { lineId: string; countedQuantity: number | null }
  >({
    mutationFn: async ({ lineId, countedQuantity }) => {
      const payload = { countedQuantity };
      const response = await apiClient.patch(
        `/inventory/stock-counts/${stockCountId}/lines/${lineId}`,
        payload
      );
      return response.data;
    },
    onSuccess: (updatedLine) => {
      toast.success(
        `Línea para "${updatedLine.product?.name || "producto"}" guardada.`
      );
      setEditableLines((prevLines) =>
        prevLines.map((l) =>
          l.id === updatedLine.id
            ? {
                ...l,
                ...updatedLine,
                currentCountedQuantityString:
                  updatedLine.countedQuantity === null ||
                  updatedLine.countedQuantity === undefined
                    ? ""
                    : String(updatedLine.countedQuantity),
                isDirty: false,
              }
            : l
        )
      );
      // Considerar si refetchStockCount() es necesario o si la actualización local es suficiente
      // queryClient.invalidateQueries({ queryKey: ["stockCountDetails", stockCountId] });
    },
    onError: (error: unknown, variables) => {
      const errorMessage = getErrorMessage(error, "Error al guardar línea");
      toast.error(
        `Error al guardar línea ${variables.lineId}: ${
          errorMessage || "Error desconocido."
        }`
      );
    },
  });

  const finalizeCountMutation = useMutation<
    StockCount,
    Error,
    { notes?: string }
  >({
    mutationFn: (data) =>
      apiClient.post(`/inventory/stock-counts/${stockCountId}/finalize`, data),
    onSuccess: (finalizedStockCount) => {
      toast.success(
        `Conteo #${
          finalizedStockCount.stockCountNumber || stockCountId.slice(-6)
        } finalizado.`
      );
      refetchStockCount(); // Refrescar toda la data del conteo
      setIsFinalizeConfirmationOpen(false);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al finalizar conteo");
      toast.error(errorMessage || "Error al finalizar el conteo.");
      setIsFinalizeConfirmationOpen(false);
    },
  });

  const handleCountedQuantityChange = (lineId: string, value: string) => {
    setEditableLines((prevLines) =>
      prevLines.map((line) =>
        line.id === lineId
          ? { ...line, currentCountedQuantityString: value, isDirty: true }
          : line
      )
    );
  };

  const handleSaveLine = (lineId: string) => {
    const lineToSave = editableLines.find((l) => l.id === lineId);
    if (lineToSave) {
      const newQuantity =
        lineToSave.currentCountedQuantityString === ""
          ? null
          : parseInt(lineToSave.currentCountedQuantityString, 10);
      if (
        lineToSave.currentCountedQuantityString !== "" &&
        (newQuantity === null || isNaN(newQuantity) || newQuantity < 0)
      ) {
        toast.error(
          "Cantidad contada inválida. Debe ser un número positivo o vacío."
        );
        return;
      }
      updateLineMutation.mutate({ lineId, countedQuantity: newQuantity });
    }
  };

  const handleSaveAllDirtyLines = async () => {
    const dirtyLinesToSave = editableLines.filter((line) => line.isDirty);
    if (dirtyLinesToSave.length === 0) {
      toast.info("No hay cambios sin guardar.");
      return;
    }
    setIsSavingAll(true);
    toast.info(`Guardando ${dirtyLinesToSave.length} línea(s)...`);
    try {
      for (const line of dirtyLinesToSave) {
        const newQuantity =
          line.currentCountedQuantityString === ""
            ? null
            : parseInt(line.currentCountedQuantityString, 10);
        if (
          line.currentCountedQuantityString !== "" &&
          (newQuantity === null || isNaN(newQuantity) || newQuantity < 0)
        ) {
          throw new Error(
            `Cantidad inválida para producto ${
              line.product?.name || line.productId
            }.`
          );
        }
        // No esperamos el resultado de la mutación individual aquí, pero la mutación tiene su propio onSuccess
        await updateLineMutation.mutateAsync({
          lineId: line.id,
          countedQuantity: newQuantity,
        });
      }
      toast.success("Todas las líneas modificadas han sido guardadas.");
      // Podríamos hacer un refetchStockCount() general al final si es más simple que manejar el estado local
      // o confiar en que los onSuccess individuales de updateLineMutation actualizaron editableLines
      refetchStockCount(); // Para asegurar consistencia
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "Error al guardar líneas");
      toast.error(errorMessage);
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleFinalizeCount = () => {
    const dirtyLines = editableLines.filter((line) => line.isDirty);
    if (dirtyLines.length > 0) {
      toast.error(
        "Tienes líneas con cambios sin guardar. Por favor, guarda todas las líneas antes de finalizar."
      );
      return;
    }
    setIsFinalizeConfirmationOpen(true);
  };

  // const currentStatus = stockCount?.status as
  //   | PrismaStockCountStatus
  //   | undefined;

  const confirmFinalize = () => {
    // Podrías añadir un input para notas finales en el AlertDialog si el backend lo soporta
    finalizeCountMutation.mutate({});
  };

  // --- LÓGICA DE CARGA Y ERROR (COMO LA TENÍAS) ---
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cargando Detalles del Conteo..."
          actionButton={<Skeleton className="h-9 w-32" />}
        />
        <Skeleton className="h-24 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              {/* Para el skeleton, podemos usar un número fijo de columnas o uno basado en un estado seguro */}
              <TableHeader>
                <TableRow>
                  {[...Array(6)].map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-5 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={`skel-sc-line-${i}`}>
                    {[...Array(6)].map((_, j) => (
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
        Error cargando conteo de stock: {error?.message || "Error desconocido."}
      </div>
    );
  }
  if (!stockCount) {
    return (
      <div className="p-6">Sesión de conteo no encontrada o inválida.</div>
    );
  }
  // --- FIN LÓGICA DE CARGA Y ERROR ---
  const canEditCount =
    stockCount.status === PrismaStockCountStatus.PENDING ||
    stockCount.status === PrismaStockCountStatus.IN_PROGRESS;

  return (
    <>
      <PageHeader
        title={`Conteo de Stock: ${
          stockCount.stockCountNumber || stockCount.id.slice(-6)
        }`}
        description={
          `Iniciado por: ${stockCount.user?.firstName || ""} ${
            stockCount.user?.lastName || ""
          } el ${formatDateForDisplay(stockCount.initiatedAt)}. ` +
          (stockCount.location
            ? `Ubicación: ${stockCount.location.name}. `
            : "Conteo Ad-hoc. ") +
          `Estado: ${
            statusLabels[stockCount.status as PrismaStockCountStatus] ||
            stockCount.status
          }`
        }
        actionButton={
          <div className="flex gap-2">
            {canEditCount && ( // Mostrar "Guardar Cambios" solo si se puede editar
              <Button
                onClick={handleSaveAllDirtyLines}
                disabled={
                  isSavingAll ||
                  updateLineMutation.status === "pending" ||
                  !editableLines.some((l) => l.isDirty)
                }
              >
                {(isSavingAll || updateLineMutation.status === "pending") && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Cambios
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/inventory/stock-counts")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver
            </Button>
          </div>
        }
      />

      {stockCount.notes && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Notas del Conteo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {stockCount.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Líneas del Conteo</CardTitle>
          <CardDescription>
            {canEditCount
              ? "Ingresa la cantidad física contada para cada producto."
              : "Resultados del conteo."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[35%]">Producto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Cant. Sistema</TableHead>
                <TableHead className="text-center w-[150px]">
                  Cant. Contada
                </TableHead>
                <TableHead className="text-center">Discrepancia</TableHead>
                {canEditCount && (
                  <TableHead className="text-right w-[100px]">
                    Guardar
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableLines.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={canEditCount ? 6 : 5}
                    className="text-center py-10 text-muted-foreground"
                  >
                    {stockCount.status === PrismaStockCountStatus.PENDING
                      ? "Esta sesión de conteo aún no tiene líneas generadas o está vacía."
                      : "No hay líneas en este conteo."}
                  </TableCell>
                </TableRow>
              )}
              {editableLines.map((line) => {
                // Añadir index si necesitas una key muy única
                const systemQty = line.systemQuantity;
                // Convertir currentCountedQuantityString a número para el cálculo de discrepancia
                const countedQtyNumOrNull =
                  line.currentCountedQuantityString === "" ||
                  line.currentCountedQuantityString === null ||
                  line.currentCountedQuantityString === undefined
                    ? null
                    : Number(line.currentCountedQuantityString);

                const discrepancy =
                  countedQtyNumOrNull === null || isNaN(countedQtyNumOrNull)
                    ? null
                    : countedQtyNumOrNull - systemQty;

                return (
                  <TableRow
                    key={line.id}
                    className={cn(
                      line.isDirty && "bg-yellow-50 dark:bg-yellow-900/30"
                    )}
                  >
                    <TableCell className="font-medium">
                      {line.product?.name || "Desconocido"}
                    </TableCell>
                    <TableCell>{line.product?.sku || "-"}</TableCell>
                    <TableCell className="text-center">{systemQty}</TableCell>
                    <TableCell className="text-center">
                      {canEditCount ? (
                        <Input
                          type="number"
                          min={0} // Permitir 0 si se contó cero
                          value={line.currentCountedQuantityString} // Directamente el string del estado
                          onChange={(e) =>
                            handleCountedQuantityChange(line.id, e.target.value)
                          }
                          className="h-9 text-center w-24 mx-auto" // Ajustar ancho
                          disabled={
                            updateLineMutation.status === "pending" &&
                            updateLineMutation.variables?.lineId === line.id
                          }
                        />
                      ) : (
                        line.countedQuantity ?? "-" // Mostrar lo guardado si no es editable
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center font-semibold",
                        discrepancy === null
                          ? "text-muted-foreground"
                          : discrepancy === 0
                          ? "text-green-600"
                          : discrepancy > 0
                          ? "text-blue-600"
                          : "text-red-600"
                      )}
                    >
                      {discrepancy === null
                        ? "-"
                        : discrepancy > 0
                        ? `+${discrepancy}`
                        : discrepancy}
                    </TableCell>
                    {canEditCount && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm" // Cambiado a sm para consistencia
                          onClick={() => handleSaveLine(line.id)}
                          disabled={
                            !line.isDirty ||
                            (updateLineMutation.status === "pending" &&
                              updateLineMutation.variables?.lineId === line.id)
                          }
                          title="Guardar línea"
                          className="h-9 px-3" // Ajustar padding
                        >
                          {updateLineMutation.status === "pending" &&
                          updateLineMutation.variables?.lineId === line.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 text-blue-600 hover:text-blue-700" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {canEditCount && (
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
          {/* Botón "Añadir Producto al Conteo" - Funcionalidad Futura */}
          {/* <Button variant="outline" disabled={finalizeCountMutation.isLoading || isSavingAll}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Producto al Conteo
          </Button> */}
          <Button
            onClick={handleFinalizeCount}
            disabled={
              finalizeCountMutation.status === "pending" ||
              editableLines.some((l) => l.isDirty) ||
              isSavingAll ||
              updateLineMutation.status === "pending"
            }
          >
            {finalizeCountMutation.status === "pending" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Finalizar Conteo
          </Button>
        </div>
      )}

      {/* Mensajes de estado completado/cancelado (como los tenías) */}
      {stockCount.status === PrismaStockCountStatus.COMPLETED && (
        <Card className="mt-6 border-green-500">
          <CardHeader>
            <CardTitle className="text-green-700">Conteo Completado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" /> Este conteo fue
              completado el {formatDateForDisplay(stockCount.completedAt)}.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Los ajustes de stock para productos no serializados (si hubo
              discrepancias) deberían haberse aplicado.
            </p>
          </CardContent>
        </Card>
      )}
      {stockCount.status === PrismaStockCountStatus.CANCELLED && (
        <Card className="mt-6 bg-red-50 border border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Conteo Cancelado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 flex items-center">
              <FileX2 className="mr-2 h-5 w-5" /> Este conteo fue cancelado.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              No se realizaron ajustes de stock.
            </p>
          </CardContent>
        </Card>
      )}

      {/* AlertDialog para Finalizar (como lo tenías) */}
      <AlertDialog
        open={isFinalizeConfirmationOpen}
        onOpenChange={setIsFinalizeConfirmationOpen}
      >
        <AlertDialogContent>
          {" "}
          {/* <--- El contenido empieza aquí */}
          <AlertDialogHeader>
            {" "}
            {/* <--- El Header SÍ está */}
            <AlertDialogTitle>
              ¿Estás seguro de finalizar este conteo?
            </AlertDialogTitle>{" "}
            {/* <--- Title SÍ está */}
            <AlertDialogDescription>
              {" "}
              {/* <--- Description SÍ está */}
              Asegúrate de que todas las cantidades contadas sean correctas y se
              hayan guardado. Una vez finalizado, se aplicarán los ajustes de
              stock.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver al Conteo</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmFinalize}
              disabled={finalizeCountMutation.isPending}
            >
              {finalizeCountMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sí, Finalizar Conteo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
