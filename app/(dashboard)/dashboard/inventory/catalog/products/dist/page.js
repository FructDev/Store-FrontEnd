// app/(dashboard)/inventory/catalog/products/page.tsx
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
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var sonner_1 = require("sonner");
// TODO: Importar AlertDialog para eliminar
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var use_debounce_1 = require("@/hooks/use-debounce"); // Asumiendo que tienes este hook
var card_1 = require("@/components/ui/card");
var product_form_dialog_1 = require("@/components/inventory/catalog/product-form-dialog");
var product_stock_details_dialog_1 = require("@/components/inventory/stock/product-stock-details-dialog");
// Mapeo para mostrar nombres de ProductType más amigables
var productTypeLabels = {
    GENERAL: "General",
    NEW: "Nuevo (Serializado)",
    USED: "Usado (Serializado)",
    REFURBISHED: "Reacondicionado (Serializado)",
    ACCESSORY: "Accesorio",
    SPARE_PART: "Repuesto",
    SERVICE: "Servicio",
    BUNDLE: "Bundle/Kit",
    OTHER: "Otro"
};
function ProductsPage() {
    var _this = this;
    var _a;
    var _b = react_1.useState(1), currentPage = _b[0], setCurrentPage = _b[1];
    var limitPerPage = react_1.useState(10)[0];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), filterProductType = _d[0], setFilterProductType = _d[1]; // 'all' o un valor de PrismaProductType
    var _e = react_1.useState("all"), filterCategoryId = _e[0], setFilterCategoryId = _e[1];
    var _f = react_1.useState("all"), filterIsActive = _f[0], setFilterIsActive = _f[1]; // "all", "true", "false"
    var debouncedSearchTerm = use_debounce_1.useDebounce(searchTerm, 500);
    var queryClient = react_query_1.useQueryClient();
    var _g = react_1.useState(false), isProductFormOpen = _g[0], setIsProductFormOpen = _g[1];
    var _h = react_1.useState(null), editingProduct = _h[0], setEditingProduct = _h[1];
    var _j = react_1.useState(null), productToAction = _j[0], setProductToAction = _j[1];
    var _k = react_1.useState(false), isDeactivateActivateDialogOpen = _k[0], setIsDeactivateActivateDialogOpen = _k[1];
    var _l = react_1.useState(false), isDeleteDialogOpen = _l[0], setIsDeleteDialogOpen = _l[1];
    var _m = react_1.useState(false), isStockDetailsOpen = _m[0], setIsStockDetailsOpen = _m[1];
    var _o = react_1.useState(null), selectedProductIdForStock = _o[0], setSelectedProductIdForStock = _o[1];
    var _p = react_query_1.useQuery({
        queryKey: [
            "inventoryProducts",
            currentPage,
            limitPerPage,
            debouncedSearchTerm,
            filterProductType,
            filterCategoryId,
            filterIsActive,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = {
                            page: currentPage,
                            limit: limitPerPage,
                            sortBy: "name",
                            sortOrder: "asc"
                        };
                        if (debouncedSearchTerm)
                            params.search = debouncedSearchTerm;
                        if (filterProductType !== "all")
                            params.productType = filterProductType;
                        if (filterCategoryId !== "all")
                            params.categoryId = filterCategoryId;
                        if (filterIsActive !== "all")
                            params.isActive = filterIsActive === "true";
                        return [4 /*yield*/, api_1["default"].get("/inventory/products", { params: params })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        placeholderData: function (previousData) { return previousData; }
    }), paginatedProducts = _p.data, isLoading = _p.isLoading, isError = _p.isError, error = _p.error, isFetching = _p.isFetching;
    // Fetch para categorías (usado en el filtro y potencialmente en el form de producto)
    var _q = react_query_1.useQuery({
        queryKey: ["allCategoriesForFilter"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].get("/inventory/categories")];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.data || response.data]; // Ajustar según la estructura de tu API
                }
            });
        }); }
    }), categories = _q.data, isLoadingCategories = _q.isLoading;
    // En ProductsPage
    var updateProductStatusMutation = react_query_1.useMutation({
        mutationFn: function (_a) {
            var productId = _a.productId, isActive = _a.isActive;
            return api_1["default"].patch("/inventory/products/" + productId, { isActive: isActive });
        },
        onSuccess: function (updatedProduct) {
            sonner_1.toast.success("Producto \"" + updatedProduct.name + "\" ha sido " + (updatedProduct.isActive ? "activado" : "desactivado") + ".");
            queryClient.invalidateQueries({ queryKey: ["inventoryProducts"] });
            setIsDeactivateActivateDialogOpen(false);
            setProductToAction(null);
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al actualizar estado del producto.");
            setIsDeactivateActivateDialogOpen(false);
            setProductToAction(null);
        }
    });
    // En ProductsPage
    var deleteProductMutation = react_query_1.useMutation({
        mutationFn: function (productId) {
            return api_1["default"]["delete"]("/inventory/products/" + productId);
        },
        onSuccess: function () {
            sonner_1.toast.success("Producto \"" + ((productToAction === null || productToAction === void 0 ? void 0 : productToAction.name) || "") + "\" marcado como inactivo (eliminado).");
            queryClient.invalidateQueries({ queryKey: ["inventoryProducts"] });
            setIsDeleteDialogOpen(false);
            setProductToAction(null);
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al eliminar producto.");
            setIsDeleteDialogOpen(false);
            setProductToAction(null);
        }
    });
    var handleOpenCreateDialog = function () {
        console.log("Open Dialog");
        setEditingProduct(null);
        setIsProductFormOpen(true);
    };
    var handleOpenEditDialog = function (product) {
        setEditingProduct(product);
        setIsProductFormOpen(true);
    };
    var handleOpenDeactivateActivateDialog = function (product) {
        setProductToAction(product);
        setIsDeactivateActivateDialogOpen(true);
    };
    var handleOpenDeleteDialog = function (product) {
        setProductToAction(product);
        setIsDeleteDialogOpen(true);
    };
    var confirmProductStatusChange = function () {
        if (productToAction) {
            updateProductStatusMutation.mutate({
                productId: productToAction.id,
                isActive: !productToAction.isActive
            });
        }
    };
    var confirmDeleteProduct = function () {
        if (productToAction) {
            deleteProductMutation.mutate(productToAction.id);
        }
    };
    var handleOpenStockDetails = function (productId) {
        setSelectedProductIdForStock(productId);
        setIsStockDetailsOpen(true);
    };
    var handlePreviousPage = function () {
        return setCurrentPage(function (prev) { return Math.max(prev - 1, 1); });
    };
    var handleNextPage = function () {
        if (paginatedProducts && currentPage < paginatedProducts.totalPages) {
            setCurrentPage(function (prev) { return prev + 1; });
        }
    };
    react_1.useEffect(function () {
        setCurrentPage(1);
    }, [
        debouncedSearchTerm,
        filterProductType,
        filterCategoryId,
        filterIsActive,
    ]);
    // Función para formatear moneda (si la necesitas para precios)
    var formatCurrency = function (amount, currencySymbol) {
        if (currencySymbol === void 0) { currencySymbol = "RD$"; }
        if (amount === null || amount === undefined)
            return "-";
        var numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        return currencySymbol + " " + numericAmount.toFixed(2);
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Cat\u00E1logo de Productos", description: "Gestiona todos los productos, servicios y repuestos de tu tienda.", actionButton: react_1["default"].createElement(button_1.Button, { onClick: handleOpenCreateDialog },
                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                " A\u00F1adir Producto") }),
        react_1["default"].createElement(card_1.Card, { className: "mb-6" },
            react_1["default"].createElement(card_1.CardHeader, null,
                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Filtros de B\u00FAsqueda")),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
                    react_1["default"].createElement("div", { className: "relative" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                        react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar por nombre, SKU...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-10" })),
                    react_1["default"].createElement(select_1.Select, { value: filterProductType, onValueChange: setFilterProductType },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por tipo..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos los Tipos"),
                            Object.entries(productTypeLabels).map(function (_a) {
                                var value = _a[0], label = _a[1];
                                return (react_1["default"].createElement(select_1.SelectItem, { key: value, value: value }, label));
                            }))),
                    react_1["default"].createElement(select_1.Select, { value: filterCategoryId, onValueChange: setFilterCategoryId, disabled: isLoadingCategories },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por categor\u00EDa..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todas las Categor\u00EDas"),
                            isLoadingCategories && (react_1["default"].createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), categories === null || categories === void 0 ? void 0 :
                            categories.map(function (cat) { return (react_1["default"].createElement(select_1.SelectItem, { key: cat.id, value: cat.id }, cat.name)); }))),
                    react_1["default"].createElement(select_1.Select, { value: filterIsActive, onValueChange: setFilterIsActive },
                        react_1["default"].createElement(select_1.SelectTrigger, null,
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filtrar por estado..." })),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "Todos (Activo/Inactivo)"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "true" }, "Solo Activos"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "false" }, "Solo Inactivos")))))),
        react_1["default"].createElement(card_1.Card, null,
            react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                react_1["default"].createElement(table_1.Table, null,
                    react_1["default"].createElement(table_1.TableHeader, null,
                        react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[25%]" }, "Nombre"),
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[15%]" }, "SKU"),
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[15%]" }, "Tipo"),
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[10%] text-right" }, "Precio Venta"),
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[10%] text-right" }, "Costo"),
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[10%] text-center" }, "Serializado"),
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[10%] text-center" }, "Activo"),
                            react_1["default"].createElement(table_1.TableHead, { className: "w-[5%] text-right" }, "Acciones"))),
                    react_1["default"].createElement(table_1.TableBody, null, isLoading || (isFetching && !(paginatedProducts === null || paginatedProducts === void 0 ? void 0 : paginatedProducts.data)) ? (__spreadArrays(Array(limitPerPage)).map(function (_, i) { return (react_1["default"].createElement(table_1.TableRow, { key: "skel-prod-" + i },
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" })),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" })),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" })),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" })),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-5 w-full" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-6 mx-auto" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-16 mx-auto" })),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-8 ml-auto" })))); })) : isError ? (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center text-red-500 py-10" },
                            "Error: ",
                            error.message))) : ((_a = paginatedProducts === null || paginatedProducts === void 0 ? void 0 : paginatedProducts.data) === null || _a === void 0 ? void 0 : _a.length) ? (paginatedProducts.data.map(function (product) { return (react_1["default"].createElement(table_1.TableRow, { key: product.id },
                        react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, product.name),
                        react_1["default"].createElement(table_1.TableCell, null, product.sku || "-"),
                        react_1["default"].createElement(table_1.TableCell, null,
                            react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, productTypeLabels[product.productType] || product.productType)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(product.sellingPrice)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(product.costPrice)),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" }, product.tracksImei ? (react_1["default"].createElement(lucide_react_1.CheckSquare, { className: "h-5 w-5 text-blue-600 mx-auto" })) : (react_1["default"].createElement(lucide_react_1.XSquare, { className: "h-5 w-5 text-muted-foreground mx-auto" }))),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-center" },
                            react_1["default"].createElement(badge_1.Badge, { variant: product.isActive ? "default" : "destructive", className: product.isActive
                                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:text-green-300 dark:bg-green-700/30"
                                    : "" }, product.isActive ? "Sí" : "No")),
                        react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                            react_1["default"].createElement(dropdown_menu_1.DropdownMenu, null,
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "h-8 w-8 p-0" },
                                        react_1["default"].createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
                                react_1["default"].createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuLabel, null, "Acciones"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenStockDetails(product.id); } },
                                        react_1["default"].createElement(lucide_react_1.Layers, { className: "mr-2 h-4 w-4" }),
                                        " Ver Stock"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenEditDialog(product); } },
                                        " ",
                                        react_1["default"].createElement(lucide_react_1.Edit3, { className: "mr-2 h-4 w-4" }),
                                        " Editar"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () {
                                            return handleOpenDeactivateActivateDialog(product);
                                        }, className: product.isActive
                                            ? "text-yellow-600 focus:text-yellow-700"
                                            : "text-green-600 focus:text-green-700" },
                                        product.isActive ? (react_1["default"].createElement(lucide_react_1.XSquare, { className: "mr-2 h-4 w-4" })) : (react_1["default"].createElement(lucide_react_1.CheckSquare, { className: "mr-2 h-4 w-4" })),
                                        product.isActive ? "Desactivar" : "Activar"),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    react_1["default"].createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return handleOpenDeleteDialog(product); }, className: "text-red-600 focus:text-red-600" },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" }),
                                        " Eliminar")))))); })) : (react_1["default"].createElement(table_1.TableRow, null,
                        react_1["default"].createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-10" }, "No se encontraron productos que coincidan con los filtros."))))))),
        paginatedProducts &&
            paginatedProducts.data &&
            paginatedProducts.totalPages > 0 && (react_1["default"].createElement(data_table_pagination_1.DataTablePagination, { page: paginatedProducts.page, totalPages: paginatedProducts.totalPages, totalRecords: paginatedProducts.total, limit: paginatedProducts.limit, onNextPage: handleNextPage, onPreviousPage: handlePreviousPage, isFetching: isFetching })),
        react_1["default"].createElement(product_form_dialog_1.ProductFormDialog, { product: editingProduct, isOpen: isProductFormOpen, onOpenChange: setIsProductFormOpen }),
        productToAction && (react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: isDeactivateActivateDialogOpen, onOpenChange: setIsDeactivateActivateDialogOpen },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null,
                        "\u00BFEst\u00E1s seguro de que quieres",
                        " ",
                        productToAction.isActive ? "desactivar" : "activar",
                        " el producto ",
                        productToAction.name,
                        " ?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null, productToAction.isActive
                        ? "El producto ya no estará disponible para nuevas ventas o uso en reparaciones/bundles."
                        : "El producto volverá a estar disponible.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { onClick: function () { return setProductToAction(null); } }, "Cancelar"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmProductStatusChange, disabled: updateProductStatusMutation.isPending, className: productToAction.isActive
                            ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                            : "bg-green-600 hover:bg-green-700" },
                        updateProductStatusMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        productToAction.isActive ? "Sí, Desactivar" : "Sí, Activar"))))),
        productToAction && ( // Reutilizar productToAction o crear uno específico como productToDelete
        react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: isDeleteDialogOpen, onOpenChange: setIsDeleteDialogOpen },
            react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                react_1["default"].createElement(alert_dialog_1.AlertDialogHeader, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null,
                        "\u00BFEst\u00E1s seguro de eliminar (marcar como inactivo) el producto",
                        productToAction.name,
                        " ?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null, "Esta acci\u00F3n marcar\u00E1 el producto como inactivo. No se eliminar\u00E1 permanentemente de la base de datos, pero no estar\u00E1 disponible para nuevas operaciones.")),
                react_1["default"].createElement(alert_dialog_1.AlertDialogFooter, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, { onClick: function () { return setProductToAction(null); } }, "Cancelar"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: confirmDeleteProduct, disabled: deleteProductMutation.isPending, className: "bg-destructive hover:bg-destructive/90" },
                        deleteProductMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        "S\u00ED, Eliminar"))))),
        react_1["default"].createElement(product_stock_details_dialog_1.ProductStockDetailsDialog, { productId: selectedProductIdForStock, isOpen: isStockDetailsOpen, onOpenChange: setIsStockDetailsOpen })));
}
exports["default"] = ProductsPage;
