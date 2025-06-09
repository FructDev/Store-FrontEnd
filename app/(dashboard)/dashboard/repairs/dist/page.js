// app/(dashboard)/repairs/page.tsx
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
var _a;
exports.__esModule = true;
exports.repairStatusLabels = void 0;
var react_1 = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var button_1 = require("@/components/ui/button");
var page_header_1 = require("@/components/common/page-header");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var date_range_picker_1 = require("@/components/ui/date-range-picker");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var date_fns_1 = require("date-fns"); // parseISO para manejar strings de fecha del backend
// import { es } from "date-fns/locale";
var use_debounce_1 = require("@/hooks/use-debounce"); // Asumiendo que tienes este hook
var card_1 = require("@/components/ui/card");
var utils_1 = require("@/lib/utils");
// No necesitamos FormLabel aquí si usamos <p> o <label> HTML para el DatePicker
// Mapeo para estados de Reparación
exports.repairStatusLabels = (_a = {},
    _a[prisma_enums_1.RepairStatus.RECEIVED] = "Recibido",
    _a[prisma_enums_1.RepairStatus.DIAGNOSING] = "Diagnosticando",
    _a[prisma_enums_1.RepairStatus.QUOTE_PENDING] = "Pend. Cotización",
    _a[prisma_enums_1.RepairStatus.AWAITING_QUOTE_APPROVAL] = "Esperando Aprob. Cotización",
    _a[prisma_enums_1.RepairStatus.QUOTE_REJECTED] = "Cotización Rechazada",
    _a[prisma_enums_1.RepairStatus.AWAITING_PARTS] = "Esperando Repuestos",
    _a[prisma_enums_1.RepairStatus.IN_REPAIR] = "En Reparación",
    _a[prisma_enums_1.RepairStatus.ASSEMBLING] = "Ensamblando",
    _a[prisma_enums_1.RepairStatus.TESTING_QC] = "Pruebas C. Calidad",
    _a[prisma_enums_1.RepairStatus.REPAIR_COMPLETED] = "Reparación Interna OK",
    _a[prisma_enums_1.RepairStatus.PENDING_PICKUP] = "Listo para Entrega",
    _a[prisma_enums_1.RepairStatus.COMPLETED_PICKED_UP] = "Entregado al Cliente",
    _a[prisma_enums_1.RepairStatus.CANCELLED] = "Cancelado",
    _a[prisma_enums_1.RepairStatus.UNREPAIRABLE] = "No Reparable",
    _a);
