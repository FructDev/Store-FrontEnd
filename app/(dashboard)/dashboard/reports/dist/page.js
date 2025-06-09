// app/(dashboard)/reports/page.tsx
"use client";
"use strict";
exports.__esModule = true;
var page_header_1 = require("@/components/common/page-header");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react"); // Iconos
var availableReports = [
    {
        title: "Ventas Detalladas por Período",
        description: "Analiza todas las transacciones de venta, líneas, pagos y totales dentro de un rango de fechas.",
        href: "/dashboard/reports/sales/detailed-period",
        icon: lucide_react_1.ShoppingCart,
        category: "Ventas"
    },
    {
        title: "Ventas por Producto",
        description: "Rendimiento de cada producto: cantidad vendida, ingresos y rentabilidad.",
        href: "/dashboard/reports/sales/by-product",
        icon: lucide_react_1.BarChart2,
        category: "Ventas"
    },
    {
        title: "Movimientos de Stock (Kardex)",
        description: "Historial detallado de todas las entradas y salidas de inventario, con saldos por producto.",
        href: "/dashboard/reports/inventory/stock-movements",
        icon: lucide_react_1.History,
        category: "Inventario"
    },
    {
        title: "Reporte Detallado de Stock Bajo",
        description: "Identifica productos no serializados cuyo stock disponible es inferior al nivel de reorden.",
        href: "/dashboard/reports/inventory/low-stock",
        icon: lucide_react_1.Archive,
        category: "Inventario"
    },
    {
        title: "Valorización de Inventario",
        description: "Calcula el valor actual de tu stock al costo para los productos seleccionados.",
        href: "/dashboard/reports/inventory/valuation",
        icon: lucide_react_1.FileText,
        category: "Inventario"
    },
    // --- Reportes de Reparaciones (Añadir el nuevo) --- V V V
    {
        title: "Listado Detallado de Reparaciones",
        description: "Seguimiento y análisis del estado y detalles de las órdenes de reparación.",
        href: "/dashboard/reports/repairs/list",
        icon: lucide_react_1.Wrench,
        category: "Reparaciones"
    },
];
function ReportsPage() {
    var reportCategories = Array.from(new Set(availableReports.map(function (r) { return r.category; })));
    return (React.createElement(React.Fragment, null,
        React.createElement(page_header_1.PageHeader, { title: "Centro de Reportes", description: "Analiza el rendimiento de tu negocio con reportes detallados." }),
        React.createElement("div", { className: "space-y-8" },
            reportCategories.map(function (category) { return (React.createElement("section", { key: category },
                React.createElement("h2", { className: "text-xl font-semibold mb-4 text-foreground" }, category),
                React.createElement("div", { className: "grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }, availableReports
                    .filter(function (report) { return report.category === category; })
                    .map(function (report) { return (React.createElement(card_1.Card, { key: report.title, className: "flex flex-col" },
                    React.createElement(card_1.CardHeader, { className: "pb-4" },
                        React.createElement("div", { className: "flex items-start justify-between" },
                            React.createElement(report.icon, { className: "h-8 w-8 text-primary mb-2" })),
                        React.createElement(card_1.CardTitle, { className: "text-lg" }, report.title),
                        React.createElement(card_1.CardDescription, { className: "text-sm min-h-[60px]" }, report.description)),
                    React.createElement(card_1.CardContent, { className: "mt-auto" },
                        " ",
                        React.createElement(button_1.Button, { asChild: true, className: "w-full" },
                            React.createElement(link_1["default"], { href: report.href }, "Generar Reporte"))))); })))); }),
            availableReports.length === 0 && (React.createElement("p", { className: "text-muted-foreground text-center py-10" }, "A\u00FAn no hay reportes disponibles. Se a\u00F1adir\u00E1n pr\u00F3ximamente.")))));
}
exports["default"] = ReportsPage;
