// app/(dashboard)/reports/page.tsx
"use client";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  BarChart2,
  Settings,
  Users,
  ShoppingCart,
  Wrench,
  History,
  Archive,
} from "lucide-react"; // Iconos

interface ReportLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: "Ventas" | "Inventario" | "Reparaciones" | "Clientes"; // Para agrupar
}

const availableReports: ReportLink[] = [
  {
    title: "Ventas Detalladas por Período",
    description:
      "Analiza todas las transacciones de venta, líneas, pagos y totales dentro de un rango de fechas.",
    href: "/dashboard/reports/sales/detailed-period",
    icon: ShoppingCart,
    category: "Ventas",
  },
  {
    title: "Ventas por Producto",
    description:
      "Rendimiento de cada producto: cantidad vendida, ingresos y rentabilidad.",
    href: "/dashboard/reports/sales/by-product",
    icon: BarChart2,
    category: "Ventas",
  },
  {
    title: "Movimientos de Stock (Kardex)",
    description:
      "Historial detallado de todas las entradas y salidas de inventario, con saldos por producto.",
    href: "/dashboard/reports/inventory/stock-movements",
    icon: History, // O Layers3
    category: "Inventario",
  },
  {
    title: "Reporte Detallado de Stock Bajo",
    description:
      "Identifica productos no serializados cuyo stock disponible es inferior al nivel de reorden.",
    href: "/dashboard/reports/inventory/low-stock",
    icon: Archive, // O FileWarning
    category: "Inventario",
  },
  {
    title: "Valorización de Inventario",
    description:
      "Calcula el valor actual de tu stock al costo para los productos seleccionados.",
    href: "/dashboard/reports/inventory/valuation",
    icon: FileText, // O Layers3
    category: "Inventario",
  },
  // --- Reportes de Reparaciones (Añadir el nuevo) --- V V V
  {
    title: "Listado Detallado de Reparaciones",
    description:
      "Seguimiento y análisis del estado y detalles de las órdenes de reparación.",
    href: "/dashboard/reports/repairs/list", // La página que creamos para el listado de reparaciones
    icon: Wrench, // O Settings
    category: "Reparaciones",
  },
];

export default function ReportsPage() {
  const reportCategories = Array.from(
    new Set(availableReports.map((r) => r.category))
  );

  return (
    <>
      <PageHeader
        title="Centro de Reportes"
        description="Analiza el rendimiento de tu negocio con reportes detallados."
      />
      <div className="space-y-8">
        {reportCategories.map((category) => (
          <section key={category}>
            <h2 className="text-xl font-semibold mb-4 text-foreground">
              {category}
            </h2>
            <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {availableReports
                .filter((report) => report.category === category)
                .map((report) => (
                  <Card key={report.title} className="flex flex-col">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <report.icon className="h-8 w-8 text-primary mb-2" />
                      </div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm min-h-[60px]">
                        {report.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      {" "}
                      {/* Empujar botón abajo */}
                      <Button asChild className="w-full">
                        <Link href={report.href}>Generar Reporte</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </section>
        ))}
        {availableReports.length === 0 && (
          <p className="text-muted-foreground text-center py-10">
            Aún no hay reportes disponibles. Se añadirán próximamente.
          </p>
        )}
      </div>
    </>
  );
}
