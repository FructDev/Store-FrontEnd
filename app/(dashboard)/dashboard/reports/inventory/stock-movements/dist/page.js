// app/(dashboard)/reports/inventory/stock-movements/page.tsx
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
var scroll_area_1 = require("@/components/ui/scroll-area");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react"); // Añadido SortAsc, SortDesc
var use_debounce_1 = require("@/hooks/use-debounce");
var utils_1 = require("@/lib/utils");
var formatters_1 = require("@/lib/utils/formatters");
var prisma_enums_1 = require("@/types/prisma-enums");
var prisma_enums_2 = require("@/types/prisma-enums"); // Ajusta la ruta al DTO del backend
var sonner_1 = require("sonner");
// Mapeo para MovementType
var movementTypeLabels = {
    SALE: "Venta",
    PURCHASE_RECEIPT: "Recepción Compra",
    ADJUSTMENT_IN: "Ajuste Entrada",
    ADJUSTMENT_OUT: "Ajuste Salida",
    TRANSFER_OUT: "Transferencia (Salida)",
    TRANSFER_IN: "Transferencia (Entrada)",
    RETURN_RESTOCK: "Devolución (Reingreso)",
    REPAIR_CONSUMPTION: "Consumo Reparación",
    INITIAL_STOCK: "Stock Inicial",
    STOCK_COUNT_ADJUSTMENT: "Ajuste Conteo",
    PRODUCTION_IN: "Entrada Producción",
    PRODUCTION_OUT: "Salida Producción"
};
var ALL_MOVEMENT_TYPES = Object.values(prisma_enums_1.MovementType);
var ALL_ITEMS_FILTER_VALUE = "__ALL__"; // O usa "" si prefieres y ajusta la lógica
function StockMovementsReportPage() {
    var _this = this;
    var _a, _b, _c;
    var _d = react_1.useState({
        from: date_fns_1.startOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
        to: date_fns_1.endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)))
    }), dateRange = _d[0], setDateRange = _d[1];
    var _e = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedProductId = _e[0], setSelectedProductId = _e[1];
    var _f = react_1.useState(""), productSearchTerm = _f[0], setProductSearchTerm = _f[1];
    var debouncedProductSearch = use_debounce_1.useDebounce(productSearchTerm, 300);
    var _g = react_1.useState(false), isProductPopoverOpen = _g[0], setIsProductPopoverOpen = _g[1];
    var _h = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedLocationId = _h[0], setSelectedLocationId = _h[1];
    var _j = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedMovementType = _j[0], setSelectedMovementType = _j[1];
    var _k = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedUserId = _k[0], setSelectedUserId = _k[1];
    var _l = react_1.useState(""), referenceType = _l[0], setReferenceType = _l[1];
    var _m = react_1.useState(""), referenceId = _m[0], setReferenceId = _m[1];
    var _o = react_1.useState(prisma_enums_2.StockMovementsOrderBy.MOVEMENT_DATE), orderBy = _o[0], setOrderBy = _o[1];
    var _p = react_1.useState("desc"), sortOrder = _p[0], setSortOrder = _p[1];
    var _q = react_1.useState(1), currentPage = _q[0], setCurrentPage = _q[1];
    var limitPerPage = react_1.useState(50)[0]; // Límite para este reporte
    // Fetch para selectores de filtro
    var _r = react_query_1.useQuery({
        queryKey: ["allProductsForMovementFilter", debouncedProductSearch],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?isActive=true&limit=50" + (debouncedProductSearch ? "&search=" + debouncedProductSearch : ""))
                .then(function (res) { return res.data.data || []; });
        },
        enabled: isProductPopoverOpen
    }), productsForFilter = _r.data, isLoadingProducts = _r.isLoading;
    var _s = react_query_1.useQuery({
        queryKey: ["allLocationsForMovementFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || []; });
        }
    }), locations = _s.data, isLoadingLocations = _s.isLoading;
    var _t = react_query_1.useQuery({
        queryKey: ["allUsersForMovementFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/users?isActive=true&limit=200")
                .then(function (res) { return res.data.data || []; });
        }
    }), users = _t.data, isLoadingUsers = _t.isLoading;
    var queryParams = react_1.useMemo(function () {
        if (!(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) || !(dateRange === null || dateRange === void 0 ? void 0 : dateRange.to))
            return null;
        var params = {
            startDate: date_fns_1.format(dateRange.from, "yyyy-MM-dd"),
            endDate: date_fns_1.format(dateRange.to, "yyyy-MM-dd"),
            page: currentPage,
            limit: limitPerPage,
            sortBy: orderBy,
            sortOrder: sortOrder
        };
        if (selectedProductId !== ALL_ITEMS_FILTER_VALUE)
            params.productId = selectedProductId;
        if (selectedLocationId !== ALL_ITEMS_FILTER_VALUE)
            params.locationId = selectedLocationId;
        if (selectedMovementType !== ALL_ITEMS_FILTER_VALUE)
            params.movementType = selectedMovementType;
        if (selectedUserId !== ALL_ITEMS_FILTER_VALUE)
            params.userId = selectedUserId;
        if (referenceType.trim())
            params.referenceType = referenceType.trim();
        if (referenceId.trim())
            params.referenceId = referenceId.trim();
        return params;
    }, [
        dateRange,
        selectedProductId,
        selectedLocationId,
        selectedMovementType,
        selectedUserId,
        referenceType,
        referenceId,
        currentPage,
        limitPerPage,
        orderBy,
        sortOrder,
    ]);
    var _u = react_query_1.useQuery({
        queryKey: ["stockMovementsReport", queryParams],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!queryParams)
                            throw new Error("Rango de fechas es requerido.");
                        return [4 /*yield*/, api_1["default"].get("/reports/inventory/stock-movements", { params: queryParams })];
                    case 1:
                        response = _b.sent();
                        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) {
                            response.data.data = response.data.data.map(function (mov) { return (__assign(__assign({}, mov), { movementDate: mov.movementDate
                                    ? date_fns_1.parseISO(String(mov.movementDate))
                                    : new Date() })); });
                        }
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        enabled: !!queryParams,
        placeholderData: function (prev) { return prev; }
    }), reportData = _u.data, isLoadingReport = _u.isLoading, isFetchingReport = _u.isFetching, isError = _u.isError, error = _u.error;
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [queryParams]);
    var handleDownloadPDF = function () {
        return sonner_1.toast.info("TODO: Implementar descarga de PDF para Kardex.");
    };
    var clearFilters = function () {
        setDateRange({
            from: date_fns_1.startOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1))),
            to: date_fns_1.endOfMonth(new Date(new Date().setMonth(new Date().getMonth() - 1)))
        });
        setSelectedProductId(ALL_ITEMS_FILTER_VALUE);
        setProductSearchTerm("");
        setSelectedLocationId(ALL_ITEMS_FILTER_VALUE);
        setSelectedMovementType(ALL_ITEMS_FILTER_VALUE);
        setSelectedUserId(ALL_ITEMS_FILTER_VALUE);
        setReferenceType("");
        setReferenceId("");
        setOrderBy(prisma_enums_2.StockMovementsOrderBy.MOVEMENT_DATE);
        setSortOrder("desc");
        setCurrentPage(1);
    };
    var handleProductSelect = function (productIdValue) {
        setSelectedProductId(productIdValue);
        setIsProductPopoverOpen(false);
    };
    var toggleSortOrder = function () {
        return setSortOrder(function (prev) { return (prev === "asc" ? "desc" : "asc"); });
    };
    var isKardexMode = selectedProductId !== ALL_ITEMS_FILTER_VALUE && selectedProductId !== "";
    return (react_1["default"].createElement("div", { className: "flex flex-col h-full p-4 md:p-6 space-y-4" },
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Reporte de Movimientos de Stock (Kardex)", description: "Historial detallado de todas las entradas y salidas de inventario.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleDownloadPDF, variant: "outline", size: "sm", disabled: isLoadingReport || !((_a = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _a === void 0 ? void 0 : _a.length) },
                react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                " Descargar PDF") }),
        react_1["default"].createElement(card_1.Card, { className: "shrink-0" },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                    "Filtros"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: clearFilters, size: "sm", className: "text-xs" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "mr-1 h-3 w-3" }),
                    " Limpiar")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-date-range", className: "text-xs font-medium" }, "Rango de Fechas*"),
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { id: "kardex-date-range", date: dateRange, onDateChange: setDateRange, className: "w-full h-9 mt-1" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-product-filter", className: "text-xs font-medium" }, "Producto (para Kardex)"),
                        react_1["default"].createElement(popover_1.Popover, { open: isProductPopoverOpen, onOpenChange: setIsProductPopoverOpen },
                            react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                react_1["default"].createElement(button_1.Button, { id: "kardex-product-filter", variant: "outline", role: "combobox", className: "w-full h-9 justify-between font-normal text-xs truncate" },
                                    react_1["default"].createElement("span", { className: "truncate" }, (selectedProductId !== ALL_ITEMS_FILTER_VALUE && ((_b = productsForFilter === null || productsForFilter === void 0 ? void 0 : productsForFilter.find(function (p) { return p.id === selectedProductId; })) === null || _b === void 0 ? void 0 : _b.name)) ||
                                        "Todos (Lista General)"),
                                    react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-3 w-3 shrink-0 opacity-50" }))),
                            react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[300px] p-0", align: "start" },
                                react_1["default"].createElement(command_1.Command, null,
                                    react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar producto...", value: productSearchTerm, onValueChange: setProductSearchTerm, className: "text-xs h-8" }),
                                    react_1["default"].createElement(command_1.CommandList, null,
                                        react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingProducts ? "Buscando..." : "No encontrado."),
                                        react_1["default"].createElement(command_1.CommandGroup, null,
                                            react_1["default"].createElement(command_1.CommandItem, { value: ALL_ITEMS_FILTER_VALUE, onSelect: function () {
                                                    return handleProductSelect(ALL_ITEMS_FILTER_VALUE);
                                                } }, "Todos (Lista General)"), productsForFilter === null || productsForFilter === void 0 ? void 0 :
                                            productsForFilter.map(function (p) { return (react_1["default"].createElement(command_1.CommandItem, { key: p.id, value: p.name, onSelect: function () { return handleProductSelect(p.id); } },
                                                p.name,
                                                " ",
                                                react_1["default"].createElement("span", { className: "text-muted-foreground ml-1 text-[10px]" },
                                                    "(",
                                                    p.sku || "N/A",
                                                    ")"))); }))))))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-location-filter", className: "text-xs font-medium" }, "Ubicaci\u00F3n"),
                        react_1["default"].createElement(select_1.Select, { value: selectedLocationId, onValueChange: function (v) { return setSelectedLocationId(v); }, disabled: isLoadingLocations },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "kardex-location-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todas" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todas"), locations === null || locations === void 0 ? void 0 :
                                locations.map(function (l) { return (react_1["default"].createElement(select_1.SelectItem, { key: l.id, value: l.id }, l.name)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-movtype-filter", className: "text-xs font-medium" }, "Tipo Movimiento"),
                        react_1["default"].createElement(select_1.Select, { value: selectedMovementType, onValueChange: function (v) { return setSelectedMovementType(v); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "kardex-movtype-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todos"),
                                ALL_MOVEMENT_TYPES.map(function (t) { return (react_1["default"].createElement(select_1.SelectItem, { key: t, value: t }, movementTypeLabels[t] || t)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-user-filter", className: "text-xs font-medium" }, "Usuario"),
                        react_1["default"].createElement(select_1.Select, { value: selectedUserId, onValueChange: function (v) { return setSelectedUserId(v); }, disabled: isLoadingUsers },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "kardex-user-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todos"), users === null || users === void 0 ? void 0 :
                                users.map(function (u) { return (react_1["default"].createElement(select_1.SelectItem, { key: u.id, value: u.id },
                                    u.firstName,
                                    " ",
                                    u.lastName)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-reftype-filter", className: "text-xs font-medium" }, "Tipo Referencia"),
                        react_1["default"].createElement(input_1.Input, { id: "kardex-reftype-filter", className: "h-9 text-xs", placeholder: "Ej: SALE, PO", value: referenceType, onChange: function (e) { return setReferenceType(e.target.value); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-refid-filter", className: "text-xs font-medium" }, "ID Referencia"),
                        react_1["default"].createElement(input_1.Input, { id: "kardex-refid-filter", className: "h-9 text-xs", placeholder: "Ej: VTA-001", value: referenceId, onChange: function (e) { return setReferenceId(e.target.value); } })),
                    react_1["default"].createElement("div", { className: "flex items-end space-x-2" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { htmlFor: "kardex-orderby-filter", className: "text-xs font-medium" }, "Ordenar Por"),
                            react_1["default"].createElement(select_1.Select, { value: orderBy, onValueChange: function (v) { return setOrderBy(v); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "kardex-orderby-filter" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "movementDate" }, "Fecha"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "productName" }, "Producto"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "movementType" }, "Tipo")))),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "icon", onClick: toggleSortOrder, className: "h-9 w-9 shrink-0", title: "Orden: " + (sortOrder === "asc" ? "Ascendente" : "Descendente") }, sortOrder === "asc" ? (react_1["default"].createElement(lucide_react_1.SortAsc, { className: "h-4 w-4" })) : (react_1["default"].createElement(lucide_react_1.SortDesc, { className: "h-4 w-4" }))))))),
        isKardexMode &&
            (reportData === null || reportData === void 0 ? void 0 : reportData.openingBalance) !== null &&
            !isLoadingReport && (react_1["default"].createElement(card_1.Card, { className: "mb-4 shrink-0 bg-amber-50 border-amber-200" },
            react_1["default"].createElement(card_1.CardContent, { className: "p-3 text-sm" },
                react_1["default"].createElement("strong", null, "Saldo Inicial del Producto"),
                " (antes de",
                " ",
                formatters_1.formatDate(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from, "dd/MM/yy"),
                "):",
                react_1["default"].createElement("span", { className: "font-semibold ml-2" },
                    reportData.openingBalance,
                    " und.")))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-hidden" },
            react_1["default"].createElement(card_1.Card, { className: "h-full flex flex-col" },
                react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4 shrink-0" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Detalle de Movimientos de Stock")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0 flex-1 overflow-hidden" },
                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-full" },
                        react_1["default"].createElement(table_1.Table, { className: "text-xs" },
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[120px]" }, "Fecha"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[180px] sticky left-0 bg-background z-10" }, "Producto"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[100px]" }, "SKU"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[120px]" }, "IMEI/Serial"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[150px]" }, "Tipo Mov."),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[80px]" }, "Cant +/-"),
                                    isKardexMode && (react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[80px] font-semibold" }, "Saldo")),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[100px]" }, "Costo Mov."),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[100px]" }, "Valor Mov."),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[120px]" }, "Desde Ubic."),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[120px]" }, "Hacia Ubic."),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[150px]" }, "Referencia"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[120px]" }, "Usuario"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[200px]" }, "Notas"))),
                            react_1["default"].createElement(table_1.TableBody, null, isLoadingReport || isFetchingReport ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-mov-" + i }, __spreadArrays(Array(isKardexMode ? 14 : 13)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: isKardexMode ? 14 : 13, className: "text-center text-red-500 py-10" },
                                    "Error: ",
                                    error.message))) : ((_c = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _c === void 0 ? void 0 : _c.length) === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: isKardexMode ? 14 : 13, className: "text-center py-10 text-muted-foreground" }, "No se encontraron movimientos con los filtros aplicados."))) : (reportData === null || reportData === void 0 ? void 0 : reportData.data.map(function (mov) { return (react_1["default"].createElement(table_1.TableRow, { key: mov.id },
                                react_1["default"].createElement(table_1.TableCell, null, formatters_1.formatDate(mov.movementDate, "dd/MM/yy HH:mm")),
                                react_1["default"].createElement(table_1.TableCell, { className: "font-medium max-w-[180px] truncate sticky left-0 bg-background z-0", title: mov.productName }, mov.productName),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-muted-foreground max-w-[100px] truncate" }, mov.productSku || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-muted-foreground max-w-[120px] truncate" }, mov.imei || "-"),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, movementTypeLabels[mov.movementType] ||
                                        mov.movementType)),
                                react_1["default"].createElement(table_1.TableCell, { className: utils_1.cn("text-right font-semibold", mov.quantityChange > 0
                                        ? "text-green-600"
                                        : "text-red-600") }, mov.quantityChange > 0
                                    ? "+" + mov.quantityChange
                                    : mov.quantityChange),
                                isKardexMode && (react_1["default"].createElement(table_1.TableCell, { className: "text-right font-bold" }, mov.balanceAfterMovement)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(mov.unitCostAtTimeOfMovement)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(mov.totalValueChange)),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[100px] truncate", title: mov.fromLocationName || "" }, mov.fromLocationName || "-"),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[100px] truncate", title: mov.toLocationName || "" }, mov.toLocationName || "-"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-[11px] max-w-[150px] truncate", title: (mov.referenceType || "") + " " + (mov.referenceId || "") }, mov.referenceType && mov.referenceId
                                    ? mov.referenceType + ": " + mov.referenceId
                                    : mov.referenceType || mov.referenceId || "-"),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[120px] truncate", title: mov.userName || "" }, mov.userName || "Sistema"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-xs max-w-[200px] truncate", title: mov.notes || "" }, mov.notes || "-"))); })))))))),
        isKardexMode &&
            (reportData === null || reportData === void 0 ? void 0 : reportData.closingBalance) !== null &&
            (reportData === null || reportData === void 0 ? void 0 : reportData.closingBalance) !== undefined &&
            reportData.page === reportData.totalPages &&
            !isLoadingReport && (react_1["default"].createElement(card_1.Card, { className: "mt-4 shrink-0 bg-amber-50 border-amber-200" },
            react_1["default"].createElement(card_1.CardContent, { className: "p-3 text-sm text-right" },
                react_1["default"].createElement("strong", null, "Saldo Final del Producto"),
                " (al",
                " ",
                formatters_1.formatDate(dateRange === null || dateRange === void 0 ? void 0 : dateRange.to, "dd/MM/yy"),
                "):",
                react_1["default"].createElement("span", { className: "font-semibold ml-2" },
                    reportData.closingBalance,
                    " und.")))),
        reportData && reportData.total > 0 && (react_1["default"].createElement("div", { className: "pt-4 shrink-0" },
            react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: reportData.page, totalPages: reportData.totalPages, totalRecords: reportData.total, limit: reportData.limit, onPageChange: function (newPage) { return setCurrentPage(newPage); }, isFetching: isFetchingReport })))));
}
exports["default"] = StockMovementsReportPage;
