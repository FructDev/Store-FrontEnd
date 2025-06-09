// components/dashboard/sales-by-salesperson-widget.tsx
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var card_1 = require("@/components/ui/card");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react");
var formatters_1 = require("@/lib/utils/formatters");
var link_1 = require("next/link");
var button_1 = require("@/components/ui/button");
function SalesBySalespersonWidget(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var limit = react_1.useState(5)[0]; // Mostrar Top 5 vendedores en el widget
    var _b = react_query_1.useQuery({
        // Espera un array
        queryKey: [
            "dashboardSalesBySalesperson",
            dateRange.startDate,
            dateRange.endDate,
            limit,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign(__assign({}, dateRange), { limit: limit });
                        return [4 /*yield*/, api_1["default"].get("/dashboard/sales-by-salesperson", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data || []]; // El backend ya debería devolver un array
                }
            });
        }); }
    }), salesBySalesperson = _b.data, isLoading = _b.isLoading, isError = _b.isError, error = _b.error;
    if (isError) {
        return (react_1["default"].createElement(card_1.Card, { className: className },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Ventas por Vendedor"),
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-destructive" })),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("p", { className: "text-xs text-destructive" },
                    "Error al cargar datos: ",
                    error.message))));
    }
    return (react_1["default"].createElement(card_1.Card, { className: className },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary" }),
                    "Top ",
                    limit,
                    " Vendedores")),
            react_1["default"].createElement(card_1.CardDescription, { className: "text-xs text-muted-foreground pt-1" }, "Rendimiento de vendedores en el per\u00EDodo seleccionado.")),
        react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "space-y-3" }, __spreadArrays(Array(limit)).map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center justify-between" },
            react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-6 rounded-full" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-24" })),
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-16" }))); }))) : salesBySalesperson && salesBySalesperson.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-2.5 text-xs" }, salesBySalesperson.map(function (item, index) { return (react_1["default"].createElement("div", { key: item.salespersonId || index, className: "flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1" },
            react_1["default"].createElement("div", { className: "flex items-center truncate" },
                react_1["default"].createElement("span", { className: "font-medium mr-2" },
                    index + 1,
                    "."),
                react_1["default"].createElement(lucide_react_1.UserCheck, { className: "h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" }),
                react_1["default"].createElement("span", { className: "truncate", title: ((item.salespersonFirstName || "") + " " + (item.salespersonLastName || "")).trim() }, ((item.salespersonFirstName || "") + " " + (item.salespersonLastName || "Desconocido")).trim())),
            react_1["default"].createElement("div", { className: "text-right" },
                react_1["default"].createElement("span", { className: "font-semibold whitespace-nowrap block" }, formatters_1.formatCurrency(item.totalSalesAmount)),
                react_1["default"].createElement("span", { className: "text-muted-foreground text-[10px]" },
                    item.numberOfSales,
                    " ventas")))); }))) : (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No hay datos de ventas por vendedor para mostrar."))),
        react_1["default"].createElement(card_1.CardFooter, { className: "pt-3" },
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", asChild: true, className: "w-full" },
                react_1["default"].createElement(link_1["default"], { href: "/dashboard/reports/sales?reportType=salesBySalesperson", className: "block truncate" },
                    react_1["default"].createElement("span", { className: "truncate" }, "Ver Reporte Completo de Vendedores"))))));
}
exports["default"] = SalesBySalespersonWidget;
