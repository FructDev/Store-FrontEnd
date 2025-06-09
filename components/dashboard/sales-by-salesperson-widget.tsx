// components/dashboard/sales-by-salesperson-widget.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { SalesBySalespersonData } from "@/types/dashboard.types"; // Desde tus tipos frontend
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SalesBySalespersonWidgetProps {
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
  className?: string;
}

export default function SalesBySalespersonWidget({
  dateRange,
  className,
}: SalesBySalespersonWidgetProps) {
  const [limit] = useState(5); // Mostrar Top 5 vendedores en el widget

  const {
    data: salesBySalesperson,
    isLoading,
    isError,
    error,
  } = useQuery<SalesBySalespersonData[], Error>({
    // Espera un array
    queryKey: [
      "dashboardSalesBySalesperson",
      dateRange.startDate,
      dateRange.endDate,
      limit,
    ],
    queryFn: async () => {
      const params = {
        ...dateRange,
        limit: limit,
        // salespersonId no se envía aquí, queremos el top N general
      };
      const response = await apiClient.get("/dashboard/sales-by-salesperson", {
        params,
      });
      return response.data || []; // El backend ya debería devolver un array
    },
  });

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ventas por Vendedor
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary" />
            Top {limit} Vendedores
          </CardTitle>
          {/* Podríamos añadir un selector para ordenar por Monto o Nro. de Ventas si el backend lo soporta */}
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
          Rendimiento de vendedores en el período seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : salesBySalesperson && salesBySalesperson.length > 0 ? (
          <div className="space-y-2.5 text-xs">
            {salesBySalesperson.map((item, index) => (
              <div
                key={item.salespersonId || index}
                className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1"
              >
                <div className="flex items-center truncate">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <UserCheck className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                  <span
                    className="truncate"
                    title={`${item.salespersonFirstName || ""} ${
                      item.salespersonLastName || ""
                    }`.trim()}
                  >
                    {`${item.salespersonFirstName || ""} ${
                      item.salespersonLastName || "Desconocido"
                    }`.trim()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold whitespace-nowrap block">
                    {formatCurrency(item.totalSalesAmount)}
                  </span>
                  <span className="text-muted-foreground text-[10px]">
                    {item.numberOfSales} ventas
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay datos de ventas por vendedor para mostrar.
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        <Button size="sm" variant="outline" asChild className="w-full">
          {/* TODO: Crear esta ruta de reporte si no existe */}
          <Link
            href="/dashboard/reports/sales?reportType=salesBySalesperson"
            className="block truncate"
          >
            <span className="truncate">Ver Reporte Completo de Vendedores</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
