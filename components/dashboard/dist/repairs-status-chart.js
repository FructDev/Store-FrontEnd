// components/dashboard/charts/repairs-status-chart.tsx
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
var _a;
exports.__esModule = true;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var card_1 = require("@/components/ui/card");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react"); // PieIcon como alias
var recharts_1 = require("recharts");
// import { RepairStatus as repairStatusLabels } from "@/types/prisma-enums"; // Importa tus etiquetas
var date_fns_1 = require("date-fns");
var repairStatusLabels = (_a = {},
    _a[prisma_enums_1.RepairStatus.RECEIVED] = "Recibido",
    _a[prisma_enums_1.RepairStatus.DIAGNOSING] = "Diagnosticando",
    _a[prisma_enums_1.RepairStatus.QUOTE_PENDING] = "Pend. Cotización",
    _a[prisma_enums_1.RepairStatus.QUOTE_APPROVED] = "Cotización Aprobada",
    _a[prisma_enums_1.RepairStatus.AWAITING_QUOTE_APPROVAL] = "Esperando Aprob. Cotización",
    _a[prisma_enums_1.RepairStatus.QUOTE_REJECTED] = "Cotización Rechazada",
    _a[prisma_enums_1.RepairStatus.AWAITING_PARTS] = "Esperando Repuestos",
    _a[prisma_enums_1.RepairStatus.IN_REPAIR] = "En Reparación",
    _a[prisma_enums_1.RepairStatus.ASSEMBLING] = "Ensamblando",
    _a[prisma_enums_1.RepairStatus.TESTING_QC] = "Pruebas C. Calidad",
    _a[prisma_enums_1.RepairStatus.REPAIR_COMPLETED] = "Reparación Interna OK",
    _a[prisma_enums_1.RepairStatus.PENDING_PICKUP] = "Listo para Entrega",
    _a[prisma_enums_1.RepairStatus.COMPLETED_PICKED_UP] = "Entregado",
    _a[prisma_enums_1.RepairStatus.CANCELLED] = "Cancelado",
    _a[prisma_enums_1.RepairStatus.UNREPAIRABLE] = "No Reparable",
    _a);
// -
// Colores para el gráfico de Pie (puedes definir más o usar una función para generarlos)
var PIE_CHART_COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
    "#ffc658",
    "#FF7F7F",
    "#D8BFD8",
    "#ADD8E6",
];
function RepairsStatusChart(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var _b = react_query_1.useQuery({
        queryKey: [
            "dashboardRepairsOverviewChartData",
            dateRange.startDate,
            dateRange.endDate,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign({}, dateRange);
                        return [4 /*yield*/, api_1["default"].get("/dashboard/repairs-overview", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); }
    }), overview = _b.data, isLoading = _b.isLoading, isError = _b.isError;
    if (isError) {
        /* ... manejo de error ... */
    }
    var chartData = react_1.useMemo(function () {
        if (!(overview === null || overview === void 0 ? void 0 : overview.byStatus))
            return [];
        return Object.entries(overview.byStatus)
            .filter(function (_a) {
            var status = _a[0], count = _a[1];
            return count > 0;
        }) // Solo estados con conteo > 0
            .map(function (_a) {
            var status = _a[0], count = _a[1];
            return ({
                name: repairStatusLabels[status] || status,
                value: count
            });
        })
            .sort(function (a, b) { return b.value - a.value; }); // Ordenar por mayor conteo
    }, [overview]);
    var periodText = (overview === null || overview === void 0 ? void 0 : overview.periodStartDate) && (overview === null || overview === void 0 ? void 0 : overview.periodEndDate)
        ? date_fns_1.formatDate(overview.periodStartDate, "dd MMM yy") + " - " + date_fns_1.formatDate(overview.periodEndDate, "dd MMM yy")
        : "todos los tiempos";
    return (react_1["default"].createElement(card_1.Card, { className: className },
        react_1["default"].createElement(card_1.CardHeader, null,
            react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center" },
                react_1["default"].createElement(lucide_react_1.PieChart, { className: "h-5 w-5 mr-2 text-purple-600" }),
                "Distribuci\u00F3n de Estados de Reparaci\u00F3n"),
            react_1["default"].createElement(card_1.CardDescription, { className: "text-xs text-muted-foreground" },
                "Reparaciones recibidas en ",
                periodText,
                ".")),
        react_1["default"].createElement(card_1.CardContent, { className: "h-[300px] pt-4" }, isLoading ? (react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-full w-full" })) : chartData && chartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
            react_1["default"].createElement(recharts_1.PieChart, null,
                react_1["default"].createElement(recharts_1.Pie, { data: chartData, cx: "50%", cy: "50%", labelLine: false, 
                    // label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} // Etiqueta en el Pie
                    outerRadius: 80, innerRadius: 40, fill: "#8884d8", dataKey: "value", paddingAngle: 2 }, chartData.map(function (entry, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: "cell-" + index, fill: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] })); })),
                react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return [value + " reparaciones", "Cantidad"]; } }),
                react_1["default"].createElement(recharts_1.Legend, { layout: "vertical", align: "right", verticalAlign: "middle", wrapperStyle: { fontSize: "0.75rem", lineHeight: "1.5" } })))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-full" },
            react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, "No hay datos de reparaciones para mostrar."))))));
}
exports["default"] = RepairsStatusChart;
