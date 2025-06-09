// components/dashboard/charts/top-products-chart.tsx
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
var select_1 = require("@/components/ui/select");
var formatters_1 = require("@/lib/utils/formatters");
var recharts_1 = require("recharts");
var utils_1 = require("@/lib/utils");
var auth_store_1 = require("@/stores/auth.store"); // Para obtener currencySymbol
// Colores para las barras (puedes expandir esta lista o usar una función generadora)
var CHART_BAR_COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
];
function TopProductsChart(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var limit = react_1.useState(7)[0]; // Mostrar Top 7 en el gráfico para no saturar
    var _b = react_1.useState("quantity"), orderBy = _b[0], setOrderBy = _b[1];
    var currencySymbol = auth_store_1.useAuthStore(function (state) { var _a, _b; return (_b = (_a = state.user) === null || _a === void 0 ? void 0 : _a.store) === null || _b === void 0 ? void 0 : _b.currencySymbol; }) || "RD$";
    var _c = react_query_1.useQuery({
        queryKey: [
            "dashboardTopSellingProductsForChart",
            dateRange.startDate,
            dateRange.endDate,
            limit,
            orderBy,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign(__assign({}, dateRange), { limit: limit, orderByCriteria: orderBy });
                        return [4 /*yield*/, api_1["default"].get("/dashboard/top-selling-products", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data || []];
                }
            });
        }); }
    }), topProducts = _c.data, isLoading = _c.isLoading, isError = _c.isError, error = _c.error;
    var chartData = react_1.useMemo(function () {
        if (!topProducts)
            return [];
        return topProducts
            .map(function (product) { return ({
            name: product.productName.length > 25
                ? product.productName.substring(0, 22) + "..."
                : product.productName,
            value: orderBy === "quantity"
                ? product.totalQuantitySold
                : product.totalRevenueGenerated,
            fullProductName: product.productName,
            sku: product.productSku
        }); })
            .reverse(); // Invertir para que el más alto esté arriba en el gráfico horizontal
    }, [topProducts, orderBy]);
    var xAxisTickFormatter = function (value) {
        return orderBy === "revenue" ? formatters_1.formatCurrency(value, "", 0) : value; // Formato corto para eje
    };
    if (isError) {
        return (react_1["default"].createElement(card_1.Card, { className: className },
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Top Productos (Gr\u00E1fico)")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("p", { className: "text-xs text-destructive" },
                    "Error al cargar datos: ", error === null || error === void 0 ? void 0 :
                    error.message))));
    }
    return (react_1["default"].createElement(card_1.Card, { className: utils_1.cn("h-[400px] flex flex-col", className) },
        " ",
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
            react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center" },
                    react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-5 w-5 mr-2 text-muted-foreground" }),
                    "Productos M\u00E1s Vendidos"),
                react_1["default"].createElement(select_1.Select, { value: orderBy, onValueChange: function (value) { return setOrderBy(value); } },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "h-8 w-full sm:w-[150px] text-xs" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Ordenar por..." })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "quantity" }, "Por Cantidad"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "revenue" }, "Por Ingresos"))))),
        react_1["default"].createElement(card_1.CardContent, { className: "flex-1 pt-2 pb-1" },
            " ",
            isLoading ? (react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-full w-full" })) : chartData && chartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                react_1["default"].createElement(recharts_1.BarChart, { data: chartData, layout: "vertical", margin: { top: 5, right: 35, left: 10, bottom: 5 } },
                    react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", horizontal: false, strokeOpacity: 0.3 }),
                    react_1["default"].createElement(recharts_1.XAxis, { type: "number", style: { fontSize: "0.65rem" }, tickFormatter: xAxisTickFormatter }),
                    react_1["default"].createElement(recharts_1.YAxis, { type: "category", dataKey: "name" // Nombres acortados
                        , width: 100, style: { fontSize: "0.65rem", fill: "hsl(var(--foreground))" }, interval: 0, tickLine: false, axisLine: false }),
                    react_1["default"].createElement(recharts_1.Tooltip, { cursor: { fill: "hsl(var(--muted))", opacity: 0.5 }, contentStyle: {
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "var(--radius)",
                            fontSize: "0.75rem",
                            padding: "4px 8px"
                        }, formatter: function (value, nameKey, props) {
                            var payload = props.payload; // payload contiene el objeto de datos completo del item de la barra
                            var displayValue = orderBy === "revenue"
                                ? formatters_1.formatCurrency(value, currencySymbol)
                                : value + " und.";
                            return [displayValue, payload.fullProductName]; // Mostrar nombre completo en tooltip
                        } }),
                    react_1["default"].createElement(recharts_1.Bar, { dataKey: "value", layout: "vertical", radius: [0, 4, 4, 0], barSize: 12 }, chartData.map(function (entry, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: "cell-" + index, fill: CHART_BAR_COLORS[index % CHART_BAR_COLORS.length] })); }))))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-full" },
                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "No hay datos de productos para graficar."))))));
}
exports["default"] = TopProductsChart;
