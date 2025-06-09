// app/(dashboard)/inventory/page.tsx
"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var page_header_1 = require("@/components/common/page-header");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var link_1 = require("next/link");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var skeleton_1 = require("@/components/ui/skeleton");
// Definimos los items del menú de inventario
var inventorySections = [
    {
        title: "Catálogo",
        description: "Definir y gestionar productos, categorías, proveedores y ubicaciones.",
        href: "/dashboard/inventory/catalog/products",
        icon: lucide_react_1.Package,
        subLinks: [
            {
                title: "Productos",
                href: "/dashboard/inventory/catalog/products",
                icon: lucide_react_1.ShoppingBasket
            },
            {
                title: "Categorías",
                href: "/dashboard/inventory/catalog/categories",
                icon: lucide_react_1.Tag
            },
            {
                title: "Proveedores",
                href: "/dashboard/inventory/catalog/suppliers",
                icon: lucide_react_1.Users
            },
            {
                title: "Ubicaciones",
                href: "/dashboard/inventory/catalog/locations",
                icon: lucide_react_1.MapPin
            },
        ]
    },
    {
        title: "Operaciones de Stock",
        description: "Registrar entradas, ajustes y transferencias de stock.",
        href: "/dashboard/inventory/stock-operations",
        icon: lucide_react_1.Boxes
    },
    {
        title: "Consulta de Niveles de Stock",
        description: "Visualiza y filtra todos los ítems de inventario en tus ubicaciones.",
        href: "/dashboard/inventory/stock-levels",
        icon: lucide_react_1.Layers
    },
    {
        title: "Órdenes de Compra",
        description: "Crear y gestionar órdenes a proveedores y registrar recepciones.",
        href: "/dashboard/inventory/purchase-orders",
        icon: lucide_react_1.Truck
    },
    {
        title: "Conteos Físicos",
        description: "Realizar tomas de inventario físico y aplicar ajustes por discrepancias.",
        href: "/dashboard/inventory/stock-counts",
        icon: lucide_react_1.ListChecks
    },
    {
        title: "Gestión de Bundles",
        description: "Ensamblar o desarmar productos compuestos (kits).",
        href: "/dashboard/inventory/bundles",
        icon: lucide_react_1.Settings2
    },
];
function InventoryHomePage() {
    var _this = this;
    var _a, _b, _c, _d;
    // Query para los KPIs del dashboard de inventario
    // Asumimos un nuevo endpoint en el backend: GET /dashboard/inventory-summary
    var _e = react_query_1.useQuery({
        queryKey: ["inventoryDashboardSummary"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].get("/dashboard/inventory-summary")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        staleTime: 1000 * 60 * 5
    }), summary = _e.data, isLoadingSummary = _e.isLoading;
    return (React.createElement(React.Fragment, null,
        React.createElement(page_header_1.PageHeader, { title: "Gesti\u00F3n de Inventario", description: "Centro de control para todas las operaciones y configuraciones de tu inventario." }),
        React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Productos Activos"),
                    React.createElement(lucide_react_1.Package, { className: "h-4 w-4 text-muted-foreground" })),
                React.createElement(card_1.CardContent, null,
                    isLoadingSummary ? (React.createElement(skeleton_1.Skeleton, { className: "h-8 w-1/2" })) : (React.createElement("div", { className: "text-2xl font-bold" }, (_a = summary === null || summary === void 0 ? void 0 : summary.totalActiveProducts) !== null && _a !== void 0 ? _a : "-")),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Total de productos en el cat\u00E1logo"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Stock Bajo"),
                    React.createElement(lucide_react_1.AlertOctagon, { className: "h-4 w-4 text-muted-foreground" })),
                React.createElement(card_1.CardContent, null,
                    isLoadingSummary ? (React.createElement(skeleton_1.Skeleton, { className: "h-8 w-1/2" })) : (React.createElement("div", { className: "text-2xl font-bold" }, (_b = summary === null || summary === void 0 ? void 0 : summary.productsWithLowStock) !== null && _b !== void 0 ? _b : "-")),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Productos por debajo del nivel de reorden"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "POs Pendientes"),
                    React.createElement(lucide_react_1.Truck, { className: "h-4 w-4 text-muted-foreground" })),
                React.createElement(card_1.CardContent, null,
                    isLoadingSummary ? (React.createElement(skeleton_1.Skeleton, { className: "h-8 w-1/2" })) : (React.createElement("div", { className: "text-2xl font-bold" }, (_c = summary === null || summary === void 0 ? void 0 : summary.pendingPurchaseOrders) !== null && _c !== void 0 ? _c : "-")),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "\u00D3rdenes de compra esperando recepci\u00F3n"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Conteos Activos"),
                    React.createElement(lucide_react_1.Activity, { className: "h-4 w-4 text-muted-foreground" })),
                React.createElement(card_1.CardContent, null,
                    isLoadingSummary ? (React.createElement(skeleton_1.Skeleton, { className: "h-8 w-1/2" })) : (React.createElement("div", { className: "text-2xl font-bold" }, (_d = summary === null || summary === void 0 ? void 0 : summary.activeStockCounts) !== null && _d !== void 0 ? _d : "-")),
                    React.createElement("p", { className: "text-xs text-muted-foreground" }, "Sesiones de conteo en progreso o pendientes")))),
        React.createElement("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3" }, inventorySections.map(function (section) { return (React.createElement(card_1.Card, { key: section.title, className: "flex flex-col hover:shadow-lg transition-shadow" },
            React.createElement(card_1.CardHeader, { className: "pb-4" },
                " ",
                React.createElement("div", { className: "flex items-start justify-between" },
                    React.createElement(section.icon, { className: "h-8 w-8 text-primary mb-2" })),
                React.createElement(card_1.CardTitle, null, section.title),
                React.createElement(card_1.CardDescription, { className: "text-sm min-h-[40px]" }, section.description)),
            section.subLinks && section.subLinks.length > 0 && (React.createElement(card_1.CardContent, { className: "flex-1 pt-0 pb-2" },
                " ",
                React.createElement("h4", { className: "text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider" }, "Accesos Directos:"),
                React.createElement("ul", { className: "space-y-1" }, section.subLinks.map(function (sub) { return (React.createElement("li", { key: sub.title },
                    React.createElement(button_1.Button, { variant: "link", asChild: true, className: "p-0 h-auto font-normal text-sm justify-start" },
                        React.createElement(link_1["default"], { href: sub.href, className: "flex items-center gap-1.5 text-muted-foreground hover:text-primary" },
                            React.createElement(sub.icon, { className: "h-3.5 w-3.5" }),
                            sub.title)))); })))),
            React.createElement(card_1.CardFooter, { className: section.subLinks && section.subLinks.length > 0
                    ? "pt-2"
                    : "pt-6 flex-1 items-end" },
                " ",
                React.createElement(button_1.Button, { asChild: true, className: "w-full" },
                    React.createElement(link_1["default"], { href: section.href },
                        section.title.startsWith("Gestión de") ||
                            section.title.startsWith("Catálogo")
                            ? "Gestionar"
                            : "Ir a",
                        " ",
                        section.title,
                        React.createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" })))))); }))));
}
exports["default"] = InventoryHomePage;
