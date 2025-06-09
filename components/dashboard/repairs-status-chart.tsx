// components/dashboard/charts/repairs-status-chart.tsx
"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { RepairsOverviewData } from "@/types/dashboard.types";
import { RepairStatus as PrismaRepairStatus } from "@/types/prisma-enums";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart as PieIcon } from "lucide-react"; // PieIcon como alias
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
// import { RepairStatus as repairStatusLabels } from "@/types/prisma-enums"; // Importa tus etiquetas
import { formatDate } from "date-fns";

interface RepairsStatusChartProps {
  dateRange: { startDate?: string; endDate?: string };
  className?: string;
}

const repairStatusLabels: Record<PrismaRepairStatus, string> = {
  [PrismaRepairStatus.RECEIVED]: "Recibido",
  [PrismaRepairStatus.DIAGNOSING]: "Diagnosticando",
  [PrismaRepairStatus.QUOTE_PENDING]: "Pend. Cotización",
  [PrismaRepairStatus.QUOTE_APPROVED]: "Cotización Aprobada",
  [PrismaRepairStatus.AWAITING_QUOTE_APPROVAL]: "Esperando Aprob. Cotización",
  [PrismaRepairStatus.QUOTE_REJECTED]: "Cotización Rechazada",
  [PrismaRepairStatus.AWAITING_PARTS]: "Esperando Repuestos",
  [PrismaRepairStatus.IN_REPAIR]: "En Reparación",
  [PrismaRepairStatus.ASSEMBLING]: "Ensamblando",
  [PrismaRepairStatus.TESTING_QC]: "Pruebas C. Calidad",
  [PrismaRepairStatus.REPAIR_COMPLETED]: "Reparación Interna OK",
  [PrismaRepairStatus.PENDING_PICKUP]: "Listo para Entrega",
  [PrismaRepairStatus.COMPLETED_PICKED_UP]: "Entregado",
  [PrismaRepairStatus.CANCELLED]: "Cancelado",
  [PrismaRepairStatus.UNREPAIRABLE]: "No Reparable",
};
// -

// Colores para el gráfico de Pie (puedes definir más o usar una función para generarlos)
const PIE_CHART_COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
  "#FF7F7F",
  "#D8BFD8",
  "#ADD8E6",
];

export default function RepairsStatusChart({
  dateRange,
  className,
}: RepairsStatusChartProps) {
  const {
    data: overview,
    isLoading,
    isError,
  } = useQuery<RepairsOverviewData, Error>({
    queryKey: [
      "dashboardRepairsOverviewChartData",
      dateRange.startDate,
      dateRange.endDate,
    ], // Key diferente
    queryFn: async () => {
      const params = { ...dateRange };
      const response = await apiClient.get("/dashboard/repairs-overview", {
        params,
      });
      return response.data;
    },
  });

  if (isError) {
    /* ... manejo de error ... */
  }

  const chartData = useMemo(() => {
    if (!overview?.byStatus) return [];
    return Object.entries(overview.byStatus)
      .filter(([status, count]) => count > 0) // Solo estados con conteo > 0
      .map(([status, count]) => ({
        name: repairStatusLabels[status as PrismaRepairStatus] || status,
        value: count,
      }))
      .sort((a, b) => b.value - a.value); // Ordenar por mayor conteo
  }, [overview]);

  const periodText =
    overview?.periodStartDate && overview?.periodEndDate
      ? `${formatDate(overview.periodStartDate, "dd MMM yy")} - ${formatDate(
          overview.periodEndDate,
          "dd MMM yy"
        )}`
      : "todos los tiempos";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center">
          <PieIcon className="h-5 w-5 mr-2 text-purple-600" />
          Distribución de Estados de Reparación
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Reparaciones recibidas en {periodText}.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Etiqueta en el Pie
                outerRadius={80}
                innerRadius={40} // Para hacerlo un gráfico de Dona
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} reparaciones`, "Cantidad"]}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: "0.75rem", lineHeight: "1.5" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No hay datos de reparaciones para mostrar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
