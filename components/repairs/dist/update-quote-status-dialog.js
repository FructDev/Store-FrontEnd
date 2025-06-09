// components/repairs/update-quote-status-dialog.tsx
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
exports.UpdateQuoteStatusDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var formatters_1 = require("@/lib/utils/formatters");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var textarea_1 = require("@/components/ui/textarea");
var radio_group_1 = require("@/components/ui/radio-group"); // Para la decisión
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var utils_1 = require("@/lib/utils");
var updateQuoteStatusSchema = z.object({
    quoteApproved: z.boolean({
        required_error: "Debe indicar si la cotización fue aprobada o rechazada."
    }),
    notes: z
        .string()
        .max(500, "Máximo 500 caracteres")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
function UpdateQuoteStatusDialog(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, repairId = _a.repairId, currentQuotedAmount = _a.currentQuotedAmount, initialApprovalStatus = _a.initialApprovalStatus, decisionToSet = _a.decisionToSet, // Esta prop indica la acción (Aprobar/Rechazar)
    onSuccess = _a.onSuccess;
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(updateQuoteStatusSchema),
        defaultValues: {
            quoteApproved: decisionToSet,
            notes: ""
        }
    });
    react_1.useEffect(function () {
        if (isOpen) {
            form.reset({
                quoteApproved: decisionToSet,
                notes: ""
            });
        }
    }, [isOpen, decisionToSet, form]);
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].patch("/repairs/" + repairId + "/quote-status", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (data) {
            sonner_1.toast.success("Cotizaci\u00F3n marcada como " + (data.quoteApproved ? "Aprobada" : "Rechazada") + ".");
            onSuccess(); // Refrescar datos de la página padre
            onOpenChange(false); // Cerrar diálogo
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al actualizar estado de cotización.");
        }
    });
    function onSubmit(data) {
        // 'quoteApproved' ya está seteado por la prop 'decisionToSet' y el form
        mutation.mutate(data);
    }
    if (!isOpen)
        return null;
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, { className: utils_1.cn(decisionToSet ? "text-green-600" : "text-red-600") },
                    decisionToSet ? "Confirmar Aprobación" : "Confirmar Rechazo",
                    " de Cotizaci\u00F3n"),
                react_1["default"].createElement(dialog_1.DialogDescription, null,
                    "Monto Cotizado:",
                    " ",
                    react_1["default"].createElement("strong", null, formatters_1.formatCurrency(currentQuotedAmount)),
                    ".",
                    decisionToSet
                        ? " Esto cambiará el estado de la reparación para proceder."
                        : " Esto podría detener el proceso de reparación.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-2" },
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "quoteApproved", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, { className: "space-y-3" },
                                react_1["default"].createElement(form_1.FormLabel, null, "Decisi\u00F3n del Cliente*"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(radio_group_1.RadioGroup, { onValueChange: function (valStr) {
                                            return field.onChange(valStr === "true");
                                        }, value: String(field.value), className: "flex space-x-4" },
                                        react_1["default"].createElement(form_1.FormItem, { className: "flex items-center space-x-2" },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(radio_group_1.RadioGroupItem, { value: "true" })),
                                            react_1["default"].createElement(form_1.FormLabel, { className: "font-normal text-green-600" }, "Aprobada")),
                                        react_1["default"].createElement(form_1.FormItem, { className: "flex items-center space-x-2" },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(radio_group_1.RadioGroupItem, { value: "false" })),
                                            react_1["default"].createElement(form_1.FormLabel, { className: "font-normal text-red-600" }, "Rechazada")))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "Notas sobre la Decisi\u00F3n (Opcional)"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Ej: Cliente solicit\u00F3 descuento adicional, Aprobado v\u00EDa telef\u00F3nica..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", rows: 3 }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-4" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: mutation.isPending }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", variant: decisionToSet ? "default" : "destructive", disabled: mutation.isPending },
                            mutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Confirmar ",
                            decisionToSet ? "Aprobación" : "Rechazo")))))));
}
exports.UpdateQuoteStatusDialog = UpdateQuoteStatusDialog;
