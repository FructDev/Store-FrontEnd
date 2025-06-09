// components/inventory/stock/transfer-stock-form.tsx
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
exports.TransferStockForm = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var textarea_1 = require("@/components/ui/textarea");
var transferStockSchema = z.object({
    productId: z.string().min(1, "Debes seleccionar un producto."),
    fromLocationId: z
        .string()
        .min(1, "Debes seleccionar una ubicación de origen."),
    toLocationId: z
        .string()
        .min(1, "Debes seleccionar una ubicación de destino."),
    quantity: z.coerce
        .number()
        .positive("Cantidad debe ser positiva.")
        .optional(),
    imei: z.string().optional().nullable(),
    notes: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
// Necesitamos una forma de pasar el estado de tracksImei al validador refine o manejarlo en onSubmit
// Por ahora, lo validaremos en onSubmit.
// Para almacenar temporalmente el producto seleccionado para la validación cruzada en Zod
// Esto es un hack. Una mejor manera sería usar el 'context' de Zod o un superRefine.
// O más simple: validar en la función onSubmit ANTES de llamar a la mutación.
// import { useAuthStore } from "@/stores/auth.store"; // Solo para el hack de abajo, no ideal
function TransferStockForm() {
    var _this = this;
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(transferStockSchema),
        defaultValues: {
            productId: undefined,
            fromLocationId: undefined,
            toLocationId: undefined,
            quantity: undefined,
            imei: undefined,
            notes: ""
        }
    });
    var selectedProductId = form.watch("productId");
    var selectedFromLocationId = form.watch("fromLocationId");
    var _a = react_query_1.useQuery({
        queryKey: ["allProductsForTransfer"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?isActive=true&limit=1000")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), allProducts = _a.data, isLoadingAllProducts = _a.isLoading;
    var selectedProductInfo = react_1.useMemo(function () {
        return allProducts === null || allProducts === void 0 ? void 0 : allProducts.find(function (p) { return p.id === selectedProductId; });
    }, [allProducts, selectedProductId]);
    var _b = react_query_1.useQuery({
        queryKey: ["allLocationsForTransfer"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), allLocations = _b.data, isLoadingAllLocations = _b.isLoading;
    // Query para obtener stock del producto en la ubicación de origen
    var _c = react_query_1.useQuery({
        queryKey: [
            "stockInFromLocation",
            selectedProductId,
            selectedFromLocationId,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedProductId || !selectedFromLocationId) {
                            return [2 /*return*/, { product: null, items: [], totalQuantity: 0 }];
                        }
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/product/" + selectedProductId)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data]; // La respuesta completa es ProductStockInfo
                }
            });
        }); },
        enabled: !!selectedProductId && !!selectedFromLocationId,
        staleTime: 1000 * 10
    }), stockInFromLocationData = _c.data, isLoadingStockFrom = _c.isLoading;
    var availableStockForTransfer = react_1.useMemo(function () {
        if (!stockInFromLocationData ||
            !selectedFromLocationId ||
            !stockInFromLocationData.items) {
            return { items: [], totalQuantity: 0 };
        }
        var filteredItems = stockInFromLocationData.items.filter(function (item) {
            var _a;
            return ((_a = item.location) === null || _a === void 0 ? void 0 : _a.id) === selectedFromLocationId &&
                item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE;
        });
        var totalQty = (selectedProductInfo === null || selectedProductInfo === void 0 ? void 0 : selectedProductInfo.tracksImei) ? filteredItems.filter(function (item) { return !!item.imei; }).length // Para serializados, cantidad de items únicos con IMEI
            : filteredItems.reduce(function (sum, item) { return sum + item.quantity; }, 0);
        return { items: filteredItems, totalQuantity: totalQty };
    }, [
        stockInFromLocationData,
        selectedFromLocationId,
        selectedProductInfo === null || selectedProductInfo === void 0 ? void 0 : selectedProductInfo.tracksImei,
    ]);
    var availableImeis = react_1.useMemo(function () {
        if ((selectedProductInfo === null || selectedProductInfo === void 0 ? void 0 : selectedProductInfo.tracksImei) && availableStockForTransfer.items) {
            return availableStockForTransfer.items
                .filter(function (item) {
                var _a;
                return !!item.imei &&
                    item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE &&
                    ((_a = item.location) === null || _a === void 0 ? void 0 : _a.id) === selectedFromLocationId;
            }) // Doble chequeo
                .map(function (item) { return item.imei; });
        }
        return [];
    }, [
        selectedProductInfo,
        availableStockForTransfer.items,
        selectedFromLocationId,
    ]);
    var mutation = react_query_1.useMutation({
        // Ajusta 'any' a tu tipo de respuesta de /transfer
        mutationFn: function (data) {
            var payload = {
                productId: data.productId,
                fromLocationId: data.fromLocationId,
                toLocationId: data.toLocationId,
                notes: data.notes
            };
            if (selectedProductInfo === null || selectedProductInfo === void 0 ? void 0 : selectedProductInfo.tracksImei) {
                payload.imei = data.imei;
                payload.quantity = 1;
            }
            else {
                payload.quantity = data.quantity;
            }
            console.log("Enviando payload de transferencia:", payload);
            return api_1["default"].post("/inventory/stock/transfer", payload);
        },
        onSuccess: function () {
            sonner_1.toast.success("Transferencia de stock realizada exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
            queryClient.invalidateQueries({
                queryKey: ["inventoryProductStock", selectedProductId]
            });
            queryClient.invalidateQueries({
                queryKey: [
                    "stockInFromLocation",
                    selectedProductId,
                    selectedFromLocationId,
                ]
            });
            form.reset({
                // Resetear a los valores iniciales definidos
                productId: undefined,
                fromLocationId: undefined,
                toLocationId: undefined,
                quantity: undefined,
                imei: undefined,
                notes: ""
            });
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al transferir stock.");
        }
    });
    function onSubmit(data) {
        if (!selectedProductInfo) {
            sonner_1.toast.error("Por favor, selecciona un producto válido primero.");
            return;
        }
        if (data.fromLocationId === data.toLocationId) {
            form.setError("toLocationId", {
                type: "manual",
                message: "Origen y destino no pueden ser iguales."
            });
            return;
        }
        if (selectedProductInfo.tracksImei) {
            if (!data.imei || data.imei.trim() === "") {
                form.setError("imei", {
                    type: "manual",
                    message: "IMEI/Serial es requerido."
                });
                return;
            }
            if (!availableImeis.includes(data.imei)) {
                form.setError("imei", {
                    type: "manual",
                    message: "IMEI/Serial no disponible en origen."
                });
                return;
            }
        }
        else {
            if (data.quantity === undefined ||
                data.quantity === null ||
                data.quantity <= 0) {
                form.setError("quantity", {
                    type: "manual",
                    message: "Cantidad debe ser positiva."
                });
                return;
            }
            if (data.quantity > availableStockForTransfer.totalQuantity) {
                form.setError("quantity", {
                    type: "manual",
                    message: "Stock insuficiente. Disponible: " + availableStockForTransfer.totalQuantity
                });
                return;
            }
        }
        mutation.mutate(data); // SOLO UNA LLAMADA A MUTATE
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(form_1.Form, __assign({}, form),
            React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
                React.createElement(form_1.FormField, { control: form.control, name: "productId", render: function (_a) {
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Producto a Transferir*"),
                            React.createElement(select_1.Select, { onValueChange: function (value) {
                                    field.onChange(value);
                                    form.setValue("imei", undefined); // Resetear imei al cambiar producto
                                    form.setValue("quantity", undefined); // Resetear quantity
                                }, value: field.value || "", disabled: isLoadingAllProducts },
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Selecciona un producto..." }))),
                                React.createElement(select_1.SelectContent, null,
                                    isLoadingAllProducts && (React.createElement(select_1.SelectItem, { value: "loading-prod", disabled: true }, "Cargando...")), allProducts === null || allProducts === void 0 ? void 0 :
                                    allProducts.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id },
                                        p.name,
                                        " ",
                                        p.sku ? "(" + p.sku + ")" : "")); }))),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                selectedProductInfo && (React.createElement(React.Fragment, null,
                    React.createElement(form_1.FormField, { control: form.control, name: "fromLocationId", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Desde Ubicaci\u00F3n (Origen)*"),
                                React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingAllLocations || !selectedProductId },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Selecciona ubicaci\u00F3n origen..." }))),
                                    React.createElement(select_1.SelectContent, null,
                                        isLoadingAllLocations && (React.createElement(select_1.SelectItem, { value: "loading-loc", disabled: true }, "Cargando...")), allLocations === null || allLocations === void 0 ? void 0 :
                                        allLocations.map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    selectedProductInfo.tracksImei ? (React.createElement(form_1.FormField, { control: form.control, name: "imei", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "IMEI / N\u00FAmero de Serie*"),
                                availableImeis.length > 0 ? (React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingStockFrom ||
                                        !selectedFromLocationId ||
                                        availableImeis.length === 0 },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Selecciona IMEI/Serial..." }))),
                                    React.createElement(select_1.SelectContent, null,
                                        isLoadingStockFrom && (React.createElement(select_1.SelectItem, { value: "loading-imei", disabled: true }, "Cargando IMEIs...")),
                                        availableImeis.map(function (imeiStr) { return (React.createElement(select_1.SelectItem, { key: imeiStr, value: imeiStr }, imeiStr)); })))) : (React.createElement(input_1.Input, __assign({ placeholder: "Ingresa IMEI/Serial manualmente" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", disabled: isLoadingStockFrom || !selectedFromLocationId }))),
                                selectedFromLocationId &&
                                    !isLoadingStockFrom &&
                                    availableStockForTransfer.totalQuantity === 0 && (React.createElement(form_1.FormDescription, { className: "text-orange-600" }, "No hay stock de este producto en la ubicaci\u00F3n origen.")),
                                selectedFromLocationId &&
                                    !isLoadingStockFrom &&
                                    availableStockForTransfer.totalQuantity > 0 &&
                                    availableImeis.length === 0 && (React.createElement(form_1.FormDescription, { className: "text-orange-600" }, "No hay items serializados espec\u00EDficos en el stock de origen, ingrese IMEI manualmente si conoce alguno.")),
                                React.createElement(form_1.FormMessage, null)));
                        } })) : (
                    // No serializado
                    React.createElement(form_1.FormField, { control: form.control, name: "quantity", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Cantidad a Transferir*"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "number", min: 1 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                            var val = e.target.value;
                                            field.onChange(val === "" ? undefined : parseInt(val, 10));
                                        }, disabled: !selectedFromLocationId }))),
                                selectedFromLocationId && !isLoadingStockFrom && (React.createElement(form_1.FormDescription, null,
                                    "Disponible en origen:",
                                    " ",
                                    availableStockForTransfer.totalQuantity)),
                                React.createElement(form_1.FormMessage, null)));
                        } })),
                    React.createElement(form_1.FormField, { control: form.control, name: "toLocationId", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Hacia Ubicaci\u00F3n (Destino)*"),
                                React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingAllLocations || !selectedProductId },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Selecciona ubicaci\u00F3n destino..." }))),
                                    React.createElement(select_1.SelectContent, null,
                                        isLoadingAllLocations && (React.createElement(select_1.SelectItem, { value: "loading-loc-to", disabled: true }, "Cargando...")), allLocations === null || allLocations === void 0 ? void 0 :
                                        allLocations.filter(function (loc) { return loc.id !== selectedFromLocationId; }).map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }))),
                React.createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                        var _b;
                        var field = _a.field;
                        return (React.createElement(form_1.FormItem, null,
                            React.createElement(form_1.FormLabel, null, "Notas"),
                            React.createElement(form_1.FormControl, null,
                                React.createElement(textarea_1.Textarea, __assign({ placeholder: "Notas adicionales sobre la transferencia..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                            React.createElement(form_1.FormMessage, null)));
                    } }),
                React.createElement(button_1.Button, { type: "submit", disabled: mutation.isPending ||
                        !selectedProductId ||
                        !selectedFromLocationId ||
                        !form.watch("toLocationId") },
                    mutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                    "Realizar Transferencia")))));
}
exports.TransferStockForm = TransferStockForm;
