// app/(dashboard)/users/page.tsx
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
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var create_user_dialog_1 = require("@/components/users/create-user-dialog"); // Importamos el diálogo
var edit_user_dialog_1 = require("@/components/users/edit-user-dialog"); // Importamos el diálogo de edición
var data_table_pagination_1 = require("@/components/common/data-table-pagination"); // Componente de paginación
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input"); // Para búsqueda
var select_1 = require("@/components/ui/select"); // Para filtros
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var sonner_1 = require("sonner");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var use_debounce_1 = require("@/hooks/use-debounce"); // Hook simple para debounce (crear este hook)
var card_1 = require("@/components/ui/card");
// Roles que se pueden asignar (para el filtro)
var assignableRoles = [
    { value: "SALESPERSON", label: "Vendedor" },
    { value: "TECHNICIAN", label: "Técnico" },
];
function UsersPage() {
    var _this = this;
    var _a;
    var _b = react_1.useState(1), currentPage = _b[0], setCurrentPage = _b[1];
    var limitPerPage = react_1.useState(10)[0];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), filterIsActive = _d[0], setFilterIsActive = _d[1]; // "all", "true", "false"
    var _e = react_1.useState("all"), filterRoleName = _e[0], setFilterRoleName = _e[1];
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 500); // Hook de debounce
    var queryClient = react_query_1.useQueryClient();
    var _f = react_1.useState(false), isEditUserDialogOpen = _f[0], setIsEditUserDialogOpen = _f[1];
    var _g = react_1.useState(null), selectedUserForEdit = _g[0], setSelectedUserForEdit = _g[1];
    var _h = react_1.useState(false), isConfirmStatusDialogOpen = _h[0], setIsConfirmStatusDialogOpen = _h[1];
    var _j = react_1.useState(null), userForStatusChange = _j[0], setUserForStatusChange = _j[1];
    var _k = react_query_1.useQuery({
        queryKey: [
            "storeUsers",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
            filterIsActive,
            filterRoleName,
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
                        if (filterIsActive !== "all")
                            params.isActive = filterIsActive === "true";
                        if (filterRoleName !== "all")
                            params.roleName = filterRoleName;
                        return [4 /*yield*/, api_1["default"].get("/users", { params: params })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedUsers = _k.data, isLoading = _k.isLoading, isError = _k.isError, error = _k.error, isFetching = _k.isFetching;
    // Mutación para activar/desactivar usuario
    var updateUserStatusMutation = react_query_1.useMutation({
        mutationFn: function (_a) {
            var userId = _a.userId, isActive = _a.isActive;
            return api_1["default"].patch("/users/" + userId, { isActive: isActive });
        },
        onSuccess: function (updatedUser) {
            sonner_1.toast.success("Estado del usuario " + updatedUser.firstName + " actualizado.");
            queryClient.invalidateQueries({ queryKey: ["storeUsers"] });
            setIsConfirmStatusDialogOpen(false);
            setUserForStatusChange(null);
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al actualizar estado del usuario.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
            setIsConfirmStatusDialogOpen(false);
            setUserForStatusChange(null);
        }
    });
    var handleOpenEditDialog = function (user) {
        setSelectedUserForEdit(user);
        setIsEditUserDialogOpen(true);
    };
    var handleOpenConfirmStatusDialog = function (user) {
        setUserForStatusChange(user);
        setIsConfirmStatusDialogOpen(true);
    };
    var confirmUserStatusChange = function () {
        if (userForStatusChange) {
            updateUserStatusMutation.mutate({
                userId: userForStatusChange.id,
                isActive: !userForStatusChange.isActive
            });
        }
    };
    // Funciones de Paginación
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedUsers && currentPage < paginatedUsers.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    // Resetear página a 1 cuando cambian los filtros
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filterIsActive, filterRoleName]);
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Gesti\u00F3n de Usuarios", description: "A\u00F1ade, edita y gestiona los usuarios de tu tienda.", actionButton: react_1["default"].createElement(create_user_dialog_1.CreateUserDialog, null) }),
        react_1["default"].createElement("div", { className: "mb-4 grid grid-cols-1 md:grid-cols-3 gap-4" },
            react_1["default"].createElement(input_1.Input, { placeholder: "Buscar por nombre, apellido, email...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "md:col-span-1" }),
            react_1["default"].createElement(select_1.Select, { value: filterIsActive, onValueChange: setFilterIsActive },
                react_1["default"].createElement(select_1.SelectTrigger, null,
                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por estado" })),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Estados"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "true" }, "Activo"),
                    react_1["default"].createElement(select_1.SelectItem, { value: "false" }, "Inactivo"))),
            react_1["default"].createElement(select_1.Select, { value: filterRoleName, onValueChange: setFilterRoleName },
                react_1["default"].createElement(select_1.SelectTrigger, null,
                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por rol" })),
                react_1["default"].createElement(select_1.SelectContent, null,
                    react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Roles"),
                    assignableRoles.map(function (role) { return (react_1["default"].createElement(select_1.SelectItem, { key: role.value, value: role.value }, role.label)); })))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, null, "Nombre Completo"),
                            react_1["default"].createElement(table_1.TableHead, null, "Email"),
                            react_1["default"].createElement(table_1.TableHead, null, "Roles"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-center" }, "Estado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Acciones"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading || isFetching ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-" + i },
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-32" })),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-40" })),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-24" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-16 mx-auto" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-8 ml-auto" })))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 5, className: "text-center text-red-500 py-10" },
                            "Error cargando usuarios: ",
                            error.message))) : ((_a = paginatedUsers === null || paginatedUsers === void 0 ? void 0 : paginatedUsers.data) === null || _a === void 0 ? void 0 : _a.length) ? (paginatedUsers.data.map(function (userItem) {
                        var _a;
                        return (react_1["default"].createElement(table_1.TableRow, { key: userItem.id },
                            react_1["default"].createElement(table_1.TableCell, null,
                                userItem.firstName,
                                " ",
                                userItem.lastName),
                            react_1["default"].createElement(table_1.TableCell, null, userItem.email),
                            react_1["default"].createElement(table_1.TableCell, null, (_a = userItem.roles) === null || _a === void 0 ? void 0 : _a.map(function (roleObj // Ahora 'roleObj' es { id: string, name: string }
                            ) { return (react_1["default"].createElement(badge_1.Badge, { key: roleObj.id, variant: "outline", className: "mr-1 capitalize" },
                                roleObj.name.toLowerCase().replace("_", " "),
                                " ")); })),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                                react_1["default"].createElement(badge_1.Badge, { variant: userItem.isActive ? "default" : "destructive", className: userItem.isActive
                                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300"
                                        : "" }, userItem.isActive ? "Activo" : "Inactivo")),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "h-8 w-8 p-0" },
                                            react_1["default"].createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, null, "Acciones"),
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenEditDialog(userItem); } }, "Editar Usuario"),
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                        react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () {
                                                return handleOpenConfirmStatusDialog(userItem);
                                            }, className: userItem.isActive
                                                ? "text-red-500 focus:text-red-600"
                                                : "text-green-600 focus:text-green-700" }, userItem.isActive ? "Desactivar" : "Activar"))))));
                    })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-10" }, "No se encontraron usuarios."))))))),
        paginatedUsers && paginatedUsers.totalPages > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedUsers.page, totalPages: paginatedUsers.totalPages, totalRecords: paginatedUsers.total, limit: paginatedUsers.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching })),
        react_1["default"].createElement(edit_user_dialog_1.EditUserDialog, { user: selectedUserForEdit, isOpen: isEditUserDialogOpen, onOpenChange: setIsEditUserDialogOpen }),
        userForStatusChange && (react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: isConfirmStatusDialogOpen, onOpenChange: setIsConfirmStatusDialogOpen },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null,
                        "\u00BFEst\u00E1s seguro de que quieres",
                        " ",
                        userForStatusChange.isActive ? "desactivar" : "activar",
                        " a",
                        " ",
                        userForStatusChange.firstName,
                        " ",
                        userForStatusChange.lastName,
                        "?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null, userForStatusChange.isActive
                        ? "El usuario ya no podrá acceder al sistema."
                        : "El usuario recuperará el acceso al sistema.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { onClick: function () { return setUserForStatusChange(null); } }, "Cancelar"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmUserStatusChange, disabled: updateUserStatusMutation.isPending, className: userForStatusChange.isActive
                            ? "bg-destructive hover:bg-destructive/90"
                            : "bg-green-600 hover:bg-green-700" },
                        updateUserStatusMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        userForStatusChange.isActive
                            ? "Sí, Desactivar"
                            : "Sí, Activar")))))));
}
exports["default"] = UsersPage;
