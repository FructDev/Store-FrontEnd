// app/(dashboard)/reports/sales/detailed-period/page.tsx
"use client";
"use strict";
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
var skeleton_1 = require("@/components/ui/skeleton");
var popover_1 = require("@/components/ui/popover");
var command_1 = require("@/components/ui/command");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var formatters_1 = require("@/lib/utils/formatters");
var prisma_enums_1 = require("@/types/prisma-enums");
var page_1 = require("@/app/(dashboard)/dashboard/sales/page"); // Reutilizar etiquetas de estado de venta
var react_scroll_area_1 = require("@radix-ui/react-scroll-area");
var badge_1 = require("@/components/ui/badge");
var link_1 = require("next/link");
var label_1 = require("@/components/ui/label");
var sonner_1 = require("sonner");
var ALL_SALE_STATUSES_ARRAY = Object.values(prisma_enums_1.SaleStatus);
var ALL_ITEMS_VALUE = "__ALL_ITEMS__"; // O cualquier string único no vacío
function DetailedSalesPeriodReportPage() {
    //   const queryClient = useQueryClient();
    var _this = this;
    var _a, _b, _c, _d, _e;
    // Estados para Filtros
    var _f = react_1.useState({
        from: date_fns_1.startOfMonth(new Date()),
        to: date_fns_1.endOfMonth(new Date())
    }), dateRange = _f[0], setDateRange = _f[1];
    var _g = react_1.useState(""), selectedCustomerId = _g[0], setSelectedCustomerId = _g[1]; // "all" o ID
    var _h = react_1.useState(""), selectedSalespersonId = _h[0], setSelectedSalespersonId = _h[1]; // "all" o ID
    var _j = react_1.useState(""), selectedProductId = _j[0], setSelectedProductId = _j[1]; // "all" o ID
    var _k = react_1.useState(""), selectedStatus = _k[0], setSelectedStatus = _k[1]; // "all" o SaleStatus
    var _l = react_1.useState(false), isCustomerPopoverOpen = _l[0], setIsCustomerPopoverOpen = _l[1];
    var _m = react_1.useState(false), isProductPopoverOpen = _m[0], setIsProductPopoverOpen = _m[1];
    var _o = react_1.useState(""), customerSearchTerm = _o[0], setCustomerSearchTerm = _o[1];
    var debouncedCustomerSearch = use_debounce_1.useDebounce(customerSearchTerm, 300);
    var _p = react_1.useState(""), productSearchTerm = _p[0], setProductSearchTerm = _p[1];
    var debouncedProductSearch = use_debounce_1.useDebounce(productSearchTerm, 300);
    var _q = react_1.useState(1), currentPage = _q[0], setCurrentPage = _q[1];
    var _r = react_1.useState(25), limitPerPage = _r[0], setLimitPerPage = _r[1];
    // Fetch para selectores de filtro
    var _s = react_query_1.useQuery({
        queryKey: ["allCustomersForReportFilter", debouncedCustomerSearch],
        queryFn: function () {
            return api_1["default"]
                .get("/customers?limit=20&isActive=true" + (debouncedCustomerSearch ? "&search=" + debouncedCustomerSearch : ""))
                .then(function (res) { return res.data.data || []; });
        },
        enabled: debouncedCustomerSearch.length > 1 ||
            debouncedCustomerSearch.length === 0
    }), customers = _s.data, isLoadingCustomers = _s.isLoading;
    var _t = react_query_1.useQuery({
        queryKey: ["allSalespersonsForReportFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/users?isActive=true&limit=200&role=SALESPERSON")
                .then(function (res) { return res.data.data || []; });
        }
    }), salespersons = _t.data, isLoadingSalespersons = _t.isLoading;
    var _u = react_query_1.useQuery({
        queryKey: ["allProductsForReportFilter", debouncedProductSearch],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?isActive=true&limit=20" + (debouncedProductSearch ? "&search=" + debouncedProductSearch : ""))
                .then(function (res) { return res.data.data || []; });
        },
        enabled: debouncedProductSearch.length > 1 || debouncedProductSearch.length === 0
    }), products = _u.data, isLoadingProducts = _u.isLoading;
    // Query principal para el reporte
    var _v = react_query_1.useQuery({
        queryKey: [
            "detailedSalesReport",
            dateRange === null || dateRange === void 0 ? void 0 : dateRange.from,
            dateRange === null || dateRange === void 0 ? void 0 : dateRange.to,
            selectedCustomerId,
            selectedSalespersonId,
            selectedProductId,
            selectedStatus,
            currentPage,
            limitPerPage,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) || !(dateRange === null || dateRange === void 0 ? void 0 : dateRange.to)) {
                            // Esto no debería pasar si los DatePicker siempre tienen valor
                            throw new Error("Rango de fechas es requerido.");
                        }
                        params = {
                            startDate: date_fns_1.format(dateRange.from, "yyyy-MM-dd"),
                            endDate: date_fns_1.format(dateRange.to, "yyyy-MM-dd"),
                            page: currentPage,
                            limit: limitPerPage
                        };
                        if (selectedCustomerId && selectedCustomerId !== "all")
                            params.customerId = selectedCustomerId;
                        if (selectedSalespersonId && selectedSalespersonId !== "all")
                            params.salespersonId = selectedSalespersonId;
                        if (selectedProductId && selectedProductId !== "all")
                            params.productId = selectedProductId;
                        if (selectedStatus && selectedStatus !== "all")
                            params.status = selectedStatus;
                        return [4 /*yield*/, api_1["default"].get("/reports/sales/detailed-period", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        enabled: !!(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) && !!(dateRange === null || dateRange === void 0 ? void 0 : dateRange.to),
        placeholderData: function (prev) { return prev; }
    }), reportData = _v.data, isLoadingReport = _v.isLoading, isFetchingReport = _v.isFetching, isError = _v.isError, error = _v.error;
    var handleFilterChange = function () {
        setCurrentPage(1); // Resetear a página 1 cuando los filtros cambian
        // queryClient.invalidateQueries({ queryKey: ["detailedSalesReport"] }); // React Query lo hará por cambio en queryKey
    };
    react_1.useEffect(handleFilterChange, [
        dateRange,
        selectedCustomerId,
        selectedSalespersonId,
        selectedProductId,
        selectedStatus,
    ]);
    var queryParams = react_1.useMemo(function () {
        // Si no hay un rango de fechas válido, no generamos PDF ni llamamos a la query principal
        if (!(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) || !(dateRange === null || dateRange === void 0 ? void 0 : dateRange.to)) {
            // Podrías devolver un objeto que indique que los params no están listos,
            // o manejar esto antes de llamar a handleDownloadPDF
            return null;
        }
        var params = {
            startDate: date_fns_1.format(dateRange.from, "yyyy-MM-dd"),
            endDate: date_fns_1.format(dateRange.to, "yyyy-MM-dd")
        };
        if (selectedCustomerId && selectedCustomerId !== ALL_ITEMS_VALUE)
            params.customerId = selectedCustomerId;
        if (selectedSalespersonId && selectedSalespersonId !== ALL_ITEMS_VALUE)
            params.salespersonId = selectedSalespersonId;
        if (selectedProductId && selectedProductId !== ALL_ITEMS_VALUE)
            params.productId = selectedProductId;
        if (selectedStatus && selectedStatus !== ALL_ITEMS_VALUE)
            params.status = selectedStatus;
        // NO incluimos page y limit aquí, ya que el PDF debería ser completo
        return params;
    }, [
        dateRange,
        selectedCustomerId,
        selectedSalespersonId,
        selectedProductId,
        selectedStatus,
    ]);
    var handleDownloadPDF = function () { return __awaiter(_this, void 0, void 0, function () {
        var filteredParamsForUrl, queryString, pdfEndpointPath, response, blob, link, startDate, endDate, err_1, errorMessage, errorJson, _a, _b, e_1;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!queryParams) {
                        sonner_1.toast.error("Por favor, selecciona un rango de fechas válido para generar el PDF.");
                        return [2 /*return*/];
                    }
                    filteredParamsForUrl = Object.entries(queryParams)
                        .filter(function (_a) {
                        var value = _a[1];
                        return value !== null && value !== undefined && value !== "";
                    })
                        .reduce(function (acc, _a) {
                        var key = _a[0], value = _a[1];
                        acc[key] = String(value);
                        return acc;
                    }, {});
                    queryString = new URLSearchParams(filteredParamsForUrl).toString();
                    pdfEndpointPath = "/reports/sales/detailed-period/pdf?" + queryString;
                    sonner_1.toast.info("Generando PDF... Por favor espera.");
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 10]);
                    return [4 /*yield*/, api_1["default"].get(pdfEndpointPath, {
                            responseType: "blob"
                        })];
                case 2:
                    response = _d.sent();
                    blob = new Blob([response.data], { type: "application/pdf" });
                    link = document.createElement("a");
                    link.href = window.URL.createObjectURL(blob);
                    startDate = queryParams.startDate || "reporte";
                    endDate = queryParams.endDate || "ventas";
                    link.download = "reporte-ventas-<span class=\"math-inline\">{startDate}-al-</span>{endDate}.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href); // Limpiar el object URL
                    sonner_1.toast.success("PDF descargado exitosamente.");
                    return [3 /*break*/, 10];
                case 3:
                    err_1 = _d.sent();
                    console.error("Error descargando PDF:", err_1);
                    errorMessage = "Error al generar el PDF del reporte.";
                    if (!((_c = err_1.response) === null || _c === void 0 ? void 0 : _c.data)) return [3 /*break*/, 9];
                    if (!(err_1.response.data instanceof Blob &&
                        err_1.response.data.type === "application/json")) return [3 /*break*/, 8];
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 6, , 7]);
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, err_1.response.data.text()];
                case 5:
                    errorJson = _b.apply(_a, [_d.sent()]);
                    errorMessage = errorJson.message || errorMessage;
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _d.sent();
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    if (err_1.response.data.message) {
                        errorMessage = err_1.response.data.message;
                    }
                    _d.label = 9;
                case 9:
                    sonner_1.toast.error(errorMessage);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var clearFilters = function () {
        setDateRange({
            from: date_fns_1.startOfMonth(new Date()),
            to: date_fns_1.endOfMonth(new Date())
        });
        setSelectedCustomerId("");
        setSelectedSalespersonId("");
        setSelectedProductId("");
        setSelectedStatus("");
        setCustomerSearchTerm("");
        setProductSearchTerm("");
        setCurrentPage(1);
    };
    var handleCustomerSelect = function (customerId) {
        setSelectedCustomerId(customerId === ALL_ITEMS_VALUE ? ALL_ITEMS_VALUE : customerId); // O usa "" para "todos"
        setIsCustomerPopoverOpen(false); // <--- CERRAR POPOVER
    };
    var handleProductSelect = function (productId) {
        setSelectedProductId(productId === ALL_ITEMS_VALUE ? ALL_ITEMS_VALUE : productId); // O usa "" para "todos"
        setIsProductPopoverOpen(false); // <--- CERRAR POPOVER
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col h-full p-4 md:p-6 space-y-4" },
        " ",
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Reporte de Ventas Detalladas", description: "Analiza las transacciones de venta con detalle de l\u00EDneas, pagos, costos y ganancias.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleDownloadPDF, variant: "outline", size: "sm", disabled: isLoadingReport || !((_a = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _a === void 0 ? void 0 : _a.length) },
                react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                " Descargar PDF") }),
        react_1["default"].createElement(card_1.Card, { className: "shrink-0" },
            " ",
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                    "Filtros del Reporte"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: clearFilters, size: "sm", className: "text-xs text-muted-foreground hover:text-primary" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "mr-1 h-3 w-3" }),
                    " Limpiar")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end" },
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "report-date-range", className: "text-xs font-medium" }, "Rango de Fechas*"),
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { id: "report-date-range", date: dateRange, onDateChange: setDateRange, className: "w-full h-9 mt-1" })),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "customer-filter-trigger", className: "text-xs font-medium" }, "Cliente"),
                        react_1["default"].createElement(popover_1.Popover, { open: isCustomerPopoverOpen, onOpenChange: setIsCustomerPopoverOpen },
                            react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true, id: "customer-filter-trigger" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", className: "w-full h-9 justify-between font-normal text-xs truncate" },
                                    react_1["default"].createElement("span", { className: "truncate" }, selectedCustomerId !== ALL_ITEMS_VALUE && (customers === null || customers === void 0 ? void 0 : customers.find(function (c) { return c.id === selectedCustomerId; }))
                                        ? (((_b = customers.find(function (c) { return c.id === selectedCustomerId; })) === null || _b === void 0 ? void 0 : _b.firstName) + " " + ((_c = customers.find(function (c) { return c.id === selectedCustomerId; })) === null || _c === void 0 ? void 0 : _c.lastName)).trim()
                                        : "Todos los Clientes"),
                                    react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-3 w-3 shrink-0 opacity-50" }))),
                            react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[300px] p-0", align: "start" },
                                react_1["default"].createElement(command_1.Command, null,
                                    react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar cliente...", value: customerSearchTerm, onValueChange: setCustomerSearchTerm, className: "text-xs h-8" }),
                                    react_1["default"].createElement(command_1.CommandList, null,
                                        react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingCustomers ? "Buscando..." : "No encontrado."),
                                        react_1["default"].createElement(command_1.CommandGroup, null,
                                            react_1["default"].createElement(command_1.CommandItem, { key: "all-cust", value: ALL_ITEMS_VALUE, onSelect: function () { return handleCustomerSelect(ALL_ITEMS_VALUE); } }, "Todos los Clientes"), customers === null || customers === void 0 ? void 0 :
                                            customers.map(function (c) { return (react_1["default"].createElement(command_1.CommandItem, { key: c.id, value: c.firstName + " " + c.lastName, onSelect: function () { return handleCustomerSelect(c.id); } },
                                                c.firstName,
                                                " ",
                                                c.lastName)); }))))))),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "salesperson-filter", className: "text-xs font-medium" }, "Vendedor"),
                        react_1["default"].createElement(select_1.Select, { value: selectedSalespersonId, onValueChange: function (value) {
                                return setSelectedSalespersonId(value === ALL_ITEMS_VALUE ? ALL_ITEMS_VALUE : value);
                            } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "salesperson-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_VALUE }, "Todos los Vendedores"),
                                isLoadingSalespersons && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-sp", disabled: true }, "Cargando...")), salespersons === null || salespersons === void 0 ? void 0 :
                                salespersons.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s.id, value: s.id },
                                    s.firstName,
                                    " ",
                                    s.lastName)); })))),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "product-filter-trigger", className: "text-xs font-medium" }, "Producto"),
                        react_1["default"].createElement(popover_1.Popover, { open: isProductPopoverOpen, onOpenChange: setIsProductPopoverOpen },
                            react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true, id: "product-filter-trigger" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", className: "w-full h-9 justify-between font-normal text-xs truncate" },
                                    react_1["default"].createElement("span", { className: "truncate" }, (selectedProductId !== ALL_ITEMS_VALUE && ((_d = products === null || products === void 0 ? void 0 : products.find(function (p) { return p.id === selectedProductId; })) === null || _d === void 0 ? void 0 : _d.name)) ||
                                        "Todos los Productos"),
                                    react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-3 w-3 shrink-0 opacity-50" }))),
                            react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[300px] p-0", align: "start" },
                                react_1["default"].createElement(command_1.Command, null,
                                    react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar producto...", value: productSearchTerm, onValueChange: setProductSearchTerm, className: "text-xs h-8" }),
                                    react_1["default"].createElement(command_1.CommandList, null,
                                        react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingProducts ? "Buscando..." : "No encontrado."),
                                        react_1["default"].createElement(command_1.CommandGroup, null,
                                            react_1["default"].createElement(command_1.CommandItem, { key: "all-prod", value: ALL_ITEMS_VALUE, onSelect: function () { return handleProductSelect(ALL_ITEMS_VALUE); } }, "Todos los Productos"), products === null || products === void 0 ? void 0 :
                                            products.map(function (p) { return (react_1["default"].createElement(command_1.CommandItem, { key: p.id, value: p.name, onSelect: function () { return handleProductSelect(p.id); } },
                                                p.name,
                                                " ",
                                                react_1["default"].createElement("span", { className: "text-muted-foreground ml-2" },
                                                    "(",
                                                    p.sku || "N/A",
                                                    ")"))); }))))))),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "status-filter", className: "text-xs font-medium" }, "Estado Venta"),
                        react_1["default"].createElement(select_1.Select, { value: selectedStatus, onValueChange: function (value) {
                                return setSelectedStatus(value === ALL_ITEMS_VALUE ? "" : value);
                            } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "status-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_VALUE }, "Todos los Estados"),
                                ALL_SALE_STATUSES_ARRAY.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s, value: s }, page_1.saleStatusLabels[s] || s)); }))))))),
        (reportData === null || reportData === void 0 ? void 0 : reportData.reportGrandTotals) && !isLoadingReport && (react_1["default"].createElement(card_1.Card, { className: "mb-4 shrink-0" },
            " ",
            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Totales del Per\u00EDodo Filtrado")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 text-sm" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Ventas Totales:"),
                    react_1["default"].createElement("strong", { className: "block" }, reportData.reportGrandTotals.totalSalesCount)),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Ingresos Brutos:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalRevenue))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Desc. L\u00EDnea:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalAllLineDiscounts))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Desc. General:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalOverallDiscounts))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Desc. Neto Total:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalNetDiscounts))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Impuestos:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalTaxes))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Costo Mercanc\u00EDa:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalCostOfGoodsSold))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Ganancia Bruta:"),
                    react_1["default"].createElement("strong", { className: "block font-semibold text-green-600" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalProfit)))))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-hidden" },
            react_1["default"].createElement(card_1.Card, { className: "h-full flex flex-col" },
                react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4 shrink-0" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Detalle de Ventas del Per\u00EDodo")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0 flex-1 overflow-hidden" },
                    react_1["default"].createElement(react_scroll_area_1.ScrollArea, { className: "h-full" },
                        react_1["default"].createElement(table_1.Table, { className: "sticky top-0 bg-background z-10" },
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[120px]" }, "N\u00BA Venta"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[100px]" }, "Fecha"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[180px]" }, "Cliente"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[150px]" }, "Vendedor"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[130px]" }, "Estado"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Subtotal"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Desc. Gral"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Impuestos"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[110px] font-semibold" }, "Total Venta"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Costo"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px] font-semibold" }, "Ganancia"))),
                            react_1["default"].createElement(table_1.TableBody, null, isLoadingReport || isFetchingReport ? (__spreadArrays(Array(10)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-sale-report-" + i }, __spreadArrays(Array(11)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 11, className: "text-center text-red-500 py-10" },
                                    "Error: ",
                                    error.message))) : ((_e = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _e === void 0 ? void 0 : _e.length) === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 11, className: "text-center py-10 text-muted-foreground" }, "No se encontraron ventas con los filtros aplicados."))) : (reportData === null || reportData === void 0 ? void 0 : reportData.data.map(function (sale) { return (react_1["default"].createElement(table_1.TableRow, { key: sale.saleId },
                                react_1["default"].createElement(table_1.TableCell, { className: "font-medium" },
                                    react_1["default"].createElement(link_1["default"], { href: "/dashboard/sales/" + sale.saleId, className: "text-primary hover:underline" }, sale.saleNumber)),
                                react_1["default"].createElement(table_1.TableCell, null, formatters_1.formatDate(sale.saleDate, "dd/MM/yy")),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[180px] truncate", title: sale.customerName || "" }, sale.customerName || "Genérico"),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[150px] truncate", title: sale.salespersonName || "" }, sale.salespersonName || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: sale.status === prisma_enums_1.SaleStatus.COMPLETED
                                            ? "success"
                                            : sale.status === prisma_enums_1.SaleStatus.CANCELLED
                                                ? "destructive"
                                                : "outline" }, page_1.saleStatusLabels[sale.status] || sale.status)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(sale.subTotalAfterLineDiscounts)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(sale.discountOnTotalAmount)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(sale.taxTotal)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold" }, formatters_1.formatCurrency(sale.totalAmount)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(sale.totalCostOfGoodsSold)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold" }, formatters_1.formatCurrency(sale.totalSaleProfit)))); })))))))),
        reportData && reportData.total > 0 && (react_1["default"].createElement("div", { className: "pt-4 shrink-0" },
            " ",
            react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: reportData.page, totalPages: reportData.totalPages, totalRecords: reportData.total, limit: reportData.limit, onPageChange: function (newPage) { return setCurrentPage(newPage); }, isFetching: isFetchingReport })))));
}
exports["default"] = DetailedSalesPeriodReportPage;
