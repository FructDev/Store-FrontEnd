// app/(dashboard)/inventory/stock-counts/page.tsx
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
var lucide_react_1 = require("lucide-react"); // Iconos
var skeleton_1 = require("@/components/ui/skeleton");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var use_debounce_1 = require("@/hooks/use-debounce");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var sonner_1 = require("sonner");
// TODO: Importar CreateStockCountDialog cuando esté listo
var statusLabels = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado"
};
var ALL_STATUSES = Object.values(prisma_enums_1.StockCountStatus);
var formatDateForDisplay = function (dateInput) {
    if (!dateInput)
        return "-";
    try {
        return date_fns_1.format(new Date(dateInput), "dd/MM/yyyy HH:mm", { locale: locale_1.es });
    }
    catch (e) {
        return String(dateInput);
    }
};
function StockCountsPage() {
    var _this = this;
    var _a;
    var router = navigation_1.useRouter();
    var _b = react_1.useState(1), currentPage = _b[0], setCurrentPage = _b[1];
    var limitPerPage = react_1.useState(10)[0];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 500);
    var _d = react_1.useState("all"), filterStatus = _d[0], setFilterStatus = _d[1];
    // TODO: Añadir filtros para locationId y userId si se necesitan (cargar datos para Selects)
    var _e = react_1.useState(undefined), dateRange = _e[0], setDateRange = _e[1];
    // TODO: Estado para el diálogo de creación
    // const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    var _f = react_query_1.useQuery({
        queryKey: [
            "stockCounts",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
            filterStatus,
            dateRange === null || dateRange === void 0 ? void 0 : dateRange.from,
            dateRange === null || dateRange === void 0 ? void 0 : dateRange.to,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            page: currentPage,
                            limit: limitPerPage,
                            sortBy: "initiatedAt",
                            sortOrder: "desc"
                        };
                        if (debouncedSearchTerm)
                            params.search = debouncedSearchTerm;
                        if (filterStatus !== "all")
                            params.status = filterStatus;
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from)
                            params.startDate = date_fns_1.format(dateRange.from, "yyyy-MM-dd");
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to)
                            params.endDate = date_fns_1.format(dateRange.to, "yyyy-MM-dd");
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock-counts", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedData = _f.data, isLoading = _f.isLoading, isError = _f.isError, error = _f.error, isFetching = _f.isFetching;
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedData && currentPage < paginatedData.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterStatus, dateRange]);
    var navigateToDetail = function (id, status) {
        // Si está completado o cancelado, podría ir a una vista de "Resultados"
        // Si está pendiente o en progreso, va a la página de "Registro de Conteo"
        router.push("/dashboard/inventory/stock-counts/" + id);
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Conteos F\u00EDsicos de Stock", description: "Inicia, gestiona y finaliza los conteos de tu inventario f\u00EDsico.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: function () {
                    return sonner_1.toast.info("TODO: Abrir diálogo para Iniciar Nuevo Conteo");
                } /* setIsCreateDialogOpen(true) */ },
                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                " Iniciar Nuevo Conteo") }),
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Filtros")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end" },
                    react_1["default"].createElement("div", { className: "relative" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                        react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar por N\u00BA Conteo, Notas...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" })),
                    react_1["default"].createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por estado..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Estados"),
                            ALL_STATUSES.map(function (status) { return (react_1["default"].createElement(select_1.SelectItem, { key: status, value: status }, statusLabels[status] || status)); }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(form_1.FormLabel, { className: "text-sm font-medium" }, "Rango de Fechas (Iniciado)"),
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { date: dateRange, onDateChange: setDateRange, className: "w-full" }))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "N\u00BA Conteo"),
                            react_1["default"].createElement(table_1.TableHead, null, "Fecha Iniciado"),
                            react_1["default"].createElement(table_1.TableHead, null, "Ubicaci\u00F3n"),
                            react_1["default"].createElement(table_1.TableHead, null, "Iniciado Por"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "L\u00EDneas"),
                            react_1["default"].createElement(table_1.TableHead, null, "Estado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Acciones"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading || (isFetching && !(paginatedData === null || paginatedData === void 0 ? void 0 : paginatedData.data)) ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-sc-" + i }, __spreadArrays(Array(7)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 7, className: "text-center text-red-500 py-10" },
                            "Error: ",
                            error.message))) : ((_a = paginatedData === null || paginatedData === void 0 ? void 0 : paginatedData.data) === null || _a === void 0 ? void 0 : _a.length) ? (paginatedData.data.map(function (sc) {
                        var _a, _b, _c, _d, _e;
                        return (react_1["default"].createElement(table_1.TableRow, { key: sc.id },
                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, sc.stockCountNumber || sc.id.slice(-8)),
                            react_1["default"].createElement(table_1.TableCell, null, formatDateForDisplay(sc.initiatedAt)),
                            react_1["default"].createElement(table_1.TableCell, null, ((_a = sc.location) === null || _a === void 0 ? void 0 : _a.name) || "Ad-hoc / Múltiple"),
                            react_1["default"].createElement(table_1.TableCell, null,
                                ((_b = sc.user) === null || _b === void 0 ? void 0 : _b.firstName) || "N/A",
                                " ",
                                ((_c = sc.user) === null || _c === void 0 ? void 0 : _c.lastName) || ""),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" }, (_e = (_d = sc._count) === null || _d === void 0 ? void 0 : _d.lines) !== null && _e !== void 0 ? _e : 0),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, statusLabels[sc.status] ||
                                    sc.status)),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                        return navigateToDetail(sc.id, sc.status);
                                    } }, sc.status === prisma_enums_1.StockCountStatus.PENDING ||
                                    sc.status === prisma_enums_1.StockCountStatus.IN_PROGRESS ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                                    react_1["default"].createElement(lucide_react_1.PlayCircle, { className: "mr-1 h-4 w-4" }),
                                    " Continuar")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                                    react_1["default"].createElement(lucide_react_1.Eye, { className: "mr-1 h-4 w-4" }),
                                    " Ver"))))));
                    })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-10" }, "No se encontraron sesiones de conteo."))))))),
        paginatedData && paginatedData.data && paginatedData.totalPages > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedData.page, totalPages: paginatedData.totalPages, totalRecords: paginatedData.total, limit: paginatedData.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching }))));
}
exports["default"] = StockCountsPage;
