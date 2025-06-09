// components/dashboard/repairs-overview-widget.tsx
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
var lucide_react_1 = require("lucide-react"); // Iconos
var link_1 = require("next/link");
var button_1 = require("@/components/ui/button");
var scroll_area_1 = require("@/components/ui/scroll-area"); // Para la lista de estados si son muchos
// Mapeo para estados de Reparación (importar de un archivo de constantes/utils o definir aquí)
// Asegúrate de que coincida con tu enum y el que usa la página de listado de reparaciones
var repairStatusLabelsWidget = {
    RECEIVED: "Recibido",
    DIAGNOSING: "Diagnosticando",
    QUOTE_PENDING: "Pend. Cotización",
    QUOTE_APPROVED: "Cotización Aprobada",
    AWAITING_QUOTE_APPROVAL: "Esperando Aprob. Cotización",
    QUOTE_REJECTED: "Cotización Rechazada",
    AWAITING_PARTS: "Esperando Repuestos",
    IN_REPAIR: "En Reparación",
    ASSEMBLING: "Ensamblando",
    TESTING_QC: "Pruebas C. Calidad",
    REPAIR_COMPLETED: "Reparación Interna OK",
    PENDING_PICKUP: "Listo para Entrega",
    COMPLETED_PICKED_UP: "Entregado",
    CANCELLED: "Cancelado",
    UNREPAIRABLE: "No Reparable"
};
function RepairsOverviewWidget(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var _b = react_query_1.useQuery({
        queryKey: [
            "dashboardRepairsOverview",
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
                        return [2 /*return*/, response.data]; // Asumimos que response.data ya tiene el formato de RepairsOverviewData
                }
            });
        }); }
    }), overview = _b.data, isLoading = _b.isLoading, isError = _b.isError, error = _b.error;
    if (isError) {
        return (react_1["default"].createElement(card_1.Card, { className: className },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Resumen de Reparaciones"),
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-destructive" })),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("p", { className: "text-xs text-destructive" },
                    "Error al cargar datos: ",
                    error.message))));
    }
    // Filtrar estados con conteo > 0 o mostrar todos si se prefiere
    var statusesToShow = (overview === null || overview === void 0 ? void 0 : overview.byStatus) ? Object.entries(overview.byStatus)
        .filter(function (_a) {
        var status = _a[0], count = _a[1];
        return count > 0;
    }) // Mostrar solo estados con reparaciones
        .sort(function (_a, _b) {
        var countA = _a[1];
        var countB = _b[1];
        return countB - countA;
    }) // Opcional: ordenar por conteo descendente
        : [];
    return (react_1["default"].createElement(card_1.Card, { className: className },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
            react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center" },
                react_1["default"].createElement(lucide_react_1.Wrench, { className: "h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary" }),
                "Resumen de Reparaciones"),
            react_1["default"].createElement(card_1.CardDescription, { className: "text-xs text-muted-foreground" }, "Estado general de las \u00F3rdenes de reparaci\u00F3n.")),
        react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "space-y-3" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-3/5" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-1/5" })),
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-px w-full my-2" }),
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-4/5" }),
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-3/5" }),
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-4/6" }))) : overview ? (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-3 pb-3 border-b" },
                react_1["default"].createElement("div", { className: "text-sm font-medium" }, "Reparaciones Activas:"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-primary" }, overview.totalActiveRepairs)),
            statusesToShow.length > 0 ? (react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-[120px]" },
                " ",
                react_1["default"].createElement("div", { className: "space-y-1.5 text-xs pr-3" }, statusesToShow.map(function (_a) {
                    var status = _a[0], count = _a[1];
                    return (react_1["default"].createElement(link_1["default"], { href: "/dashboard/repairs?status=" + status, key: status, className: "group flex items-center justify-between py-0.5 hover:bg-muted/50 rounded px-1 -mx-1", title: "Ver " + count + " reparaciones en estado \"" + (repairStatusLabelsWidget[status] || status) + "\"" },
                        react_1["default"].createElement("span", { className: "flex items-center text-muted-foreground group-hover:text-foreground" },
                            react_1["default"].createElement(lucide_react_1.ListTree, { className: "h-3 w-3 mr-2 opacity-70 group-hover:opacity-100" }),
                            repairStatusLabelsWidget[status] || status,
                            ":"),
                        react_1["default"].createElement("span", { className: "font-semibold" }, count)));
                })))) : (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground text-center py-4" }, "No hay reparaciones para mostrar en los estados individuales.")))) : (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No hay datos de reparaciones para el per\u00EDodo."))),
        react_1["default"].createElement(card_1.CardFooter, { className: "pt-3" },
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", asChild: true, className: "w-full" },
                react_1["default"].createElement(link_1["default"], { href: "/dashboard/repairs" }, "Ir a Gesti\u00F3n de Reparaciones")))));
}
exports["default"] = RepairsOverviewWidget;
