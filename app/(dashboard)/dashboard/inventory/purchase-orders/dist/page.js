// app/(dashboard)/inventory/purchase-orders/page.tsx
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
var link_1 = require("next/link");
var navigation_1 = require("next/navigation"); // Para navegar al detalle
var button_1 = require("@/components/ui/button");
var page_header_1 = require("@/components/common/page-header");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var date_range_picker_1 = require("@/components/ui/date-range-picker"); // Asumiendo que tienes este componente
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var use_debounce_1 = require("@/hooks/use-debounce");
var card_1 = require("@/components/ui/card");
var sonner_1 = require("sonner");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var alert_dialog_2 = require("@/components/ui/alert-dialog");
var edit_po_dialog_1 = require("@/components/inventory/purchase-orders/edit-po-dialog");
// Mapeo para estados de PO
var poStatusLabels = {
    // PrismaPurchaseOrderStatus es tu enum local
    DRAFT: "Borrador",
    ORDERED: "Ordenada",
    PARTIALLY_RECEIVED: "Recibida Parcialmente",
    RECEIVED: "Recibida Totalmente",
    CANCELLED: "Cancelada",
    CLOSED: "Cerrada"
};
var ALL_PO_STATUSES = Object.values(prisma_enums_1.PurchaseOrderStatus);
var formatDisplayDate = function (dateString) {
    if (!dateString)
        return "-";
    try {
        return date_fns_1.format(new Date(dateString), "dd/MM/yyyy", { locale: locale_1.es });
    }
    catch (e) {
        return String(dateString);
    }
};
var formatCurrency = function (amount, currencySymbol) {
    if (currencySymbol === void 0) { currencySymbol = "RD$"; }
    if (amount === null || amount === undefined)
        return "-";
    var numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount))
        return "-";
    return currencySymbol + " " + numericAmount.toFixed(2);
};
function PurchaseOrdersPage() {
    var _this = this;
    var _a;
    var queryClient = react_query_1.useQueryClient();
    var router = navigation_1.useRouter();
    var _b = react_1.useState(1), currentPage = _b[0], setCurrentPage = _b[1];
    var limitPerPage = react_1.useState(10)[0];
    // Estados para filtros
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 500);
    var _d = react_1.useState("all"), filterStatus = _d[0], setFilterStatus = _d[1];
    var _e = react_1.useState("all"), filterSupplierId = _e[0], setFilterSupplierId = _e[1];
    var _f = react_1.useState(undefined), dateRange = _f[0], setDateRange = _f[1];
    var _g = react_1.useState(false), isEditPODialogOpen = _g[0], setIsEditPODialogOpen = _g[1];
    var _h = react_1.useState(null), selectedPOForEdit = _h[0], setSelectedPOForEdit = _h[1];
    var _j = react_1.useState(false), isCancelPODialogOpen = _j[0], setIsCancelPODialogOpen = _j[1];
    var _k = react_1.useState(null), poToCancel = _k[0], setPoToCancel = _k[1];
    // Fetch de POs paginado y filtrado
    var _l = react_query_1.useQuery({
        queryKey: [
            "purchaseOrders",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
            filterStatus,
            filterSupplierId,
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
                            sortBy: "createdAt",
                            sortOrder: "desc"
                        };
                        if (debouncedSearchTerm)
                            params.search = debouncedSearchTerm;
                        if (filterStatus !== "all")
                            params.status = filterStatus;
                        if (filterSupplierId !== "all")
                            params.supplierId = filterSupplierId;
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.from)
                            params.startDate = date_fns_1.format(dateRange.from, "yyyy-MM-dd");
                        if (dateRange === null || dateRange === void 0 ? void 0 : dateRange.to)
                            params.endDate = date_fns_1.format(dateRange.to, "yyyy-MM-dd");
                        return [4 /*yield*/, api_1["default"].get("/inventory/purchase-orders", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedPOs = _l.data, isLoading = _l.isLoading, isError = _l.isError, error = _l.error, isFetching = _l.isFetching;
    // Fetch para proveedores (para el filtro)
    var _m = react_query_1.useQuery({
        queryKey: ["allSuppliersForPOFilter"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, api_1["default"]
                        .get("/inventory/suppliers?limit=100&isActive=true")
                        .then(function (res) { return res.data.data || res.data; })];
            });
        }); }
    }), suppliers = _m.data, isLoadingSuppliers = _m.isLoading;
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedPOs && currentPage < paginatedPOs.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    var cancelPOMutation = react_query_1.useMutation({
        mutationFn: function (poIdToCancel) {
            return api_1["default"].patch("/inventory/purchase-orders/" + poIdToCancel + "/cancel", {});
        },
        onSuccess: function (cancelledPO) {
            sonner_1.toast.success("Orden de Compra #" + cancelledPO.poNumber + " cancelada.");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
            queryClient.invalidateQueries({
                queryKey: ["purchaseOrderDetails", cancelledPO.id]
            });
            setIsCancelPODialogOpen(false);
            setPoToCancel(null);
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al cancelar la Orden de Compra.");
            setIsCancelPODialogOpen(false);
            setPoToCancel(null);
        }
    });
    var confirmCancelPO = function () {
        if (poToCancel) {
            cancelPOMutation.mutate(poToCancel.id);
        }
    };
    var handleOpenEditPODialog = function (po) {
        setSelectedPOForEdit(po);
        setIsEditPODialogOpen(true);
    };
    var handleOpenCancelPODialog = function (po) {
        console.log("Abriendo AlertDialog para cancelar PO:", po.poNumber);
        setPoToCancel(po);
        setIsCancelPODialogOpen(true);
    };
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterStatus, filterSupplierId, dateRange]);
    var navigateToDetail = function (poId) {
        router.push("/dashboard/inventory/purchase-orders/" + poId);
    };
    console.log("Estado de isCancelPODialogOpen:", isCancelPODialogOpen, "PO a cancelar:", poToCancel === null || poToCancel === void 0 ? void 0 : poToCancel.poNumber);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "\u00D3rdenes de Compra (PO)", description: "Gestiona tus \u00F3rdenes de compra a proveedores y registra la recepci\u00F3n de productos.", actionButton: react_1["default"].createElement(button_1.Button, { asChild: true },
                react_1["default"].createElement(link_1["default"], { href: "/dashboard/inventory/purchase-orders/new" },
                    react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                    " Crear Nueva PO")) }),
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Filtros")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end" },
                    react_1["default"].createElement("div", { className: "relative" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                        react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar por N\u00BA PO, Proveedor...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" })),
                    react_1["default"].createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por estado..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Estados"),
                            ALL_PO_STATUSES.map(function (status) { return (react_1["default"].createElement(select_1.SelectItem, { key: status, value: status }, poStatusLabels[status] || status)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterSupplierId, onValueChange: setFilterSupplierId, disabled: isLoadingSuppliers },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por proveedor..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Proveedores"),
                            isLoadingSuppliers && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-sup", disabled: true }, "Cargando...")), suppliers === null || suppliers === void 0 ? void 0 :
                            suppliers.map(function (sup) { return (react_1["default"].createElement(select_1.SelectItem, { key: sup.id, value: sup.id }, sup.name)); }))),
                    react_1["default"].createElement("div", { className: "space-y-1.5" },
                        react_1["default"].createElement("p", { className: "text-sm font-medium text-foreground" }, "Rango de Fechas (Creaci\u00F3n)"),
                        react_1["default"].createElement(date_range_picker_1.DatePickerWithRange, { date: dateRange, onDateChange: setDateRange, className: "w-full" }))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "N\u00BA PO"),
                            react_1["default"].createElement(table_1.TableHead, null, "Proveedor"),
                            react_1["default"].createElement(table_1.TableHead, null, "Fecha Orden"),
                            react_1["default"].createElement(table_1.TableHead, null, "Fecha Esperada"),
                            react_1["default"].createElement(table_1.TableHead, null, "Estado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Total"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "L\u00EDneas"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Acciones"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading || (isFetching && !(paginatedPOs === null || paginatedPOs === void 0 ? void 0 : paginatedPOs.data)) ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-po-" + i }, __spreadArrays(Array(8)).map(function (_, j) { return (react_1["default"].createElement(table_1.TableCell, { key: j },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" }))); }))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center text-red-500 py-10" },
                            "Error: ",
                            error.message))) : ((_a = paginatedPOs === null || paginatedPOs === void 0 ? void 0 : paginatedPOs.data) === null || _a === void 0 ? void 0 : _a.length) ? (paginatedPOs.data.map(function (po) {
                        var _a, _b, _c;
                        return (react_1["default"].createElement(table_1.TableRow, { key: po.id },
                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, po.poNumber),
                            react_1["default"].createElement(table_1.TableCell, null, ((_a = po.supplier) === null || _a === void 0 ? void 0 : _a.name) || "N/A"),
                            react_1["default"].createElement(table_1.TableCell, null, formatDisplayDate(po.orderDate)),
                            react_1["default"].createElement(table_1.TableCell, null, formatDisplayDate(po.expectedDate)),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, poStatusLabels[po.status] || po.status)),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(po.totalAmount)),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" }, (_c = (_b = po._count) === null || _b === void 0 ? void 0 : _b.lines) !== null && _c !== void 0 ? _c : 0),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "h-8 w-8 p-0" },
                                            react_1["default"].createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, null, "Acciones"),
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigateToDetail(po.id); } },
                                            react_1["default"].createElement(lucide_react_1.Eye, { className: "mr-2 h-4 w-4" }),
                                            " Ver Detalles / Recibir"),
                                        (po.status === prisma_enums_1.PurchaseOrderStatus.DRAFT ||
                                            po.status ===
                                                prisma_enums_1.PurchaseOrderStatus.ORDERED) && (react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenEditPODialog(po); } },
                                            react_1["default"].createElement(lucide_react_1.Edit3, { className: "mr-2 h-4 w-4" }),
                                            " Editar")),
                                        ![
                                            prisma_enums_1.PurchaseOrderStatus.RECEIVED,
                                            prisma_enums_1.PurchaseOrderStatus.CLOSED,
                                            prisma_enums_1.PurchaseOrderStatus.CANCELLED,
                                        ].includes(po.status) && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                            react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenCancelPODialog(po); }, className: "text-red-600 focus:text-red-600" },
                                                react_1["default"].createElement(lucide_react_1.XCircle, { className: "mr-2 h-4 w-4" }),
                                                " Cancelar Orden"))))))));
                    })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-10" }, "No se encontraron \u00F3rdenes de compra."))))))),
        paginatedPOs && paginatedPOs.data && paginatedPOs.totalPages > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedPOs.page, totalPages: paginatedPOs.totalPages, totalRecords: paginatedPOs.total, limit: paginatedPOs.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching })),
        react_1["default"].createElement(edit_po_dialog_1.EditPODialog, { po: selectedPOForEdit, isOpen: isEditPODialogOpen, onOpenChange: setIsEditPODialogOpen, onSuccess: function () {
                // Opcional: setSelectedPOForEdit(null);
            } }),
        poToCancel && (react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: isCancelPODialogOpen, onOpenChange: setIsCancelPODialogOpen },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_2.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null,
                        "\u00BFEst\u00E1s seguro de cancelar la PO #",
                        poToCancel.poNumber,
                        "?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null, "Esta acci\u00F3n cambiar\u00E1 el estado de la orden a Cancelada. No se revertir\u00E1 stock ya recibido (eso ser\u00EDa una devoluci\u00F3n a proveedor).")),
                react_1["default"].createElement(alert_dialog_2.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { onClick: function () {
                            setIsCancelPODialogOpen(false); // Cierra explícitamente
                            setPoToCancel(null); // Limpia la PO seleccionada
                        } }, "No, mantener"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmCancelPO, disabled: cancelPOMutation.isPending, className: "bg-destructive hover:bg-destructive/90" },
                        cancelPOMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        "S\u00ED, Cancelar PO")))))));
}
exports["default"] = PurchaseOrdersPage;
