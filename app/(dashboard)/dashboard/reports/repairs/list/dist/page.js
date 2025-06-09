// app/(dashboard)/reports/repairs/list/page.tsx
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
var page_header_1 = require("@/components/common/page-header");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var date_range_picker_1 = require("@/components/ui/date-range-picker");
var select_1 = require("@/components/ui/select");
var input_1 = require("@/components/ui/input");
var skeleton_1 = require("@/components/ui/skeleton");
var popover_1 = require("@/components/ui/popover");
var command_1 = require("@/components/ui/command");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var formatters_1 = require("@/lib/utils/formatters");
var prisma_enums_1 = require("@/types/prisma-enums");
var link_1 = require("next/link");
var sonner_1 = require("sonner");
// Importar repairStatusLabels (idealmente de un archivo de constantes)
var repairStatusLabels = {
    // Definir localmente o importar
    RECEIVED: "Recibido",
    DIAGNOSING: "Diagnosticando",
    QUOTE_PENDING: "Pend. Cotización",
    AWAITING_QUOTE_APPROVAL: "Esperando Aprob. Cotización",
    QUOTE_APPROVED: "Cotización Aprobada",
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
var ALL_REPAIR_STATUSES_ARRAY = Object.values(prisma_enums_1.RepairStatus);
var ALL_ITEMS_FILTER_VALUE = "__ALL_ITEMS__"; // Usar string vacío para "Todos" para simplificar Selects
function DetailedRepairsReportPage() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g;
    var defaultStartDate = date_fns_1.startOfMonth(date_fns_1.subDays(new Date(), 30)); // Inicio del mes anterior o hace 30 días
    var defaultEndDate = date_fns_1.endOfMonth(new Date()); // Fin del mes actual
    var _h = react_1.useState({
        from: defaultStartDate,
        to: defaultEndDate
    }), dateRange = _h[0], setDateRange = _h[1];
    var _j = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedStatus = _j[0], setSelectedStatus = _j[1];
    var _k = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedTechnicianId = _k[0], setSelectedTechnicianId = _k[1];
    var _l = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedCustomerId = _l[0], setSelectedCustomerId = _l[1];
    var _m = react_1.useState(""), customerSearchTerm = _m[0], setCustomerSearchTerm = _m[1];
    var debouncedCustomerSearch = use_debounce_1.useDebounce(customerSearchTerm, 300);
    var _o = react_1.useState(false), isCustomerPopoverOpen = _o[0], setIsCustomerPopoverOpen = _o[1];
    var _p = react_1.useState(""), deviceBrand = _p[0], setDeviceBrand = _p[1];
    var _q = react_1.useState(""), deviceModel = _q[0], setDeviceModel = _q[1];
    var _r = react_1.useState(""), deviceImei = _r[0], setDeviceImei = _r[1];
    var _s = react_1.useState(prisma_enums_1.RepairsReportSortBy.RECEIVED_AT), orderBy = _s[0], setOrderBy = _s[1];
    var _t = react_1.useState("desc"), sortOrder = _t[0], setSortOrder = _t[1];
    var _u = react_1.useState(1), currentPage = _u[0], setCurrentPage = _u[1];
    var limitPerPage = react_1.useState(25)[0];
    // --- Fetch para Selectores de Filtro ---
    var _v = react_query_1.useQuery({
        queryKey: ["filterCustomersForRepairsReport", debouncedCustomerSearch],
        queryFn: function () {
            return api_1["default"]
                .get("/customers?isActive=true&limit=20" + (debouncedCustomerSearch ? "&search=" + debouncedCustomerSearch : ""))
                .then(function (res) { return res.data.data || []; });
        },
        enabled: isCustomerPopoverOpen
    }), customers = _v.data, isLoadingCustomers = _v.isLoading;
    var _w = react_query_1.useQuery({
        queryKey: ["filterTechniciansForRepairsReport"],
        queryFn: function () {
            return api_1["default"]
                .get("/users?role=TECHNICIAN&isActive=true&limit=200")
                .then(function (res) { return res.data.data || []; });
        },
        staleTime: 1000 * 60 * 5
    }), technicians = _w.data, isLoadingTechnicians = _w.isLoading;
    // --- Query Principal para el Reporte ---
    var queryParams = react_1.useMemo(function () {
        var params = {
            startDate: (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) ? date_fns_1.format(dateRange.from, "yyyy-MM-dd")
                : undefined,
            endDate: (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to) ? date_fns_1.format(dateRange.to, "yyyy-MM-dd") : undefined,
            page: currentPage,
            limit: limitPerPage,
            sortBy: orderBy,
            sortOrder: sortOrder
        };
        if (selectedStatus && selectedStatus !== ALL_ITEMS_FILTER_VALUE)
            params.status = selectedStatus;
        if (selectedTechnicianId && selectedTechnicianId !== ALL_ITEMS_FILTER_VALUE)
            params.technicianId = selectedTechnicianId;
        if (selectedCustomerId && selectedCustomerId !== ALL_ITEMS_FILTER_VALUE)
            params.customerId = selectedCustomerId;
        if (deviceBrand.trim())
            params.deviceBrand = deviceBrand.trim();
        if (deviceModel.trim())
            params.deviceModel = deviceModel.trim();
        if (deviceImei.trim())
            params.deviceImei = deviceImei.trim();
        return params;
    }, [
        dateRange,
        selectedStatus,
        selectedTechnicianId,
        selectedCustomerId,
        deviceBrand,
        deviceModel,
        deviceImei,
        currentPage,
        limitPerPage,
        orderBy,
        sortOrder,
    ]);
    var _x = react_query_1.useQuery({
        queryKey: ["repairsDetailedListReport", queryParams],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, api_1["default"].get("/reports/repairs/detailed-list", {
                            params: queryParams
                        })];
                    case 1:
                        response = _b.sent();
                        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) {
                            response.data.data = response.data.data.map(function (repair) { return (__assign(__assign({}, repair), { receivedAt: repair.receivedAt
                                    ? date_fns_1.parseISO(String(repair.receivedAt))
                                    : new Date(0), completedAt: repair.completedAt
                                    ? date_fns_1.parseISO(String(repair.completedAt))
                                    : null })); });
                        }
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        // enabled: !!queryParams?.startDate && !!queryParams?.endDate, // El reporte podría funcionar sin fechas para ver "todos"
        placeholderData: function (prev) { return prev; }
    }), reportData = _x.data, isLoadingReport = _x.isLoading, isFetchingReport = _x.isFetching, isError = _x.isError, error = _x.error;
    react_1.useEffect(function () {
        // Resetear a página 1 solo si los filtros que no son de paginación cambian
        setCurrentPage(1);
    }, [
        dateRange,
        selectedStatus,
        selectedTechnicianId,
        selectedCustomerId,
        deviceBrand,
        deviceModel,
        deviceImei,
        orderBy,
        sortOrder,
    ]);
    var handleDownloadPDF = function () {
        return sonner_1.toast.info("TODO: Descarga PDF para Reporte de Reparaciones.");
    };
    var clearFilters = function () {
        setDateRange({ from: defaultStartDate, to: defaultEndDate });
        setSelectedStatus(ALL_ITEMS_FILTER_VALUE);
        setSelectedTechnicianId(ALL_ITEMS_FILTER_VALUE);
        setSelectedCustomerId(ALL_ITEMS_FILTER_VALUE);
        setCustomerSearchTerm("");
        setDeviceBrand("");
        setDeviceModel("");
        setDeviceImei("");
        setOrderBy(prisma_enums_1.RepairsReportSortBy.RECEIVED_AT);
        setSortOrder("desc");
        setCurrentPage(1);
    };
    var handleCustomerSelect = function (customerIdValue) {
        setSelectedCustomerId(customerIdValue === ALL_ITEMS_FILTER_VALUE
            ? ALL_ITEMS_FILTER_VALUE
            : customerIdValue);
        setIsCustomerPopoverOpen(false);
    };
    var toggleSortOrder = function () {
        return setSortOrder(function (prev) { return (prev === "asc" ? "desc" : "asc"); });
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col h-full p-4 md:p-6 space-y-4" },
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Listado Detallado de \u00D3rdenes de Reparaci\u00F3n", description: "Seguimiento y an\u00E1lisis del estado y detalles de las reparaciones.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleDownloadPDF, variant: "outline", size: "sm", disabled: isLoadingReport || !((_a = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _a === void 0 ? void 0 : _a.length) },
                react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                " Descargar PDF") }),
        react_1["default"].createElement(card_1.Card, { className: "shrink-0" },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "h-4 w-4 mr-2 text-muted-foreground" }),
                    "Filtros"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "text-xs" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3 w-3 mr-1" }),
                    "Limpiar Filtros")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-end" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "rep-date-range", className: "text-xs font-medium" }, "Rango Fechas (Recepci\u00F3n)"),
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { id: "rep-date-range", date: dateRange, onDateChange: setDateRange, className: "w-full h-9 mt-1" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "rep-status-filter", className: "text-xs font-medium" }, "Estado"),
                        react_1["default"].createElement(select_1.Select, { value: selectedStatus, onValueChange: function (v) { return setSelectedStatus(v); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "rep-status-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todos"),
                                ALL_REPAIR_STATUSES_ARRAY.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s, value: s }, repairStatusLabels[s] || s)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "rep-tech-filter", className: "text-xs font-medium" }, "T\u00E9cnico"),
                        react_1["default"].createElement(select_1.Select, { value: selectedTechnicianId, onValueChange: function (v) { return setSelectedTechnicianId(v); }, disabled: isLoadingTechnicians },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "rep-tech-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todos"),
                                isLoadingTechnicians && (react_1["default"].createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), technicians === null || technicians === void 0 ? void 0 :
                                technicians.map(function (t) { return (react_1["default"].createElement(select_1.SelectItem, { key: t.id, value: t.id },
                                    t.firstName,
                                    " ",
                                    t.lastName)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "rep-cust-filter", className: "text-xs font-medium" }, "Cliente"),
                        react_1["default"].createElement(popover_1.Popover, { open: isCustomerPopoverOpen, onOpenChange: setIsCustomerPopoverOpen },
                            react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                react_1["default"].createElement(button_1.Button, { id: "rep-cust-filter", variant: "outline", role: "combobox", className: "w-full h-9 justify-between font-normal text-xs truncate" },
                                    react_1["default"].createElement("span", { className: "truncate" }, selectedCustomerId !== ALL_ITEMS_FILTER_VALUE && ((_b = customers === null || customers === void 0 ? void 0 : customers.find(function (c) { return c.id === selectedCustomerId; })) === null || _b === void 0 ? void 0 : _b.firstName)
                                        ? (((_c = customers.find(function (c) { return c.id === selectedCustomerId; })) === null || _c === void 0 ? void 0 : _c.firstName) + " " + ((_d = customers.find(function (c) { return c.id === selectedCustomerId; })) === null || _d === void 0 ? void 0 : _d.lastName)).trim()
                                        : "Todos"),
                                    react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-3 w-3 shrink-0 opacity-50" }))),
                            react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[300px] p-0" },
                                react_1["default"].createElement(command_1.Command, null,
                                    react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar cliente...", value: customerSearchTerm, onValueChange: setCustomerSearchTerm, className: "text-xs h-8" }),
                                    react_1["default"].createElement(command_1.CommandList, null,
                                        react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingCustomers ? "Buscando..." : "No encontrado."),
                                        react_1["default"].createElement(command_1.CommandGroup, null,
                                            react_1["default"].createElement(command_1.CommandItem, { value: ALL_ITEMS_FILTER_VALUE, onSelect: function () {
                                                    return handleCustomerSelect(ALL_ITEMS_FILTER_VALUE);
                                                } }, "Todos"), customers === null || customers === void 0 ? void 0 :
                                            customers.map(function (c) { return (react_1["default"].createElement(command_1.CommandItem, { key: c.id, value: c.firstName + " " + c.lastName, onSelect: function () { return handleCustomerSelect(c.id); } },
                                                c.firstName,
                                                " ",
                                                c.lastName)); }))))))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "rep-brand-filter", className: "text-xs font-medium" }, "Marca Dispositivo"),
                        react_1["default"].createElement(input_1.Input, { id: "rep-brand-filter", className: "h-9 text-xs", value: deviceBrand, onChange: function (e) { return setDeviceBrand(e.target.value); }, placeholder: "Ej: Apple" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "rep-model-filter", className: "text-xs font-medium" }, "Modelo Dispositivo"),
                        react_1["default"].createElement(input_1.Input, { id: "rep-model-filter", className: "h-9 text-xs", value: deviceModel, onChange: function (e) { return setDeviceModel(e.target.value); }, placeholder: "Ej: iPhone 13" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "rep-imei-filter", className: "text-xs font-medium" }, "IMEI/Serial"),
                        react_1["default"].createElement(input_1.Input, { id: "rep-imei-filter", className: "h-9 text-xs", value: deviceImei, onChange: function (e) { return setDeviceImei(e.target.value); }, placeholder: "IMEI o S/N" })),
                    react_1["default"].createElement("div", { className: "flex items-end space-x-2" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { htmlFor: "rep-orderby-filter", className: "text-xs font-medium" }, "Ordenar Por"),
                            react_1["default"].createElement(select_1.Select, { value: orderBy, onValueChange: function (v) { return setOrderBy(v); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "rep-orderby-filter" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.RepairsReportSortBy.RECEIVED_AT }, "Fecha Recepci\u00F3n"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.RepairsReportSortBy.REPAIR_NUMBER }, "N\u00BA Reparaci\u00F3n"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.RepairsReportSortBy.CUSTOMER_NAME }, "Cliente"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.RepairsReportSortBy.TECHNICIAN_NAME }, "T\u00E9cnico"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.RepairsReportSortBy.STATUS }, "Estado"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.RepairsReportSortBy.COMPLETED_AT }, "Fecha Completado")))),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "icon", onClick: toggleSortOrder, className: "h-9 w-9 shrink-0", title: "Orden: " + (sortOrder === "asc" ? "Ascendente" : "Descendente") }, sortOrder === "asc" ? (react_1["default"].createElement(lucide_react_1.SortAsc, { className: "h-4 w-4" })) : (react_1["default"].createElement(lucide_react_1.SortDesc, { className: "h-4 w-4" }))))))),
        (reportData === null || reportData === void 0 ? void 0 : reportData.reportTotals) && !isLoadingReport && (react_1["default"].createElement(card_1.Card, { className: "mb-4 shrink-0" },
            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Resumen del Reporte Filtrado")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 text-sm" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Total Reparaciones:"),
                    react_1["default"].createElement("strong", { className: "block text-lg" }, reportData.reportTotals.totalRepairsInPeriod)),
                Object.entries(reportData.reportTotals.repairsByStatusCount || {})
                    .filter(function (_a) {
                    var count = _a[1];
                    return count > 0;
                })
                    .map(function (_a) {
                    var status = _a[0], count = _a[1];
                    return (react_1["default"].createElement("div", { key: status },
                        react_1["default"].createElement("span", { className: "text-muted-foreground" },
                            repairStatusLabels[status] || status,
                            ":"),
                        react_1["default"].createElement("strong", { className: "block text-lg" }, count)));
                }),
                reportData.reportTotals.averageDaysOpenActive !== null && (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Prom. D\u00EDas (Activas):"),
                    react_1["default"].createElement("strong", { className: "block text-lg" }, (_e = reportData.reportTotals.averageDaysOpenActive) === null || _e === void 0 ? void 0 : _e.toFixed(1)))),
                reportData.reportTotals.averageCompletionTime !== null && (react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Prom. D\u00EDas (Completadas):"),
                    react_1["default"].createElement("strong", { className: "block text-lg" }, (_f = reportData.reportTotals.averageCompletionTime) === null || _f === void 0 ? void 0 : _f.toFixed(1))))))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-hidden" },
            react_1["default"].createElement(card_1.Card, { className: "h-full flex flex-col" },
                react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4 shrink-0" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Listado de \u00D3rdenes de Reparaci\u00F3n")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0 flex-1 overflow-y-auto overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, { className: "text-xs" },
                        react_1["default"].createElement(table_1.TableHeader, { className: "sticky top-0 z-10 bg-card" },
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, { className: "w-[100px]" }, "N\u00BA Reparaci\u00F3n"),
                                react_1["default"].createElement(table_1.TableHead, { className: "w-[90px]" }, "Recibido"),
                                react_1["default"].createElement(table_1.TableHead, { className: "min-w-[150px] sticky left-0 bg-background z-10" }, "Cliente"),
                                react_1["default"].createElement(table_1.TableHead, { className: "min-w-[150px]" }, "Dispositivo"),
                                react_1["default"].createElement(table_1.TableHead, { className: "w-[130px]" }, "IMEI/Serial"),
                                react_1["default"].createElement(table_1.TableHead, { className: "min-w-[180px]" }, "Problema Reportado"),
                                react_1["default"].createElement(table_1.TableHead, { className: "min-w-[120px]" }, "T\u00E9cnico"),
                                react_1["default"].createElement(table_1.TableHead, { className: "w-[140px]" }, "Estado"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[90px]" }, "Cotizado"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[90px]" }, "Facturado"),
                                react_1["default"].createElement(table_1.TableHead, { className: "w-[90px]" }, "Completado"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[70px]" }, "D\u00EDas"))),
                        react_1["default"].createElement(table_1.TableBody, null, isLoadingReport || isFetchingReport ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-rep-report-" + i }, __spreadArrays(Array(12)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableCell, { colSpan: 12, className: "text-center text-red-500 py-10" },
                                "Error: ",
                                error.message))) : ((_g = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _g === void 0 ? void 0 : _g.length) === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableCell, { colSpan: 12, className: "text-center py-10 text-muted-foreground" }, "No se encontraron reparaciones con los filtros aplicados."))) : (reportData === null || reportData === void 0 ? void 0 : reportData.data.map(function (repair) {
                            var _a;
                            return (react_1["default"].createElement(table_1.TableRow, { key: repair.repairId, className: "hover:bg-muted/50" },
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(link_1["default"], { href: "/dashboard/repairs/" + repair.repairId, className: "text-primary hover:underline font-medium" }, repair.repairNumber)),
                                react_1["default"].createElement(table_1.TableCell, null, formatters_1.formatDate(repair.receivedAt, "dd/MM/yy")),
                                react_1["default"].createElement(table_1.TableCell, { className: "sticky left-0 bg-background z-0 max-w-[150px] truncate", title: repair.customerName || "" }, repair.customerName || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[150px] truncate", title: repair.deviceDisplay }, repair.deviceDisplay),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[130px] truncate text-muted-foreground", title: repair.deviceImei || "" }, repair.deviceImei || "-"),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[180px] truncate", title: repair.reportedIssueExcerpt }, repair.reportedIssueExcerpt),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[120px] truncate", title: repair.technicianName || "" }, repair.technicianName || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0.5" }, repairStatusLabels[repair.status] || repair.status)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(repair.quotedAmount)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(repair.totalBilledAmount)),
                                react_1["default"].createElement(table_1.TableCell, null, formatters_1.formatDate(repair.completedAt, "dd/MM/yy")),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, (_a = repair.daysOpenOrToCompletion) !== null && _a !== void 0 ? _a : "-")));
                        }))))))),
        reportData && reportData.total > 0 && (react_1["default"].createElement("div", { className: "pt-4 shrink-0" },
            react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: reportData.page, totalPages: reportData.totalPages, totalRecords: reportData.total, limit: reportData.limit, onPageChange: function (newPage) { return setCurrentPage(newPage); }, isFetching: isFetchingReport })))));
}
exports["default"] = DetailedRepairsReportPage;
