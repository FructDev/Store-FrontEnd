// app/(dashboard)/sales/page.tsx
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
exports.saleStatusLabels = void 0;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var page_header_1 = require("@/components/common/page-header");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var date_range_picker_1 = require("@/components/ui/date-range-picker");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var skeleton_1 = require("@/components/ui/skeleton");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var use_debounce_1 = require("@/hooks/use-debounce");
var lucide_react_1 = require("lucide-react"); // Iconos
// import { FormLabel } from "@/components/ui/form";
// Mapeo para estados de Venta
exports.saleStatusLabels = {
    PENDING_PAYMENT: "Pendiente Pago",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    RETURNED: "Devuelta",
    PARTIALLY_RETURNED: "Dev. Parcial"
};
var ALL_SALE_STATUSES = Object.values(prisma_enums_1.SaleStatus);
var formatDate = function (dateInput, formatString) {
    if (formatString === void 0) { formatString = "dd/MM/yyyy HH:mm"; }
    if (!dateInput)
        return "-";
    try {
        var date = typeof dateInput === "string" ? date_fns_1.parseISO(dateInput) : dateInput;
        return date_fns_1.format(date, formatString, { locale: locale_1.es });
    }
    catch (e) {
        return String(dateInput);
    }
};
var formatCurrency = function (amount, currencySymbol) {
    if (currencySymbol === void 0) { currencySymbol = "RD$"; }
    if (amount === null || amount === undefined)
        return "-";
    var numericAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (isNaN(numericAmount))
        return "-";
    return currencySymbol + " " + numericAmount.toFixed(2);
};
function SalesListPage() {
    var _this = this;
    var _a;
    var router = navigation_1.useRouter();
    var _b = react_1.useState(1), currentPage = _b[0], setCurrentPage = _b[1];
    var limitPerPage = react_1.useState(10)[0];
    // Estados para Filtros
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 500);
    var _d = react_1.useState("all"), filterStatus = _d[0], setFilterStatus = _d[1];
    var _e = react_1.useState("all"), filterCustomerId = _e[0], setFilterCustomerId = _e[1];
    var _f = react_1.useState("all"), filterUserId = _f[0], setFilterUserId = _f[1]; // Para filtrar por vendedor
    var _g = react_1.useState(undefined), dateRange = _g[0], setDateRange = _g[1];
    // Fetch para Clientes (para el filtro)
    var _h = react_query_1.useQuery({
        queryKey: ["allCustomersForSaleFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/customers?limit=500&isActive=true")
                .then(function (res) { return res.data.data || []; });
        }
    }), customers = _h.data, isLoadingCustomers = _h.isLoading;
    // Fetch para Usuarios/Vendedores (para el filtro)
    var _j = react_query_1.useQuery({
        queryKey: ["allUsersForSaleFilter"],
        queryFn: function () {
            return api_1["default"]
                .get("/users?limit=500&isActive=true")
                .then(function (res) { return res.data.data || []; });
        }
    }), users = _j.data, isLoadingUsers = _j.isLoading;
    var _k = react_query_1.useQuery({
        queryKey: [
            "salesList",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
            filterStatus,
            filterCustomerId,
            filterUserId,
            dateRange === null || dateRange === void 0 ? void 0 : dateRange.from,
            dateRange === null || dateRange === void 0 ? void 0 : dateRange.to,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response, salesData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            page: currentPage,
                            limit: limitPerPage,
                            sortBy: "saleDate",
                            sortOrder: "desc"
                        };
                        if (debouncedSearchTerm)
                            params.search = debouncedSearchTerm; // Buscar por saleNumber o customer name/email
                        if (filterStatus !== "all")
                            params.status = filterStatus;
                        if (filterCustomerId !== "all")
                            params.customerId = filterCustomerId;
                        if (filterUserId !== "all")
                            params.userId = filterUserId;
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from)
                            params.startDate = date_fns_1.format(dateRange.from, "yyyy-MM-dd");
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to)
                            params.endDate = date_fns_1.format(dateRange.to, "yyyy-MM-dd");
                        return [4 /*yield*/, api_1["default"].get("/sales", { params: params })];
                    case 1:
                        response = _a.sent();
                        salesData = response.data.data.map(function (sale) { return (__assign(__assign({}, sale), { totalAmount: sale.totalAmount !== null && sale.totalAmount !== undefined
                                ? parseFloat(String(sale.totalAmount))
                                : 0 })); });
                        return [2 /*return*/, __assign(__assign({}, response.data), { data: salesData })];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedSales = _k.data, isLoading = _k.isLoading, isError = _k.isError, error = _k.error, isFetching = _k.isFetching;
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedSales && currentPage < paginatedSales.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [
        debouncedSearchTerm,
        filterStatus,
        filterCustomerId,
        filterUserId,
        dateRange,
    ]);
    var clearFilters = function () {
        setSearchTerm("");
        setFilterStatus("all");
        setFilterCustomerId("all");
        setFilterUserId("all");
        setDateRange(undefined);
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Historial de Ventas", description: "Consulta todas las ventas realizadas en la tienda.", actionButton: react_1["default"].createElement(button_1.Button, { asChild: true, variant: "default" },
                react_1["default"].createElement(link_1["default"], { href: "/dashboard/pos" },
                    react_1["default"].createElement(lucide_react_1.ShoppingCart, { className: "mr-2 h-4 w-4" }),
                    " Ir al POS")) }),
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg flex items-center" },
                    react_1["default"].createElement(lucide_react_1.Filter, { className: "mr-2 h-5 w-5" }),
                    "Filtros"),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: clearFilters, size: "sm" },
                    react_1["default"].createElement(lucide_react_1.XCircle, { className: "mr-1 h-4 w-4" }),
                    " Limpiar")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end" },
                    react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar N\u00BA Venta, Cliente...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } }),
                    react_1["default"].createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Estado..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos Estados"),
                            ALL_SALE_STATUSES.map(function (st) { return (react_1["default"].createElement(select_1.SelectItem, { key: st, value: st }, exports.saleStatusLabels[st] || st)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterCustomerId, onValueChange: setFilterCustomerId, disabled: isLoadingCustomers },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Cliente..." })),
                        react_1["default"].createElement(select_1.SelectContent, { className: "max-h-72" },
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos Clientes"),
                            isLoadingCustomers && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-cust", disabled: true }, "Cargando...")), customers === null || customers === void 0 ? void 0 :
                            customers.map(function (c) { return (react_1["default"].createElement(select_1.SelectItem, { key: c.id, value: c.id },
                                c.firstName,
                                " ",
                                c.lastName,
                                " (",
                                c.email || c.phone || "N/A",
                                ")")); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterUserId, onValueChange: setFilterUserId, disabled: isLoadingUsers },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Vendedor..." })),
                        react_1["default"].createElement(select_1.SelectContent, { className: "max-h-72" },
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos Vendedores"),
                            isLoadingUsers && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-user", disabled: true }, "Cargando...")), users === null || users === void 0 ? void 0 :
                            users.map(function (u) { return (react_1["default"].createElement(select_1.SelectItem, { key: u.id, value: u.id },
                                u.firstName,
                                " ",
                                u.lastName)); }))),
                    react_1["default"].createElement("div", null,
                        " ",
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { id: "sales-date-filter" // ID para el htmlFor
                            , label: "Fecha de Venta" // Pasar la etiqueta como prop
                            , date: dateRange, onDateChange: setDateRange, className: "w-full" }))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "N\u00BA Venta"),
                            react_1["default"].createElement(table_1.TableHead, null, "Fecha"),
                            react_1["default"].createElement(table_1.TableHead, null, "Cliente"),
                            react_1["default"].createElement(table_1.TableHead, null, "Vendedor"),
                            react_1["default"].createElement(table_1.TableHead, null, "Estado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Total"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Acciones"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading || (isFetching && !(paginatedSales === null || paginatedSales === void 0 ? void 0 : paginatedSales.data)) ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-sale-" + i }, __spreadArrays(Array(7)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 7, className: "text-center text-red-500 py-10" },
                            "Error: ",
                            error.message))) : ((_a = paginatedSales === null || paginatedSales === void 0 ? void 0 : paginatedSales.data) === null || _a === void 0 ? void 0 : _a.length) ? (paginatedSales.data.map(function (sale) { return (react_1["default"].createElement(table_1.TableRow, { key: sale.id },
                        react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, sale.saleNumber),
                        react_1["default"].createElement(table_1.TableCell, null, formatDate(sale.saleDate, "dd/MM/yy HH:mm")),
                        react_1["default"].createElement(table_1.TableCell, null, sale.customer
                            ? ((sale.customer.firstName || "") + " " + (sale.customer.lastName || "")).trim() || "Cliente Genérico"
                            : "Cliente Genérico"),
                        react_1["default"].createElement(table_1.TableCell, null, sale.user
                            ? ((sale.user.firstName || "") + " " + (sale.user.lastName || "")).trim()
                            : "N/A"),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, exports.saleStatusLabels[sale.status] ||
                                sale.status)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(sale.totalAmount)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                    return router.push("/dashboard/sales/" + sale.id);
                                } },
                                react_1["default"].createElement(lucide_react_1.Eye, { className: "mr-1 h-4 w-4" }),
                                " Ver Detalle")))); })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-10" }, "No se encontraron ventas."))))))),
        paginatedSales &&
            paginatedSales.data &&
            paginatedSales.totalPages > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedSales.page, totalPages: paginatedSales.totalPages, totalRecords: paginatedSales.total, limit: paginatedSales.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching }))));
}
exports["default"] = SalesListPage;