var ALL_REPAIR_STATUSES = Object.values(prisma_enums_1.RepairStatus);
// Asumo que tienes una función formatCurrency global o la defines aquí
var formatCurrency = function (amount, currencySymbol) {
    if (currencySymbol === void 0) { currencySymbol = "RD$"; }
    if (amount === null || amount === undefined)
        return "-";
    var numericAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (isNaN(numericAmount))
        return "-";
    // Intl.NumberFormat es más robusto para formateo de moneda
    try {
        return new Intl.NumberFormat("es-DO", {
            style: "currency",
            currency: "DOP"
        })
            .format(numericAmount)
            .replace("DOP", currencySymbol); // Reemplazar código ISO por símbolo si es necesario
    }
    catch (e) {
        return currencySymbol + " " + numericAmount.toFixed(2); // Fallback simple
    }
};
function RepairsListPage() {
    var _this = this;
    var _a, _b, _c;
    var router = navigation_1.useRouter();
    //   const queryClient = useQueryClient();
    var _d = react_1.useState(1), currentPage = _d[0], setCurrentPage = _d[1];
    var limitPerPage = react_1.useState(10)[0];
    // Estados para Filtros
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 500);
    var _f = react_1.useState("all"), filterStatus = _f[0], setFilterStatus = _f[1];
    var _g = react_1.useState("all"), filterCustomerId = _g[0], setFilterCustomerId = _g[1];
    var _h = react_1.useState("all"), filterTechnicianId = _h[0], setFilterTechnicianId = _h[1];
    var _j = react_1.useState(undefined), dateRange = _j[0], setDateRange = _j[1];
    // Fetch para Clientes (para el filtro)
    var _k = react_query_1.useQuery({
        queryKey: ["allActiveCustomersForRepairFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/customers?isActive=true&limit=500&page=1") // Pedir suficientes para un select
                .then(function (res) { return res.data.data || res.data || []; });
        },
        staleTime: 1000 * 60 * 5
    }), customers = _k.data, isLoadingCustomers = _k.isLoading;
    // Fetch para Técnicos/Usuarios (para el filtro)
    var _l = react_query_1.useQuery({
        queryKey: ["allActiveTechniciansForRepairFilter"],
        // Asume un endpoint que devuelve usuarios que pueden ser técnicos, o todos los usuarios activos
        queryFn: function () {
            return api_1["default"]
                .get("/users?isActive=true&limit=500&page=1") // Pedir suficientes
                .then(function (res) { return res.data.data || res.data || []; });
        },
        staleTime: 1000 * 60 * 5
    }), technicians = _l.data, isLoadingTechnicians = _l.isLoading;
    var _m = react_query_1.useQuery({
        queryKey: [
            "repairsList",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
            filterStatus,
            filterCustomerId,
            filterTechnicianId,
            (_a = dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) === null || _a === void 0 ? void 0 : _a.toISOString(),
            (_b = dateRange === null || dateRange === void 0 ? void 0 : dateRange.to) === null || _b === void 0 ? void 0 : _b.toISOString(),
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response, parsedData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            page: currentPage,
                            limit: limitPerPage,
                            sortBy: "receivedAt",
                            sortOrder: "desc"
                        };
                        if (debouncedSearchTerm)
                            params.search = debouncedSearchTerm;
                        if (filterStatus !== "all")
                            params.status = filterStatus;
                        if (filterCustomerId !== "all")
                            params.customerId = filterCustomerId;
                        if (filterTechnicianId !== "all")
                            params.technicianId = filterTechnicianId;
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from)
                            params.startDate = date_fns_1.format(dateRange.from, "yyyy-MM-dd");
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to)
                            params.endDate = date_fns_1.format(dateRange.to, "yyyy-MM-dd");
                        return [4 /*yield*/, api_1["default"].get("/repairs", { params: params })];
                    case 1:
                        response = _a.sent();
                        parsedData = (response.data.data || []).map(function (repair) { return (__assign(__assign({}, repair), { quotedAmount: repair.quotedAmount !== null && repair.quotedAmount !== undefined
                                ? parseFloat(String(repair.quotedAmount))
                                : null, totalRepairAmount: repair.totalRepairAmount !== null &&
                                repair.totalRepairAmount !== undefined
                                ? parseFloat(String(repair.totalRepairAmount))
                                : null })); });
                        return [2 /*return*/, __assign(__assign({}, response.data), { data: parsedData, total: response.data.total || 0, totalPages: response.data.totalPages || 0, page: response.data.page || 1, limit: response.data.limit || 10 })];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedRepairs = _m.data, isLoading = _m.isLoading, isError = _m.isError, error = _m.error, isFetching = _m.isFetching;
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedRepairs && currentPage < paginatedRepairs.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    react_1.useEffect(function () {
        setCurrentPage(1); // Resetear a página 1 cuando los filtros cambian
    }, [
        debouncedSearchTerm,
        filterStatus,
        filterCustomerId,
        filterTechnicianId,
        dateRange,
    ]);
    var navigateToDetail = function (repairId) {
        router.push("/dashboard/repairs/" + repairId);
    };
    var clearFilters = function () {
        setSearchTerm("");
        setFilterStatus("all");
        setFilterCustomerId("all");
        setFilterTechnicianId("all");
        setDateRange(undefined);
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "\u00D3rdenes de Reparaci\u00F3n", description: "Gestiona todas las reparaciones de dispositivos de tus clientes.", actionButton: react_1["default"].createElement(button_1.Button, { asChild: true },
                react_1["default"].createElement(link_1["default"], { href: "/dashboard/repairs/new" },
                    react_1["default"].createElement(lucide_react_1.Wrench, { className: "mr-2 h-4 w-4" }),
                    " Registrar Nueva Reparaci\u00F3n")) }),
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between py-4 px-6" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "mr-2 h-5 w-5 text-muted-foreground" }),
                    "Filtros"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: clearFilters, size: "sm", className: "text-sm text-muted-foreground hover:text-primary" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "mr-1 h-4 w-4" }),
                    " Limpiar Filtros")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-6 pb-6" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end" },
                    react_1["default"].createElement("div", { className: "relative" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                        react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar N\u00BA, Cliente, IMEI...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10 h-10" })),
                    react_1["default"].createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                        react_1["default"].createElement(select_1.SelectTrigger, { className: "h-10" },
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Estado..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Estados"),
                            ALL_REPAIR_STATUSES.map(function (statusValue) { return (react_1["default"].createElement(select_1.SelectItem, { key: statusValue, value: statusValue }, exports.repairStatusLabels[statusValue] || statusValue)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterCustomerId, onValueChange: setFilterCustomerId, disabled: isLoadingCustomers },
                        react_1["default"].createElement(select_1.SelectTrigger, { className: "h-10" },
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Cliente..." })),
                        react_1["default"].createElement(select_1.SelectContent, { className: "max-h-72" },
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Clientes"),
                            isLoadingCustomers && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-cust", disabled: true }, "Cargando clientes...")), customers === null || customers === void 0 ? void 0 :
                            customers.map(function (c) { return (react_1["default"].createElement(select_1.SelectItem, { key: c.id, value: c.id },
                                c.firstName,
                                " ",
                                c.lastName)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterTechnicianId, onValueChange: setFilterTechnicianId, disabled: isLoadingTechnicians },
                        react_1["default"].createElement(select_1.SelectTrigger, { className: "h-10" },
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "T\u00E9cnico..." })),
                        react_1["default"].createElement(select_1.SelectContent, { className: "max-h-72" },
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los T\u00E9cnicos"),
                            isLoadingTechnicians && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-tech", disabled: true }, "Cargando t\u00E9cnicos...")), technicians === null || technicians === void 0 ? void 0 :
                            technicians.map(function (tech) { return (react_1["default"].createElement(select_1.SelectItem, { key: tech.id, value: tech.id },
                                tech.firstName,
                                " ",
                                tech.lastName)); }))),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement("p", { className: "text-sm font-medium text-foreground" }, "Fecha de Recepci\u00F3n"),
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { date: dateRange, onDateChange: setDateRange, className: "w-full h-10" }))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "N\u00BA Reparaci\u00F3n"),
                            react_1["default"].createElement(table_1.TableHead, null, "Recibido"),
                            react_1["default"].createElement(table_1.TableHead, null, "Cliente"),
                            react_1["default"].createElement(table_1.TableHead, null, "Dispositivo"),
                            react_1["default"].createElement(table_1.TableHead, null, "T\u00E9cnico"),
                            react_1["default"].createElement(table_1.TableHead, null, "Estado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Monto Cotizado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Acciones"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-repair-" + i }, __spreadArrays(Array(8)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center text-red-500 py-10" },
                            "Error cargando reparaciones: ",
                            error.message))) : ((_c = paginatedRepairs === null || paginatedRepairs === void 0 ? void 0 : paginatedRepairs.data) === null || _c === void 0 ? void 0 : _c.length) === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-10 text-muted-foreground" }, "No se encontraron \u00F3rdenes de reparaci\u00F3n con los filtros actuales."))) : (paginatedRepairs === null || paginatedRepairs === void 0 ? void 0 : paginatedRepairs.data.map(function (repair) { return (react_1["default"].createElement(table_1.TableRow, { key: repair.id },
                        react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, repair.repairNumber),
                        react_1["default"].createElement(table_1.TableCell, null, date_fns_1.formatDate(repair.receivedAt, "dd/MM/yy")),
                        react_1["default"].createElement(table_1.TableCell, null, repair.customer
                            ? ((repair.customer.firstName || "") + " " + (repair.customer.lastName || "")).trim()
                            : "N/A"),
                        react_1["default"].createElement(table_1.TableCell, null,
                            repair.deviceBrand,
                            " ",
                            repair.deviceModel),
                        react_1["default"].createElement(table_1.TableCell, null, repair.technician
                            ? ((repair.technician.firstName || "") + " " + (repair.technician.lastName || "")).trim()
                            : "No asignado"),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: utils_1.cn(repair.status ===
                                    prisma_enums_1.RepairStatus.REPAIR_COMPLETED &&
                                    "bg-green-100 text-green-700 border-green-300", repair.status === prisma_enums_1.RepairStatus.CANCELLED &&
                                    "bg-red-100 text-red-700 border-red-300", repair.status === prisma_enums_1.RepairStatus.DIAGNOSING &&
                                    "bg-blue-100 text-blue-700 border-blue-300", repair.status === prisma_enums_1.RepairStatus.IN_REPAIR &&
                                    "bg-yellow-100 text-yellow-700 border-yellow-300", repair.status === prisma_enums_1.RepairStatus.PENDING_PICKUP &&
                                    "bg-teal-100 text-teal-700 border-teal-300") }, exports.repairStatusLabels[repair.status] || repair.status)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(repair.quotedAmount)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigateToDetail(repair.id); } }, repair.status === prisma_enums_1.RepairStatus.DIAGNOSING ||
                                repair.status === prisma_enums_1.RepairStatus.IN_REPAIR ||
                                repair.status === prisma_enums_1.RepairStatus.QUOTE_PENDING ||
                                repair.status ===
                                    prisma_enums_1.RepairStatus.AWAITING_QUOTE_APPROVAL ||
                                repair.status === prisma_enums_1.RepairStatus.AWAITING_PARTS ||
                                repair.status === prisma_enums_1.RepairStatus.TESTING_QC ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.PlayCircle, { className: "mr-1 h-4 w-4" }),
                                " Gestionar")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.Eye, { className: "mr-1 h-4 w-4" }),
                                " Ver Detalle")))))); })))))),
        paginatedRepairs && paginatedRepairs.total > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedRepairs.page, totalPages: paginatedRepairs.totalPages, totalRecords: paginatedRepairs.total, limit: paginatedRepairs.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching }))));
}
exports["default"] = RepairsListPage;
