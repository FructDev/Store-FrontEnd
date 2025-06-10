// app/(dashboard)/inventory/purchase-orders/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Para navegar al detalle
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  PaginatedPurchaseOrdersResponse,
  PurchaseOrder,
  SupplierBasic,
} from "@/types/inventory.types";
import { PurchaseOrderStatus as PrismaPurchaseOrderStatus } from "@/types/prisma-enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker"; // Asumiendo que tienes este componente
import { DateRange } from "react-day-picker";
import {
  MoreHorizontal,
  PlusCircle,
  Eye,
  Search,
  Edit3,
  XCircle,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
import { EditPODialog } from "@/components/inventory/purchase-orders/edit-po-dialog";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Mapeo para estados de PO
const poStatusLabels: Record<PrismaPurchaseOrderStatus, string> = {
  // PrismaPurchaseOrderStatus es tu enum local
  DRAFT: "Borrador",
  ORDERED: "Ordenada",
  PARTIALLY_RECEIVED: "Recibida Parcialmente",
  RECEIVED: "Recibida Totalmente", // O solo "Recibida"
  CANCELLED: "Cancelada",
  CLOSED: "Cerrada",
};
const ALL_PO_STATUSES = Object.values(PrismaPurchaseOrderStatus);

const formatDisplayDate = (dateString?: string | Date | null) => {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  } catch (e) {
    console.log(e);
    return String(dateString);
  }
};
const formatCurrency = (
  amount: string | number | null | undefined,
  currencySymbol = "RD$"
) => {
  if (amount === null || amount === undefined) return "-";
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "-";
  return `${currencySymbol} ${numericAmount.toFixed(2)}`;
};

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSupplierId, setFilterSupplierId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [isEditPODialogOpen, setIsEditPODialogOpen] = useState(false);
  const [selectedPOForEdit, setSelectedPOForEdit] =
    useState<PurchaseOrder | null>(null);

  const [isCancelPODialogOpen, setIsCancelPODialogOpen] = useState(false);
  const [poToCancel, setPoToCancel] = useState<PurchaseOrder | null>(null);

  // Fetch de POs paginado y filtrado
  const {
    data: paginatedPOs,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedPurchaseOrdersResponse, Error>({
    queryKey: [
      "purchaseOrders",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
      filterStatus,
      filterSupplierId,
      dateRange?.from,
      dateRange?.to,
    ],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: currentPage,
        limit: limitPerPage,
        sortBy: "createdAt", // O por orderDate
        sortOrder: "desc",
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterSupplierId !== "all") params.supplierId = filterSupplierId;
      if (dateRange?.from)
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
      if (dateRange?.to) params.endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await apiClient.get("/inventory/purchase-orders", {
        params,
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData,
  });

  // Fetch para proveedores (para el filtro)
  const { data: suppliers, isLoading: isLoadingSuppliers } = useQuery<
    SupplierBasic[]
  >({
    queryKey: ["allSuppliersForPOFilter"],
    queryFn: async () =>
      apiClient
        .get("/inventory/suppliers?limit=100&isActive=true")
        .then((res) => res.data.data || (res.data as SupplierBasic[])),
  });

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedPOs && currentPage < paginatedPOs.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const cancelPOMutation = useMutation<
    PurchaseOrder, // Asume que el backend devuelve la PO actualizada
    Error,
    string // poId
  >({
    mutationFn: (poIdToCancel) =>
      apiClient.patch(`/inventory/purchase-orders/${poIdToCancel}/cancel`, {}),
    onSuccess: (cancelledPO) => {
      toast.success(`Orden de Compra #${cancelledPO.poNumber} cancelada.`);
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchaseOrderDetails", cancelledPO.id],
      });
      setIsCancelPODialogOpen(false);
      setPoToCancel(null);
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(
        error,
        "Error al actualizar el estado del cliente."
      );
      toast.error(errorMessage);
      setIsCancelPODialogOpen(false);
      setPoToCancel(null);
    },
  });

  const confirmCancelPO = () => {
    if (poToCancel) {
      cancelPOMutation.mutate(poToCancel.id);
    }
  };

  const handleOpenEditPODialog = (po: PurchaseOrder) => {
    setSelectedPOForEdit(po);
    setIsEditPODialogOpen(true);
  };

  const handleOpenCancelPODialog = (po: PurchaseOrder) => {
    console.log("Abriendo AlertDialog para cancelar PO:", po.poNumber);
    setPoToCancel(po);
    setIsCancelPODialogOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterSupplierId, dateRange]);

  const navigateToDetail = (poId: string) => {
    router.push(`/dashboard/inventory/purchase-orders/${poId}`);
  };
  console.log(
    "Estado de isCancelPODialogOpen:",
    isCancelPODialogOpen,
    "PO a cancelar:",
    poToCancel?.poNumber
  );
  return (
    <>
      <PageHeader
        title="Órdenes de Compra (PO)"
        description="Gestiona tus órdenes de compra a proveedores y registra la recepción de productos."
        actionButton={
          <Button asChild>
            <Link href="/dashboard/inventory/purchase-orders/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Nueva PO
            </Link>
          </Button>
        }
      />

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por Nº PO, Proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {ALL_PO_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {poStatusLabels[status] || status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterSupplierId}
              onValueChange={setFilterSupplierId}
              disabled={isLoadingSuppliers}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por proveedor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Proveedores</SelectItem>
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
            </Select>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                Rango de Fechas (Creación)
              </p>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº PO</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha Orden</TableHead>
                <TableHead>Fecha Esperada</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Líneas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedPOs?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-po-${i}`}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-red-500 py-10"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedPOs?.data?.length ? (
                paginatedPOs.data.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell>{po.supplier?.name || "N/A"}</TableCell>
                    <TableCell>{formatDisplayDate(po.orderDate)}</TableCell>
                    <TableCell>{formatDisplayDate(po.expectedDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {poStatusLabels[
                          po.status as PrismaPurchaseOrderStatus
                        ] || po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(po.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {po._count?.lines ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigateToDetail(po.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> Ver Detalles /
                            Recibir
                          </DropdownMenuItem>
                          {(po.status === PrismaPurchaseOrderStatus.DRAFT ||
                            po.status ===
                              PrismaPurchaseOrderStatus.ORDERED) && (
                            <DropdownMenuItem
                              onClick={() => handleOpenEditPODialog(po)}
                            >
                              <Edit3 className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          )}
                          {![
                            PrismaPurchaseOrderStatus.RECEIVED,
                            PrismaPurchaseOrderStatus.CLOSED,
                            PrismaPurchaseOrderStatus.CANCELLED,
                            // Considerar si PARTIALLY_RECEIVED se puede cancelar directamente
                          ].includes(po.status) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleOpenCancelPODialog(po)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Cancelar
                                Orden
                              </DropdownMenuItem>
                            </>
                          )}
                          {/* TODO: Otras acciones como Cancelar PO si el estado lo permite */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    No se encontraron órdenes de compra.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedPOs && paginatedPOs.data && paginatedPOs.totalPages > 0 && (
        <DataTablePagination
          page={paginatedPOs.page}
          totalPages={paginatedPOs.totalPages}
          totalRecords={paginatedPOs.total}
          limit={paginatedPOs.limit}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          isFetching={isFetching}
        />
      )}

      {/* Diálogo de Edición de PO */}
      <EditPODialog
        po={selectedPOForEdit}
        isOpen={isEditPODialogOpen}
        onOpenChange={setIsEditPODialogOpen}
        onSuccess={() => {
          // Opcional: setSelectedPOForEdit(null);
        }}
      />

      {/* Diálogo de Confirmación para Cancelar PO */}
      {poToCancel && (
        <AlertDialog
          open={isCancelPODialogOpen}
          onOpenChange={setIsCancelPODialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                ¿Estás seguro de cancelar la PO #{poToCancel.poNumber}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción cambiará el estado de la orden a Cancelada. No se
                revertirá stock ya recibido (eso sería una devolución a
                proveedor).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setIsCancelPODialogOpen(false); // Cierra explícitamente
                  setPoToCancel(null); // Limpia la PO seleccionada
                }}
              >
                No, mantener
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmCancelPO}
                disabled={cancelPOMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {cancelPOMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sí, Cancelar PO
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
