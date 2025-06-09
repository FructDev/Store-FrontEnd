// app/(dashboard)/reports/inventory/low-stock/page.tsx
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
var select_1 = require("@/components/ui/select");
var skeleton_1 = require("@/components/ui/skeleton");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var scroll_area_1 = require("@/components/ui/scroll-area");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var ALL_ITEMS_FILTER_VALUE = "__ALL__"; // O un string vacío ""
function LowStockReportPage() {
    var _this = this;
    var _a, _b;
    // --- Estados para Filtros ---
    var _c = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedCategoryId = _c[0], setSelectedCategoryId = _c[1];
    var _d = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedSupplierId = _d[0], setSelectedSupplierId = _d[1];
    var _e = react_1.useState(ALL_ITEMS_FILTER_VALUE), selectedLocationId = _e[0], setSelectedLocationId = _e[1];
    var _f = react_1.useState(1), currentPage = _f[0], setCurrentPage = _f[1];
    var _g = react_1.useState(25), limitPerPage = _g[0], setLimitPerPage = _g[1];
    // --- Fetch para Selectores de Filtro ---
    var _h = react_query_1.useQuery({
        queryKey: ["allCategoriesForFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/categories?limit=500&isActive=true")
                .then(function (res) { return res.data.data || []; });
        }
    }), categories = _h.data, isLoadingCategories = _h.isLoading;
    var _j = react_query_1.useQuery({
        queryKey: ["allSuppliersForFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/suppliers?limit=500&isActive=true")
                .then(function (res) { return res.data.data || []; });
        }
    }), suppliers = _j.data, isLoadingSuppliers = _j.isLoading;
    var _k = react_query_1.useQuery({
        queryKey: ["allLocationsForFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?limit=500&isActive=true")
                .then(function (res) { return res.data.data || []; });
        }
    }), locations = _k.data, isLoadingLocations = _k.isLoading;
    // --- Query Principal para el Reporte ---
    var queryParams = react_1.useMemo(function () {
        var params = {
            page: currentPage,
            limit: limitPerPage
        };
        if (selectedCategoryId !== ALL_ITEMS_FILTER_VALUE)
            params.categoryId = selectedCategoryId;
        if (selectedSupplierId !== ALL_ITEMS_FILTER_VALUE)
            params.supplierId = selectedSupplierId;
        if (selectedLocationId !== ALL_ITEMS_FILTER_VALUE)
            params.locationId = selectedLocationId;
        return params;
    }, [
        selectedCategoryId,
        selectedSupplierId,
        selectedLocationId,
        currentPage,
        limitPerPage,
    ]);
    var _l = react_query_1.useQuery({
        queryKey: ["lowStockReport", queryParams],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].get("/reports/inventory/low-stock", {
                            params: queryParams
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (prev) { return prev; }
    }), reportData = _l.data, isLoadingReport = _l.isLoading, isFetchingReport = _l.isFetching, isError = _l.isError, error = _l.error;
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [selectedCategoryId, selectedSupplierId, selectedLocationId]);
    var handleDownloadPDF = function () {
        return sonner_1.toast.info("TODO: Implementar descarga de PDF para Reporte de Stock Bajo.");
    };
    var clearFilters = function () {
        setSelectedCategoryId(ALL_ITEMS_FILTER_VALUE);
        setSelectedSupplierId(ALL_ITEMS_FILTER_VALUE);
        setSelectedLocationId(ALL_ITEMS_FILTER_VALUE);
        setCurrentPage(1);
    };
    return (react_1["default"].createElement("div", { className: "flex flex-col h-full p-4 md:p-6 space-y-4" },
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Reporte Detallado de Stock Bajo", description: "Productos no serializados cuyo stock disponible es igual o inferior al nivel de reorden.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleDownloadPDF, variant: "outline", size: "sm", disabled: isLoadingReport || !((_a = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _a === void 0 ? void 0 : _a.length) },
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
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "category-filter-lowstock", className: "text-xs font-medium" }, "Categor\u00EDa"),
                        react_1["default"].createElement(select_1.Select, { value: selectedCategoryId, onValueChange: function (v) { return setSelectedCategoryId(v); }, disabled: isLoadingCategories },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "category-filter-lowstock" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todas" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todas"), categories === null || categories === void 0 ? void 0 :
                                categories.map(function (c) { return (react_1["default"].createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.name)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "supplier-filter-lowstock", className: "text-xs font-medium" }, "Proveedor"),
                        react_1["default"].createElement(select_1.Select, { value: selectedSupplierId, onValueChange: function (v) { return setSelectedSupplierId(v); }, disabled: isLoadingSuppliers },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "supplier-filter-lowstock" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todos" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todos"), suppliers === null || suppliers === void 0 ? void 0 :
                                suppliers.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s.id, value: s.id }, s.name)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "location-filter-lowstock", className: "text-xs font-medium" }, "Ubicaci\u00F3n de Stock"),
                        react_1["default"].createElement(select_1.Select, { value: selectedLocationId, onValueChange: function (v) { return setSelectedLocationId(v); }, disabled: isLoadingLocations },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 text-xs", id: "location-filter-lowstock" },
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Todas" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: ALL_ITEMS_FILTER_VALUE }, "Todas"), locations === null || locations === void 0 ? void 0 :
                                locations.map(function (l) { return (react_1["default"].createElement(select_1.SelectItem, { key: l.id, value: l.id }, l.name)); }))))))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-hidden" },
            react_1["default"].createElement(card_1.Card, { className: "h-full flex flex-col" },
                react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4 shrink-0" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Productos con Stock Bajo")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0 flex-1 overflow-hidden" },
                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "h-full" },
                        react_1["default"].createElement(table_1.Table, { className: "sticky top-0 bg-background z-10" },
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[200px] sticky left-0 bg-background z-10" }, "Producto"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[100px]" }, "SKU"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Stock Actual"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[100px]" }, "Nivel Reorden"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[120px]" }, "Stock Ideal"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right min-w-[120px] font-semibold text-orange-600" }, "Cant. a Pedir"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[150px]" }, "Proveedor"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "min-w-[150px]" }, "Categor\u00EDa"),
                                    !selectedLocationId && (react_1["default"].createElement(table_1.TableHead, { className: "min-w-[200px]" }, "Stock por Ubicaci\u00F3n")))),
                            react_1["default"].createElement(table_1.TableBody, null, isLoadingReport || isFetchingReport ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-lowstock-" + i }, __spreadArrays(Array(!selectedLocationId ? 9 : 8)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: !selectedLocationId ? 9 : 8, className: "text-center text-red-500 py-10" },
                                    "Error: ",
                                    error.message))) : ((_b = reportData === null || reportData === void 0 ? void 0 : reportData.data) === null || _b === void 0 ? void 0 : _b.length) === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: !selectedLocationId ? 9 : 8, className: "text-center py-10 text-muted-foreground" }, "No se encontraron productos con stock bajo para los filtros aplicados."))) : (reportData === null || reportData === void 0 ? void 0 : reportData.data.map(function (item) {
                                var _a;
                                return (react_1["default"].createElement(table_1.TableRow, { key: item.productId },
                                    react_1["default"].createElement(table_1.TableCell, { className: "font-medium max-w-[250px] truncate sticky left-0 bg-background z-0", title: item.productName }, item.productName),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-muted-foreground max-w-[100px] truncate", title: item.productSku || "" }, item.productSku || "N/A"),
                                    react_1["default"].createElement(table_1.TableCell, { className: utils_1.cn("text-right", item.currentStock <= item.reorderLevel
                                            ? "text-destructive font-semibold"
                                            : "") }, item.currentStock),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, item.reorderLevel),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, (_a = item.idealStockLevel) !== null && _a !== void 0 ? _a : "-"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right font-semibold text-orange-600" }, item.quantityToOrder),
                                    react_1["default"].createElement(table_1.TableCell, { className: "max-w-[150px] truncate", title: item.supplierName || "" }, item.supplierName || "N/A"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "max-w-[150px] truncate", title: item.categoryName || "" }, item.categoryName || "N/A"),
                                    !selectedLocationId && (react_1["default"].createElement(table_1.TableCell, { className: "text-xs max-w-[200px] truncate" }, item.stockByLocation &&
                                        item.stockByLocation.length > 0
                                        ? item.stockByLocation
                                            .map(function (loc) {
                                            return loc.locationName + ": " + loc.quantityAvailable;
                                        })
                                            .join("; ")
                                        : "N/A"))));
                            })))))))),
        reportData && reportData.total > 0 && (react_1["default"].createElement("div", { className: "pt-4 shrink-0" },
            react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: reportData.page, totalPages: reportData.totalPages, totalRecords: reportData.total, limit: reportData.limit, onPageChange: function (newPage) { return setCurrentPage(newPage); }, isFetching: isFetchingReport })))));
}
exports["default"] = LowStockReportPage;
