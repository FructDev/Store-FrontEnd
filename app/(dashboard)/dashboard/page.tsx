// app/(dashboard)/page.tsx
"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
// import { es } from "date-fns/locale";
import { Separator } from "@/components/ui/separator"; // Para dividir secciones

// --- Importar Widgets de KPIs ---
import SalesSummaryWidget from "@/components/dashboard/sales-summary-widget";
import InventorySummaryWidget from "@/components/dashboard/inventory-summary-widget";
import RepairsOverviewWidget from "@/components/dashboard/repairs-overview-widget"; // El que muestra números

// --- Importar Componentes de Gráficos ---
import SalesTrendChart from "@/components/dashboard/sales-trend-chart"; // Nuevo
import RepairsStatusChart from "@/components/dashboard/repairs-status-chart"; // Nuevo
import TopSellingProductsWidget from "@/components/dashboard/top-selling-products-widget"; // Este ya muestra una lista, podría ser un gráfico de barras también
import SalesBySalespersonWidget from "@/components/dashboard/sales-by-salesperson-widget"; // Este también es una lista
import { Card } from "@/components/ui/card";
import TopProductsChart from "@/components/dashboard/top-products-chart";
import SalesBySalespersonChart from "@/components/dashboard/sales-by-salesperson-chart";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -29),
    to: new Date(),
  });

  const queryDateRange = {
    startDate: dateRange?.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  };

  return (
    <div className="space-y-6">
      {" "}
      {/* Contenedor principal con espaciado */}
      <PageHeader
        title="Dashboard Principal"
        description="Visión general del rendimiento y operaciones de la tienda."
      />
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center pb-2">
        <p className="text-sm font-medium text-muted-foreground shrink-0">
          Mostrando datos para:
        </p>
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          className="w-full sm:w-auto"
        />
      </div>
      {/* Sección de KPIs Principales */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <SalesSummaryWidget dateRange={queryDateRange} />
        <InventorySummaryWidget dateRange={queryDateRange} />{" "}
        {/* Asumiendo que este no necesita el gráfico dentro */}
        <RepairsOverviewWidget dateRange={queryDateRange} />{" "}
        {/* Asumiendo que este solo muestra números (Total Activas) */}
      </div>
      <Separator className="my-6 md:my-8" />
      {/* Sección de Gráficos */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <SalesTrendChart dateRange={queryDateRange} />{" "}
        {/* Ocupa todo el ancho en lg */}
        <RepairsStatusChart dateRange={queryDateRange} />
        <TopProductsChart dateRange={queryDateRange} />
        <SalesBySalespersonChart dateRange={queryDateRange} />
        {/* Este ya es como una tabla/lista */}
        {/* <SalesBySalespersonWidget dateRange={queryDateRange} />  Podría ir aquí o en otra fila */}
      </div>
      {/* Podrías tener otra fila para más widgets/gráficos */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6">
        <SalesBySalespersonWidget dateRange={queryDateRange} />
        <TopSellingProductsWidget dateRange={queryDateRange} />
        {/* Placeholder para otro gráfico o widget */}
        <Card className="flex items-center justify-center min-h-[300px] bg-muted/30">
          <p className="text-muted-foreground">Más visualizaciones...</p>
        </Card>
      </div>
    </div>
  );
}
