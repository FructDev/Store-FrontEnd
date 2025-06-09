// components/dashboard/charts/sales-by-salesperson-chart.tsx
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
var lucide_react_1 = require("lucide-react"); // BarChartBig o Users2
var select_1 = require("@/components/ui/select");
var formatters_1 = require("@/lib/utils/formatters");
var recharts_1 = require("recharts");
var utils_1 = require("@/lib/utils");
var auth_store_1 = require("@/stores/auth.store");
// Colores para las barras (puedes expandir esta lista o usar una función generadora)
var CHART_BAR_COLORS_SALESPERSON = [
    "#82ca9d",
    "#8884d8",
    "#ffc658",
    "#00C49F",
    "#FF8042",
    "#0088FE",
];
function SalesBySalespersonChart(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var limit = react_1.useState(7)[0]; // Mostrar Top 7 vendedores
    var _b = react_1.useState("totalSalesAmount"), orderBy = _b[0], setOrderBy = _b[1]; // Default a monto
    var currencySymbol = auth_store_1.useAuthStore(function (state) { var _a, _b; return (_b = (_a = state.user) === null || _a === void 0 ? void 0 : _a.store) === null || _b === void 0 ? void 0 : _b.currencySymbol; }) || "RD$";
    var _c = react_query_1.useQuery({
        queryKey: [
            "dashboardSalesBySalespersonChartData",
            dateRange.startDate,
            dateRange.endDate,
            limit,
            orderBy,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign(__assign({}, dateRange), { limit: limit });
                        return [4 /*yield*/, api_1["default"].get("/dashboard/sales-by-salesperson", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        data = response.data || [];
                        // Re-ordenar en el frontend si es necesario (si el backend no soporta el orderBy deseado)
                        if (orderBy === "numberOfSales") {
                            data.sort(function (a, b) {
                                return b.numberOfSales - a.numberOfSales;
                            });
                        }
                        // Ya viene ordenado por totalSalesAmount desde el backend si no se especifica otra cosa
                        return [2 /*return*/, data.slice(0, limit)]; // Asegurar el límite en el cliente también
                }
            });
        }); }
    }), salesBySalesperson = _c.data, isLoading = _c.isLoading, isError = _c.isError;
    var chartData = react_1.useMemo(function () {
        if (!salesBySalesperson)
            return [];
        return salesBySalesperson.map(function (item) { return ({
            name: ((item.salespersonFirstName || "") + " " + (item.salespersonLastName || "N/A"))
                .trim()
                .substring(0, 15),
            value: orderBy === "totalSalesAmount"
                ? item.totalSalesAmount
                : item.numberOfSales,
            fullSalespersonName: ((item.salespersonFirstName || "") + " " + (item.salespersonLastName || "N/A")).trim(),
            salesCount: item.numberOfSales,
            salesAmount: item.totalSalesAmount
        }); });
        // No es necesario .reverse() para BarChart vertical si el eje X es la categoría
    }, [salesBySalesperson, orderBy]);
    var xAxisTickFormatter = function (value) {
        return orderBy === "totalSalesAmount"
            ? formatters_1.formatCurrency(value, "", 0)
            : value;
    };
    if (isError) {
        /* ... tu manejo de error ... */
    }
    return (react_1["default"].createElement(card_1.Card, { className: utils_1.cn("h-[400px] flex flex-col", className) },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
            react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5 mr-2 text-muted-foreground" }),
                    "Top Vendedores"),
                react_1["default"].createElement(select_1.Select, { value: orderBy, onValueChange: function (value) { return setOrderBy(value); } },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "h-8 w-full sm:w-[180px] text-xs" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Ordenar por..." })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "totalSalesAmount" }, "Por Monto Vendido"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "numberOfSales" }, "Por N\u00BA de Ventas"))))),
        react_1["default"].createElement(card_1.CardContent, { className: "flex-1 pt-2 pb-1" }, isLoading ? (react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-full w-full" })) : chartData && chartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
            react_1["default"].createElement(recharts_1.BarChart, { data: chartData, layout: "horizontal" // Barras verticales (categorías en X, valores en Y)
                , margin: { top: 5, right: 20, left: 5, bottom: 20 } },
                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", vertical: false, strokeOpacity: 0.3 }),
                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", angle: -35, textAnchor: "end", height: 50, interval: 0, style: { fontSize: "0.65rem", fill: "hsl(var(--foreground))" } }),
                react_1["default"].createElement(recharts_1.YAxis, { style: { fontSize: "0.65rem", fill: "hsl(var(--foreground))" }, tickFormatter: xAxisTickFormatter }),
                react_1["default"].createElement(recharts_1.Tooltip, { cursor: { fill: "hsl(var(--muted))", opacity: 0.5 }, contentStyle: {
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        fontSize: "0.75rem",
                        padding: "4px 8px"
                    }, formatter: function (value, nameKey, props) {
                        var payload = props.payload;
                        var label = orderBy === "totalSalesAmount"
                            ? "Monto Total:"
                            : "Nº Ventas:";
                        var displayValue = orderBy === "totalSalesAmount"
                            ? formatters_1.formatCurrency(value, currencySymbol)
                            : "" + value;
                        return [displayValue, label];
                    }, labelFormatter: function (label, payload) { var _a; return ((_a = payload === null || payload === void 0 ? void 0 : payload[0]) === null || _a === void 0 ? void 0 : _a.payload.fullSalespersonName) || label; } }),
                react_1["default"].createElement(recharts_1.Bar, { dataKey: "value", radius: [4, 4, 0, 0], barSize: 20 }, chartData.map(function (entry, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: "cell-" + index, fill: CHART_BAR_COLORS_SALESPERSON[index % CHART_BAR_COLORS_SALESPERSON.length] })); }))))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-full" },
            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "No hay datos de ventas por vendedor."))))));
}
exports["default"] = SalesBySalespersonChart;
