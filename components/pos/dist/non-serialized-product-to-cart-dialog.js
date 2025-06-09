// components/pos/non-serialized-product-to-cart-dialog.tsx
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
exports.__esModule = true;
exports.NonSerializedProductToCartDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react"); // ShoppingCart para el botón
var react_1 = require("react");
// Schema Zod solo para locationId, ya que la cantidad es fija (1)
var selectLocationSchema = z.object({
    locationId: z.string().min(1, "Debe seleccionar una ubicación de origen.")
});
function NonSerializedProductToCartDialog(_a) {
    var _this = this;
    var _b;
    var product = _a.product, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onAddToCart = _a.onAddToCart;
    var _c = react_query_1.useQuery({
        queryKey: ["productAvailableStockForDialog", product === null || product === void 0 ? void 0 : product.id],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(product === null || product === void 0 ? void 0 : product.id))
                            throw new Error("ID de producto no disponible para cargar stock.");
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/product/" + product.id // Endpoint que devuelve stock detallado
                            )];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        enabled: !!product && isOpen,
        staleTime: 1000 * 30
    }), productStockInfo = _c.data, isLoadingProductStock = _c.isLoading;
    // Calcula y memoiza las ubicaciones con stock disponible para el producto
    var locationsWithStock = react_1.useMemo(function () {
        if (!(productStockInfo === null || productStockInfo === void 0 ? void 0 : productStockInfo.items))
            return [];
        var locationMap = new Map();
        productStockInfo.items.forEach(function (item) {
            if (item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE &&
                !item.imei &&
                item.location) {
                var existing = locationMap.get(item.location.id);
                var currentQuantityInLocation = existing
                    ? existing.availableQuantity
                    : 0;
                locationMap.set(item.location.id, {
                    locationId: item.location.id,
                    locationName: item.location.name,
                    availableQuantity: currentQuantityInLocation + item.quantity
                });
            }
        });
        return Array.from(locationMap.values()).filter(function (loc) { return loc.availableQuantity > 0; });
    }, [productStockInfo]);
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(selectLocationSchema),
        defaultValues: {
            locationId: undefined
        }
    });
    // Efecto para resetear el formulario y preseleccionar ubicación si solo hay una opción
    react_1.useEffect(function () {
        if (isOpen && product) {
            var initialLocationId = undefined;
            if (locationsWithStock && locationsWithStock.length === 1) {
                initialLocationId = locationsWithStock[0].locationId;
            }
            form.reset({
                locationId: initialLocationId
            });
        }
        else if (!isOpen) {
            // Limpiar el formulario cuando el diálogo se cierra
            form.reset({ locationId: undefined });
        }
    }, [product, isOpen, form, locationsWithStock]); // form.reset es estable, pero RHF recomienda incluir form
    // Función que se ejecuta al enviar el formulario del diálogo
    function onSubmit(data) {
        if (!product || !data.locationId) {
            sonner_1.toast.error("Error inesperado: Producto o ubicación no están definidos.");
            return;
        }
        var selectedLocation = locationsWithStock.find(function (loc) { return loc.locationId === data.locationId; });
        if (!selectedLocation) {
            sonner_1.toast.error("Ubicación seleccionada no es válida o no tiene stock.");
            return;
        }
        // Validar que haya al menos 1 unidad disponible (ya que siempre añadimos 1)
        if (selectedLocation.availableQuantity < 1) {
            form.setError("locationId", {
                type: "manual",
                message: "No hay stock disponible en " + selectedLocation.locationName + "."
            });
            sonner_1.toast.error("Stock insuficiente en " + selectedLocation.locationName + ".");
            return;
        }
        // Llama al callback del POSPage para añadir el producto al carrito
        onAddToCart(product, {
            locationId: selectedLocation.locationId,
            locationName: selectedLocation.locationName
        });
        onOpenChange(false); // Cierra el diálogo después de llamar a onAddToCart
    }
    // No renderizar nada si el diálogo no está abierto o no hay producto
    if (!isOpen || !product)
        return null;
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-sm" },
            " ",
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-lg" },
                    "A\u00F1adir: ",
                    react_1["default"].createElement("span", { className: "font-semibold" }, product.name)),
                react_1["default"].createElement(dialog_1.DialogDescription, null,
                    product.sku && (react_1["default"].createElement("span", { className: "block text-xs text-muted-foreground" },
                        "SKU: ",
                        product.sku)),
                    "Selecciona la ubicaci\u00F3n para a\u00F1adir 1 unidad al carrito.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-5 pt-1" },
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "locationId", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "Ubicaci\u00F3n de Origen*"),
                                react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingProductStock || locationsWithStock.length === 0 },
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "h-10" },
                                            react_1["default"].createElement(select_1.SelectValue, { placeholder: isLoadingProductStock
                                                    ? "Cargando stock..."
                                                    : locationsWithStock.length === 0
                                                        ? "Sin stock disponible"
                                                        : "Selecciona una ubicación..." }))),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        !isLoadingProductStock &&
                                            locationsWithStock.length === 0 && (react_1["default"].createElement("div", { className: "px-2 py-3 text-center text-sm text-muted-foreground" }, "No hay stock disponible para este producto en ninguna ubicaci\u00F3n.")),
                                        locationsWithStock.map(function (loc) { return (react_1["default"].createElement(select_1.SelectItem, { key: loc.locationId, value: loc.locationId, disabled: loc.availableQuantity < 1 },
                                            loc.locationName,
                                            " (Disponible:",
                                            " ",
                                            loc.availableQuantity,
                                            ")",
                                            loc.availableQuantity < 1 && (react_1["default"].createElement("span", { className: "text-xs text-destructive ml-2" }, "(Agotado)")))); }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-3" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: form.formState.isSubmitting }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: !form.watch("locationId") || // Deshabilitar si no hay ubicación seleccionada
                                form.formState.isSubmitting ||
                                isLoadingProductStock ||
                                locationsWithStock.length === 0 ||
                                (((_b = locationsWithStock.find(function (l) { return l.locationId === form.getValues("locationId"); })) === null || _b === void 0 ? void 0 : _b.availableQuantity) || 0) < 1 // Si la ubicación seleccionada se quedó sin stock
                         },
                            form.formState.isSubmitting && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            react_1["default"].createElement(lucide_react_1.ShoppingCart, { className: "mr-2 h-4 w-4" }),
                            " A\u00F1adir al Carrito (1 ud.)")))))));
}
exports.NonSerializedProductToCartDialog = NonSerializedProductToCartDialog;
