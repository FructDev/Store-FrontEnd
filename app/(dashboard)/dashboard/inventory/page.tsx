// app/(dashboard)/inventory/page.tsx
"use client";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Package,
  Boxes,
  Truck,
  Settings2,
  ListChecks,
  ShoppingBasket,
  Tag,
  MapPin,
  Users as SuppliersIcon,
  AlertOctagon,
  Activity,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

// Tipos para los KPIs del dashboard de inventario (si los traemos del backend)
interface InventoryDashboardSummary {
  totalActiveProducts: number;
  productsWithLowStock: number; // Contar los que están por debajo del reorderLevel
  pendingPurchaseOrders: number; // POs en estado ORDERED o PARTIALLY_RECEIVED
  activeStockCounts: number; // Conteos PENDING o IN_PROGRESS
  // totalInventoryValue?: number; // Esto requeriría cálculo en backend
}

// Definimos los items del menú de inventario
const inventorySections = [
  {
    title: "Catálogo",
    description:
      "Definir y gestionar productos, categorías, proveedores y ubicaciones.",
    href: "/dashboard/inventory/catalog/products", // Enlace principal a productos
    icon: Package,
    subLinks: [
      {
        title: "Productos",
        href: "/dashboard/inventory/catalog/products",
        icon: ShoppingBasket,
      },
      {
        title: "Categorías",
        href: "/dashboard/inventory/catalog/categories",
        icon: Tag,
      },
      {
        title: "Proveedores",
        href: "/dashboard/inventory/catalog/suppliers",
        icon: SuppliersIcon,
      },
      {
        title: "Ubicaciones",
        href: "/dashboard/inventory/catalog/locations",
        icon: MapPin,
      },
    ],
  },
  {
    title: "Operaciones de Stock",
    description: "Registrar entradas, ajustes y transferencias de stock.",
    href: "/dashboard/inventory/stock-operations",
    icon: Boxes,
  },
  {
    title: "Consulta de Niveles de Stock",
    description:
      "Visualiza y filtra todos los ítems de inventario en tus ubicaciones.",
    href: "/dashboard/inventory/stock-levels", // La nueva página que creamos
    icon: Layers, // Un icono apropiado
  },
  {
    title: "Órdenes de Compra",
    description:
      "Crear y gestionar órdenes a proveedores y registrar recepciones.",
    href: "/dashboard/inventory/purchase-orders",
    icon: Truck,
  },
  {
    title: "Conteos Físicos",
    description:
      "Realizar tomas de inventario físico y aplicar ajustes por discrepancias.",
    href: "/dashboard/inventory/stock-counts",
    icon: ListChecks, // Cambiado de CheckSquareIcon
  },
  {
    title: "Gestión de Bundles",
    description: "Ensamblar o desarmar productos compuestos (kits).",
    href: "/dashboard/inventory/bundles",
    icon: Settings2,
  },
  // {
  //   title: "Reportes de Inventario",
  //   description: "Análisis de stock, movimientos, valorización.",
  //   href: "/dashboard/reports/inventory", // Futuro
  //   icon: FileText,
  // },
];

export default function InventoryHomePage() {
  // Query para los KPIs del dashboard de inventario
  // Asumimos un nuevo endpoint en el backend: GET /dashboard/inventory-summary
  const {
    data: summary,
    isLoading: isLoadingSummary,
    // isError: isErrorSummary,
  } = useQuery<InventoryDashboardSummary>({
    queryKey: ["inventoryDashboardSummary"],
    queryFn: async () => {
      const response = await apiClient.get("/dashboard/inventory-summary"); // Endpoint correcto
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos // Cache por 5 minutos
  });

  return (
    <>
      <PageHeader
        title="Gestión de Inventario"
        description="Centro de control para todas las operaciones y configuraciones de tu inventario."
      />

      {/* KPIs / Resumen Rápido */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos Activos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">
                {summary?.totalActiveProducts ?? "-"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Total de productos en el catálogo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertOctagon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">
                {summary?.productsWithLowStock ?? "-"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Productos por debajo del nivel de reorden
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              POs Pendientes
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">
                {summary?.pendingPurchaseOrders ?? "-"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Órdenes de compra esperando recepción
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conteos Activos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">
                {summary?.activeStockCounts ?? "-"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Sesiones de conteo en progreso o pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de Acceso Rápido */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inventorySections.map((section) => (
          <Card
            key={section.title}
            className="flex flex-col hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-4">
              {" "}
              {/* Menos padding abajo */}
              <div className="flex items-start justify-between">
                <section.icon className="h-8 w-8 text-primary mb-2" />
                {/* Puedes añadir un botón de "Acción Principal" si lo deseas */}
              </div>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription className="text-sm min-h-[40px]">
                {section.description}
              </CardDescription>
            </CardHeader>
            {section.subLinks && section.subLinks.length > 0 && (
              <CardContent className="flex-1 pt-0 pb-2">
                {" "}
                {/* Menos padding */}
                <h4 className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                  Accesos Directos:
                </h4>
                <ul className="space-y-1">
                  {section.subLinks.map((sub) => (
                    <li key={sub.title}>
                      <Button
                        variant="link"
                        asChild
                        className="p-0 h-auto font-normal text-sm justify-start"
                      >
                        <Link
                          href={sub.href}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                        >
                          <sub.icon className="h-3.5 w-3.5" />
                          {sub.title}
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
            <CardFooter
              className={
                section.subLinks && section.subLinks.length > 0
                  ? "pt-2"
                  : "pt-6 flex-1 items-end"
              }
            >
              {" "}
              {/* Ajustar padding si hay sublinks */}
              <Button asChild className="w-full">
                <Link href={section.href}>
                  {section.title.startsWith("Gestión de") ||
                  section.title.startsWith("Catálogo")
                    ? "Gestionar"
                    : "Ir a"}{" "}
                  {section.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
