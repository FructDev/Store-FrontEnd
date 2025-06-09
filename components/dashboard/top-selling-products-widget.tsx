// components/dashboard/top-selling-products-widget.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { TopSellingProductData } from "@/types/dashboard.types"; // Desde tus tipos frontend
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ShoppingBag, AlertCircle } from "lucide-react"; // Iconos
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatCurrency } from "@/lib/utils/formatters";
import Link from "next/link";
import { Button } from "../ui/button";

interface TopSellingProductsWidgetProps {
  dateRange: {
    startDate?: string;
    endDate?: string;
  };
  className?: string;
}

type OrderByCriteria = "quantity" | "revenue";

export default function TopSellingProductsWidget({
  dateRange,
  className,
}: TopSellingProductsWidgetProps) {
  const [limit] = useState(5); // Mostrar Top 5 en el widget
  const [orderBy, setOrderBy] = useState<OrderByCriteria>("quantity"); // Default a cantidad

  const {
    data: topProducts,
    isLoading,
    isError,
    error,
  } = useQuery<TopSellingProductData[], Error>({
    // Espera un array
    queryKey: [
      "dashboardTopSellingProducts",
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
      return response.data || []; // El backend ya debería devolver un array
    },
    // staleTime y cacheTime pueden ser útiles
  });

  if (isError) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Productos</CardTitle>
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
            <TrendingUp className="h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary" />
            Top {limit} Productos Vendidos
          </CardTitle>
          <Select
            value={orderBy}
            onValueChange={(value) => setOrderBy(value as OrderByCriteria)}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Ordenar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quantity">Por Cantidad</SelectItem>
              <SelectItem value="revenue">Por Ingresos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
          Productos más populares en el período seleccionado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-3/5" />{" "}
                <Skeleton className="h-4 w-1/5" />
              </div>
            ))}
          </div>
        ) : topProducts && topProducts.length > 0 ? (
          <div className="space-y-2 text-xs">
            {topProducts.map((product, index) => (
              <div
                key={product.productId || index}
                className="flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1"
              >
                <div className="flex items-center truncate">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                  <span className="truncate" title={product.productName}>
                    {product.productName}
                    {product.productSku && product.productSku !== "N/A" && (
                      <span className="text-muted-foreground text-[10px] ml-1">
                        ({product.productSku})
                      </span>
                    )}
                  </span>
                </div>
                <span className="font-semibold whitespace-nowrap">
                  {orderBy === "quantity"
                    ? `${product.totalQuantitySold} und.`
                    : formatCurrency(product.totalRevenueGenerated)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay datos de productos vendidos para mostrar.
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-3">
        <Button size="sm" variant="outline" asChild className="w-full">
          <Link
            href="/dashboard/reports/sales/by-product"
            className="block truncate"
          >
            {/* Ruta a un futuro reporte */}
            <span className="truncate">Ver Reporte Completo de Productos</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
