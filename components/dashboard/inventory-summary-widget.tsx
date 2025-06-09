// components/dashboard/inventory-summary-widget.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { InventorySummaryData } from "@/types/dashboard.types"; // Importar desde tus tipos frontend
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  ArchiveRestore,
  Truck,
  ListChecks,
  AlertCircle,
} from "lucide-react"; // Iconos relevantes
import Link from "next/link";
// import { Button } from "@/components/ui/button";

interface InventorySummaryWidgetProps {
  dateRange: {
    // Aunque el DTO de respuesta no incluya fechas, la query puede usarla
    startDate?: string;
    endDate?: string;
  };
  className?: string;
}

export default function InventorySummaryWidget({
  dateRange,
  className,
}: InventorySummaryWidgetProps) {
  const {
    data: summary,
    isLoading,
    isError,
    error,
  } = useQuery<InventorySummaryData, Error>({
    queryKey: [
      "dashboardInventorySummary",
      dateRange.startDate,
      dateRange.endDate,
    ],
    queryFn: async () => {
      const params = { ...dateRange }; // Enviar startDate y endDate si existen
      const response = await apiClient.get("/dashboard/inventory-summary", {
        params,
      });
      return response.data; // Asumimos que response.data ya tiene el formato de InventorySummaryData
    },
    // staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Resumen de Inventario
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

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          Resumen de Inventario
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Estado actual y alertas clave.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {isLoading ? (
          <>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-5 w-1/5" />
            </div>
          </>
        ) : summary ? (
          <>
            <Link
              href="/dashboard/inventory/catalog/products"
              className="group"
            >
              <div className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1">
                <span className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" />{" "}
                  Productos Activos:
                </span>
                <span className="font-semibold">
                  {summary.totalActiveProducts}
                </span>
              </div>
            </Link>

            {/* Idealmente, 'productsWithLowStock' también sería un enlace a un reporte filtrado */}
            <div className="flex items-center justify-between py-1 px-1 -mx-1">
              <span className="flex items-center">
                <ArchiveRestore
                  className={`h-4 w-4 mr-2 ${
                    summary.productsWithLowStock > 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                />
                Productos con Stock Bajo:
              </span>
              <span
                className={`font-semibold ${
                  summary.productsWithLowStock > 0 ? "text-destructive" : ""
                }`}
              >
                {summary.productsWithLowStock}
              </span>
            </div>

            <Link
              href="/dashboard/inventory/purchase-orders?status=ORDERED&status=PARTIALLY_RECEIVED"
              className="group"
            >
              <div className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1">
                <span className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" />{" "}
                  POs Pendientes Recibir:
                </span>
                <span className="font-semibold">
                  {summary.pendingPurchaseOrders}
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/inventory/stock-counts?status=PENDING&status=IN_PROGRESS"
              className="group"
            >
              <div className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1">
                <span className="flex items-center">
                  <ListChecks className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" />{" "}
                  Conteos de Stock Activos:
                </span>
                <span className="font-semibold">
                  {summary.activeStockCounts}
                </span>
              </div>
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay datos de inventario para mostrar.
          </p>
        )}
      </CardContent>
      {/* <CardFooter className="print:hidden">
        <Button size="sm" variant="outline" asChild className="w-full">
          <Link href="/dashboard/inventory">
            Ir a Gestión de Inventario
          </Link>
        </Button>
      </CardFooter> */}
    </Card>
  );
}
