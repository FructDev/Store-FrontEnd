// app/(dashboard)/page.tsx
"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var page_header_1 = require("@/components/common/page-header");
var date_range_picker_1 = require("@/components/ui/date-range-picker");
var date_fns_1 = require("date-fns");
// import { es } from "date-fns/locale";
var separator_1 = require("@/components/ui/separator"); // Para dividir secciones
// --- Importar Widgets de KPIs ---
var sales_summary_widget_1 = require("@/components/dashboard/sales-summary-widget");
var inventory_summary_widget_1 = require("@/components/dashboard/inventory-summary-widget");
var repairs_overview_widget_1 = require("@/components/dashboard/repairs-overview-widget"); // El que muestra números
// --- Importar Componentes de Gráficos ---
var sales_trend_chart_1 = require("@/components/dashboard/sales-trend-chart"); // Nuevo
var repairs_status_chart_1 = require("@/components/dashboard/repairs-status-chart"); // Nuevo
var top_selling_products_widget_1 = require("@/components/dashboard/top-selling-products-widget"); // Este ya muestra una lista, podría ser un gráfico de barras también
var sales_by_salesperson_widget_1 = require("@/components/dashboard/sales-by-salesperson-widget"); // Este también es una lista
var card_1 = require("@/components/ui/card");
var top_products_chart_1 = require("@/components/dashboard/top-products-chart");
var sales_by_salesperson_chart_1 = require("@/components/dashboard/sales-by-salesperson-chart");
function DashboardPage() {
    var _a = react_1.useState({
        from: date_fns_1.addDays(new Date(), -29),
        to: new Date()
    }), dateRange = _a[0], setDateRange = _a[1];
    var queryDateRange = {
        startDate: (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) ? date_fns_1.format(dateRange.from, "yyyy-MM-dd")
            : undefined,
        endDate: (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to) ? date_fns_1.format(dateRange.to, "yyyy-MM-dd") : undefined
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        " ",
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Dashboard Principal", description: "Visi\u00F3n general del rendimiento y operaciones de la tienda." }),
        react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-2 sm:items-center pb-2" },
            react_1["default"].createElement("p", { className: "text-sm font-medium text-muted-foreground shrink-0" }, "Mostrando datos para:"),
            react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { date: dateRange, onDateChange: setDateRange, className: "w-full sm:w-auto" })),
        react_1["default"].createElement("div", { className: "grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" },
            react_1["default"].createElement(sales_summary_widget_1["default"], { dateRange: queryDateRange }),
            react_1["default"].createElement(inventory_summary_widget_1["default"], { dateRange: queryDateRange }),
            " ",
            react_1["default"].createElement(repairs_overview_widget_1["default"], { dateRange: queryDateRange }),
            " "),
        react_1["default"].createElement(separator_1.Separator, { className: "my-6 md:my-8" }),
        react_1["default"].createElement("div", { className: "grid gap-6 grid-cols-1 lg:grid-cols-2" },
            react_1["default"].createElement(sales_trend_chart_1["default"], { dateRange: queryDateRange }),
            " ",
            react_1["default"].createElement(repairs_status_chart_1["default"], { dateRange: queryDateRange }),
            react_1["default"].createElement(top_products_chart_1["default"], { dateRange: queryDateRange }),
            react_1["default"].createElement(sales_by_salesperson_chart_1["default"], { dateRange: queryDateRange })),
        react_1["default"].createElement("div", { className: "grid gap-6 grid-cols-1 lg:grid-cols-2 mt-6" },
            react_1["default"].createElement(sales_by_salesperson_widget_1["default"], { dateRange: queryDateRange }),
            react_1["default"].createElement(top_selling_products_widget_1["default"], { dateRange: queryDateRange }),
            react_1["default"].createElement(card_1.Card, { className: "flex items-center justify-center min-h-[300px] bg-muted/30" },
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "M\u00E1s visualizaciones...")))));
}
exports["default"] = DashboardPage;
