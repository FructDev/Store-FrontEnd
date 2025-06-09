// components/inventory/stock/product-stock-details-dialog.tsx
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
exports.ProductStockDetailsDialog = void 0;
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums"); // O donde tengas tus enums
var sheet_1 = require("@/components/ui/sheet");
var button_1 = require("@/components/ui/button");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var scroll_area_1 = require("@/components/ui/scroll-area");
var date_fns_1 = require("date-fns"); // Para formatear fechas
var locale_1 = require("date-fns/locale"); // Para formato en español
var formatCurrency = function (amount, currencySymbol) {
    if (currencySymbol === void 0) { currencySymbol = "RD$"; }
    if (amount === null || amount === undefined)
        return "-";
    var numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(numericAmount))
        return "-";
    return currencySymbol + " " + numericAmount.toFixed(2);
};
var formatDate = function (dateString) {
    if (!dateString)
        return "-";
    try {
        return date_fns_1.format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: locale_1.es });
    }
    catch (e) {
        return String(dateString); // Fallback
    }
};
function ProductStockDetailsDialog(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var productId = _a.productId, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange;
    var _f = react_query_1.useQuery({
        // Tipado más explícito para queryKey
        // --- CAMBIO AQUÍ: Todo dentro de un solo objeto --- V V V
        queryKey: ["productStockDetails", productId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!productId) {
                            // Esto no debería lanzarse si 'enabled' funciona bien, pero es una buena guarda.
                            // O podrías devolver Promise.reject(new Error(...)) o un valor que indique no datos.
                            // React Query prefiere que queryFn devuelva una promesa que resuelva o rechace.
                            // No lanzar errores directamente aquí si 'enabled' lo maneja.
                            // Si enabled es false, queryFn no se ejecuta.
                            // Si productId es null y enabled es true por alguna razón, entonces sí es un error.
                            console.warn("Product ID es null en queryFn, no se debería ejecutar si 'enabled' está bien.");
                            return [2 /*return*/, { product: null, items: [], totalQuantity: 0 }]; // Devolver data vacía/default o lanzar error
                        }
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/product/" + productId)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        enabled: !!productId && isOpen,
        staleTime: 1000 * 60 * 1
    }), stockDetails = _f.data, isLoading = _f.isLoading, isError = _f.isError, error = _f.error;
    if (!isOpen)
        return null;
    return (React.createElement(sheet_1.Sheet, { open: isOpen, onOpenChange: onOpenChange },
        React.createElement(sheet_1.SheetContent, { className: "sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full flex flex-col" },
            " ",
            React.createElement(sheet_1.SheetHeader, { className: "pr-10" },
                " ",
                React.createElement(sheet_1.SheetTitle, null,
                    "Detalle de Stock:",
                    " ",
                    isLoading ? (React.createElement(skeleton_1.Skeleton, { className: "h-6 w-40 inline-block" })) : (((_b = stockDetails === null || stockDetails === void 0 ? void 0 : stockDetails.product) === null || _b === void 0 ? void 0 : _b.name) || "Producto Desconocido")),
                React.createElement(sheet_1.SheetDescription, null,
                    React.createElement("span", null,
                        "SKU: ",
                        ((_c = stockDetails === null || stockDetails === void 0 ? void 0 : stockDetails.product) === null || _c === void 0 ? void 0 : _c.sku) || "-",
                        " | Total Disponible:",
                        " ",
                        isLoading ? (React.createElement(skeleton_1.Skeleton, { className: "h-4 w-10 inline-block" })) : ((_d = stockDetails === null || stockDetails === void 0 ? void 0 : stockDetails.totalQuantity) !== null && _d !== void 0 ? _d : 0),
                        " ",
                        "unidades"))),
            React.createElement(scroll_area_1.ScrollArea, { className: "flex-1 pr-2" },
                " ",
                React.createElement("div", { className: "py-4" },
                    isLoading && (React.createElement("div", { className: "space-y-2" }, __spreadArrays(Array(5)).map(function (_, i) { return (React.createElement(skeleton_1.Skeleton, { key: i, className: "h-10 w-full" })); }))),
                    isError && (React.createElement("p", { className: "text-red-500 text-center py-10" },
                        "Error cargando detalles de stock: ",
                        error.message)),
                    !isLoading &&
                        !isError &&
                        (!stockDetails || stockDetails.items.length === 0) && (React.createElement("p", { className: "text-muted-foreground text-center py-10" }, "No hay items de inventario registrados para este producto.")),
                    !isLoading &&
                        !isError &&
                        stockDetails &&
                        stockDetails.items.length > 0 && (React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Ubicaci\u00F3n"),
                                ((_e = stockDetails.product) === null || _e === void 0 ? void 0 : _e.tracksImei) && (React.createElement(table_1.TableHead, null, "IMEI/Serial")),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Cantidad"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Costo Unit."),
                                React.createElement(table_1.TableHead, null, "Condici\u00F3n"),
                                React.createElement(table_1.TableHead, null, "Estado"),
                                React.createElement(table_1.TableHead, null, "Ingreso"),
                                React.createElement(table_1.TableHead, null, "\u00DAlt. Act."))),
                        React.createElement(table_1.TableBody, null, stockDetails.items.map(function (item) {
                            var _a, _b;
                            return (React.createElement(table_1.TableRow, { key: item.id },
                                React.createElement(table_1.TableCell, null, ((_a = item.location) === null || _a === void 0 ? void 0 : _a.name) || "N/A"),
                                ((_b = stockDetails.product) === null || _b === void 0 ? void 0 : _b.tracksImei) && (React.createElement(table_1.TableCell, null, item.imei || "-")),
                                React.createElement(table_1.TableCell, { className: "text-right" }, item.quantity),
                                React.createElement(table_1.TableCell, { className: "text-right" }, formatCurrency(item.costPrice)),
                                React.createElement(table_1.TableCell, null, item.condition || "-"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE
                                            ? "default"
                                            : item.status === prisma_enums_1.InventoryItemStatus.SOLD
                                                ? "secondary"
                                                : item.status ===
                                                    prisma_enums_1.InventoryItemStatus.USED_IN_REPAIR
                                                    ? "outline"
                                                    : item.status === prisma_enums_1.InventoryItemStatus.DAMAGED
                                                        ? "destructive"
                                                        : item.status === prisma_enums_1.InventoryItemStatus.REMOVED
                                                            ? "destructive" // Usar 'destructive' para REMOVED
                                                            : item.status === prisma_enums_1.InventoryItemStatus.RETURNED
                                                                ? "default" // 'default' para RETURNED, color se añade con className
                                                                : item.status === prisma_enums_1.InventoryItemStatus.RESERVED
                                                                    ? "outline" // 'outline' para RESERVED
                                                                    : item.status === prisma_enums_1.InventoryItemStatus.IN_TRANSIT
                                                                        ? "outline" // 'outline' para IN_TRANSIT
                                                                        : item.status ===
                                                                            prisma_enums_1.InventoryItemStatus.CONSIGNMENT
                                                                            ? "secondary" // 'secondary' para CONSIGNMENT
                                                                            : "secondary" // Un default general para otros estados si los hubiera
                                        , className: item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE
                                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:text-green-300 dark:bg-green-700/30"
                                            : item.status === prisma_enums_1.InventoryItemStatus.RETURNED
                                                ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:text-yellow-300 dark:bg-yellow-700/30"
                                                : item.status === prisma_enums_1.InventoryItemStatus.RESERVED
                                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-700/30"
                                                    : item.status === prisma_enums_1.InventoryItemStatus.IN_TRANSIT
                                                        ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:text-purple-300 dark:bg-purple-700/30"
                                                        : // No necesitas clases adicionales si 'destructive' o 'secondary' por defecto ya se ven bien
                                                            "" }, item.status
                                        ? item.status
                                            .toString()
                                            .replace(/_/g, " ")
                                            .toLowerCase()
                                            .replace(/\b\w/g, function (l) { return l.toUpperCase(); })
                                        : "N/A")),
                                React.createElement(table_1.TableCell, null, formatDate(item.entryDate || item.createdAt)),
                                React.createElement(table_1.TableCell, null, formatDate(item.updatedAt))));
                        })))))),
            React.createElement("div", { className: "mt-auto pt-4 border-t" },
                " ",
                React.createElement(sheet_1.SheetClose, { asChild: true },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", className: "w-full" }, "Cerrar"))))));
}
exports.ProductStockDetailsDialog = ProductStockDetailsDialog;
