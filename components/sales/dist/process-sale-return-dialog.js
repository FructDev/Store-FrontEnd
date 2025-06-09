// components/sales/process-sale-return-dialog.tsx
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
var _a;
exports.__esModule = true;
exports.ProcessSaleReturnDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var formatters_1 = require("@/lib/utils/formatters");
var auth_store_1 = require("@/stores/auth.store"); // Para métodos de pago aceptados por la tienda
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var scroll_area_1 = require("@/components/ui/scroll-area");
var card_1 = require("@/components/ui/card");
var popover_1 = require("@/components/ui/popover");
var calendar_1 = require("@/components/ui/calendar");
var utils_1 = require("@/lib/utils");
var date_fns_1 = require("date-fns"); // Para formatear la fecha de devolución
var locale_1 = require("date-fns/locale");
var paymentMethodLabels = (_a = {},
    _a[prisma_enums_1.PaymentMethod.CASH] = "Efectivo",
    _a[prisma_enums_1.PaymentMethod.CARD_CREDIT] = "Tarjeta de Crédito",
    _a[prisma_enums_1.PaymentMethod.CARD_DEBIT] = "Tarjeta de Débito",
    _a[prisma_enums_1.PaymentMethod.TRANSFER] = "Transferencia Bancaria",
    _a[prisma_enums_1.PaymentMethod.MOBILE_WALLET] = "Billetera Móvil (Ej: Yape, Plin)",
    _a[prisma_enums_1.PaymentMethod.STORE_CREDIT] = "Crédito de Tienda",
    _a[prisma_enums_1.PaymentMethod.OTHER] = "Otro Método",
    _a);
