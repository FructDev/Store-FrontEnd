// app/(dashboard)/reports/inventory/valuation/page.tsx
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
var _a, _b;
exports.__esModule = true;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var page_header_1 = require("@/components/common/page-header");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var skeleton_1 = require("@/components/ui/skeleton");
var popover_1 = require("@/components/ui/popover");
var command_1 = require("@/components/ui/command");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var scroll_area_1 = require("@/components/ui/scroll-area");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var formatters_1 = require("@/lib/utils/formatters"); // Asumiendo que tienes este
var reports_types_1 = require("@/types/reports.types");
var sonner_1 = require("sonner");
var ALL_ITEMS_FILTER_VALUE = "ALL_VALUES"; // Usar string vacío para "Todos"
var stockValuationThresholdLabels = (_a = {},
    _a[reports_types_1.ReportStockValuationThreshold.ALL_PRODUCTS] = "Todos los Productos (incl. stock 0)",
    _a[reports_types_1.ReportStockValuationThreshold.POSITIVE_STOCK_ONLY] = "Solo con Stock Positivo (>0)",
    _a);
var ALL_THRESHOLDS = Object.values(reports_types_1.ReportStockValuationThreshold);
var stockValuationSortByLabels = (_b = {},
    _b[reports_types_1.StockValuationSortBy.PRODUCT_NAME] = "Nombre Producto",
    _b[reports_types_1.StockValuationSortBy.TOTAL_STOCK_VALUE] = "Valor Total Stock",
    _b[reports_types_1.StockValuationSortBy.CURRENT_STOCK_QUANTITY] = "Cantidad Stock Actual",
    _b);
