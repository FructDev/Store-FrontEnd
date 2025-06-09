// components/repairs/assign-technician-dialog.tsx
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
exports.AssignTechnicianDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react"); // React no siempre es necesario
var NULL_TECHNICIAN_VALUE = "__NULL_TECH__"; // Para la opción "No Asignado"
var assignTechnicianSchema = z.object({
    technicianId: z.string().nullable()
});
function AssignTechnicianDialog(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, repairId = _a.repairId, currentTechnicianId = _a.currentTechnicianId, onSuccess = _a.onSuccess;
    // Fetch para la lista de técnicos/usuarios
    var _b = react_query_1.useQuery({
        queryKey: ["allActiveTechniciansForAssignment"],
        // Asume un endpoint que devuelve usuarios con rol 'TECHNICIAN' o similar
        // O un filtro general que puedas aplicar.
        queryFn: function () {
            return api_1["default"]
                .get("/users?roleName=TECHNICIAN&isActive=true&limit=200")
                .then(function (res) { return res.data.data || res.data || []; });
        },
        staleTime: 1000 * 60 * 5
    }), technicians = _b.data, isLoadingTechnicians = _b.isLoading;
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(assignTechnicianSchema),
        defaultValues: {
            technicianId: currentTechnicianId || null
        }
    });
    react_1.useEffect(function () {
        if (isOpen) {
            form.reset({ technicianId: currentTechnicianId || null });
        }
    }, [isOpen, currentTechnicianId, form]);
    var assignTechnicianMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = { technicianId: data.technicianId };
                        return [4 /*yield*/, api_1["default"].patch("/repairs/" + repairId + "/assign", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function () {
            sonner_1.toast.success("Técnico asignado/actualizado exitosamente.");
            onSuccess();
            onOpenChange(false);
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al asignar el técnico.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg.toString());
        }
    });
    function onSubmit(data) {
        assignTechnicianMutation.mutate({ technicianId: data.technicianId });
    }
    if (!isOpen)
        return null;
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Asignar T\u00E9cnico a Reparaci\u00F3n"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Selecciona el t\u00E9cnico que se encargar\u00E1 de esta orden de reparaci\u00F3n.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-2" },
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "technicianId", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "T\u00E9cnico Asignado"),
                                react_1["default"].createElement(select_1.Select, { onValueChange: function (value) {
                                        return field.onChange(value === NULL_TECHNICIAN_VALUE ? null : value);
                                    }, value: field.value === null
                                        ? NULL_TECHNICIAN_VALUE
                                        : field.value || "", disabled: isLoadingTechnicians },
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(select_1.SelectTrigger, null,
                                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Selecciona un t\u00E9cnico..." }))),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: NULL_TECHNICIAN_VALUE },
                                            react_1["default"].createElement("em", null, "-- No Asignado --")),
                                        isLoadingTechnicians && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-tech", disabled: true }, "Cargando t\u00E9cnicos...")), technicians === null || technicians === void 0 ? void 0 :
                                        technicians.map(function (tech) { return (react_1["default"].createElement(select_1.SelectItem, { key: tech.id, value: tech.id },
                                            tech.firstName,
                                            " ",
                                            tech.lastName)); }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-4" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: assignTechnicianMutation.isPending }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: assignTechnicianMutation.isPending },
                            assignTechnicianMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Asignar T\u00E9cnico")))))));
}
exports.AssignTechnicianDialog = AssignTechnicianDialog;
