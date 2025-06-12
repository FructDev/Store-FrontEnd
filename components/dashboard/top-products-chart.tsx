// components/dashboard/charts/top-products-chart.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { TopSellingProductData } from "@/types/dashboard.types"; // Desde tus tipos frontend
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3 } from "lucide-react";
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
// import { useAuthStore } from "@/stores/auth.store"; // Para obtener currencySymbol
import { useStoreSettings } from "@/hooks/use-store-settings";

interface TopProductsChartProps {
  dateRange: { startDate?: string; endDate?: string };
  className?: string;
}

type OrderByCriteriaChart = "quantity" | "revenue";

// Colores para las barras (puedes expandir esta lista o usar una función generadora)
const CHART_BAR_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
];

export default function TopProductsChart({
  dateRange,
  className,
}: TopProductsChartProps) {
  const [limit] = useState(7); // Mostrar Top 7 en el gráfico para no saturar
  const [orderBy, setOrderBy] = useState<OrderByCriteriaChart>("quantity");

  const { data: storeSettings } = useStoreSettings();

  const currencySymbol = storeSettings?.currencySymbol || "RD$";

  const {
    data: topProducts,
    isLoading,
    isError,
    error,
  } = useQuery<TopSellingProductData[], Error>({
    queryKey: [
      "dashboardTopSellingProductsForChart",
      dateRange.startDate,
      dateRange.endDate,
      limit,
      orderBy,
    ],
    queryFn: async () => {
      const params = {
        ...dateRange,
        limit: limit,
        orderByCriteria: orderBy,
      };
      const response = await apiClient.get("/dashboard/top-selling-products", {
        params,
      });
      return response.data || [];
    },
    // Mantener datos mientras se recarga en segundo plano para una mejor UX
    // placeholderData: (previousData) => previousData,
    // staleTime: 1000 * 60 * 1, // 1 minuto
  });

  const chartData = useMemo(() => {
    if (!topProducts) return [];
    return topProducts
      .map((product) => ({
        name:
          product.productName.length > 25
            ? `${product.productName.substring(0, 22)}...`
            : product.productName, // Acortar nombres
        value:
          orderBy === "quantity"
            ? product.totalQuantitySold
            : product.totalRevenueGenerated,
        fullProductName: product.productName, // Para el tooltip
        sku: product.productSku,
      }))
      .reverse(); // Invertir para que el más alto esté arriba en el gráfico horizontal
  }, [topProducts, orderBy]);

  const xAxisTickFormatter = (value: number | string) =>
    orderBy === "revenue"
      ? formatCurrency(Number(value), currencySymbol) // RD$ 1 234.00
      : String(value);

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Top Productos (Gráfico)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-destructive">
            Error al cargar datos: {error?.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-[400px] flex flex-col", className)}>
      {" "}
      {/* Altura fija y flex para el footer */}
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-muted-foreground" />
            Productos Más Vendidos
          </CardTitle>
          <Select
            value={orderBy}
            onValueChange={(value) => setOrderBy(value as OrderByCriteriaChart)}
          >
            <SelectTrigger className="h-8 w-full sm:w-[150px] text-xs">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantity">Por Cantidad</SelectItem>
              <SelectItem value="revenue">Por Ingresos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-2 pb-1">
        {" "}
        {/* flex-1 para que el contenido del gráfico tome espacio */}
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 35, left: 10, bottom: 5 }} // Aumentar right/left para labels
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                strokeOpacity={0.3}
              />
              <XAxis
                type="number"
                style={{ fontSize: "0.65rem" }}
                tickFormatter={xAxisTickFormatter}
              />
              <YAxis
                type="category"
                dataKey="name" // Nombres acortados
                width={100} // Ajustar ancho para etiquetas del eje Y
                style={{ fontSize: "0.65rem", fill: "hsl(var(--foreground))" }}
                interval={0}
                tickLine={false}
                axisLine={false}
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
                  const { payload } = props; // payload contiene el objeto de datos completo del item de la barra
                  const displayValue =
                    orderBy === "revenue"
                      ? formatCurrency(value, currencySymbol)
                      : `${value} und.`;
                  return [displayValue, payload.fullProductName]; // Mostrar nombre completo en tooltip
                }}
              />
              <Bar
                dataKey="value"
                layout="vertical"
                radius={[0, 4, 4, 0]}
                barSize={12}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_BAR_COLORS[index % CHART_BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              No hay datos de productos para graficar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
