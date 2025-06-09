// components/inventory/stock/add-serialized-stock-form.tsx
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
exports.__esModule = true;
exports.AddSerializedStockForm = void 0;
// Similar a AddNonSerializedStockForm, pero con campo IMEI y quantity siempre es 1
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var addSerializedStockSchema = z.object({
    productId: z.string().min(1, "Debes seleccionar un producto."),
    locationId: z.string().min(1, "Debes seleccionar una ubicación."),
    imei: z
        .string()
        .min(5, "IMEI/Serial es requerido y debe tener al menos 5 caracteres.")
        .max(50),
    costPrice: z.coerce.number().min(0, "Costo no puede ser negativo."),
    condition: z
        .string()
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    notes: z
        .string()
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
function AddSerializedStockForm() {
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(addSerializedStockSchema),
        defaultValues: {
            productId: undefined,
            locationId: undefined,
            imei: "",
            costPrice: 0,
            condition: "Nuevo",
            notes: ""
        }
    });
    var _a = react_query_1.useQuery({
        queryKey: ["productsForStockForm", { tracksImei: true }],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?tracksImei=true&limit=500&isActive=true")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), products = _a.data, isLoadingProducts = _a.isLoading;
    var _b = react_query_1.useQuery({
        queryKey: ["locationsForStockForm", { isActive: true }],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), locations = _b.data, isLoadingLocations = _b.isLoading;
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) {
            return api_1["default"].post("/inventory/stock/add-serialized", data);
        },
        onSuccess: function (response) {
            sonner_1.toast.success("Item serializado " + response.data.imei + " a\u00F1adido exitosamente (ID: " + response.data.id + ").");
            queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] });
            queryClient.invalidateQueries({
                queryKey: ["inventoryProductStock", form.getValues("productId")]
            });
            form.reset();
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al añadir item serializado.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        mutation.mutate(data);
    }
    return (React.createElement(form_1.Form, __assign({}, form),
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
            React.createElement(form_1.FormField, { control: form.control, name: "productId", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Producto Serializado*"),
                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingProducts },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona un producto..." }))),
                            React.createElement(select_1.SelectContent, null,
                                isLoadingProducts && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), products === null || products === void 0 ? void 0 :
                                products.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id },
                                    p.name,
                                    " ",
                                    p.sku ? "(" + p.sku + ")" : "")); }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "locationId", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Ubicaci\u00F3n*"),
                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingLocations },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona una ubicaci\u00F3n..." }))),
                            React.createElement(select_1.SelectContent, null,
                                isLoadingLocations && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                locations.map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "imei", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "IMEI / N\u00FAmero de Serie*"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(input_1.Input, __assign({ placeholder: "Ingresa el IMEI o serial \u00FAnico" }, field))),
                        " ",
                        React.createElement(form_1.FormMessage, null),
                        " "));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "costPrice", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Costo Unitario*"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0 }, field, { onChange: function (e) {
                                    return field.onChange(parseFloat(e.target.value) || 0);
                                } }))),
                        " ",
                        React.createElement(form_1.FormMessage, null),
                        " "));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "condition", render: function (_a) {
                    var _b;
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Condici\u00F3n"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(input_1.Input, __assign({ placeholder: "Ej: Nuevo, Usado - Grado A" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                    var _b;
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Notas Adicionales"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(textarea_1.Textarea, __assign({ placeholder: "Notas sobre esta entrada de stock..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(button_1.Button, { type: "submit", disabled: mutation.isPending },
                mutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                "A\u00F1adir Item Serializado"))));
}
exports.AddSerializedStockForm = AddSerializedStockForm;