var ALL_SORT_BY_OPTIONS = Object.values(reports_types_1.StockValuationSortBy);
function StockValuationReportPage() {
    var _this = this;
    var _a, _b, _c;
    var _d = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedLocationId = _d[0], setSelectedLocationId = _d[1];
    var _e = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedCategoryId = _e[0], setSelectedCategoryId = _e[1];
    var _f = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedSupplierId = _f[0], setSelectedSupplierId = _f[1];
    var _g = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedProductId = _g[0], setSelectedProductId = _g[1];
    var _h = react_1.useState(""), productSearchTerm = _h[0], setProductSearchTerm = _h[1];
    var debouncedProductSearch = use_debounce_1.useDebounce(productSearchTerm, 300);
    var _j = react_1.useState(false), isProductPopoverOpen = _j[0], setIsProductPopoverOpen = _j[1];
    var _k = react_1.useState(reports_types_1.ReportStockValuationThreshold.POSITIVE_STOCK_ONLY), threshold = _k[0], setThreshold = _k[1];
    var _l = react_1.useState(reports_types_1.StockValuationSortBy.PRODUCT_NAME), orderBy = _l[0], setOrderBy = _l[1];
    var _m = react_1.useState("asc"), sortOrder = _m[0], setSortOrder = _m[1];
    var _o = react_1.useState(1), currentPage = _o[0], setCurrentPage = _o[1];
    var limitPerPage = react_1.useState(25)[0];
    // --- Fetch para Selectores de Filtro ---
    var _p = react_query_1.useQuery({
        queryKey: ["allActiveLocationsForFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || []; });
        }
    }), locations = _p.data, isLoadingLocations = _p.isLoading;
    var _q = react_query_1.useQuery({
        queryKey: ["allActiveCategoriesForFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/categories?limit=500")
                .then(function (res) { return res.data.data || []; });
        }
    }), categories = _q.data, isLoadingCategories = _q.isLoading;
    var _r = react_query_1.useQuery({
        queryKey: ["allActiveSuppliersForFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/suppliers?isActive=true&limit=500")
                .then(function (res) { return res.data.data || []; });
        }
    }), suppliers = _r.data, isLoadingSuppliers = _r.isLoading;
    var _s = react_query_1.useQuery({
        queryKey: ["allActiveProductsForValuationFilter", debouncedProductSearch],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?isActive=true&limit=20" + (debouncedProductSearch ? "&search=" + debouncedProductSearch : ""))
                .then(function (res) { return res.data.data || []; });
        },
        enabled: isProductPopoverOpen
    }), productsForFilter = _s.data, isLoadingProductsForFilter = _s.isLoading;
    // --- Query Principal para el Reporte ---
    var queryParams = react_1.useMemo(function () {
        var params = {
            page: currentPage,
            limit: limitPerPage,
            sortBy: orderBy,
            sortOrder: sortOrder,
            threshold: threshold
        };
        if (selectedLocationId && selectedLocationId !== ALL_ITEMS_FILTER_VALUE)
            params.locationId = selectedLocationId;
        if (selectedCategoryId && selectedCategoryId !== ALL_ITEMS_FILTER_VALUE)
            params.categoryId = selectedCategoryId;
        if (selectedSupplierId && selectedSupplierId !== ALL_ITEMS_FILTER_VALUE)
            params.supplierId = selectedSupplierId;
        if (selectedProductId && selectedProductId !== ALL_ITEMS_FILTER_VALUE)
            params.productId = selectedProductId;
        return params;
    }, [
        selectedLocationId,
        selectedCategoryId,
        selectedSupplierId,
        selectedProductId,
        threshold,
        currentPage,
        limitPerPage,
        orderBy,
        sortOrder,
    ]);
    var _t = react_query_1.useQuery({
        queryKey: ["stockValuationReport", queryParams],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].get("/reports/inventory/valuation", {
                            params: queryParams
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (prev) { return prev; }
    }), reportData = _t.data, isLoadingReport = _t.isLoading, isFetchingReport = _t.isFetching, isError = _t.isError, error = _t.error;
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [queryParams]);
    var handleDownloadPDF = function () {
        return sonner_1.toast.info("TODO: Implementar descarga de PDF para Valorización de Stock.");
    };
    var clearFilters = function () {
        setSelectedLocationId(ALL_ITEMS_FILTER_VALUE);
        setSelectedCategoryId(ALL_ITEMS_FILTER_VALUE);
        setSelectedSupplierId(ALL_ITEMS_FILTER_VALUE);
        setSelectedProductId(ALL_ITEMS_FILTER_VALUE);
        setProductSearchTerm("");
        setThreshold(reports_types_1.ReportStockValuationThreshold.POSITIVE_STOCK_ONLY);
        setOrderBy(reports_types_1.StockValuationSortBy.PRODUCT_NAME);
        setSortOrder("asc");
        setCurrentPage(1);
    };
    var handleProductSelect = function (productIdValue) {
        setSelectedProductId(productIdValue === ALL_ITEMS_FILTER_VALUE
            ? ALL_ITEMS_FILTER_VALUE
            : productIdValue);
        var product = productsForFilter === null || productsForFilter === void 0 ? void 0 : productsForFilter.find(function (p) { return p.id === productIdValue; });
        setProductSearchTerm(product ? product.name : ""); // Actualizar el input de búsqueda con el nombre
        setIsProductPopoverOpen(false);
    };
    var toggleSortOrder = function () {
        return setSortOrder(function (prev) { return (prev === "asc" ? "desc" : "asc"); });
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col h-full p-4 md:p-6 space-y-4" },
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Reporte de Valorizaci\u00F3n de Inventario", description: "Valor actual de tu stock al costo, filtrable por diversos criterios.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleDownloadPDF, variant: "outline", size: "sm", disabled: isLoadingReport || !((_a = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _a === void 0 ? void 0 : _a.length) },
                react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                " Descargar PDF") }),
        react_1["default"].createElement(card_1.Card, { className: "shrink-0" },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "h-4 w-4 mr-2" }),
                    "Filtros"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: clearFilters, className: "text-xs" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3 w-3 mr-1" }),
                    "Limpiar")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "val-location-filter", className: "text-xs" }, "Ubicaci\u00F3n"),
                        react_1["default"].createElement(select_1.Select, { value: selectedLocationId, onValueChange: setSelectedLocationId, disabled: isLoadingLocations },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "val-location-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todas" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todas"), locations === null || locations === void 0 ? void 0 :
                                locations.map(function (l) { return (react_1["default"].createElement(select_1.SelectItem, { key: l.id, value: l.id }, l.name)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "val-category-filter", className: "text-xs" }, "Categor\u00EDa"),
                        react_1["default"].createElement(select_1.Select, { value: selectedCategoryId, onValueChange: setSelectedCategoryId, disabled: isLoadingCategories },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "val-category-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todas" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todas"), categories === null || categories === void 0 ? void 0 :
                                categories.map(function (c) { return (react_1["default"].createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.name)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "val-supplier-filter", className: "text-xs" }, "Proveedor"),
                        react_1["default"].createElement(select_1.Select, { value: selectedSupplierId, onValueChange: setSelectedSupplierId, disabled: isLoadingSuppliers },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "val-supplier-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todos"), suppliers === null || suppliers === void 0 ? void 0 :
                                suppliers.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s.id, value: s.id }, s.name)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "val-product-filter", className: "text-xs" }, "Producto Espec\u00EDfico"),
                        react_1["default"].createElement(popover_1.Popover, { open: isProductPopoverOpen, onOpenChange: setIsProductPopoverOpen },
                            react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                react_1["default"].createElement(button_1.Button, { id: "val-product-filter", variant: "outline", role: "combobox", className: "w-full h-9 justify-between font-normal text-xs truncate" },
                                    react_1["default"].createElement("span", { className: "truncate" }, (selectedProductId !== ALL_ITEMS_FILTER_VALUE && ((_b = productsForFilter === null || productsForFilter === void 0 ? void 0 : productsForFilter.find(function (p) { return p.id === selectedProductId; })) === null || _b === void 0 ? void 0 : _b.name)) ||
                                        "Todos"),
                                    react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-3 w-3 shrink-0 opacity-50" }))),
                            react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0", align: "start" },
                                react_1["default"].createElement(command_1.Command, null,
                                    react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar producto...", value: productSearchTerm, onValueChange: setProductSearchTerm, className: "text-xs h-8" }),
                                    react_1["default"].createElement(command_1.CommandList, null,
                                        react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingProductsForFilter
                                            ? "Buscando..."
                                            : "No encontrado."),
                                        react_1["default"].createElement(command_1.CommandGroup, null,
                                            react_1["default"].createElement(command_1.CommandItem, { value: ALL_ITEMS_FILTER_VALUE, onSelect: function () {
                                                    return handleProductSelect(ALL_ITEMS_FILTER_VALUE);
                                                } }, "Todos"), productsForFilter === null || productsForFilter === void 0 ? void 0 :
                                            productsForFilter.map(function (p) { return (react_1["default"].createElement(command_1.CommandItem, { key: p.id, value: p.name, onSelect: function () { return handleProductSelect(p.id); } },
                                                p.name,
                                                " ",
                                                react_1["default"].createElement("span", { className: "text-muted-foreground ml-1 text-[10px]" },
                                                    "(",
                                                    p.sku || "N/A",
                                                    ")"))); }))))))),
                    react_1["default"].createElement("div", { className: "xl:col-span-2" },
                        " ",
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 items-end" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement(label_1.Label, { htmlFor: "val-threshold-filter", className: "text-xs" }, "Mostrar Productos"),
                                react_1["default"].createElement(select_1.Select, { value: threshold, onValueChange: function (v) {
                                        return setThreshold(v);
                                    } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "val-threshold-filter" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: reports_types_1.ReportStockValuationThreshold.POSITIVE_STOCK_ONLY }, stockValuationThresholdLabels[reports_types_1.ReportStockValuationThreshold.POSITIVE_STOCK_ONLY]),
                                        react_1["default"].createElement(select_1.SelectItem, { value: reports_types_1.ReportStockValuationThreshold.ALL_PRODUCTS }, stockValuationThresholdLabels[reports_types_1.ReportStockValuationThreshold.ALL_PRODUCTS])))),
                            react_1["default"].createElement("div", { className: "flex items-end space-x-2" },
                                react_1["default"].createElement("div", { className: "flex-1" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "val-orderby-filter", className: "text-xs" }, "Ordenar Por"),
                                    react_1["default"].createElement(select_1.Select, { value: orderBy, onValueChange: function (v) {
                                            return setOrderBy(v);
                                        } },
                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "val-orderby-filter" },
                                            react_1["default"].createElement(select_1.SelectValue, null)),
                                        react_1["default"].createElement(select_1.SelectContent, null,
                                            react_1["default"].createElement(select_1.SelectItem, { value: reports_types_1.StockValuationSortBy.PRODUCT_NAME }, stockValuationSortByLabels[reports_types_1.StockValuationSortBy.PRODUCT_NAME]),
                                            react_1["default"].createElement(select_1.SelectItem, { value: reports_types_1.StockValuationSortBy.TOTAL_STOCK_VALUE }, stockValuationSortByLabels[reports_types_1.StockValuationSortBy.TOTAL_STOCK_VALUE]),
                                            react_1["default"].createElement(select_1.SelectItem, { value: reports_types_1.StockValuationSortBy.CURRENT_STOCK_QUANTITY }, stockValuationSortByLabels[reports_types_1.StockValuationSortBy.CURRENT_STOCK_QUANTITY])))),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "icon", onClick: toggleSortOrder, className: "h-9 w-9 shrink-0", title: "Orden: " + (sortOrder === "asc" ? "Ascendente" : "Descendente") }, sortOrder === "asc" ? (react_1["default"].createElement(lucide_react_1.SortAsc, { className: "h-4 w-4" })) : (react_1["default"].createElement(lucide_react_1.SortDesc, { className: "h-4 w-4" }))))))))),
        (reportData === null || reportData === void 0 ? void 0 : reportData.reportGrandTotals) && !isLoadingReport && (react_1["default"].createElement(card_1.Card, { className: "mb-4 shrink-0" },
            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Valorizaci\u00F3n Total (Seg\u00FAn Filtros)")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Productos \u00DAnicos Listados:"),
                    react_1["default"].createElement("strong", { className: "block text-lg" }, reportData.reportGrandTotals.totalUniqueProductsInStock)),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Unidades Totales en Stock:"),
                    react_1["default"].createElement("strong", { className: "block text-lg" }, reportData.reportGrandTotals.totalStockUnits)),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Valor Total del Stock:"),
                    react_1["default"].createElement("strong", { className: "block text-lg font-semibold text-green-600" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalOverallStockValue)))))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-hidden" },
            react_1["default"].createElement(card_1.Card, { className: "h-full flex flex-col" },
                react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4 shrink-0" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Valorizaci\u00F3n de Inventario por Producto")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0 flex-1 overflow-hidden" },
                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-full" },
                        react_1["default"].createElement(table_1.Table, { className: "text-xs" },
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[250px] sticky left-0 bg-background z-10" }, "Producto"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[120px]" }, "SKU"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[150px]" }, "Categor\u00EDa"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[100px]" }, "Stock Actual"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[100px]" }, "Costo Usado"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right w-[140px] font-semibold" }, "Valor Total Stock"))),
                            react_1["default"].createElement(table_1.TableBody, null, isLoadingReport || isFetchingReport ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-val-report-" + i }, __spreadArrays(Array(6)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 6, className: "text-center text-red-500 py-10" },
                                    "Error: ",
                                    error.message))) : ((_c = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _c === void 0 ? void 0 : _c.length) === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-10 text-muted-foreground" }, "No hay productos para valorizar con los filtros aplicados."))) : (reportData === null || reportData === void 0 ? void 0 : reportData.data.map(function (item) { return (react_1["default"].createElement(table_1.TableRow, { key: item.productId },
                                react_1["default"].createElement(table_1.TableCell, { className: "font-medium max-w-[250px] truncate sticky left-0 bg-background z-0", title: item.productName }, item.productName),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-muted-foreground max-w-[100px] truncate", title: item.productSku || "" }, item.productSku || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, { className: "max-w-[150px] truncate", title: item.categoryName || "" }, item.categoryName || "-"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right font-medium" }, item.currentStockQuantity),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(item.costPriceUsed)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold" }, formatters_1.formatCurrency(item.totalStockValueByProduct)))); })))))))),
        reportData && reportData.total > 0 && (react_1["default"].createElement("div", { className: "pt-4 shrink-0" },
            react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: reportData.page, totalPages: reportData.totalPages, totalRecords: reportData.total, limit: reportData.limit, onPageChange: function (newPage) { return setCurrentPage(newPage); }, isFetching: isFetchingReport })))));
}
exports["default"] = StockValuationReportPage;
