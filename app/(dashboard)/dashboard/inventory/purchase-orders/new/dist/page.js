// app/(dashboard)/inventory/purchase-orders/new/page.tsx
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
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var navigation_1 = require("next/navigation");
var formatters_1 = require("@/lib/utils/formatters");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var date_picker_1 = require("@/components/ui/date-picker"); // Asumiendo que tienes un DatePicker simple
var card_1 = require("@/components/ui/card");
var page_header_1 = require("@/components/common/page-header");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var react_1 = require("react");
// Schema Zod para una línea de PO
var poLineSchema = z.object({
    productId: z.string().min(1, "Producto es requerido."),
    orderedQuantity: z.coerce.number().positive("Cantidad debe ser > 0."),
    unitCost: z.coerce.number().min(0, "Costo debe ser >= 0.")
});
// Schema Zod principal para el formulario de PO
var createPOFormSchema = z.object({
    supplierId: z.string().min(1, "Proveedor es requerido."),
    orderDate: z.date({ required_error: "Fecha de orden es requerida." }),
    expectedDate: z.date().optional().nullable(),
    notes: z
        .string()
        .max(500, "Máximo 500 caracteres.")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    lines: z
        .array(poLineSchema)
        .min(1, "Debe añadir al menos un producto a la orden.")
});
function CreatePurchaseOrderPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(createPOFormSchema),
        defaultValues: {
            supplierId: undefined,
            orderDate: new Date(),
            expectedDate: null,
            notes: "",
            lines: [{ productId: "", orderedQuantity: 1, unitCost: 0 }]
        }
    });
    var _a = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "lines"
    }), fields = _a.fields, append = _a.append, remove = _a.remove;
    // Fetch para Proveedores
    var _b = react_query_1.useQuery({
        queryKey: ["allSuppliersForPOForm"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/suppliers?isActive=true&limit=100")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), suppliers = _b.data, isLoadingSuppliers = _b.isLoading;
    // Fetch para Productos (para los selects en las líneas)
    var _c = react_query_1.useQuery({
        queryKey: ["allProductsForPOLines"],
        // Podrías filtrar por productos que son comprables (no servicios puros, por ejemplo)
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?isActive=true&limit=1000")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), products = _c.data, isLoadingProducts = _c.isLoading;
    var createPOMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = __assign(__assign({}, data), { orderDate: date_fns_1.format(data.orderDate, "yyyy-MM-dd"), expectedDate: data.expectedDate
                                ? date_fns_1.format(data.expectedDate, "yyyy-MM-dd")
                                : null, lines: data.lines.map(function (line) { return (__assign({}, line)); }) });
                        return [4 /*yield*/, api_1["default"].post("/inventory/purchase-orders", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (createdPO) {
            sonner_1.toast.success("Orden de Compra #" + createdPO.poNumber + " creada exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] }); // Para refrescar la lista
            router.push("/dashboard/inventory/purchase-orders/" + createdPO.id); // Ir al detalle de la PO creada
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al crear la Orden de Compra.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        console.log("PO Form Data:", data);
        createPOMutation.mutate(data);
    }
    // Calcular totales (esto es solo para visualización, el backend recalculará)
    var watchedLines = form.watch("lines");
    var subTotalPO = react_1.useMemo(function () {
        return watchedLines.reduce(function (acc, line) {
            var quantity = Number(line.orderedQuantity) || 0;
            var cost = Number(line.unitCost) || 0;
            return acc + quantity * cost;
        }, 0);
    }, [watchedLines]);
    return (React.createElement(React.Fragment, null,
        React.createElement(page_header_1.PageHeader, { title: "Crear Nueva Orden de Compra", description: "Completa los detalles para generar una nueva orden a un proveedor." }),
        React.createElement(form_1.Form, __assign({}, form),
            React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Informaci\u00F3n General de la PO")),
                    React.createElement(card_1.CardContent, { className: "grid md:grid-cols-2 gap-6" },
                        React.createElement(form_1.FormField, { control: form.control, name: "supplierId", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Proveedor*"),
                                    React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingSuppliers },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Selecciona un proveedor..." }))),
                                        React.createElement(select_1.SelectContent, null,
                                            isLoadingSuppliers && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), suppliers === null || suppliers === void 0 ? void 0 :
                                            suppliers.map(function (s) { return (React.createElement(select_1.SelectItem, { key: s.id, value: s.id }, s.name)); }))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement("div", null),
                        " ",
                        React.createElement(form_1.FormField, { control: form.control, name: "orderDate", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "flex flex-col" },
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Fecha de Orden*"),
                                    React.createElement(date_picker_1.DatePicker, { selected: field.value, onSelect: field.onChange }),
                                    " ",
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "expectedDate", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "flex flex-col" },
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Fecha de Entrega Esperada"),
                                    React.createElement(date_picker_1.DatePicker, { selected: field.value, onSelect: field.onChange }),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "md:col-span-2" },
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Notas Adicionales"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(textarea_1.Textarea, __assign({ placeholder: "Notas internas o para el proveedor..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement(card_1.CardTitle, null, "L\u00EDneas de Productos"),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                    return append({ productId: "", orderedQuantity: 1, unitCost: 0 });
                                } },
                                React.createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                                " A\u00F1adir Producto")),
                        React.createElement(form_1.FormDescription, null, "A\u00F1ade los productos que deseas ordenar.")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        fields.length === 0 && (React.createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No hay productos en esta orden.")),
                        fields.map(function (item, index) { return (React.createElement("div", { key: item.id, className: "grid grid-cols-12 gap-x-4 gap-y-2 items-start border p-3 rounded-md relative" },
                            React.createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".productId", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, { className: "col-span-12 md:col-span-5" },
                                        " ",
                                        React.createElement(form_1.FormLabel, { className: index !== 0 ? "sr-only md:not-sr-only" : "" }, "Producto*"),
                                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingProducts },
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(select_1.SelectTrigger, null,
                                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona producto..." }))),
                                            React.createElement(select_1.SelectContent, null,
                                                isLoadingProducts && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), products === null || products === void 0 ? void 0 :
                                                products.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id },
                                                    p.name,
                                                    " ",
                                                    p.sku ? "(" + p.sku + ")" : "")); }))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".orderedQuantity", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, { className: "col-span-6 md:col-span-2" },
                                        " ",
                                        React.createElement(form_1.FormLabel, { className: index !== 0 ? "sr-only md:not-sr-only" : "" }, "Cantidad*"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "number", min: 1 }, field, { onChange: function (e) {
                                                    return field.onChange(parseInt(e.target.value, 10) || 1);
                                                } }))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".unitCost", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, { className: "col-span-6 md:col-span-2" },
                                        " ",
                                        React.createElement(form_1.FormLabel, { className: index !== 0 ? "sr-only md:not-sr-only" : "" }, "Costo Unit.*"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0 }, field, { onChange: function (e) {
                                                    return field.onChange(parseFloat(e.target.value) || 0);
                                                } }))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement("div", { className: "col-span-12 md:col-span-2 flex items-end" },
                                React.createElement("p", { className: "text-sm w-full text-right font-medium" },
                                    "Subtotal:",
                                    " ",
                                    formatters_1.formatCurrency((form.getValues("lines." + index + ".orderedQuantity") ||
                                        0) * (form.getValues("lines." + index + ".unitCost") || 0)))),
                            React.createElement("div", { className: "col-span-12 md:col-span-1 flex items-end justify-end" },
                                React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return remove(index); }, className: "text-destructive hover:text-destructive/80 shrink-0" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); })),
                    React.createElement(card_1.CardFooter, { className: "flex justify-end font-semibold text-lg" },
                        "Total Orden: ",
                        formatters_1.formatCurrency(subTotalPO))),
                React.createElement("div", { className: "flex justify-end space-x-3 pt-4" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return router.back(); }, disabled: createPOMutation.isPending },
                        React.createElement(lucide_react_1.X, { className: "mr-2 h-4 w-4" }),
                        " Cancelar"),
                    React.createElement(button_1.Button, { type: "submit", disabled: createPOMutation.isPending || fields.length === 0 },
                        createPOMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                        " Crear Orden de Compra"))))));
}
exports["default"] = CreatePurchaseOrderPage;
