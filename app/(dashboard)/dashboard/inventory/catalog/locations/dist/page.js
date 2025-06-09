// app/(dashboard)/inventory/catalog/locations/page.tsx
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
var button_1 = require("@/components/ui/button");
var page_header_1 = require("@/components/common/page-header");
var data_table_pagination_1 = require("@/components/common/data-table-pagination");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var location_form_dialog_1 = require("@/components/inventory/catalog/location-form-dialog");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var sonner_1 = require("sonner");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var use_debounce_1 = require("@/hooks/use-debounce");
var card_1 = require("@/components/ui/card");
function LocationsPage() {
    var _this = this;
    var _a;
    var _b = react_1.useState(1), currentPage = _b[0], setCurrentPage = _b[1];
    var limitPerPage = react_1.useState(10)[0];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 300);
    var queryClient = react_query_1.useQueryClient();
    var _d = react_1.useState(false), isFormDialogOpen = _d[0], setIsFormDialogOpen = _d[1];
    var _e = react_1.useState(null), selectedLocation = _e[0], setSelectedLocation = _e[1];
    var _f = react_1.useState(false), isDeleteDialogOpen = _f[0], setIsDeleteDialogOpen = _f[1];
    var _g = react_1.useState(null), locationToDelete = _g[0], setLocationToDelete = _g[1];
    var _h = react_query_1.useQuery({
        queryKey: [
            "inventoryLocations",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            page: currentPage,
                            limit: limitPerPage
                        };
                        if (debouncedSearchTerm)
                            params.search = debouncedSearchTerm; // Asume que backend soporta 'search' por nombre
                        return [4 /*yield*/, api_1["default"].get("/inventory/locations", { params: params })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedLocations = _h.data, isLoading = _h.isLoading, isError = _h.isError, error = _h.error, isFetching = _h.isFetching;
    var deleteMutation = react_query_1.useMutation({
        mutationFn: function (locationId) {
            return api_1["default"]["delete"]("/inventory/locations/" + locationId);
        },
        onSuccess: function () {
            sonner_1.toast.success("Ubicación eliminada exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["inventoryLocations"] });
            setIsDeleteDialogOpen(false);
            setLocationToDelete(null);
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al eliminar ubicación. Puede estar en uso o contener stock.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
            setIsDeleteDialogOpen(false);
            setLocationToDelete(null);
        }
    });
    var handleOpenCreateDialog = function () {
        setSelectedLocation(null);
        setIsFormDialogOpen(true);
    };
    var handleOpenEditDialog = function (location) {
        setSelectedLocation(location);
        setIsFormDialogOpen(true);
    };
    var handleOpenDeleteDialog = function (location) {
        setLocationToDelete(location);
        setIsDeleteDialogOpen(true);
    };
    var confirmDelete = function () {
        if (locationToDelete) {
            deleteMutation.mutate(locationToDelete.id);
        }
    };
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedLocations && currentPage < paginatedLocations.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Ubicaciones de Inventario", description: "Gestiona los lugares donde se almacena tu stock.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleOpenCreateDialog },
                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                " A\u00F1adir Ubicaci\u00F3n") }),
        react_1["default"].createElement("div", { className: "mb-4" },
            react_1["default"].createElement("div", { className: "relative" },
                react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar ubicaciones por nombre...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-8 w-full md:w-1/3" }))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "Nombre"),
                            react_1["default"].createElement(table_1.TableHead, null, "Descripci\u00F3n"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Por Defecto"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Estado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Acciones"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading || (isFetching && !(paginatedLocations === null || paginatedLocations === void 0 ? void 0 : paginatedLocations.data)) ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-loc-" + i },
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-3/4" })),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-6 mx-auto" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-16 mx-auto" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-8 ml-auto" })))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 5, className: "text-center text-red-500 py-10" },
                            "Error: ",
                            error.message))) : ((_a = paginatedLocations === null || paginatedLocations === void 0 ? void 0 : paginatedLocations.data) === null || _a === void 0 ? void 0 : _a.length) ? (paginatedLocations.data.map(function (location) { return (react_1["default"].createElement(table_1.TableRow, { key: location.id },
                        react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, location.name),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground truncate max-w-xs" }, location.description || "-"),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" }, location.isDefault ? (react_1["default"].createElement(lucide_react_1.CheckSquare, { className: "h-5 w-5 text-green-600 mx-auto" })) : (react_1["default"].createElement(lucide_react_1.XSquare, { className: "h-5 w-5 text-muted-foreground mx-auto" }))),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(badge_1.Badge, { variant: location.isActive ? "default" : "destructive", className: location.isActive
                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300"
                                    : "" }, location.isActive ? "Activa" : "Inactiva")),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "h-8 w-8 p-0" },
                                        react_1["default"].createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, null, "Acciones"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenEditDialog(location); } },
                                        react_1["default"].createElement(lucide_react_1.Edit3, { className: "mr-2 h-4 w-4" }),
                                        " Editar"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenDeleteDialog(location); }, className: "text-red-600 focus:text-red-600" },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                                        " Eliminar")))))); })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-10" }, "No se encontraron ubicaciones."))))))),
        paginatedLocations &&
            paginatedLocations.data &&
            paginatedLocations.totalPages > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedLocations.page, totalPages: paginatedLocations.totalPages, totalRecords: paginatedLocations.total, limit: paginatedLocations.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching })),
        react_1["default"].createElement(location_form_dialog_1.LocationFormDialog, { location: selectedLocation, isOpen: isFormDialogOpen, onOpenChange: setIsFormDialogOpen }),
        locationToDelete && (react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null, "\u00BFEst\u00E1s 1 absolutamente seguro?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null,
                        "Esta acci\u00F3n no se puede 2 deshacer. Se eliminar\u00E1 la ubicaci\u00F3n",
                        locationToDelete.name,
                        ". Si esta ubicaci\u00F3n tiene stock asociado o est\u00E1 en uso, es posible que no se pueda eliminar.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { onClick: function () { return setLocationToDelete(null); } }, "Cancelar"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmDelete, disabled: deleteMutation.isPending, className: "bg-destructive hover:bg-destructive/90" },
                        deleteMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        "S\u00ED, Eliminar Ubicaci\u00F3n")))))));
}
exports["default"] = LocationsPage;
