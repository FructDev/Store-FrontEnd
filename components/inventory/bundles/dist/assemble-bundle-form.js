// components/inventory/bundles/assemble-bundle-form.tsx
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
exports.AssembleBundleForm = void 0;
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
var card_1 = require("@/components/ui/card");
var assembleBundleSchema = z
    .object({
    bundleProductId: z.string().min(1, "Debes seleccionar un producto bundle."),
    quantityToAssemble: z.coerce
        .number()
        .positive("Cantidad debe ser positiva."),
    // El backend toma componentSourceLocationId del DTO
    componentSourceLocationId: z
        .string()
        .min(1, "Ubicación de componentes es requerida."),
    targetLocationId: z
        .string()
        .min(1, "Ubicación destino del bundle es requerida.")
})
    .refine(function (data) { return data.componentSourceLocationId !== data.targetLocationId; }, {
    message: "Ubicación de componentes y destino no pueden ser la misma para este tipo de operación simple.",
    path: ["targetLocationId"]
}); // Simplificación, el backend podría permitirlo si el bundle se "crea" en la misma ubicación.
function AssembleBundleForm() {
    var _this = this;
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(assembleBundleSchema),
        defaultValues: {
            bundleProductId: undefined,
            quantityToAssemble: 1,
            componentSourceLocationId: undefined,
            targetLocationId: undefined
        }
    });
    var selectedBundleProductId = form.watch("bundleProductId");
    // Productos tipo BUNDLE
    var _a = react_query_1.useQuery({
        queryKey: ["bundleProductsForAssembly"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?productType=" + prisma_enums_1.ProductType.BUNDLE + "&isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), bundleProducts = _a.data, isLoadingBundleProducts = _a.isLoading;
    // Todas las ubicaciones activas (para origen de componentes y destino de bundles)
    var _b = react_query_1.useQuery({
        queryKey: ["locationsForBundleAssembly"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), locations = _b.data, isLoadingLocations = _b.isLoading;
    var _c = react_query_1.useQuery({
        // <-- Abre el objeto de opciones aquí
        queryKey: ["selectedBundleDetailsForAssembly", selectedBundleProductId],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!selectedBundleProductId) {
                            // Si enabled es false, esto no se ejecuta.
                            // Si se ejecuta y selectedBundleProductId es falsy, devolvemos null.
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, api_1["default"].get("/inventory/products/" + selectedBundleProductId)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        enabled: !!selectedBundleProductId
    }), selectedBundleDetails = _c.data, isLoadingBundleDetails = _c.isLoading;
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) {
            return api_1["default"].post("/inventory/stock/assemble-bundle", data);
        },
        onSuccess: function (response) {
            var _a, _b;
            var bundleName = ((_a = bundleProducts === null || bundleProducts === void 0 ? void 0 : bundleProducts.find(function (p) { return p.id === form.getValues("bundleProductId"); })) === null || _a === void 0 ? void 0 : _a.name) || "Bundle";
            sonner_1.toast.success(bundleName + " ensamblado(s) exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
            queryClient.invalidateQueries({
                queryKey: ["inventoryProductStock", form.getValues("bundleProductId")]
            });
            // Invalidar stock de componentes también
            (_b = selectedBundleDetails === null || selectedBundleDetails === void 0 ? void 0 : selectedBundleDetails.bundleComponents) === null || _b === void 0 ? void 0 : _b.forEach(function (comp) {
                queryClient.invalidateQueries({
                    queryKey: ["inventoryProductStock", comp.componentProductId]
                });
            });
            form.reset();
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al ensamblar el bundle.");
        }
    });
    function onSubmit(data) {
        mutation.mutate(data);
    }
    return (React.createElement(form_1.Form, __assign({}, form),
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
            React.createElement(form_1.FormField, { control: form.control, name: "bundleProductId", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Producto Bundle a Ensamblar*"),
                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingBundleProducts },
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
            selectedBundleProductId && selectedBundleDetails && (React.createElement(card_1.Card, { className: "mt-4" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Componentes Requeridos (por unidad de Bundle)")),
                React.createElement(card_1.CardContent, null,
                    isLoadingBundleDetails && React.createElement("p", null, "Cargando componentes..."),
                    selectedBundleDetails.bundleComponents &&
                        selectedBundleDetails.bundleComponents.length > 0 ? (React.createElement("ul", { className: "list-disc pl-5 text-sm space-y-1" }, selectedBundleDetails.bundleComponents.map(function (comp) {
                        var _a, _b;
                        return (React.createElement("li", { key: comp.componentProductId },
                            ((_a = comp.componentProduct) === null || _a === void 0 ? void 0 : _a.name) ||
                                "ID: " + comp.componentProductId,
                            " ",
                            "(SKU: ",
                            ((_b = comp.componentProduct) === null || _b === void 0 ? void 0 : _b.sku) || "N/A",
                            ") - Cantidad:",
                            " ",
                            comp.quantity));
                    }))) : (React.createElement("p", { className: "text-sm text-muted-foreground" }, "Este bundle no tiene componentes definidos."))))),
            React.createElement(form_1.FormField, { control: form.control, name: "quantityToAssemble", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Cantidad de Bundles a Ensamblar*"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(input_1.Input, __assign({ type: "number", min: 1 }, field, { onChange: function (e) {
                                    return field.onChange(parseInt(e.target.value, 10) || 1);
                                } }))),
                        React.createElement(form_1.FormMessage, null),
                        " "));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "componentSourceLocationId", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Ubicaci\u00F3n Origen de Componentes*"),
                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingLocations },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona ubicaci\u00F3n de componentes..." }))),
                            React.createElement(select_1.SelectContent, null,
                                isLoadingLocations && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                locations.map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "targetLocationId", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Ubicaci\u00F3n Destino de Bundles Ensamblados*"),
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
            React.createElement(button_1.Button, { type: "submit", disabled: mutation.isPending || !selectedBundleProductId },
                mutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                "Ensamblar Bundles"))));
}
exports.AssembleBundleForm = AssembleBundleForm;
