// components/dashboard/charts/sales-trend-chart.tsx
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
var recharts_1 = require("recharts");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var formatters_1 = require("@/lib/utils/formatters");
function SalesTrendChart(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var _b = react_query_1.useQuery({
        queryKey: [
            "dashboardSalesTrendChartData",
            dateRange.startDate,
            dateRange.endDate,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign({}, dateRange);
                        return [4 /*yield*/, api_1["default"].get("/dashboard/sales-trend", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data || []];
                }
            });
        }); },
        enabled: !!dateRange.startDate && !!dateRange.endDate
    }), trendData = _b.data, isLoading = _b.isLoading, isError = _b.isError;
    if (isError) {
        /* ... manejo de error ... */
    }
    var chartData = trendData === null || trendData === void 0 ? void 0 : trendData.map(function (item) { return ({
        name: date_fns_1.format(date_fns_1.parseISO(item.date), "dd MMM", { locale: locale_1.es }),
        Ingresos: item.totalRevenue,
        Ventas: item.numberOfSales
    }); });
    var periodText = dateRange.startDate && dateRange.endDate
        ? date_fns_1.formatDate(dateRange.startDate, "dd MMM yy") + " - " + date_fns_1.formatDate(dateRange.endDate, "dd MMM yy")
        : "período seleccionado";
    return (react_1["default"].createElement(card_1.Card, { className: className },
        react_1["default"].createElement(card_1.CardHeader, null,
            react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center" },
                react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5 mr-2 text-blue-600" }),
                "Tendencia de Ventas"),
            react_1["default"].createElement(card_1.CardDescription, { className: "text-xs text-muted-foreground" },
                "Ingresos y n\u00FAmero de ventas en ",
                periodText,
                ".")),
        react_1["default"].createElement(card_1.CardContent, { className: "h-[300px] pt-4" },
            " ",
            isLoading ? (react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-full w-full" })) : chartData && chartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                react_1["default"].createElement(recharts_1.LineChart, { data: chartData, margin: { top: 5, right: 20, left: -20, bottom: 5 } },
                    react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", strokeOpacity: 0.5 }),
                    react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", style: { fontSize: "0.7rem" }, tickFormatter: function (value) { return value.split(" ")[0]; }, interval: "preserveStartEnd" }),
                    react_1["default"].createElement(recharts_1.YAxis, { yAxisId: "left", label: {
                            value: "Ingresos",
                            angle: -90,
                            position: "insideLeft",
                            style: { fontSize: "0.7rem", fill: "#8884d8" }
                        }, style: { fontSize: "0.7rem" }, tickFormatter: function (value) { return formatters_1.formatCurrency(value, "", 0); } }),
                    react_1["default"].createElement(recharts_1.YAxis, { yAxisId: "right", orientation: "right", label: {
                            value: "Nº Ventas",
                            angle: 90,
                            position: "insideRight",
                            style: { fontSize: "0.7rem", fill: "#82ca9d" }
                        }, style: { fontSize: "0.7rem" } }),
                    react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { fontSize: "0.75rem", padding: "4px 8px" }, formatter: function (value, name) {
                            return name === "Ingresos" ? formatters_1.formatCurrency(value) : value;
                        } }),
                    react_1["default"].createElement(recharts_1.Legend, { wrapperStyle: { fontSize: "0.75rem" } }),
                    react_1["default"].createElement(recharts_1.Line, { yAxisId: "left", type: "monotone", dataKey: "Ingresos", stroke: "#8884d8", strokeWidth: 2, dot: { r: 3 }, activeDot: { r: 5 }, name: "Ingresos Totales" }),
                    react_1["default"].createElement(recharts_1.Line, { yAxisId: "right", type: "monotone", dataKey: "Ventas", stroke: "#82ca9d", strokeWidth: 2, dot: { r: 3 }, activeDot: { r: 5 }, name: "N\u00BA de Ventas" })))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-full" },
                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "No hay datos de tendencia para mostrar."))))));
}
exports["default"] = SalesTrendChart;
