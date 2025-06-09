// components/inventory/stock-counts/create-stock-count-dialog.tsx
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
exports.CreateStockCountDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var navigation_1 = require("next/navigation");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var radio_group_1 = require("@/components/ui/radio-group");
var createStockCountSchema = z.object({
    locationId: z.string().optional().nullable(),
    notes: z
        .string()
        .max(255, "Máximo 255 caracteres")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    // Opcional: un campo para indicar si se pre-poblará con items de la ubicación
    // Por ahora, el backend decide esto basado en si locationId se envía y lines no.
    // O si queremos que el usuario elija "Conteo de Ubicación Completa" vs "Conteo Ad-hoc"
    countType: z["enum"](["location_full", "adhoc"], {
        required_error: "Selecciona el tipo de conteo"
    })["default"]("location_full")
});
function CreateStockCountDialog(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var queryClient = react_query_1.useQueryClient();
    var router = navigation_1.useRouter(); // Para redirigir
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(createStockCountSchema),
        defaultValues: {
            locationId: undefined,
            notes: "",
            countType: "location_full"
        }
    });
    var watchedCountType = form.watch("countType");
    var _b = react_query_1.useQuery({
        queryKey: ["activeLocationsForStockCount"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=500")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), locations = _b.data, isLoadingLocations = _b.isLoading;
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = { notes: data.notes };
                        if (data.countType === "location_full" && data.locationId) {
                            payload.locationId = data.locationId;
                            // El backend pre-poblará las líneas si locationId se envía y no se envía un array `lines`
                        }
                        else if (data.countType === "adhoc") {
                            payload.locationId = null; // O undefined, el backend lo manejará
                            payload.lines = []; // Iniciar con cero líneas para conteo adhoc
                        }
                        return [4 /*yield*/, api_1["default"].post("/inventory/stock-counts", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (createdStockCount) {
            sonner_1.toast.success("Sesi\u00F3n de conteo #" + (createdStockCount.stockCountNumber || createdStockCount.id.slice(-6)) + " iniciada.");
            queryClient.invalidateQueries({ queryKey: ["stockCounts"] });
            onOpenChange(false);
            onSuccess(createdStockCount.id); // Pasar ID para redirección
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al iniciar el conteo.");
        }
    });
    function onSubmit(data) {
        if (data.countType === "location_full" && !data.locationId) {
            form.setError("locationId", {
                message: "Debes seleccionar una ubicación para un conteo de ubicación completa."
            });
            return;
        }
        mutation.mutate(data);
    }
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) {
            if (!mutation.isPending)
                onOpenChange(open);
        } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, "Iniciar Nuevo Conteo de Stock"),
                React.createElement(dialog_1.DialogDescription, null, "Configura los detalles para la nueva sesi\u00F3n de conteo.")),
            React.createElement(form_1.Form, __assign({}, form),
                React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6 py-4" },
                    React.createElement(form_1.FormField, { control: form.control, name: "countType", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, { className: "space-y-3" },
                                " ",
                                React.createElement(form_1.FormLabel, null, "Tipo de Conteo*"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(radio_group_1.RadioGroup, { onValueChange: field.onChange, defaultValue: field.value, className: "flex flex-col space-y-1" },
                                        React.createElement(form_1.FormItem, { className: "flex items-center space-x-3 space-y-0" },
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(radio_group_1.RadioGroupItem, { value: "location_full" })),
                                            React.createElement(form_1.FormLabel, { className: "font-normal" }, "Ubicaci\u00F3n Completa (Recomendado)")),
                                        React.createElement(form_1.FormItem, { className: "flex items-center space-x-3 space-y-0" },
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(radio_group_1.RadioGroupItem, { value: "adhoc" })),
                                            React.createElement(form_1.FormLabel, { className: "font-normal" }, "Ad-hoc / Manual (A\u00F1adir productos despu\u00E9s)")))),
                                " ",
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    watchedCountType === "location_full" && (React.createElement(form_1.FormField, { control: form.control, name: "locationId", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                " ",
                                React.createElement(form_1.FormLabel, null, "Ubicaci\u00F3n para Conteo Completo*"),
                                React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingLocations },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Selecciona una ubicaci\u00F3n..." }))),
                                    React.createElement(select_1.SelectContent, null,
                                        isLoadingLocations && (React.createElement(select_1.SelectItem, { value: "loading", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                        locations.map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                                " ",
                                React.createElement(form_1.FormMessage, null)));
                        } })),
                    React.createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                " ",
                                React.createElement(form_1.FormLabel, null, "Notas Adicionales"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(textarea_1.Textarea, __assign({ placeholder: "Ej: Conteo de fin de mes, secci\u00F3n A" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: mutation.isPending },
                            " ",
                            "Cancelar",
                            " "),
                        React.createElement(button_1.Button, { type: "submit", disabled: mutation.isPending },
                            mutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Iniciar Conteo")))))));
}
exports.CreateStockCountDialog = CreateStockCountDialog;
