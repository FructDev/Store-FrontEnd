// components/inventory/stock/adjust-stock-form.tsx
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
exports.AdjustStockForm = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums"); // Asumiendo que tienes este enum
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var adjustmentReasons = [
    "Conteo físico - Excedente",
    "Conteo físico - Faltante",
    "Producto dañado/descartado",
    "Producto encontrado/recuperado",
    "Transferencia interna (corrección)",
    "Consumo interno/Muestra",
    "Vencimiento/Obsolescencia",
    "Otro (especificar en notas)",
];
var adjustStockSchema = z.object({
    productId: z.string().min(1, "Debes seleccionar un producto."),
    locationId: z.string().min(1, "Debes seleccionar una ubicación."),
    quantityChange: z.coerce
        .number()
        .int({ message: "Cantidad debe ser un entero." })
        .refine(function (val) { return val !== 0; }, { message: "El cambio no puede ser cero." }),
    reason: z.string().min(3, "El motivo es requerido.").max(100),
    notes: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
function AdjustStockForm() {
    var _this = this;
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(adjustStockSchema),
        defaultValues: {
            productId: undefined,
            locationId: undefined,
            quantityChange: 0,
            reason: "",
            notes: ""
        }
    });
    var selectedProductId = form.watch("productId");
    var selectedLocationId = form.watch("locationId");
    // Productos NO serializados
    var _a = react_query_1.useQuery({
        queryKey: ["productsForStockForm", { tracksImei: false, isActive: true }],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/products?tracksImei=false&isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), products = _a.data, isLoadingProducts = _a.isLoading;
    // Ubicaciones activas
    var _b = react_query_1.useQuery({
        queryKey: ["locationsForStockForm", { isActive: true }],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), locations = _b.data, isLoadingLocations = _b.isLoading;
    // --- IMPLEMENTACIÓN DEL TODO: Cargar stock actual del producto/ubicación ---
    // Query para Cargar stock actual del producto/ubicación
    var _c = react_query_1.useQuery({
        // <-- Abre el objeto de opciones aquí
        queryKey: [
            // Query key depende del producto y ubicación seleccionados
            "currentProductStockForAdjustment",
            selectedProductId,
            selectedLocationId,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // El 'enabled' de abajo previene que esto se ejecute si los IDs no están
                        if (!selectedProductId || !selectedLocationId) {
                            // Este console.warn no debería ejecutarse si 'enabled' funciona bien.
                            console.warn("currentProductStockForAdjustment: ProductID o LocationID es nulo en queryFn, aunque 'enabled' debería prevenir esto.");
                            // Devolver una estructura que no cause error o lanzar un error específico si 'enabled' fallara.
                            // Como 'enabled' lo controla, podemos asumir que si queryFn se ejecuta, los IDs son válidos.
                            return [2 /*return*/, { product: null, items: [], totalQuantity: 0 }]; // O lanzar un error
                        }
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/product/" + selectedProductId)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        // Habilitar la query solo si ambos, producto y ubicación, están seleccionados
        enabled: !!selectedProductId && !!selectedLocationId,
        staleTime: 1000 * 30
    }), currentProductStockInfo = _c.data, isLoadingCurrentStock = _c.isLoading;
    // Encontrar el item específico o el stock total en la ubicación seleccionada
    var currentStockInLocation = "N/A";
    if (currentProductStockInfo && selectedLocationId) {
        var itemsInSelectedLocation = currentProductStockInfo.items.filter(function (item) {
            var _a;
            return ((_a = item.location) === null || _a === void 0 ? void 0 : _a.id) === selectedLocationId &&
                item.status === prisma_enums_1.InventoryItemStatus.AVAILABLE &&
                !item.imei;
        });
        // Para no serializados, sumamos las cantidades de los lotes en esa ubicación
        // (Asumiendo que adjustStock trabaja sobre un concepto de "stock total no serializado en ubicación")
        // Si tu `adjustStock` del backend espera un `inventoryItemId` específico para no serializados,
        // esta lógica necesitaría ser más compleja (ej. un selector de lote si hay varios).
        // Por ahora, sumamos todo el stock no serializado del producto en esa ubicación.
        var totalQuantityInLocation = itemsInSelectedLocation.reduce(function (sum, item) { return sum + item.quantity; }, 0);
        currentStockInLocation = totalQuantityInLocation;
    }
    // --- FIN IMPLEMENTACIÓN DEL TODO ---
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) {
            return api_1["default"].post("/inventory/stock/adjust", data);
        },
        onSuccess: function (response) {
            var _a, _b;
            var productName = ((_a = products === null || products === void 0 ? void 0 : products.find(function (p) { return p.id === form.getValues("productId"); })) === null || _a === void 0 ? void 0 : _a.name) ||
                "Producto";
            var locationName = ((_b = locations === null || locations === void 0 ? void 0 : locations.find(function (l) { return l.id === form.getValues("locationId"); })) === null || _b === void 0 ? void 0 : _b.name) ||
                "Ubicación";
            sonner_1.toast.success("Stock de \"" + productName + "\" en \"" + locationName + "\" ajustado en " + form.getValues("quantityChange") + " unidades.");
            queryClient.invalidateQueries({ queryKey: ["inventoryStockLevels"] }); // Clave genérica
            queryClient.invalidateQueries({
                queryKey: ["inventoryProductStock", form.getValues("productId")]
            }); // Para vista detallada de stock
            queryClient.invalidateQueries({
                queryKey: [
                    "currentProductStockForAdjustment",
                    form.getValues("productId"),
                    form.getValues("locationId"),
                ]
            }); // Para refrescar el stock actual mostrado
            form.reset();
            // setSelectedProductId(undefined); // form.reset() debería limpiar los campos del form
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al ajustar stock.";
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
                        React.createElement(form_1.FormLabel, null, "Producto (No Serializado)*"),
                        React.createElement(select_1.Select, { onValueChange: function (value) {
                                field.onChange(value);
                                // setSelectedProductId(value); // No es necesario si usamos form.watch("productId")
                            }, value: field.value || "", disabled: isLoadingProducts },
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
            selectedProductId && selectedLocationId && (React.createElement("div", { className: "p-3 border rounded-md bg-accent/50 text-sm" },
                React.createElement("p", { className: "text-muted-foreground" },
                    "Stock actual (sistema) del producto seleccionado en esta ubicaci\u00F3n:",
                    React.createElement("span", { className: "font-semibold text-foreground ml-1" }, isLoadingCurrentStock ? "Cargando..." : currentStockInLocation),
                    typeof currentStockInLocation === "number" && " unidades"))),
            React.createElement(form_1.FormField, { control: form.control, name: "quantityChange", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Cambio en Cantidad*"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(input_1.Input, __assign({ type: "number", placeholder: "Ej: 5 (a\u00F1adir) o -2 (quitar)" }, field, { value: field.value === undefined || field.value === null
                                    ? ""
                                    : String(field.value), onChange: function (e) {
                                    var val = e.target.value;
                                    field.onChange(val === "" ? undefined : parseInt(val, 10)); // Enviar undefined si está vacío para que Zod lo maneje
                                } }))),
                        React.createElement(form_1.FormDescription, null, "Positivo para a\u00F1adir, negativo para quitar. No puede ser cero."),
                        React.createElement(form_1.FormMessage, null),
                        " "));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "reason", render: function (_a) {
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Motivo del Ajuste*"),
                        React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "" },
                            React.createElement(form_1.FormControl, null,
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Selecciona un motivo..." }))),
                            React.createElement(select_1.SelectContent, null, adjustmentReasons.map(function (reason) { return (React.createElement(select_1.SelectItem, { key: reason, value: reason }, reason)); }))),
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                    var _b;
                    var field = _a.field;
                    return (React.createElement(form_1.FormItem, null,
                        " ",
                        React.createElement(form_1.FormLabel, null, "Notas Adicionales"),
                        React.createElement(form_1.FormControl, null,
                            React.createElement(textarea_1.Textarea, __assign({ placeholder: "Detalles sobre el ajuste..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                        " ",
                        React.createElement(form_1.FormMessage, null)));
                } }),
            React.createElement(button_1.Button, { type: "submit", disabled: mutation.isPending },
                mutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                "Aplicar Ajuste"))));
}
exports.AdjustStockForm = AdjustStockForm;
