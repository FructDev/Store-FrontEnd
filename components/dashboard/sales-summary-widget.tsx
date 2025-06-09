// components/dashboard/sales-summary-widget.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { SalesSummaryData } from "@/types/dashboard.types"; // Ajusta la ruta a tu DTO
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/formatters"; // Tu formatter

interface SalesSummaryWidgetProps {
  dateRange: {
    // El tipo que espera el DTO de query del backend
    startDate?: string;
    endDate?: string;
  };
  className?: string;
}

export default function SalesSummaryWidget({
  dateRange,
  className,
}: SalesSummaryWidgetProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useQuery<SalesSummaryData, Error>({
    queryKey: ["dashboardSalesSummary", dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      const params = { ...dateRange }; // Enviar startDate y endDate
      const response = await apiClient.get("/dashboard/sales-summary", {
        params,
      });
      return response.data;
    },
    // staleTime y cacheTime pueden ser útiles aquí
  });

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Resumen de Ventas
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-destructive">
            Error al cargar datos: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  const periodText =
    summary?.periodStartDate && summary?.periodEndDate
      ? `${formatDate(summary.periodStartDate, "dd MMM")} - ${formatDate(
          summary.periodEndDate,
          "dd MMM"
        )}`
      : "el período seleccionado";

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resumen de Ventas</CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2 mb-3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </>
        ) : summary ? (
          <>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalSalesRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos totales en {periodText}
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Número de Ventas:</span>
                <span className="font-semibold">{summary.numberOfSales}</span>
              </div>
              <div className="flex justify-between">
                <span>Ticket Promedio:</span>
                <span className="font-semibold">
                  {formatCurrency(summary.averageSaleValue)}
                </span>
              </div>
              {summary.grossProfit !== undefined && (
                <div className="flex justify-between">
                  <span>Ganancia Bruta:</span>
                  <span className="font-semibold">
                    {formatCurrency(summary.grossProfit)}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            `` No hay datos de ventas para el período.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
