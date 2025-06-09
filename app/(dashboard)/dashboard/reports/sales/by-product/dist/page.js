// app/(dashboard)/reports/sales/by-product/page.tsx
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
var scroll_area_1 = require("@/components/ui/scroll-area");
var label_1 = require("@/components/ui/label");
var date_fns_1 = require("date-fns");
var lucide_react_1 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var formatters_1 = require("@/lib/utils/formatters");
var prisma_enums_1 = require("@/types/prisma-enums"); // Ajusta la ruta al DTO del backend si lo necesitas para los valores del enum
var sonner_1 = require("sonner");
var ALL_ITEMS_FILTER_VALUE = "__ALL__"; // O un string vacío
function SalesByProductReportPage() {
    var _this = this;
    var _a, _b, _c;
    // --- Estados para Filtros ---
    var _d = react_1.useState({
        from: date_fns_1.startOfMonth(new Date()),
        to: date_fns_1.endOfMonth(new Date())
    }), dateRange = _d[0], setDateRange = _d[1];
    var _e = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedCategoryId = _e[0], setSelectedCategoryId = _e[1];
    var _f = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedSupplierId = _f[0], setSelectedSupplierId = _f[1];
    var _g = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedProductId = _g[0], setSelectedProductId = _g[1];
    var _h = react_1.useState(""), productSearchTerm = _h[0], setProductSearchTerm = _h[1];
    var debouncedProductSearch = use_debounce_1.useDebounce(productSearchTerm, 300);
    var _j = react_1.useState(false), isProductPopoverOpen = _j[0], setIsProductPopoverOpen = _j[1];
    var _k = react_1.useState(prisma_enums_1.SalesByProductOrderBy.QUANTITY_SOLD), orderBy = _k[0], setOrderBy = _k[1];
    var _l = react_1.useState("desc"), sortOrder = _l[0], setSortOrder = _l[1];
    var _m = react_1.useState(1), currentPage = _m[0], setCurrentPage = _m[1];
    var limitPerPage = react_1.useState(25)[0];
    // --- Fetch para Selectores de Filtro ---
    var _o = react_query_1.useQuery({
        queryKey: ["allCategoriesForReportFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/categories?limit=500")
                .then(function (res) { return res.data.data || []; });
        }
    }), categories = _o.data, isLoadingCategories = _o.isLoading;
    var _p = react_query_1.useQuery({
        queryKey: ["allSuppliersForReportFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/suppliers?limit=500")
                .then(function (res) { return res.data.data || []; });
        }
    }), suppliers = _p.data, isLoadingSuppliers = _p.isLoading;
    var _q = react_query_1.useQuery({
        queryKey: ["allProductsForSBPreportFilter", debouncedProductSearch],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?isActive=true&limit=20" + (debouncedProductSearch ? "&search=" + debouncedProductSearch : ""))
                .then(function (res) { return res.data.data || []; });
        },
        enabled: debouncedProductSearch.length > 1 ||
            debouncedProductSearch.length === 0
    }), productsForFilter = _q.data, isLoadingProductsForFilter = _q.isLoading;
    // --- Query Principal para el Reporte ---
    var queryParams = react_1.useMemo(function () {
        if (!(dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) || !(dateRange === null || dateRange === void 0 ? void 0 : dateRange.to))
            return null;
        var params = {
            startDate: date_fns_1.format(dateRange.from, "yyyy-MM-dd"),
            endDate: date_fns_1.format(dateRange.to, "yyyy-MM-dd"),
            page: currentPage,
            limit: limitPerPage,
            orderBy: orderBy,
            sortOrder: sortOrder
        };
        if (selectedCategoryId !== ALL_ITEMS_FILTER_VALUE)
            params.categoryId = selectedCategoryId;
        if (selectedSupplierId !== ALL_ITEMS_FILTER_VALUE)
            params.supplierId = selectedSupplierId;
        if (selectedProductId !== ALL_ITEMS_FILTER_VALUE)
            params.productId = selectedProductId;
        return params;
    }, [
        dateRange,
        selectedCategoryId,
        selectedSupplierId,
        selectedProductId,
        currentPage,
        limitPerPage,
        orderBy,
        sortOrder,
    ]);
    var _r = react_query_1.useQuery({
        queryKey: ["salesByProductReport", queryParams],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!queryParams)
                            throw new Error("Rango de fechas es requerido.");
                        return [4 /*yield*/, api_1["default"].get("/reports/sales/by-product", {
                                params: queryParams
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        enabled: !!queryParams,
        placeholderData: function (prev) { return prev; }
    }), reportData = _r.data, isLoadingReport = _r.isLoading, isFetchingReport = _r.isFetching, isError = _r.isError, error = _r.error;
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [
        dateRange,
        selectedCategoryId,
        selectedSupplierId,
        selectedProductId,
        orderBy,
        sortOrder,
    ]);
    var handleDownloadPDF = function () {
        return sonner_1.toast.info("TODO: Implementar descarga de PDF para Ventas por Producto.");
    };
    var clearFilters = function () {
        /* ... tu lógica para limpiar filtros ... */
        setDateRange({
            from: date_fns_1.startOfMonth(new Date()),
            to: date_fns_1.endOfMonth(new Date())
        });
        setSelectedCategoryId(ALL_ITEMS_FILTER_VALUE);
        setSelectedSupplierId(ALL_ITEMS_FILTER_VALUE);
        setSelectedProductId(ALL_ITEMS_FILTER_VALUE);
        setProductSearchTerm("");
        setOrderBy(prisma_enums_1.SalesByProductOrderBy.QUANTITY_SOLD);
        setSortOrder("desc");
        setCurrentPage(1);
    };
    var handleProductSelect = function (productId) {
        setSelectedProductId(productId === "all" ? ALL_ITEMS_FILTER_VALUE : productId);
        setIsProductPopoverOpen(false);
    };
    var toggleSortOrder = function () {
        return setSortOrder(function (prev) { return (prev === "asc" ? "desc" : "asc"); });
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col h-full p-4 md:p-6 space-y-4" },
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Reporte de Ventas por Producto/Servicio", description: "Analiza el rendimiento de ventas para cada \u00EDtem en el per\u00EDodo seleccionado.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleDownloadPDF, variant: "outline", size: "sm", disabled: isLoadingReport || !((_a = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _a === void 0 ? void 0 : _a.length) },
                react_1["default"].createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" }),
                " Descargar PDF") }),
        react_1["default"].createElement(card_1.Card, { className: "shrink-0" },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
                    "Filtros del Reporte"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: clearFilters, size: "sm", className: "text-xs text-muted-foreground hover:text-primary" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "mr-1 h-3 w-3" }),
                    " Limpiar Filtros")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4" },
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 items-end" },
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "report-date-range", className: "text-xs font-medium" }, "Rango de Fechas*"),
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { id: "report-date-range", date: dateRange, onDateChange: setDateRange, className: "w-full h-9 mt-1" })),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "category-filter", className: "text-xs font-medium" }, "Categor\u00EDa"),
                        react_1["default"].createElement(select_1.Select, { value: selectedCategoryId, onValueChange: function (value) {
                                return setSelectedCategoryId(value === ALL_ITEMS_FILTER_VALUE
                                    ? ALL_ITEMS_FILTER_VALUE
                                    : value);
                            }, disabled: isLoadingCategories },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "category-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todas las Categor\u00EDas" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todas las Categor\u00EDas"),
                                isLoadingCategories && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-cat", disabled: true }, "Cargando...")), categories === null || categories === void 0 ? void 0 :
                                categories.map(function (cat) { return (react_1["default"].createElement(select_1.SelectItem, { key: cat.id, value: cat.id }, cat.name)); })))),
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement(label_1.Label, { htmlFor: "supplier-filter", className: "text-xs font-medium" }, "Proveedor"),
                        react_1["default"].createElement(select_1.Select, { value: selectedSupplierId, onValueChange: function (value) {
                                return setSelectedSupplierId(value === ALL_ITEMS_FILTER_VALUE
                                    ? ALL_ITEMS_FILTER_VALUE
                                    : value);
                            }, disabled: isLoadingSuppliers },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "supplier-filter" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos los Proveedores" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todos los Proveedores"),
                                isLoadingSuppliers && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-sup", disabled: true }, "Cargando...")), suppliers === null || suppliers === void 0 ? void 0 :
                                suppliers.map(function (sup) { return (react_1["default"].createElement(select_1.SelectItem, { key: sup.id, value: sup.id }, sup.name)); })))),
                    react_1["default"].createElement("div", { className: "lg:col-span-2 xl:col-span-2 space-y-1" },
                        " ",
                        react_1["default"].createElement(label_1.Label, { htmlFor: "product-filter-trigger", className: "text-xs font-medium" }, "Producto Espec\u00EDfico"),
                        react_1["default"].createElement(popover_1.Popover, { open: isProductPopoverOpen, onOpenChange: setIsProductPopoverOpen },
                            react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true, id: "product-filter-trigger" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", className: "w-full h-9 justify-between font-normal text-xs truncate" },
                                    react_1["default"].createElement("span", { className: "truncate" }, (selectedProductId !== ALL_ITEMS_FILTER_VALUE && ((_b = productsForFilter === null || productsForFilter === void 0 ? void 0 : productsForFilter.find(function (p) { return p.id === selectedProductId; })) === null || _b === void 0 ? void 0 : _b.name)) ||
                                        "Todos los Productos"),
                                    react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-3 w-3 shrink-0 opacity-50" }))),
                            react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0", align: "start" },
                                react_1["default"].createElement(command_1.Command, { filter: function (value, search) {
                                        return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                                    } },
                                    react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar producto...", value: productSearchTerm, onValueChange: setProductSearchTerm, className: "text-xs h-8" }),
                                    react_1["default"].createElement(command_1.CommandList, null,
                                        react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingProductsForFilter
                                            ? "Buscando..."
                                            : "No encontrado."),
                                        react_1["default"].createElement(command_1.CommandGroup, null,
                                            react_1["default"].createElement(command_1.CommandItem, { key: "all-prod-filter", value: ALL_ITEMS_FILTER_VALUE, onSelect: function () {
                                                    return handleProductSelect(ALL_ITEMS_FILTER_VALUE);
                                                } }, "Todos los Productos"), productsForFilter === null || productsForFilter === void 0 ? void 0 :
                                            productsForFilter.map(function (p) { return (react_1["default"].createElement(command_1.CommandItem, { key: p.id, value: p.name, onSelect: function () { return handleProductSelect(p.id); } },
                                                p.name,
                                                " ",
                                                p.sku && (react_1["default"].createElement("span", { className: "text-muted-foreground ml-1 text-[10px]" },
                                                    "(",
                                                    p.sku,
                                                    ")")))); }))))))),
                    react_1["default"].createElement("div", { className: "flex items-end space-x-2 xl:col-span-1" },
                        " ",
                        react_1["default"].createElement("div", { className: "flex-1 space-y-1" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "orderby-filter", className: "text-xs font-medium" }, "Ordenar Por"),
                            react_1["default"].createElement(select_1.Select, { value: orderBy, onValueChange: function (v) { return setOrderBy(v); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "orderby-filter" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.SalesByProductOrderBy.QUANTITY_SOLD }, "Cant. Vendida"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.SalesByProductOrderBy.REVENUE }, "Ingresos"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.SalesByProductOrderBy.PROFIT }, "Ganancia"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.SalesByProductOrderBy.PRODUCT_NAME }, "Nombre Producto")))),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "icon", onClick: toggleSortOrder, className: "h-9 w-9 shrink-0", title: "Orden: " + (sortOrder === "asc" ? "Ascendente" : "Descendente") }, sortOrder === "asc" ? (react_1["default"].createElement(lucide_react_1.SortAsc, { className: "h-4 w-4" })) : (react_1["default"].createElement(lucide_react_1.SortDesc, { className: "h-4 w-4" }))))))),
        (reportData === null || reportData === void 0 ? void 0 : reportData.reportGrandTotals) && !isLoadingReport && (react_1["default"].createElement(card_1.Card, { className: "mb-4 shrink-0" },
            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Totales Globales del Reporte")),
            react_1["default"].createElement(card_1.CardContent, { className: "px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-2 text-sm" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Productos \u00DAnicos:"),
                    react_1["default"].createElement("strong", { className: "block" }, reportData.reportGrandTotals.totalUniqueProductsSold)),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "\u00CDtems Vendidos:"),
                    react_1["default"].createElement("strong", { className: "block" }, reportData.reportGrandTotals.totalItemsSold)),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Ingresos Totales:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalRevenue))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Costo Total:"),
                    react_1["default"].createElement("strong", { className: "block" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalCostOfGoodsSold))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("span", { className: "text-muted-foreground" }, "Ganancia Total:"),
                    react_1["default"].createElement("strong", { className: "block font-semibold text-green-600" }, formatters_1.formatCurrency(reportData.reportGrandTotals.totalProfit)))))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-hidden" },
            react_1["default"].createElement(card_1.Card, { className: "h-full flex flex-col" },
                react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4 shrink-0" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Detalle de Ventas por Producto/Servicio")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0 flex-1 overflow-hidden" },
                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-full" },
                        react_1["default"].createElement(table_1.Table, { className: "sticky top-0 bg-background z-10" },
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[200px] sticky left-0 bg-background z-10" }, "Producto/Servicio"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[100px]" }, "SKU"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Cant. Vendida"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[120px]" }, "P. Venta Prom."),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[120px]" }, "Ingresos Totales"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Costo Prom."),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Costo Total"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[110px] font-semibold" }, "Ganancia Total"))),
                            react_1["default"].createElement(table_1.TableBody, null, isLoadingReport || isFetchingReport ? (__spreadArrays(Array(limitPerPage)).map(function (_, i // Mostrar skeletons según el limitPerPage
                            ) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-prod-report-" + i }, __spreadArrays(Array(8)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center text-red-500 py-10" },
                                    "Error al cargar el reporte: ",
                                    error.message))) : ((_c = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _c === void 0 ? void 0 : _c.length) === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-10 text-muted-foreground" }, "No se encontraron resultados con los filtros aplicados."))) : (reportData === null || reportData === void 0 ? void 0 : reportData.data.map(function (item) { return (react_1["default"].createElement(table_1.TableRow, { key: item.productId },
                                react_1["default"].createElement(table_1.TableCell, { className: "font-medium max-w-[250px] truncate sticky left-0 bg-background z-0", title: item.productName }, item.productName),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-muted-foreground max-w-[100px] truncate", title: item.productSku || "" }, item.productSku || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, item.totalQuantitySold),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(item.averageSellingPrice)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(item.totalRevenue)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(item.averageCost)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(item.totalCostOfGoodsSold)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold" }, formatters_1.formatCurrency(item.totalProfit)))); })))))))),
        reportData && reportData.total > 0 && (react_1["default"].createElement("div", { className: "pt-4 shrink-0" },
            react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: reportData.page, totalPages: reportData.totalPages, totalRecords: reportData.total, limit: reportData.limit, onPageChange: function (newPage) { return setCurrentPage(newPage); }, isFetching: isFetchingReport })))));
}
exports["default"] = SalesByProductReportPage;
