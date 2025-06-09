// app/(dashboard)/customers/page.tsx
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
var react_table_1 = require("@tanstack/react-table");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var page_header_1 = require("@/components/common/page-header");
var columns_1 = require("./columns"); // Importar columnas
var input_1 = require("@/components/ui/input");
var use_debounce_1 = require("@/hooks/use-debounce");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var table_1 = require("@/components/ui/table");
var data_table_pagination_1 = require("@/components/common/data-table-pagination"); // Tu componente de paginación
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var customer_form_dialog_1 = require("@/components/customers/customer-form-dialog");
function CustomersPage() {
    var _this = this;
    var _a, _b, _c, _d;
    var _e = react_1.useState(""), searchTerm = _e[0], setSearchTerm = _e[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 300);
    var queryClient = react_query_1.useQueryClient();
    // Estado de paginación compatible con TanStack Table
    var _f = react_1.useState({
        pageIndex: 0,
        pageSize: 10
    }), pagination = _f[0], setPagination = _f[1];
    var _g = react_1.useState([]), sorting = _g[0], setSorting = _g[1];
    // TODO: Añadir estado para diálogos de CUD
    var _h = react_1.useState(false), isCreateDialogOpen = _h[0], setIsCreateDialogOpen = _h[1];
    var _j = react_1.useState(null), editingCustomer = _j[0], setEditingCustomer = _j[1];
    var _k = react_1.useState(null), customerToDelete = _k[0], setCustomerToDelete = _k[1];
    var _l = react_1.useState(false), isFormDialogOpen = _l[0], setIsFormDialogOpen = _l[1];
    var _m = react_query_1.useQuery({
        queryKey: [
            "customersList",
            pagination.pageIndex,
            pagination.pageSize,
            debouncedSearchTerm,
            sorting,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams({
                            page: String(pagination.pageIndex + 1),
                            limit: String(pagination.pageSize),
                            search: debouncedSearchTerm
                        });
                        // Añadir ordenamiento a los parámetros si existe
                        if (sorting.length > 0) {
                            params.append("sortBy", sorting[0].id);
                            params.append("sortOrder", sorting[0].desc ? "desc" : "asc");
                        }
                        return [4 /*yield*/, api_1["default"].get("/customers?" + params.toString())];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (prev) { return prev; }
    }), paginatedCustomers = _m.data, isLoading = _m.isLoading, isFetching = _m.isFetching;
    // --- MUTACIÓN PARA DESACTIVAR/ACTIVAR CLIENTE ---
    var deleteMutation = react_query_1.useMutation({
        mutationFn: function (customerId) {
            return api_1["default"]["delete"]("/customers/" + customerId);
        },
        onSuccess: function () {
            sonner_1.toast.success("Estado del cliente actualizado.");
            queryClient.invalidateQueries({ queryKey: ["customersList"] });
            setCustomerToDelete(null); // Cerrar diálogo de confirmación
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al actualizar el estado del cliente.");
            setCustomerToDelete(null);
        }
    });
    var handleOpenCreateDialog = function () {
        setEditingCustomer(null); // Asegurarse de que no haya datos de edición
        setIsFormDialogOpen(true);
    };
    var handleOpenEditDialog = function (customer) {
        setEditingCustomer(customer);
        setIsFormDialogOpen(true);
    };
    var handleOpenDeleteDialog = function (customer) {
        setCustomerToDelete(customer);
    };
    var customerActions = {
        onEdit: handleOpenEditDialog,
        onDelete: handleOpenDeleteDialog
    };
    var table = react_table_1.useReactTable({
        data: (_a = paginatedCustomers === null || paginatedCustomers === void 0 ? void 0 : paginatedCustomers.data) !== null && _a !== void 0 ? _a : [],
        columns: columns_1.columns,
        pageCount: (_b = paginatedCustomers === null || paginatedCustomers === void 0 ? void 0 : paginatedCustomers.totalPages) !== null && _b !== void 0 ? _b : -1,
        state: { pagination: pagination, sorting: sorting },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: react_table_1.getCoreRowModel(),
        getSortedRowModel: react_table_1.getSortedRowModel(),
        manualPagination: true,
        manualSorting: true,
        meta: { actions: customerActions }
    });
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Gesti\u00F3n de Clientes", description: "Visualiza, crea, y administra la informaci\u00F3n de tus clientes.", actionButton: react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleOpenCreateDialog },
                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                "A\u00F1adir Cliente") }),
        react_1["default"].createElement("div", { className: "p-1 space-y-4" },
            react_1["default"].createElement("div", { className: "flex items-center py-4" },
                react_1["default"].createElement(input_1.Input, { placeholder: "Buscar por nombre, email, tel\u00E9fono, RNC...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "max-w-sm h-9" })),
            react_1["default"].createElement("div", { className: "rounded-md border" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null, table.getHeaderGroups().map(function (headerGroup) { return (react_1["default"].createElement(table_1.TableRow, { key: headerGroup.id }, headerGroup.headers.map(function (header) { return (react_1["default"].createElement(table_1.TableHead, { key: header.id }, header.isPlaceholder
                        ? null
                        : react_table_1.flexRender(header.column.columnDef.header, header.getContext()))); }))); })),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading ? (__spreadArrays(Array(pagination.pageSize)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-row-" + i }, columns_1.columns.map(function (col, j // <-- 'j' es el índice de la columna
                    ) { return (react_1["default"].createElement(table_1.TableCell, { key: "skel-cell-" + i + "-" + j },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-full" }))); }))); })) : ((_c = table.getRowModel().rows) === null || _c === void 0 ? void 0 : _c.length) ? (table.getRowModel().rows.map(function (row) { return (react_1["default"].createElement(table_1.TableRow, { key: row.id, "data-state": row.getIsSelected() && "selected" }, row.getVisibleCells().map(function (cell) { return (react_1["default"].createElement(table_1.TableCell, { key: cell.id }, react_table_1.flexRender(cell.column.columnDef.cell, cell.getContext()))); }))); })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: columns_1.columns.length, className: "h-24 text-center" }, "No se encontraron clientes.")))))),
            react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: table.getState().pagination.pageIndex + 1, totalPages: table.getPageCount(), totalRecords: (_d = paginatedCustomers === null || paginatedCustomers === void 0 ? void 0 : paginatedCustomers.total) !== null && _d !== void 0 ? _d : 0, limit: table.getState().pagination.pageSize, onNextPage: function () { return table.nextPage(); }, onPreviousPage: function () { return table.previousPage(); }, isFetching: isFetching })),
        react_1["default"].createElement(customer_form_dialog_1.CustomerFormDialog, { isOpen: isFormDialogOpen, onOpenChange: function (open) {
                if (!open) {
                    // Si el diálogo se cierra (por botón, esc, clic afuera)
                    setEditingCustomer(null); // Limpiar datos de edición
                }
                setIsFormDialogOpen(open);
            }, onSuccess: function () {
                // <-- AJUSTAR ESTA FUNCIÓN
                setIsFormDialogOpen(false);
                setEditingCustomer(null);
                // Usar invalidateQueries es más robusto que refetch para este caso
                // Invalida todas las queries que comiencen con "customersList"
                queryClient.invalidateQueries({ queryKey: ["customersList"] });
            }, customerData: editingCustomer }),
        react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: !!customerToDelete, onOpenChange: function (open) { return !open && setCustomerToDelete(null); } },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null, "\u00BFEst\u00E1s seguro?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null,
                        "Esta acci\u00F3n",
                        " ",
                        (customerToDelete === null || customerToDelete === void 0 ? void 0 : customerToDelete.isActive) ? "desactivará" : "activará",
                        " al cliente",
                        react_1["default"].createElement("strong", null,
                            " ",
                            (((customerToDelete === null || customerToDelete === void 0 ? void 0 : customerToDelete.firstName) || "") + " " + ((customerToDelete === null || customerToDelete === void 0 ? void 0 : customerToDelete.lastName) || "")).trim()),
                        ".",
                        (customerToDelete === null || customerToDelete === void 0 ? void 0 : customerToDelete.isActive) &&
                            " No podrás seleccionarlo para nuevas ventas o reparaciones.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, null, "Cancelar"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteMutation.mutate(customerToDelete.id); }, disabled: deleteMutation.isPending, className: (customerToDelete === null || customerToDelete === void 0 ? void 0 : customerToDelete.isActive) ? "bg-destructive hover:bg-destructive/90"
                            : "" },
                        deleteMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        "S\u00ED, ",
                        (customerToDelete === null || customerToDelete === void 0 ? void 0 : customerToDelete.isActive) ? "Desactivar" : "Activar"))))));
}
exports["default"] = CustomersPage;