var ALL_PAYMENT_METHODS = Object.values(prisma_enums_1.PaymentMethod);
// --- SCHEMAS ZOD ---
var formReturnLineSchema = z
    .object({
    fieldId: z.string(),
    saleLineId: z.string(),
    productId: z.string(),
    productName: z.string(),
    maxReturnableQuantity: z.number().min(0),
    unitPrice: z.number(),
    isSelected: z.boolean()["default"](false),
    returnQuantity: z.coerce
        .number()
        .int("Debe ser entero.")
        .min(0, "No puede ser negativo.")["default"](0),
    restockLocationId: z.string().optional().nullable(),
    returnedCondition: z
        .string()
        .max(100)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    reason: z
        .string()
        .max(100)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
})
    .refine(function (data) {
    // Si se selecciona y la cantidad a devolver es > 0, la ubicación es requerida
    if (data.isSelected && data.returnQuantity > 0) {
        return !!data.restockLocationId && data.restockLocationId.length > 0;
    }
    return true;
}, {
    message: "Ubicación de reingreso es requerida para ítems seleccionados.",
    path: ["restockLocationId"]
})
    .refine(function (data) { return data.returnQuantity <= data.maxReturnableQuantity; }, {
    message: "No puedes devolver más de la cantidad máxima permitida.",
    path: ["returnQuantity"]
});
var formRefundSchema = z.object({
    fieldId: z.string(),
    paymentMethod: z.nativeEnum(prisma_enums_1.PaymentMethod, {
        required_error: "Método es requerido."
    }),
    amount: z.coerce.number().positive({ message: "Monto debe ser positivo." }),
    reference: z
        .string()
        .max(100)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    notes: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
var processReturnFormSchema = z.object({
    returnDate: z
        .date()
        .optional()["default"](function () { return new Date(); }),
    reason: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    notes: z
        .string()
        .max(500)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    lines: z
        .array(formReturnLineSchema)
        .refine(function (lines) {
        return lines.some(function (line) { return line.isSelected && line.returnQuantity > 0; });
    }, {
        message: "Debes seleccionar al menos un producto y cantidad > 0 para devolver."
    }),
    refunds: z
        .array(formRefundSchema)
        .min(1, "Se requiere al menos un método de reembolso si el monto a reembolsar es mayor a cero.")
});
function ProcessSaleReturnDialog(_a) {
    var _this = this;
    var _b, _c, _d, _e, _f, _g;
    var sale = _a.sale, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onReturnProcessed = _a.onReturnProcessed;
    var queryClient = react_query_1.useQueryClient();
    var storeInfo = auth_store_1.useAuthStore(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.store; });
    var storeAcceptedPaymentMethods = (storeInfo === null || storeInfo === void 0 ? void 0 : storeInfo.acceptedPaymentMethods) || ALL_PAYMENT_METHODS;
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(processReturnFormSchema),
        defaultValues: {
            returnDate: new Date(),
            reason: "",
            notes: "",
            lines: [],
            refunds: [
                {
                    fieldId: crypto.randomUUID(),
                    paymentMethod: prisma_enums_1.PaymentMethod.CASH,
                    amount: 0,
                    reference: "",
                    notes: ""
                },
            ]
        }
    });
    var _h = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "lines",
        keyName: "fieldId"
    }), lineFields = _h.fields, replaceLines = _h.replace;
    var _j = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "refunds",
        keyName: "fieldId"
    }), refundFields = _j.fields, appendRefund = _j.append, removeRefund = _j.remove, replaceRefunds = _j.replace;
    var _k = react_query_1.useQuery({
        queryKey: ["activeLocationsForReturnRestock"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || []; });
        }
    }), locations = _k.data, isLoadingLocations = _k.isLoading;
    react_1.useEffect(function () {
        if (isOpen && (sale === null || sale === void 0 ? void 0 : sale.lines)) {
            var initialReturnLines = sale.lines
                .map(function (saleLine) {
                var _a;
                // ASUNCIÓN CRÍTICA: EnrichedSaleLineItem tiene 'quantityReturnedByPreviousReturns'
                // Si no, necesitas obtener este dato del backend para la línea de venta.
                var alreadyReturned = saleLine.quantityReturnedByPreviousReturns || 0;
                var maxReturnable = saleLine.quantity - alreadyReturned;
                return {
                    fieldId: crypto.randomUUID(),
                    saleLineId: saleLine.id,
                    productId: saleLine.productId,
                    productName: ((_a = saleLine.product) === null || _a === void 0 ? void 0 : _a.name) || "Producto Desconocido",
                    maxReturnableQuantity: maxReturnable,
                    unitPrice: saleLine.unitPrice,
                    isSelected: false,
                    returnQuantity: 0,
                    restockLocationId: (storeInfo === null || storeInfo === void 0 ? void 0 : storeInfo.defaultReturnLocationId) || "",
                    returnedCondition: "Vendible",
                    reason: null
                };
            })
                .filter(function (line) { return line.maxReturnableQuantity > 0; });
            form.reset({
                returnDate: new Date(),
                reason: "",
                notes: "",
                lines: initialReturnLines,
                refunds: [
                    {
                        fieldId: crypto.randomUUID(),
                        paymentMethod: prisma_enums_1.PaymentMethod.CASH,
                        amount: 0,
                        reference: "",
                        notes: ""
                    },
                ]
            });
        }
        else if (!isOpen) {
            form.reset({
                returnDate: new Date(),
                reason: "",
                notes: "",
                lines: [],
                refunds: [
                    {
                        fieldId: crypto.randomUUID(),
                        paymentMethod: prisma_enums_1.PaymentMethod.CASH,
                        amount: 0,
                        reference: "",
                        notes: ""
                    },
                ]
            });
        }
    }, [sale, isOpen, form, storeInfo === null || storeInfo === void 0 ? void 0 : storeInfo.defaultReturnLocationId]);
    var watchedReturnLines = form.watch("lines");
    var calculatedRefundAmount = react_1.useMemo(function () {
        console.log("Recalculando calculatedRefundAmount con watchedLines:", watchedReturnLines);
        return (watchedReturnLines || []).reduce(function (acc, line) {
            if (line.isSelected && line.returnQuantity > 0) {
                // Asegurarse que line.unitPrice sea un número aquí
                var unitPrice = Number(line.unitPrice) || 0;
                var returnQty = Number(line.returnQuantity) || 0;
                return acc + returnQty * unitPrice;
            }
            return acc;
        }, 0);
    }, [
        // Usar JSON.stringify para forzar la detección de cambios en el contenido del array
        JSON.stringify((watchedReturnLines || []).map(function (l) { return ({
            isSelected: l.isSelected,
            returnQuantity: l.returnQuantity
        }); })),
    ]);
    react_1.useEffect(function () {
        if (refundFields.length === 1) {
            var currentPaymentAmount = form.getValues("refunds.0.amount");
            var roundedRefundAmount = parseFloat(calculatedRefundAmount.toFixed(2));
            if (currentPaymentAmount !== roundedRefundAmount) {
                form.setValue("refunds.0.amount", roundedRefundAmount, {
                    shouldValidate: true
                });
            }
        }
        else if (refundFields.length === 0 && calculatedRefundAmount > 0) {
            // Si no hay métodos y se espera un reembolso, añadir uno por defecto
            appendRefund({
                fieldId: crypto.randomUUID(),
                paymentMethod: prisma_enums_1.PaymentMethod.CASH,
                amount: parseFloat(calculatedRefundAmount.toFixed(2)),
                reference: "",
                notes: ""
            });
        }
    }, [calculatedRefundAmount, refundFields.length, form, appendRefund]);
    var returnMutation = react_query_1.useMutation({
        mutationFn: function (payload) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(sale === null || sale === void 0 ? void 0 : sale.id))
                            throw new Error("ID de venta no disponible.");
                        return [4 /*yield*/, api_1["default"].post("/sales/" + sale.id + "/return", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function () {
            sonner_1.toast.success("Devolución procesada exitosamente.");
            onReturnProcessed();
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al procesar la devolución.");
        }
    });
    function onSubmit(data) {
        if (!sale)
            return;
        var linesToSubmitApi = data.lines
            .filter(function (line) {
            return line.isSelected && line.returnQuantity > 0 && line.restockLocationId;
        }) // Asegurar que ubicación esté seleccionada
            .map(function (formLine) { return ({
            originalSaleLineId: formLine.saleLineId,
            returnQuantity: formLine.returnQuantity,
            restockLocationId: formLine.restockLocationId,
            returnedCondition: formLine.returnedCondition
        }); });
        if (linesToSubmitApi.length === 0) {
            sonner_1.toast.error("Debes seleccionar productos, cantidades válidas y ubicación de reingreso para devolver.");
            // O usar form.setError en 'lines' para un mensaje más general
            return;
        }
        var totalRefundedByForm = data.refunds.reduce(function (sum, ref) { return sum + (Number(ref.amount) || 0); }, 0);
        if (Math.abs(totalRefundedByForm - calculatedRefundAmount) > 0.01) {
            sonner_1.toast.error("El monto total del reembolso no coincide con el valor de los ítems devueltos.");
            return;
        }
        var payload = {
            returnDate: data.returnDate
                ? date_fns_1.format(data.returnDate, "yyyy-MM-dd")
                : undefined,
            reason: data.reason,
            notes: data.notes,
            lines: linesToSubmitApi,
            refunds: data.refunds.map(function (ref) { return ({
                paymentMethod: ref.paymentMethod,
                amount: Number(ref.amount) || 0,
                reference: ref.reference,
                notes: ref.notes
            }); })
        };
        returnMutation.mutate(payload);
    }
    if (!isOpen || !sale)
        return null;
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-0" },
            react_1["default"].createElement(dialog_1.DialogHeader, { className: "p-6 pb-4 border-b shrink-0" },
                react_1["default"].createElement(dialog_1.DialogTitle, null,
                    "Procesar Devoluci\u00F3n para Venta #", sale === null || sale === void 0 ? void 0 :
                    sale.saleNumber),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Selecciona productos/cantidades a devolver. El stock se reingresar\u00E1 y se procesar\u00E1 el reembolso.")),
            sale &&
                sale.lines &&
                (lineFields.length > 0 || !isOpen || form.formState.isDirty) ? ( // Condición para mostrar el form
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "flex-1 flex flex-col overflow-hidden" },
                    react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "flex-1 px-6 py-4" },
                        react_1["default"].createElement("div", { className: "space-y-6" },
                            react_1["default"].createElement(card_1.Card, null,
                                react_1["default"].createElement(card_1.CardHeader, null,
                                    react_1["default"].createElement(card_1.CardTitle, { className: "text-md" }, "\u00CDtems de la Venta Original a Devolver"),
                                    react_1["default"].createElement(card_1.CardDescription, null, "Selecciona los \u00EDtems y cantidades a devolver. M\u00E1ximo a devolver por l\u00EDnea: la cantidad originalmente vendida menos devoluciones previas.")),
                                react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                                    lineFields.length === 0 && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No hay \u00EDtems elegibles para devoluci\u00F3n en esta venta (o ya fueron todos devueltos).")),
                                    lineFields.map(function (lineFieldItem, index) {
                                        // Renombrar item a lineFieldItem para evitar colisión con item de map interno
                                        var currentLineValues = form.watch("lines." + index);
                                        return (react_1["default"].createElement(card_1.Card, { key: lineFieldItem.fieldId, className: utils_1.cn("p-4 transition-all", (currentLineValues === null || currentLineValues === void 0 ? void 0 : currentLineValues.isSelected) ? "border-primary ring-1 ring-primary shadow-md"
                                                : "border") },
                                            react_1["default"].createElement("div", { className: "flex items-start gap-4" },
                                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".isSelected", render: function (_a) {
                                                        var field = _a.field;
                                                        return (react_1["default"].createElement(form_1.FormItem, { className: "flex items-center pt-1.5" },
                                                            react_1["default"].createElement(form_1.FormControl, null,
                                                                react_1["default"].createElement(checkbox_1.Checkbox, { checked: field.value, onCheckedChange: field.onChange, id: "line-select-" + lineFieldItem.fieldId }))));
                                                    } }),
                                                react_1["default"].createElement("label", { htmlFor: "line-select-" + lineFieldItem.fieldId, className: "flex-1 space-y-1.5 cursor-pointer group" },
                                                    react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row justify-between sm:items-start" },
                                                        react_1["default"].createElement("div", { className: "mb-2 sm:mb-0" },
                                                            react_1["default"].createElement("p", { className: "font-medium text-sm group-hover:text-primary" }, lineFieldItem.productName),
                                                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                                                "Max a devolver:",
                                                                " ",
                                                                lineFieldItem.maxReturnableQuantity,
                                                                " | P.Venta Unit:",
                                                                " ",
                                                                formatters_1.formatCurrency(lineFieldItem.unitPrice))),
                                                        (currentLineValues === null || currentLineValues === void 0 ? void 0 : currentLineValues.isSelected) && (react_1["default"].createElement("div", { className: "text-sm font-semibold text-right sm:text-left mt-1 sm:mt-0" },
                                                            "Subtotal Devol.:",
                                                            " ",
                                                            formatters_1.formatCurrency((form.watch("lines." + index + ".returnQuantity") || 0) * lineFieldItem.unitPrice)))),
                                                    (currentLineValues === null || currentLineValues === void 0 ? void 0 : currentLineValues.isSelected) && (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-4 pt-2 border-t border-dashed mt-2" },
                                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".returnQuantity", render: function (_a) {
                                                                var _b;
                                                                var field = _a.field;
                                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Cant. a Devolver*"),
                                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                                        react_1["default"].createElement(input_1.Input, __assign({ type: "number", min: 0, max: lineFieldItem.maxReturnableQuantity }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                                                return field.onChange(e.target.value === ""
                                                                                    ? 0
                                                                                    : parseInt(e.target.value, 10));
                                                                            } }))),
                                                                    react_1["default"].createElement(form_1.FormMessage, null)));
                                                            } }),
                                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".restockLocationId", render: function (_a) {
                                                                var field = _a.field;
                                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Reingresar a Ubicaci\u00F3n*"),
                                                                    react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingLocations },
                                                                        react_1["default"].createElement(form_1.FormControl, null,
                                                                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9" },
                                                                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Ubicaci\u00F3n..." }))),
                                                                        react_1["default"].createElement(select_1.SelectContent, null,
                                                                            isLoadingLocations && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-loc-return", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                                                            locations.map(function (loc) { return (react_1["default"].createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                                                                    react_1["default"].createElement(form_1.FormMessage, null)));
                                                            } }),
                                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".returnedCondition", render: function (_a) {
                                                                var _b;
                                                                var field = _a.field;
                                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Condici\u00F3n \u00CDtem Devuelto"),
                                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Como Nuevo, Caja Da\u00F1ada" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                                                    react_1["default"].createElement(form_1.FormMessage, null)));
                                                            } }),
                                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".reason", render: function (_a) {
                                                                var _b;
                                                                var field = _a.field;
                                                                return (react_1["default"].createElement(form_1.FormItem, { className: "sm:col-span-full md:col-span-3" },
                                                                    " ",
                                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Raz\u00F3n de Devoluci\u00F3n (L\u00EDnea)"),
                                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: No le gust\u00F3, Defectuoso" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                                                    react_1["default"].createElement(form_1.FormMessage, null)));
                                                            } })))))));
                                    }),
                                    react_1["default"].createElement(form_1.FormMessage, null, ((_b = form.formState.errors.lines) === null || _b === void 0 ? void 0 : _b.message) || ((_d = (_c = form.formState.errors.lines) === null || _c === void 0 ? void 0 : _c.root) === null || _d === void 0 ? void 0 : _d.message)))),
                            react_1["default"].createElement(card_1.Card, null,
                                react_1["default"].createElement(card_1.CardHeader, null,
                                    react_1["default"].createElement(card_1.CardTitle, { className: "text-md flex justify-between items-center" },
                                        "Informaci\u00F3n del Reembolso",
                                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                                return appendRefund({
                                                    fieldId: crypto.randomUUID(),
                                                    paymentMethod: prisma_enums_1.PaymentMethod.CASH,
                                                    amount: refundFields.length === 0
                                                        ? calculatedRefundAmount
                                                        : 0,
                                                    reference: "",
                                                    notes: ""
                                                });
                                            }, disabled: refundFields.length >= 2 || returnMutation.isPending },
                                            react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-1 h-3 w-3" }),
                                            " A\u00F1adir M\u00E9todo"))),
                                react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                                    react_1["default"].createElement("div", { className: "text-lg font-semibold text-right mb-3" },
                                        " ",
                                        "Total a Reembolsar:",
                                        " ",
                                        formatters_1.formatCurrency(calculatedRefundAmount),
                                        " "),
                                    refundFields.map(function (refundItem, index) { return (react_1["default"].createElement("div", { key: refundItem.fieldId, className: "space-y-3 border p-3 rounded-md bg-muted/30" },
                                        react_1["default"].createElement("div", { className: "grid grid-cols-[1fr_120px_min-content] gap-2 items-start" },
                                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "refunds." + index + ".paymentMethod", render: function (_a) {
                                                    var field = _a.field;
                                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                                        " ",
                                                        react_1["default"].createElement(form_1.FormLabel, { className: "text-xs sr-only" }, "M\u00E9todo"),
                                                        react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "" },
                                                            react_1["default"].createElement(form_1.FormControl, null,
                                                                react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 bg-background" },
                                                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "M\u00E9todo..." }))),
                                                            react_1["default"].createElement(select_1.SelectContent, null, storeAcceptedPaymentMethods
                                                                .filter(function (m) {
                                                                return [
                                                                    prisma_enums_1.PaymentMethod.CASH,
                                                                    prisma_enums_1.PaymentMethod.STORE_CREDIT,
                                                                    prisma_enums_1.PaymentMethod.TRANSFER,
                                                                    prisma_enums_1.PaymentMethod.OTHER,
                                                                ].includes(m);
                                                            })
                                                                .map(function (m) { return (react_1["default"].createElement(select_1.SelectItem, { key: m, value: m }, paymentMethodLabels[m] ||
                                                                m.replace("_", " "))); }))),
                                                        react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                                } }),
                                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "refunds." + index + ".amount", render: function (_a) {
                                                    var _b;
                                                    var field = _a.field;
                                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                                        " ",
                                                        react_1["default"].createElement(form_1.FormLabel, { className: "text-xs sr-only" }, "Monto"),
                                                        react_1["default"].createElement(form_1.FormControl, null,
                                                            react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0, className: "h-9 text-right bg-background" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                                    return field.onChange(parseFloat(e.target.value) || 0);
                                                                } }))),
                                                        react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                                } }),
                                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return removeRefund(index); }, className: "h-9 w-9 text-destructive self-center", disabled: refundFields.length <= 1 ||
                                                    returnMutation.isPending },
                                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "refunds." + index + ".reference", render: function (_a) {
                                                var _b;
                                                var field = _a.field;
                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Referencia Reembolso"),
                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Nro. Transacci\u00F3n, etc.", className: "h-8 text-xs" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                                    react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                            } }),
                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "refunds." + index + ".notes", render: function (_a) {
                                                var _b;
                                                var field = _a.field;
                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Notas Reembolso"),
                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                        react_1["default"].createElement(textarea_1.Textarea, __assign({ rows: 1, placeholder: "Notas...", className: "text-xs" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                                    react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                            } }))); }),
                                    react_1["default"].createElement(form_1.FormMessage, null, ((_e = form.formState.errors.refunds) === null || _e === void 0 ? void 0 : _e.message) || ((_g = (_f = form.formState.errors.refunds) === null || _f === void 0 ? void 0 : _f.root) === null || _g === void 0 ? void 0 : _g.message)))),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "returnDate", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-col pt-2" },
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Fecha de Devoluci\u00F3n*"),
                                        react_1["default"].createElement(popover_1.Popover, null,
                                            react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                                react_1["default"].createElement(form_1.FormControl, null,
                                                    react_1["default"].createElement(button_1.Button, { variant: "outline", className: utils_1.cn("w-full sm:w-[280px] pl-3 text-left font-normal", !field.value && "text-muted-foreground") },
                                                        field.value ? (date_fns_1.format(field.value, "PPP", {
                                                            locale: locale_1.es
                                                        })) : (react_1["default"].createElement("span", null, "Selecciona fecha de devoluci\u00F3n")),
                                                        react_1["default"].createElement(lucide_react_1.CalendarIcon, { className: "ml-auto h-4 w-4 opacity-50" })))),
                                            react_1["default"].createElement(popover_1.PopoverContent, { className: "w-auto p-0", align: "start" },
                                                react_1["default"].createElement(calendar_1.Calendar, { mode: "single", selected: field.value, onSelect: field.onChange, initialFocus: true, disabled: function (date) {
                                                        return date > new Date() ||
                                                            date < new Date("2000-01-01");
                                                    } }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "reason", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Raz\u00F3n General de la Devoluci\u00F3n (Opcional)"),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Cliente insatisfecho" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Notas Generales de la Devoluci\u00F3n (Internas)"),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Observaciones adicionales sobre la devoluci\u00F3n..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", rows: 2 }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }))),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "p-6 pt-4 border-t shrink-0" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: returnMutation.isPending },
                            " ",
                            "Cancelar",
                            " "),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: returnMutation.isPending ||
                                calculatedRefundAmount <= 0 ||
                                (form.formState.isSubmitted &&
                                    !form.formState.isValid &&
                                    !form.formState.isValidating) },
                            returnMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Procesar Devoluci\u00F3n"))))) : (
            // Si pendingQuantity es 0 o no hay venta/líneas elegibles
            react_1["default"].createElement("div", { className: "py-4 text-center flex-1 flex flex-col justify-center items-center" },
                react_1["default"].createElement("p", { className: "text-green-600 font-medium" }, "\u00A1Todas las unidades de esta venta ya han sido devueltas o no hay \u00EDtems elegibles para devoluci\u00F3n!"),
                react_1["default"].createElement(dialog_1.DialogFooter, { className: "mt-6 pt-4" },
                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); } }, "Cerrar")))))));
}
exports.ProcessSaleReturnDialog = ProcessSaleReturnDialog;
