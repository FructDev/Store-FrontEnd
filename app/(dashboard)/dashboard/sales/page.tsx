// app/(dashboard)/sales/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  Sale,
  PaginatedSalesResponse,
  CustomerBasic,
} from "@/types/sales.types"; // CustomerBasic de sales.types o customer.types
import { UserMinimal } from "@/types/user.types"; // Para el filtro de vendedor
import {
  SaleStatus as PrismaSaleStatus,
  //   PaymentMethod as PrismaPaymentMethod,
} from "@/types/prisma-enums";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useDebounce } from "@/hooks/use-debounce";
import { Eye, Filter, XCircle, ShoppingCart } from "lucide-react"; // Iconos
// import { FormLabel } from "@/components/ui/form";

// Mapeo para estados de Venta
export const saleStatusLabels: Record<PrismaSaleStatus, string> = {
  PENDING_PAYMENT: "Pendiente Pago",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  RETURNED: "Devuelta",
  PARTIALLY_RETURNED: "Dev. Parcial",
};
const ALL_SALE_STATUSES = Object.values(PrismaSaleStatus);

const formatDate = (
  dateInput?: string | Date | null,
  formatString = "dd/MM/yyyy HH:mm"
) => {
  if (!dateInput) return "-";
  try {
    const date =
      typeof dateInput === "string" ? parseISO(dateInput) : dateInput;
    return format(date, formatString, { locale: es });
  } catch (e) {
    return String(dateInput);
  }
};

const formatCurrency = (
  amount: string | number | null | undefined,
  currencySymbol = "RD$"
) => {
  if (amount === null || amount === undefined) return "-";
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(numericAmount)) return "-";
  return `${currencySymbol} ${numericAmount.toFixed(2)}`;
};

export default function SalesListPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage] = useState(10);

  // Estados para Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCustomerId, setFilterCustomerId] = useState<string>("all");
  const [filterUserId, setFilterUserId] = useState<string>("all"); // Para filtrar por vendedor
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Fetch para Clientes (para el filtro)
  const { data: customers, isLoading: isLoadingCustomers } = useQuery<
    CustomerBasic[]
  >({
    queryKey: ["allCustomersForSaleFilter"],
    queryFn: () =>
      apiClient
        .get("/customers?limit=500&isActive=true")
        .then((res) => res.data.data || []),
  });

  // Fetch para Usuarios/Vendedores (para el filtro)
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserMinimal[]>({
    queryKey: ["allUsersForSaleFilter"],
    queryFn: () =>
      apiClient
        .get("/users?limit=500&isActive=true")
        .then((res) => res.data.data || []),
  });

  const {
    data: paginatedSales,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<PaginatedSalesResponse, Error>({
    queryKey: [
      "salesList",
      currentPage,
      limitPerPage,
      debouncedSearchTerm,
      filterStatus,
      filterCustomerId,
      filterUserId,
      dateRange?.from,
      dateRange?.to,
    ],
    queryFn: async () => {
      const params: Record<string, any> = {
        page: currentPage,
        limit: limitPerPage,
        sortBy: "saleDate",
        sortOrder: "desc",
      };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm; // Buscar por saleNumber o customer name/email
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterCustomerId !== "all") params.customerId = filterCustomerId;
      if (filterUserId !== "all") params.userId = filterUserId;
      if (dateRange?.from)
        params.startDate = format(dateRange.from, "yyyy-MM-dd");
      if (dateRange?.to) params.endDate = format(dateRange.to, "yyyy-MM-dd");

      const response = await apiClient.get("/sales", { params });
      // Parsear Decimales a números en el frontend si es necesario para cálculos o display
      const salesData = response.data.data.map((sale: Sale) => ({
        ...sale,
        totalAmount:
          sale.totalAmount !== null && sale.totalAmount !== undefined
            ? parseFloat(String(sale.totalAmount))
            : 0,
      }));
      return { ...response.data, data: salesData };
    },
    placeholderData: (previousData) => previousData,
  });

  const handlePreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => {
    if (paginatedSales && currentPage < paginatedSales.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearchTerm,
    filterStatus,
    filterCustomerId,
    filterUserId,
    dateRange,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setFilterCustomerId("all");
    setFilterUserId("all");
    setDateRange(undefined);
  };

  return (
    <>
      <PageHeader
        title="Historial de Ventas"
        description="Consulta todas las ventas realizadas en la tienda."
        actionButton={
          <Button asChild variant="default">
            <Link href="/dashboard/pos">
              <ShoppingCart className="mr-2 h-4 w-4" /> Ir al POS
            </Link>
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <XCircle className="mr-1 h-4 w-4" /> Limpiar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
            <Input
              type="search"
              placeholder="Buscar Nº Venta, Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Estados</SelectItem>
                {ALL_SALE_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {saleStatusLabels[st] || st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterCustomerId}
              onValueChange={setFilterCustomerId}
              disabled={isLoadingCustomers}
            >
              <SelectTrigger>
                <SelectValue placeholder="Cliente..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todos Clientes</SelectItem>
                {isLoadingCustomers && (
                  <SelectItem value="loading-cust" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} ({c.email || c.phone || "N/A"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterUserId}
              onValueChange={setFilterUserId}
              disabled={isLoadingUsers}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vendedor..." />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">Todos Vendedores</SelectItem>
                {isLoadingUsers && (
                  <SelectItem value="loading-user" disabled>
                    Cargando...
                  </SelectItem>
                )}
                {users?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              {" "}
              {/* Ya no necesitas <div className="space-y-1.5"> si DatePickerWithRange lo maneja */}
              <DatePickerWithRange
                id="sales-date-filter" // ID para el htmlFor
                label="Fecha de Venta" // Pasar la etiqueta como prop
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
                <TableHead>Nº Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || (isFetching && !paginatedSales?.data) ? (
                [...Array(limitPerPage)].map((_, i) => (
                  <TableRow key={`skel-sale-${i}`}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-red-500 py-10"
                  >
                    Error: {error.message}
                  </TableCell>
                </TableRow>
              ) : paginatedSales?.data?.length ? (
                paginatedSales.data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.saleNumber}
                    </TableCell>
                    <TableCell>
                      {formatDate(sale.saleDate, "dd/MM/yy HH:mm")}
                    </TableCell>
                    <TableCell>
                      {sale.customer
                        ? `${sale.customer.firstName || ""} ${
                            sale.customer.lastName || ""
                          }`.trim() || "Cliente Genérico"
                        : "Cliente Genérico"}
                    </TableCell>
                    <TableCell>
                      {sale.user
                        ? `${sale.user.firstName || ""} ${
                            sale.user.lastName || ""
                          }`.trim()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {saleStatusLabels[sale.status as PrismaSaleStatus] ||
                          sale.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sale.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/sales/${sale.id}`)
                        }
                      >
                        <Eye className="mr-1 h-4 w-4" /> Ver Detalle
                      </Button>
                      {/* TODO: Dropdown para más acciones como "Añadir Pago", "Cancelar", "Devolución" */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No se encontraron ventas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {paginatedSales &&
        paginatedSales.data &&
        paginatedSales.totalPages > 0 && (
          <DataTablePagination
            page={paginatedSales.page}
            totalPages={paginatedSales.totalPages}
            totalRecords={paginatedSales.total}
            limit={paginatedSales.limit}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            isFetching={isFetching}
          />
        )}
    </>
  );
}
