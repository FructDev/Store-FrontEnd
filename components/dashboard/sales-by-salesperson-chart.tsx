// components/dashboard/charts/sales-by-salesperson-chart.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { SalesBySalespersonData } from "@/types/dashboard.types"; // Desde tus tipos frontend
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react"; // BarChartBig o Users2
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

interface SalesBySalespersonChartProps {
  dateRange: { startDate?: string; endDate?: string };
  className?: string;
}

type SalesOrderByCriteria = "totalSalesAmount" | "numberOfSales";

// Colores para las barras (puedes expandir esta lista o usar una función generadora)
const CHART_BAR_COLORS_SALESPERSON = [
  "#82ca9d",
  "#8884d8",
  "#ffc658",
  "#00C49F",
  "#FF8042",
  "#0088FE",
];

export default function SalesBySalespersonChart({
  dateRange,
  className,
}: SalesBySalespersonChartProps) {
  const [limit] = useState(7); // Mostrar Top 7 vendedores
  const [orderBy, setOrderBy] =
    useState<SalesOrderByCriteria>("totalSalesAmount"); // Default a monto

  const currencySymbol =
    useAuthStore((state) => state.user?.store?.currencySymbol) || "RD$";

  const {
    data: salesBySalesperson,
    isLoading,
    isError,
  } = useQuery<SalesBySalespersonData[], Error>({
    queryKey: [
      "dashboardSalesBySalespersonChartData",
      dateRange.startDate,
      dateRange.endDate,
      limit,
      orderBy,
    ],
    queryFn: async () => {
      const params = {
        ...dateRange,
        limit: limit,
        // El backend ya ordena por totalSalesAmount desc. Si queremos ordenar por numberOfSales,
        // el backend necesitaría un param 'orderByCriteria' o lo hacemos en el frontend.
        // Por ahora, asumimos que el backend ordena por monto y el frontend solo toma el top N.
        // Si quieres que el frontend reordene:
        // sortBy: orderBy === 'numberOfSales' ? 'count' : 'amount' // Esto es conceptual, backend lo hace
      };
      const response = await apiClient.get("/dashboard/sales-by-salesperson", {
        params,
      });
      const data = response.data || [];

      // Re-ordenar en el frontend si es necesario (si el backend no soporta el orderBy deseado)
      if (orderBy === "numberOfSales") {
        data.sort(
          (a: SalesBySalespersonData, b: SalesBySalespersonData) =>
            b.numberOfSales - a.numberOfSales
        );
      }
      // Ya viene ordenado por totalSalesAmount desde el backend si no se especifica otra cosa

      return data.slice(0, limit); // Asegurar el límite en el cliente también
    },
  });

  const chartData = useMemo(() => {
    if (!salesBySalesperson) return [];
    return salesBySalesperson.map((item) => ({
      name: `${item.salespersonFirstName || ""} ${
        item.salespersonLastName || "N/A"
      }`
        .trim()
        .substring(0, 15), // Acortar nombre
      value:
        orderBy === "totalSalesAmount"
          ? item.totalSalesAmount
          : item.numberOfSales,
      fullSalespersonName: `${item.salespersonFirstName || ""} ${
        item.salespersonLastName || "N/A"
      }`.trim(),
      salesCount: item.numberOfSales,
      salesAmount: item.totalSalesAmount,
    }));
    // No es necesario .reverse() para BarChart vertical si el eje X es la categoría
  }, [salesBySalesperson, orderBy]);

  const xAxisTickFormatter = (value: never) => {
    return orderBy === "totalSalesAmount"
      ? formatCurrency(value, "", 0)
      : value;
  };

  if (isError) {
    /* ... tu manejo de error ... */
  }

  return (
    <Card className={cn("h-[400px] flex flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-muted-foreground" />
            Top Vendedores
          </CardTitle>
          <Select
            value={orderBy}
            onValueChange={(value) => setOrderBy(value as SalesOrderByCriteria)}
          >
            <SelectTrigger className="h-8 w-full sm:w-[180px] text-xs">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="totalSalesAmount">
                Por Monto Vendido
              </SelectItem>
              <SelectItem value="numberOfSales">Por Nº de Ventas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-2 pb-1">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal" // Barras verticales (categorías en X, valores en Y)
              margin={{ top: 5, right: 20, left: 5, bottom: 20 }} // Ajustar bottom para labels largos
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="name"
                angle={-35} // Rotar etiquetas si son largas
                textAnchor="end"
                height={50} // Más altura para etiquetas rotadas
                interval={0}
                style={{ fontSize: "0.65rem", fill: "hsl(var(--foreground))" }}
              />
              <YAxis
                style={{ fontSize: "0.65rem", fill: "hsl(var(--foreground))" }}
                tickFormatter={xAxisTickFormatter} // Usar el formatter del eje X del gráfico de productos
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                }}
                formatter={(value: number, nameKey: string, props) => {
                  const { payload } = props;
                  console.log(typeof payload);
                  const label =
                    orderBy === "totalSalesAmount"
                      ? "Monto Total:"
                      : "Nº Ventas:";
                  const displayValue =
                    orderBy === "totalSalesAmount"
                      ? formatCurrency(value, currencySymbol)
                      : `${value}`;
                  return [displayValue, label];
                }}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload.fullSalespersonName || label
                } // Mostrar nombre completo en tooltip
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      CHART_BAR_COLORS_SALESPERSON[
                        index % CHART_BAR_COLORS_SALESPERSON.length
                      ]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No hay datos de ventas por vendedor.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
