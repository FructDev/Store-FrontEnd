// components/dashboard/repairs-overview-widget.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { RepairsOverviewData } from "@/types/dashboard.types"; // Importar desde tus tipos frontend
import { RepairStatus as PrismaRepairStatus } from "@/types/prisma-enums"; // Tu enum de estados
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench, AlertCircle, ListTree } from "lucide-react"; // Iconos
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area"; // Para la lista de estados si son muchos

// Mapeo para estados de Reparación (importar de un archivo de constantes/utils o definir aquí)
// Asegúrate de que coincida con tu enum y el que usa la página de listado de reparaciones
const repairStatusLabelsWidget: Record<PrismaRepairStatus, string> = {
  RECEIVED: "Recibido",
  DIAGNOSING: "Diagnosticando",
  QUOTE_PENDING: "Pend. Cotización",
  QUOTE_APPROVED: "Cotización Aprobada",
  AWAITING_QUOTE_APPROVAL: "Esperando Aprob. Cotización",
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

interface RepairsOverviewWidgetProps {
  dateRange: {
    // El backend lo puede usar para filtrar reparaciones recibidas en el rango
    startDate?: string;
    endDate?: string;
  };
  className?: string;
}

export default function RepairsOverviewWidget({
  dateRange,
  className,
}: RepairsOverviewWidgetProps) {
  const {
    data: overview,
    isLoading,
    isError,
    error,
  } = useQuery<RepairsOverviewData, Error>({
    queryKey: [
      "dashboardRepairsOverview",
      dateRange.startDate,
      dateRange.endDate,
    ],
    queryFn: async () => {
      const params = { ...dateRange };
      const response = await apiClient.get("/dashboard/repairs-overview", {
        params,
      });
      return response.data; // Asumimos que response.data ya tiene el formato de RepairsOverviewData
    },
  });

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Resumen de Reparaciones
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

  // Filtrar estados con conteo > 0 o mostrar todos si se prefiere
  const statusesToShow = overview?.byStatus
    ? Object.entries(overview.byStatus)
        .filter(([status, count]) => count > 0) // Mostrar solo estados con reparaciones
        .sort(([, countA], [, countB]) => countB - countA) // Opcional: ordenar por conteo descendente
    : [];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center">
          <Wrench className="h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary" />
          Resumen de Reparaciones
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Estado general de las órdenes de reparación.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-6 w-1/5" />
            </div>
            <Skeleton className="h-px w-full my-2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : overview ? (
          <>
            <div className="flex items-center justify-between mb-3 pb-3 border-b">
              <div className="text-sm font-medium">Reparaciones Activas:</div>
              <div className="text-2xl font-bold text-primary">
                {overview.totalActiveRepairs}
              </div>
            </div>
            {statusesToShow.length > 0 ? (
              <ScrollArea className="h-[120px]">
                {" "}
                {/* Altura fija para la lista de estados con scroll */}
                <div className="space-y-1.5 text-xs pr-3">
                  {statusesToShow.map(([status, count]) => (
                    <Link
                      href={`/dashboard/repairs?status=${status}`}
                      key={status}
                      className="group flex items-center justify-between py-0.5 hover:bg-muted/50 rounded px-1 -mx-1"
                      title={`Ver ${count} reparaciones en estado "${
                        repairStatusLabelsWidget[
                          status as PrismaRepairStatus
                        ] || status
                      }"`}
                    >
                      <span className="flex items-center text-muted-foreground group-hover:text-foreground">
                        <ListTree className="h-3 w-3 mr-2 opacity-70 group-hover:opacity-100" />
                        {repairStatusLabelsWidget[
                          status as PrismaRepairStatus
                        ] || status}
                        :
                      </span>
                      <span className="font-semibold">{count}</span>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No hay reparaciones para mostrar en los estados individuales.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay datos de reparaciones para el período.
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        <Button size="sm" variant="outline" asChild className="w-full">
          <Link href="/dashboard/repairs">Ir a Gestión de Reparaciones</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
