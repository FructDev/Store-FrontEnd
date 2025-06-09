// components/dashboard/sales-summary-widget.tsx
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
var lucide_react_1 = require("lucide-react");
var formatters_1 = require("@/lib/utils/formatters"); // Tu formatter
function SalesSummaryWidget(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var _b = react_query_1.useQuery({
        queryKey: ["dashboardSalesSummary", dateRange.startDate, dateRange.endDate],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign({}, dateRange);
                        return [4 /*yield*/, api_1["default"].get("/dashboard/sales-summary", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); }
    }), summary = _b.data, isLoading = _b.isLoading, isError = _b.isError, error = _b.error;
    if (isError) {
        return (react_1["default"].createElement(card_1.Card, { className: className },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Resumen de Ventas"),
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-destructive" })),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("p", { className: "text-xs text-destructive" },
                    "Error al cargar datos: ",
                    error.message))));
    }
    var periodText = (summary === null || summary === void 0 ? void 0 : summary.periodStartDate) && (summary === null || summary === void 0 ? void 0 : summary.periodEndDate)
        ? formatters_1.formatDate(summary.periodStartDate, "dd MMM") + " - " + formatters_1.formatDate(summary.periodEndDate, "dd MMM")
        : "el período seleccionado";
    return (react_1["default"].createElement(card_1.Card, { className: className },
        react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Resumen de Ventas"),
            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" })),
        react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-3/4 mb-1" }),
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-1/2 mb-3" }),
            react_1["default"].createElement("div", { className: "space-y-2" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-full" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-full" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-2/3" })))) : summary ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", { className: "text-2xl font-bold" }, formatters_1.formatCurrency(summary.totalSalesRevenue)),
            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                "Ingresos totales en ",
                periodText),
            react_1["default"].createElement("div", { className: "mt-3 space-y-1 text-xs" },
                react_1["default"].createElement("div", { className: "flex justify-between" },
                    react_1["default"].createElement("span", null, "N\u00FAmero de Ventas:"),
                    react_1["default"].createElement("span", { className: "font-semibold" }, summary.numberOfSales)),
                react_1["default"].createElement("div", { className: "flex justify-between" },
                    react_1["default"].createElement("span", null, "Ticket Promedio:"),
                    react_1["default"].createElement("span", { className: "font-semibold" }, formatters_1.formatCurrency(summary.averageSaleValue))),
                summary.grossProfit !== undefined && (react_1["default"].createElement("div", { className: "flex justify-between" },
                    react_1["default"].createElement("span", null, "Ganancia Bruta:"),
                    react_1["default"].createElement("span", { className: "font-semibold" }, formatters_1.formatCurrency(summary.grossProfit))))))) : (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "`` No hay datos de ventas para el per\u00EDodo.")))));
}
exports["default"] = SalesSummaryWidget;
