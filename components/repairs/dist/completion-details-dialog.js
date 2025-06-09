// components/repairs/completion-details-dialog.tsx
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
exports.CompletionDetailsDialog = exports.postRepairChecklistItems = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react"); // React no siempre es necesario importar
var card_1 = require("@/components/ui/card");
// --- COPIAR postRepairChecklistItems y completionDetailsSchema AQUÍ ---
exports.postRepairChecklistItems = [
    { id: "power_on_off", label: "Encendido y Apagado Correcto" },
    { id: "screen_touch_response", label: "Respuesta Táctil de Pantalla OK" },
    { id: "buttons_check", label: "Todos los Botones Físicos Funcionan" },
    { id: "sound_audio_jack", label: "Audio (Altavoz, Auriculares) OK" },
    { id: "microphone_check", label: "Micrófono Funciona" },
    { id: "camera_front_rear", label: "Cámaras (Frontal y Trasera) OK" },
    { id: "wifi_connectivity", label: "Conectividad WiFi Estable" },
    { id: "cellular_signal", label: "Señal Celular y Llamadas OK" },
    { id: "charging_port", label: "Puerto de Carga Funciona" },
    {
        id: "battery_performance",
        label: "Rendimiento de Batería Adecuado (si aplica)"
    },
    { id: "no_overheating", label: "Sin Sobrecalentamiento Anormal" },
    { id: "device_cleaned", label: "Dispositivo Limpio Externamente" },
];
// Construir el schema para el checklist dinámicamente
var checklistSchemaObject = exports.postRepairChecklistItems.reduce(function (acc, item) {
    acc[item.id] = z.boolean()["default"](false);
    return acc;
}, {});
var completionDetailsSchema = z.object({
    completionNotes: z
        .string()
        .max(2000, "Máx 2000 caracteres.")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    warrantyPeriodDays: z.coerce
        .number()
        .int("Debe ser un número entero.")
        .min(0, "No puede ser negativo.")
        .optional()
        .nullable(),
    postRepairChecklist: z.object(checklistSchemaObject).optional().nullable()
});
function CompletionDetailsDialog(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, repairId = _a.repairId, currentData = _a.currentData, onSuccess = _a.onSuccess;
    var defaultChecklistValues = exports.postRepairChecklistItems.reduce(function (acc, item) {
        var _a;
        acc[item.id] =
            ((_a = currentData === null || currentData === void 0 ? void 0 : currentData.postRepairChecklist) === null || _a === void 0 ? void 0 : _a[item.id]) || false;
        return acc;
    }, {});
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(completionDetailsSchema),
        defaultValues: {
            completionNotes: (currentData === null || currentData === void 0 ? void 0 : currentData.completionNotes) || "",
            warrantyPeriodDays: (_b = currentData === null || currentData === void 0 ? void 0 : currentData.warrantyPeriodDays) !== null && _b !== void 0 ? _b : undefined,
            postRepairChecklist: defaultChecklistValues
        }
    });
    react_1.useEffect(function () {
        var _a;
        if (isOpen) {
            var checklistVals = exports.postRepairChecklistItems.reduce(function (acc, item) {
                var _a;
                acc[item.id] =
                    ((_a = currentData === null || currentData === void 0 ? void 0 : currentData.postRepairChecklist) === null || _a === void 0 ? void 0 : _a[item.id]) || false;
                return acc;
            }, {});
            form.reset({
                completionNotes: (currentData === null || currentData === void 0 ? void 0 : currentData.completionNotes) || "",
                warrantyPeriodDays: (_a = currentData === null || currentData === void 0 ? void 0 : currentData.warrantyPeriodDays) !== null && _a !== void 0 ? _a : undefined,
                postRepairChecklist: checklistVals
            });
        }
    }, [isOpen, currentData, form]);
    var updateCompletionMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            completionNotes: data.completionNotes,
                            warrantyPeriodDays: data.warrantyPeriodDays,
                            postRepairChecklist: data.postRepairChecklist
                        };
                        return [4 /*yield*/, api_1["default"].patch("/repairs/" + repairId, payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function () {
            sonner_1.toast.success("Detalles de finalización guardados.");
            onSuccess();
            onOpenChange(false);
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al guardar detalles de finalización.");
        }
    });
    function onSubmit(data) {
        updateCompletionMutation.mutate(data);
    }
    if (!isOpen)
        return null;
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-lg max-h-[90vh] flex flex-col p-0" },
            react_1["default"].createElement(dialog_1.DialogHeader, { className: "p-6 pb-4 border-b shrink-0" },
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Registrar Detalles de Finalizaci\u00F3n"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "A\u00F1ade notas finales, garant\u00EDa y completa el checklist post-reparaci\u00F3n.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "flex-1 overflow-y-auto" },
                    react_1["default"].createElement("div", { className: "px-6 py-4 space-y-6" },
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "completionNotes", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    " ",
                                    react_1["default"].createElement(form_1.FormLabel, null, "Notas de Finalizaci\u00F3n"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Detalles sobre el trabajo realizado, pruebas finales, etc.", rows: 4 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "warrantyPeriodDays", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    " ",
                                    react_1["default"].createElement(form_1.FormLabel, null, "Garant\u00EDa (D\u00EDas)"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ type: "number", placeholder: "Ej: 30, 90 (0 para sin garant\u00EDa)", min: 0 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                return field.onChange(e.target.value === ""
                                                    ? null
                                                    : parseInt(e.target.value, 10));
                                            } }))),
                                    " ",
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(form_1.FormLabel, { className: "text-sm font-medium" }, "Checklist Post-Reparaci\u00F3n"),
                            react_1["default"].createElement(card_1.Card, { className: "p-4 mt-2 space-y-2 max-h-60 overflow-y-auto" },
                                " ",
                                exports.postRepairChecklistItems.map(function (item) { return (react_1["default"].createElement(form_1.FormField, { key: item.id, control: form.control, name: "postRepairChecklist." + item.id, render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-row items-center space-x-3 space-y-0" },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(checkbox_1.Checkbox, { checked: field.value, onCheckedChange: field.onChange })),
                                            react_1["default"].createElement(form_1.FormLabel, { className: "font-normal text-sm" }, item.label)));
                                    } })); })),
                            react_1["default"].createElement(form_1.FormMessage, null, ((_c = form.formState.errors.postRepairChecklist) === null || _c === void 0 ? void 0 : _c.message) || ((_e = (_d = form.formState.errors.postRepairChecklist) === null || _d === void 0 ? void 0 : _d.root) === null || _e === void 0 ? void 0 : _e.message)))),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "p-6 pt-4 border-t shrink-0 sticky bottom-0 bg-background z-10" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: updateCompletionMutation.isPending },
                            " ",
                            "Cancelar",
                            " "),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: updateCompletionMutation.isPending || !form.formState.isDirty },
                            updateCompletionMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Guardar Detalles")))))));
}
exports.CompletionDetailsDialog = CompletionDetailsDialog;
