// components/dashboard/charts/sales-trend-chart.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { SalesTrendItemData } from "@/types/dashboard.types"; // Tu tipo frontend
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { formatDate, format as formatDateFns, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils/formatters";

interface SalesTrendChartProps {
  dateRange: { startDate?: string; endDate?: string };
  className?: string;
}

export default function SalesTrendChart({
  dateRange,
  className,
}: SalesTrendChartProps) {
  const {
    data: trendData,
    isLoading,
    isError,
  } = useQuery<SalesTrendItemData[], Error>({
    queryKey: [
      "dashboardSalesTrendChartData",
      dateRange.startDate,
      dateRange.endDate,
    ], // Key diferente al del widget
    queryFn: async () => {
      const params = { ...dateRange };
      const response = await apiClient.get("/dashboard/sales-trend", {
        params,
      });
      return response.data || [];
    },
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });

  if (isError) {
    /* ... manejo de error ... */
  }

  const chartData = trendData?.map((item) => ({
    name: formatDateFns(parseISO(item.date), "dd MMM", { locale: es }),
    Ingresos: item.totalRevenue,
    Ventas: item.numberOfSales,
  }));

  const periodText =
    dateRange.startDate && dateRange.endDate
      ? `${formatDate(dateRange.startDate, "dd MMM yy")} - ${formatDate(
          dateRange.endDate,
          "dd MMM yy"
        )}`
      : "período seleccionado";

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Tendencia de Ventas
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Ingresos y número de ventas en {periodText}.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        {" "}
        {/* Altura fija para el gráfico */}
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
              <XAxis
                dataKey="name"
                style={{ fontSize: "0.7rem" }}
                tickFormatter={(value) => value.split(" ")[0]}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Ingresos",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: "0.7rem", fill: "#8884d8" },
                }}
                style={{ fontSize: "0.7rem" }}
                tickFormatter={(value) => formatCurrency(value, "", "0")}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Nº Ventas",
                  angle: 90,
                  position: "insideRight",
                  style: { fontSize: "0.7rem", fill: "#82ca9d" },
                }}
                style={{ fontSize: "0.7rem" }}
              />
              <Tooltip
                contentStyle={{ fontSize: "0.75rem", padding: "4px 8px" }}
                formatter={(value, name) =>
                  name === "Ingresos" ? formatCurrency(value as number) : value
                }
              />
              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="Ingresos"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Ingresos Totales"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Ventas"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name="Nº de Ventas"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No hay datos de tendencia para mostrar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
