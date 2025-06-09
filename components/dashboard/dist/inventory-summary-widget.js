// components/dashboard/inventory-summary-widget.tsx
"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var card_1 = require("@/components/ui/card");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react"); // Iconos relevantes
var link_1 = require("next/link");
function InventorySummaryWidget(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var _b = react_query_1.useQuery({
        queryKey: [
            "dashboardInventorySummary",
            dateRange.startDate,
            dateRange.endDate,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign({}, dateRange);
                        return [4 /*yield*/, api_1["default"].get("/dashboard/inventory-summary", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data]; // Asumimos que response.data ya tiene el formato de InventorySummaryData
                }
            });
        }); }
    }), summary = _b.data, isLoading = _b.isLoading, isError = _b.isError, error = _b.error;
    if (isError) {
        return (react_1["default"].createElement(card_1.Card, { className: className },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Resumen de Inventario"),
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-destructive" })),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("p", { className: "text-xs text-destructive" },
                    "Error al cargar datos: ",
                    error.message))));
    }
    return (react_1["default"].createElement(card_1.Card, { className: className },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
            react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold" }, "Resumen de Inventario"),
            react_1["default"].createElement(card_1.CardDescription, { className: "text-xs text-muted-foreground" }, "Estado actual y alertas clave.")),
        react_1["default"].createElement(card_1.CardContent, { className: "grid gap-2 text-sm" }, isLoading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-3/5" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-1/5" })),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-3/5" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-1/5" })),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-3/5" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-1/5" })),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-3/5" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-1/5" })))) : summary ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(link_1["default"], { href: "/dashboard/inventory/catalog/products", className: "group" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1" },
                    react_1["default"].createElement("span", { className: "flex items-center" },
                        react_1["default"].createElement(lucide_react_1.Package, { className: "h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" }),
                        " ",
                        "Productos Activos:"),
                    react_1["default"].createElement("span", { className: "font-semibold" }, summary.totalActiveProducts))),
            react_1["default"].createElement("div", { className: "flex items-center justify-between py-1 px-1 -mx-1" },
                react_1["default"].createElement("span", { className: "flex items-center" },
                    react_1["default"].createElement(lucide_react_1.ArchiveRestore, { className: "h-4 w-4 mr-2 " + (summary.productsWithLowStock > 0
                            ? "text-destructive"
                            : "text-muted-foreground") }),
                    "Productos con Stock Bajo:"),
                react_1["default"].createElement("span", { className: "font-semibold " + (summary.productsWithLowStock > 0 ? "text-destructive" : "") }, summary.productsWithLowStock)),
            react_1["default"].createElement(link_1["default"], { href: "/dashboard/inventory/purchase-orders?status=ORDERED&status=PARTIALLY_RECEIVED", className: "group" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1" },
                    react_1["default"].createElement("span", { className: "flex items-center" },
                        react_1["default"].createElement(lucide_react_1.Truck, { className: "h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" }),
                        " ",
                        "POs Pendientes Recibir:"),
                    react_1["default"].createElement("span", { className: "font-semibold" }, summary.pendingPurchaseOrders))),
            react_1["default"].createElement(link_1["default"], { href: "/dashboard/inventory/stock-counts?status=PENDING&status=IN_PROGRESS", className: "group" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1" },
                    react_1["default"].createElement("span", { className: "flex items-center" },
                        react_1["default"].createElement(lucide_react_1.ListChecks, { className: "h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary" }),
                        " ",
                        "Conteos de Stock Activos:"),
                    react_1["default"].createElement("span", { className: "font-semibold" }, summary.activeStockCounts))))) : (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No hay datos de inventario para mostrar.")))));
}
exports["default"] = InventorySummaryWidget;
