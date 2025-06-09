// app/(dashboard)/inventory/stock-levels/page.tsx
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
var prisma_enums_1 = require("@/types/prisma-enums");
var page_header_1 = require("@/components/common/page-header");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var formatters_1 = require("@/lib/utils/formatters");
var use_debounce_1 = require("@/hooks/use-debounce");
var lucide_react_1 = require("lucide-react"); // Iconos
// Mapeo para InventoryItemStatus (deberías tenerlo en un lugar central o definirlo aquí)
var itemStatusLabels = {
    AVAILABLE: "Disponible",
    RESERVED: "Reservado",
    SOLD: "Vendido",
    USED_IN_REPAIR: "Usado en Reparación",
    RETURNED: "Devuelto",
    DAMAGED: "Dañado",
    IN_TRANSIT: "En Tránsito",
    CONSIGNMENT: "Consignación",
    REMOVED: "Eliminado/Ajustado"
};
var ALL_ITEM_STATUSES = Object.values(prisma_enums_1.InventoryItemStatus);
function StockLevelsPage() {
    var _this = this;
    var _a;
    var _b = react_1.useState(1), currentPage = _b[0], setCurrentPage = _b[1];
    var limitPerPage = react_1.useState(15)[0]; // Mostrar más items por página
    // Estados para Filtros
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 500);
    var _d = react_1.useState("all"), filterProductId = _d[0], setFilterProductId = _d[1];
    var _e = react_1.useState("all"), filterLocationId = _e[0], setFilterLocationId = _e[1];
    var _f = react_1.useState("all"), filterStatus = _f[0], setFilterStatus = _f[1]; // 'all' o un valor de PrismaInventoryItemStatus
    var _g = react_1.useState(""), filterCondition = _g[0], setFilterCondition = _g[1];
    var debouncedCondition = use_debounce_1.useDebounce(filterCondition, 500);
    var _h = react_1.useState("all"), filterTracksImei = _h[0], setFilterTracksImei = _h[1]; // "all", "true", "false"
    // Fetch para Productos (para el filtro de producto)
    var _j = react_query_1.useQuery({
        queryKey: ["allProductsForStockLevelFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?isActive=true&limit=1000")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), productsForFilter = _j.data, isLoadingPForFilter = _j.isLoading;
    // Fetch para Ubicaciones (para el filtro de ubicación)
    var _k = react_query_1.useQuery({
        queryKey: ["allLocationsForStockLevelFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), locationsForFilter = _k.data, isLoadingLForFilter = _k.isLoading;
    // Fetch Principal para InventoryItems
    var _l = react_query_1.useQuery({
        // Usar InventoryItem directamente
        queryKey: [
            "inventoryItemsList",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
            filterProductId,
            filterLocationId,
            filterStatus,
            debouncedCondition,
            filterTracksImei,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            page: currentPage,
                            limit: limitPerPage,
                            sortBy: "productName",
                            sortOrder: "asc"
                        };
                        if (debouncedSearchTerm)
                            params.search = debouncedSearchTerm;
                        if (filterProductId !== "all")
                            params.productId = filterProductId;
                        if (filterLocationId !== "all")
                            params.locationId = filterLocationId;
                        if (filterStatus !== "all")
                            params.status = filterStatus;
                        if (debouncedCondition)
                            params.condition = debouncedCondition;
                        if (filterTracksImei !== "all")
                            params.tracksImei = filterTracksImei === "true";
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/items", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        // El backend ya debería devolver costPrice como string/number, y product/location anidados
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedItems = _l.data, isLoading = _l.isLoading, isError = _l.isError, error = _l.error, isFetching = _l.isFetching;
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedItems && currentPage < paginatedItems.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [
        debouncedSearchTerm,
        filterProductId,
        filterLocationId,
        filterStatus,
        debouncedCondition,
        filterTracksImei,
    ]);
    var clearFilters = function () {
        setSearchTerm("");
        setFilterProductId("all");
        setFilterLocationId("all");
        setFilterStatus("all");
        setFilterCondition("");
        setFilterTracksImei("all");
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Consulta de Niveles de Stock", description: "Visualiza y filtra todos los \u00EDtems de inventario en tus ubicaciones." }),
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "mr-2 h-5 w-5" }),
                    "Filtros Avanzados"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: clearFilters, size: "sm" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "mr-1 h-4 w-4" }),
                    " Limpiar")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end" },
                    react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar producto, SKU, IMEI...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } }),
                    react_1["default"].createElement(select_1.Select, { value: filterProductId, onValueChange: setFilterProductId, disabled: isLoadingPForFilter },
                        react_1["default"].createElement(select_1.SelectTrigger, { className: "w-full" },
                            react_1["default"].createElement("span", { className: "truncate" },
                                " ",
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Producto..." }))),
                        react_1["default"].createElement(select_1.SelectContent, { className: "max-h-72" },
                            " ",
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Productos"),
                            isLoadingPForFilter && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-prod", disabled: true }, "Cargando...")), productsForFilter === null || productsForFilter === void 0 ? void 0 :
                            productsForFilter.map(function (p) { return (react_1["default"].createElement(select_1.SelectItem, { key: p.id, value: p.id }, p.name)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterLocationId, onValueChange: setFilterLocationId, disabled: isLoadingLForFilter },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Ubicaci\u00F3n..." })),
                        react_1["default"].createElement(select_1.SelectContent, { className: "max-h-72" },
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todas Ubicaciones"),
                            isLoadingLForFilter && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-loc", disabled: true }, "Cargando...")), locationsForFilter === null || locationsForFilter === void 0 ? void 0 :
                            locationsForFilter.map(function (loc) { return (react_1["default"].createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Estado del \u00CDtem..." })),
                        react_1["default"].createElement(select_1.SelectContent, { className: "max-h-72" },
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Estados"),
                            ALL_ITEM_STATUSES.map(function (st) { return (react_1["default"].createElement(select_1.SelectItem, { key: st, value: st }, itemStatusLabels[st] || st)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterTracksImei, onValueChange: setFilterTracksImei },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Tipo de Stock..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todo Tipo de Stock"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "false" }, "Solo No Serializado"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "true" }, "Solo Serializado")))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[20%]" }, "Producto"),
                            react_1["default"].createElement(table_1.TableHead, null, "SKU"),
                            react_1["default"].createElement(table_1.TableHead, null, "IMEI/Serial"),
                            react_1["default"].createElement(table_1.TableHead, null, "Ubicaci\u00F3n"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Cantidad"),
                            react_1["default"].createElement(table_1.TableHead, null, "Condici\u00F3n"),
                            react_1["default"].createElement(table_1.TableHead, null, "Estado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Costo Unit."),
                            react_1["default"].createElement(table_1.TableHead, null, "Ingreso/Creaci\u00F3n"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading || (isFetching && !(paginatedItems === null || paginatedItems === void 0 ? void 0 : paginatedItems.data)) ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-item-" + i }, __spreadArrays(Array(9)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 9, className: "text-center text-red-500 py-10" },
                            "Error: ",
                            error.message))) : ((_a = paginatedItems === null || paginatedItems === void 0 ? void 0 : paginatedItems.data) === null || _a === void 0 ? void 0 : _a.length) ? (paginatedItems.data.map(function (item) {
                        var _a, _b, _c, _d, _e;
                        return (react_1["default"].createElement(table_1.TableRow, { key: item.id },
                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, ((_a = item.product) === null || _a === void 0 ? void 0 : _a.name) || "N/A"),
                            react_1["default"].createElement(table_1.TableCell, null, ((_b = item.product) === null || _b === void 0 ? void 0 : _b.sku) || "-"),
                            react_1["default"].createElement(table_1.TableCell, null, item.imei ||
                                (((_c = item.product) === null || _c === void 0 ? void 0 : _c.tracksImei) ? (react_1["default"].createElement("span", { className: "text-muted-foreground" }, "N/A")) : ("-"))),
                            react_1["default"].createElement(table_1.TableCell, null, ((_d = item.location) === null || _d === void 0 ? void 0 : _d.name) || "N/A"),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" }, ((_e = item.product) === null || _e === void 0 ? void 0 : _e.tracksImei) ? item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE
                                ? 1
                                : 0
                                : item.quantity),
                            react_1["default"].createElement(table_1.TableCell, null, item.condition || "-"),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(badge_1.Badge, { variant: item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE
                                        ? "default"
                                        : item.status === prisma_enums_1.InventoryItemStatus.SOLD
                                            ? "secondary"
                                            : item.status ===
                                                prisma_enums_1.InventoryItemStatus.REMOVED ||
                                                item.status === prisma_enums_1.InventoryItemStatus.DAMAGED
                                                ? "destructive"
                                                : "outline", className: item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE
                                        ? "bg-green-100 text-green-700"
                                        : "" }, itemStatusLabels[item.status] || item.status)),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatters_1.formatCurrency(item.costPrice)),
                            react_1["default"].createElement(table_1.TableCell, null, formatters_1.formatDate(item.entryDate || item.createdAt, "dd/MM/yy"))));
                    })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 9, className: "text-center py-10" }, "No se encontraron \u00EDtems de inventario con los filtros actuales."))))))),
        paginatedItems &&
            paginatedItems.data &&
            paginatedItems.totalPages > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedItems.page, totalPages: paginatedItems.totalPages, totalRecords: paginatedItems.total, limit: paginatedItems.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching }))));
}
exports["default"] = StockLevelsPage;
