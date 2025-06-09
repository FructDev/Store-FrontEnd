// components/repairs/facture-repair-dialog.tsx
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
exports.FactureRepairDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var auth_store_1 = require("@/stores/auth.store");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var formatters_1 = require("@/lib/utils/formatters");
var separator_1 = require("@/components/ui/separator");
var card_1 = require("../ui/card");
var paymentMethodLabels = {
    CASH: "Efectivo",
    CARD_CREDIT: "Tarjeta Crédito",
    CARD_DEBIT: "Tarjeta Débito",
    TRANSFER: "Transferencia",
    MOBILE_WALLET: "Billetera Móvil",
    STORE_CREDIT: "Crédito Tienda",
    OTHER: "Otro"
};
// Schema para un item de pago en el formulario
var factureRepairPaymentFormSchema = z.object({
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
        .transform(function (val) { return (val === "" ? null : val); }),
    cardLast4: z
        .string()
        .max(4)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
// Schema principal para el formulario de facturación de reparación
var factureRepairFormSchema = z
    .object({
    payments: z
        .array(factureRepairPaymentFormSchema)
        .min(1, "Se requiere al menos un método de pago."),
    notes: z
        .string()
        .max(500, "Máx 500 caracteres")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    ncf: z
        .string()
        .max(20)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
})
    .refine(function (data) {
    // La validación de que la suma de pagos cubra el total se hará en onSubmit
    return true;
});
var ALL_PAYMENT_METHODS = Object.values(prisma_enums_1.PaymentMethod);
function FactureRepairDialog(_a) {
    var _this = this;
    var _b, _c, _d, _e, _f;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, repairOrderData = _a.repairOrderData, onSuccess = _a.onSuccess;
    var storeInfo = auth_store_1.useAuthStore(function (state) { var _a; return (_a = state.user) === null || _a === void 0 ? void 0 : _a.store; });
    var storeAcceptedPaymentMethods = (storeInfo === null || storeInfo === void 0 ? void 0 : storeInfo.acceptedPaymentMethods) || ALL_PAYMENT_METHODS;
    var totalAmountToPay = react_1.useMemo(function () {
        return Number((repairOrderData === null || repairOrderData === void 0 ? void 0 : repairOrderData.totalRepairAmount) || (repairOrderData === null || repairOrderData === void 0 ? void 0 : repairOrderData.quotedAmount) || 0);
    }, [repairOrderData]);
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(factureRepairFormSchema),
        defaultValues: {
            payments: [
                {
                    fieldId: crypto.randomUUID(),
                    paymentMethod: prisma_enums_1.PaymentMethod.CASH,
                    amount: totalAmountToPay > 0 ? totalAmountToPay : 0,
                    reference: "",
                    notes: ""
                },
            ],
            notes: "Factura de Reparaci\u00F3n #" + ((repairOrderData === null || repairOrderData === void 0 ? void 0 : repairOrderData.repairNumber) || ""),
            ncf: ""
        }
    });
    var _g = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "payments",
        keyName: "fieldId"
    }), paymentFields = _g.fields, appendPayment = _g.append, removePayment = _g.remove;
    // Resetear y poblar el formulario cuando el diálogo se abre o los datos de la reparación cambian
    react_1.useEffect(function () {
        var _a;
        if (isOpen && repairOrderData) {
            var amountToPay = Number(repairOrderData.totalRepairAmount || repairOrderData.quotedAmount || 0);
            form.reset({
                payments: [
                    {
                        fieldId: crypto.randomUUID(),
                        paymentMethod: storeAcceptedPaymentMethods.includes(prisma_enums_1.PaymentMethod.CASH)
                            ? prisma_enums_1.PaymentMethod.CASH
                            : storeAcceptedPaymentMethods[0],
                        amount: amountToPay > 0 ? parseFloat(amountToPay.toFixed(2)) : 0,
                        reference: "",
                        notes: ""
                    },
                ],
                notes: "Factura por Reparaci\u00F3n #" + repairOrderData.repairNumber,
                ncf: ((_a = repairOrderData.customer) === null || _a === void 0 ? void 0 : _a.rnc) || ""
            });
        }
    }, [isOpen, repairOrderData, form, storeAcceptedPaymentMethods]);
    var watchedPayments = form.watch("payments");
    var totalPaidInForm = react_1.useMemo(function () {
        return watchedPayments.reduce(function (sum, p) { return sum + (Number(p.amount) || 0); }, 0);
    }, [watchedPayments]);
    var factureRepairMutation = react_query_1.useMutation({
        mutationFn: function (payload) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(repairOrderData === null || repairOrderData === void 0 ? void 0 : repairOrderData.id))
                            throw new Error("ID de orden de reparación no disponible.");
                        console.log("Enviando payload para facturar reparación:", payload);
                        return [4 /*yield*/, api_1["default"].post("/repairs/" + repairOrderData.id + "/bill", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (createdSale) {
            sonner_1.toast.success("Venta #" + createdSale.saleNumber + " creada exitosamente para la reparaci\u00F3n.");
            onSuccess(createdSale); // Llama al callback (refresca datos de reparación, redirige a venta, etc.)
            onOpenChange(false); // Cierra este diálogo
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al facturar la reparación.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg.toString());
        }
    });
    function onSubmit(data) {
        if (!repairOrderData)
            return;
        var amountToPay = Number(repairOrderData.totalRepairAmount || repairOrderData.quotedAmount || 0);
        var currentTotalPaid = data.payments.reduce(function (sum, p) { return sum + (Number(p.amount) || 0); }, 0);
        if (currentTotalPaid < amountToPay) {
            sonner_1.toast.error("El monto pagado (" + formatters_1.formatCurrency(currentTotalPaid) + ") es menor al total de la reparaci\u00F3n (" + formatters_1.formatCurrency(amountToPay) + ").");
            form.setError("payments.0.amount", { message: "Monto insuficiente." }); // O un error general
            return;
        }
        var payload = {
            payments: data.payments.map(function (p) { return ({
                paymentMethod: p.paymentMethod,
                amount: p.amount,
                reference: p.reference,
                notes: p.notes,
                cardLast4: p.cardLast4
            }); }),
            notes: data.notes,
            ncf: data.ncf,
            customerId: repairOrderData.customerId
        };
        factureRepairMutation.mutate(payload);
    }
    if (!isOpen || !repairOrderData)
        return null;
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null,
                    "Facturar Reparaci\u00F3n #",
                    repairOrderData.repairNumber),
                react_1["default"].createElement(dialog_1.DialogDescription, null,
                    "Cliente: ",
                    ((_b = repairOrderData.customer) === null || _b === void 0 ? void 0 : _b.firstName) || "",
                    " ",
                    ((_c = repairOrderData.customer) === null || _c === void 0 ? void 0 : _c.lastName) || "N/A",
                    " ",
                    react_1["default"].createElement("br", null),
                    "Monto Total a Pagar:",
                    " ",
                    react_1["default"].createElement("strong", { className: "text-lg" }, formatters_1.formatCurrency(totalAmountToPay)))),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-2" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex justify-between items-center" },
                                "Forma(s) de Pago",
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                        return appendPayment({
                                            fieldId: crypto.randomUUID(),
                                            paymentMethod: prisma_enums_1.PaymentMethod.CASH,
                                            amount: 0,
                                            reference: "",
                                            notes: ""
                                        });
                                    }, disabled: paymentFields.length >= 2 ||
                                        factureRepairMutation.isPending },
                                    react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-1 h-3 w-3" }),
                                    "A\u00F1adir M\u00E9todo"))),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                            paymentFields.map(function (paymentItem, index) { return (react_1["default"].createElement("div", { key: paymentItem.fieldId, className: "space-y-3 border p-3 rounded-md bg-muted/30" },
                                react_1["default"].createElement("div", { className: "grid grid-cols-[1fr_120px_auto] gap-2 items-start" },
                                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "payments." + index + ".paymentMethod", render: function (_a) {
                                            var field = _a.field;
                                            return (react_1["default"].createElement(form_1.FormItem, null,
                                                " ",
                                                react_1["default"].createElement(form_1.FormLabel, { className: "text-xs sr-only" }, "M\u00E9todo"),
                                                react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "" },
                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9 bg-background" },
                                                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "M\u00E9todo..." }))),
                                                    react_1["default"].createElement(select_1.SelectContent, null, storeAcceptedPaymentMethods.map(function (m) { return (react_1["default"].createElement(select_1.SelectItem, { key: m, value: m }, paymentMethodLabels[m] ||
                                                        m.replace("_", " "))); }))),
                                                react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                        } }),
                                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "payments." + index + ".amount", render: function (_a) {
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
                                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return removePayment(index); }, className: "h-9 w-9 text-destructive self-center", disabled: paymentFields.length <= 1 ||
                                            factureRepairMutation.isPending },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "payments." + index + ".reference", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Referencia Pago"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Nro. Transacci\u00F3n, etc.", className: "h-8 text-xs" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                    } }),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "payments." + index + ".notes", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Notas Pago"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(textarea_1.Textarea, __assign({ rows: 1, placeholder: "Notas sobre este pago...", className: "text-xs" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                    } }))); }),
                            react_1["default"].createElement(separator_1.Separator, { className: "my-2" }),
                            react_1["default"].createElement("div", { className: "text-sm space-y-0.5" },
                                react_1["default"].createElement("div", { className: "flex justify-between" },
                                    react_1["default"].createElement("span", null, "Total Pagado:"),
                                    react_1["default"].createElement("span", { className: "font-medium" }, formatters_1.formatCurrency(totalPaidInForm))),
                                react_1["default"].createElement("div", { className: "flex justify-between" },
                                    react_1["default"].createElement("span", null, "Pendiente por Pagar:"),
                                    react_1["default"].createElement("span", { className: "font-semibold text-destructive" }, formatters_1.formatCurrency(Math.max(0, totalAmountToPay - totalPaidInForm))))),
                            react_1["default"].createElement(form_1.FormMessage, null, ((_d = form.formState.errors.payments) === null || _d === void 0 ? void 0 : _d.message) || ((_f = (_e = form.formState.errors.payments) === null || _e === void 0 ? void 0 : _e.root) === null || _f === void 0 ? void 0 : _f.message)))),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "ncf", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                " ",
                                react_1["default"].createElement(form_1.FormLabel, null, "NCF (Opcional)"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "N\u00FAmero de Comprobante Fiscal" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                " ",
                                react_1["default"].createElement(form_1.FormLabel, null, "Notas para la Venta (Opcional)"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Notas adicionales para la factura/venta..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", rows: 2 }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-6" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: factureRepairMutation.isPending },
                            " ",
                            "Cancelar",
                            " "),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: factureRepairMutation.isPending ||
                                totalPaidInForm < totalAmountToPay ||
                                (!form.formState.isValid && form.formState.isSubmitted) },
                            factureRepairMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Confirmar y Facturar")))))));
}
exports.FactureRepairDialog = FactureRepairDialog;
