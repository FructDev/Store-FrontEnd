// components/inventory/bundles/disassemble-bundle-form.tsx
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
exports.DisassembleBundleForm = void 0;
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
var disassembleBundleSchema = z.object({
    bundleProductId: z.string().min(1, "Debes seleccionar un producto bundle."),
    bundleInventoryItemId: z
        .string()
        .min(1, "Debes seleccionar el lote/item específico del bundle a desensamblar."),
    quantityToDisassemble: z.coerce
        .number()
        .positive("Cantidad debe ser positiva."),
    targetLocationIdForComponents: z
        .string()
        .min(1, "Ubicación destino de componentes es requerida.")
});
function DisassembleBundleForm() {
    var _this = this;
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(disassembleBundleSchema),
        defaultValues: {
            bundleProductId: undefined,
            bundleInventoryItemId: undefined,
            quantityToDisassemble: 1,
            targetLocationIdForComponents: undefined
        }
    });
    var selectedBundleProductIdForDisassembly = form.watch("bundleProductId");
    // Productos tipo BUNDLE que podrían tener stock
    var _a = react_query_1.useQuery({
        queryKey: ["bundleProductsForDisassembly"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?productType=" + prisma_enums_1.ProductType.BUNDLE + "&isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), bundleProducts = _a.data, isLoadingBundleProducts = _a.isLoading;
    var _b = react_query_1.useQuery({
        // <-- Abre el objeto de opciones aquí
        queryKey: [
            "bundleStockItemsForDisassembly",
            selectedBundleProductIdForDisassembly,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedBundleProductIdForDisassembly) {
                            return [2 /*return*/, []]; // Devolver array vacío si no hay ID
                        }
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/product/" + selectedBundleProductIdForDisassembly)];
                    case 1:
                        response = _a.sent();
                        // Filtrar solo los items AVAILABLE del bundle (usualmente no serializados)
                        return [2 /*return*/, response.data.items.filter(function (item) { return item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE && !item.imei; }
                            // && item.productId === selectedBundleProductIdForDisassembly // El endpoint ya filtra por productId
                            )];
                }
            });
        }); },
        enabled: !!selectedBundleProductIdForDisassembly
    }), bundleStockItemsData = _b.data, // Renombrar para evitar confusión con el map
    isLoadingBundleStockItems = _b.isLoading;
    var selectedBundleItemInfo = bundleStockItemsData === null || bundleStockItemsData === void 0 ? void 0 : bundleStockItemsData.find(function (item) { return item.id === form.watch("bundleInventoryItemId"); });
    var _c = react_query_1.useQuery({
        queryKey: ["locationsForBundleDisassembly"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), locations = _c.data, isLoadingLocations = _c.isLoading;
    var mutation = react_query_1.useMutation({
        mutationFn: function (formData) { return __awaiter(_this, void 0, void 0, function () {
            var payloadForBackend;
            return __generator(this, function (_a) {
                payloadForBackend = {
                    bundleInventoryItemId: formData.bundleInventoryItemId,
                    quantityToDisassemble: formData.quantityToDisassemble,
                    targetLocationIdForComponents: formData.targetLocationIdForComponents
                };
                console.log("Enviando payload para DESENSAMBLAR:", payloadForBackend);
                return [2 /*return*/, api_1["default"].post("/inventory/stock/disassemble-bundle", payloadForBackend)];
            });
        }); },
        onSuccess: function () {
            sonner_1.toast.success("Bundle desensamblado exitosamente. Componentes devueltos al stock.");
            queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
            queryClient.invalidateQueries({
                queryKey: [
                    "inventoryProductStock",
                    selectedBundleProductIdForDisassembly,
                ]
            });
            // Invalidar stock de componentes también si se conoce cuáles son
            queryClient.invalidateQueries({
                queryKey: [
                    "bundleStockItemsForDisassembly",
                    selectedBundleProductIdForDisassembly,
                ]
            });
            form.reset();
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al desensamblar el bundle.");
        }
    });
    function onSubmit(data) {
        if (selectedBundleItemInfo &&
            data.quantityToDisassemble > selectedBundleItemInfo.quantity) {
            form.setError("quantityToDisassemble", {
                message: "No puedes desensamblar m\u00E1s de " + selectedBundleItemInfo.quantity + " unidades de este lote."
            });
            return;
        }
        mutation.mutate(data);
    }
    return (React.createElement(form_1.Form, __assign({}, form),
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
            React.createElement(form_1.FormField, { control: form.control, name: "bundleProductId", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Producto Bundle a Desensamblar*"),
                        React.createElement(select_1.Select, { onValueChange: function (value) {
                                field.onChange(value);
                                form.setValue("bundleInventoryItemId", undefined);
                            }, value: field.value || "", disabled: isLoadingBundleProducts },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona un producto bundle..." }))),
                            React.createElement(select_1.SelectContent, null,
                                isLoadingBundleProducts && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), bundleProducts === null || bundleProducts === void 0 ? void 0 :
                                bundleProducts.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id },
                                    p.name,
                                    " ",
                                    p.sku ? "(" + p.sku + ")" : "")); }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            selectedBundleProductIdForDisassembly && (React.createElement(form_1.FormField, { control: form.control, name: "bundleInventoryItemId", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Lote/Item Espec\u00EDfico del Bundle*"),
                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingBundleStockItems ||
                                !bundleStockItemsData ||
                                bundleStockItemsData.length === 0 },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona el lote del bundle..." }))),
                            React.createElement(select_1.SelectContent, null,
                                isLoadingBundleStockItems && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando lotes...")),
                                !isLoadingBundleStockItems &&
                                    (bundleStockItemsData === null || bundleStockItemsData === void 0 ? void 0 : bundleStockItemsData.length) === 0 && (React.createElement(select_1.SelectItem, { value: "no-items", disabled: true }, "No hay stock de este bundle.")), bundleStockItemsData === null || bundleStockItemsData === void 0 ? void 0 :
                                bundleStockItemsData.map(function (item) {
                                    var _a;
                                    return (React.createElement(select_1.SelectItem, { key: item.id, value: item.id },
                                        "Lote ID: ...",
                                        item.id.slice(-6),
                                        " (Ubic:",
                                        " ", (_a = item.location) === null || _a === void 0 ? void 0 :
                                        _a.name,
                                        ", Disp: ",
                                        item.quantity,
                                        ")"));
                                }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } })),
            selectedBundleItemInfo && (React.createElement(form_1.FormField, { control: form.control, name: "quantityToDisassemble", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null,
                            "Cantidad a Desensamblar* (M\u00E1x:",
                            " ",
                            selectedBundleItemInfo.quantity,
                            ")"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(input_1.Input, __assign({ type: "number", min: 1, max: selectedBundleItemInfo.quantity }, field, { onChange: function (e) {
                                    return field.onChange(parseInt(e.target.value, 10) || 1);
                                } }))),
                        React.createElement(form_1.FormMessage, null),
                        " "));
                } })),
            React.createElement(form_1.FormField, { control: form.control, name: "targetLocationIdForComponents", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Ubicaci\u00F3n Destino para Componentes*"),
                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingLocations },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona ubicaci\u00F3n destino..." }))),
                            React.createElement(select_1.SelectContent, null,
                                isLoadingLocations && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                locations.map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(button_1.Button, { type: "submit", disabled: mutation.isPending || !form.getValues("bundleInventoryItemId") },
                mutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                "Desensamblar Bundle"))));
}
exports.DisassembleBundleForm = DisassembleBundleForm;
