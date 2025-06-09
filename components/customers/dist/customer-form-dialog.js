// components/customers/customer-form-dialog.tsx
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.CustomerFormDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var react_1 = require("react");
var api_1 = require("@/lib/api");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var switch_1 = require("@/components/ui/switch");
var textarea_1 = require("@/components/ui/textarea");
// Schema de validación con Zod para el formulario
// Basado en CreateCustomerDto y UpdateCustomerDto
var customerFormSchema = z.object({
    firstName: z
        .string()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100),
    lastName: z
        .string()
        .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
        .max(100),
    email: z
        .string()
        .email({ message: "Formato de email inválido." })
        .optional()
        .or(z.literal("")),
    phone: z
        .string()
        .min(7, { message: "El teléfono debe tener al menos 7 dígitos." })
        .max(20)
        .optional()
        .or(z.literal("")),
    rnc: z.string().max(20).optional().or(z.literal("")),
    address: z.string().max(255).optional().or(z.literal("")),
    isActive: z.boolean()["default"](true)
});
function CustomerFormDialog(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess, customerData = _a.customerData;
    var queryClient = react_query_1.useQueryClient();
    var isEditMode = !!customerData;
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(customerFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            rnc: "",
            address: "",
            isActive: true
        }
    });
    // Efecto para llenar el formulario con datos cuando se abre en modo edición
    react_1.useEffect(function () {
        if (isOpen && isEditMode && customerData) {
            form.reset({
                firstName: customerData.firstName || "",
                lastName: customerData.lastName || "",
                email: customerData.email || "",
                phone: customerData.phone || "",
                rnc: customerData.rnc || "",
                address: customerData.address || "",
                isActive: customerData.isActive
            });
        }
        else if (!isOpen) {
            form.reset(); // Limpiar el formulario cuando se cierra
        }
    }, [isOpen, isEditMode, customerData, form]);
    // Mutación para crear o actualizar
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response, isActive, createPayload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = __assign(__assign({}, data), { email: data.email || null, phone: data.phone || null, rnc: data.rnc || null, address: data.address || null });
                        if (!(isEditMode && customerData)) return [3 /*break*/, 2];
                        return [4 /*yield*/, api_1["default"].patch("/customers/" + customerData.id, payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        isActive = payload.isActive, createPayload = __rest(payload, ["isActive"]);
                        return [4 /*yield*/, api_1["default"].post("/customers", createPayload)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function () {
            sonner_1.toast.success(isEditMode
                ? "Cliente actualizado exitosamente."
                : "Cliente creado exitosamente.");
            onSuccess(); // Llama al callback para invalidar query y cerrar diálogo
        },
        onError: function (error) {
            var _a, _b;
            var errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                (isEditMode
                    ? "Error al actualizar el cliente."
                    : "Error al crear el cliente.");
            sonner_1.toast.error(errorMessage);
        }
    });
    function onSubmit(data) {
        mutation.mutate(data);
    }
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, isEditMode ? "Editar Cliente" : "Añadir Nuevo Cliente"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, isEditMode
                    ? "Actualiza la información del cliente."
                    : "Completa los datos para registrar un nuevo cliente.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "firstName", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Nombre*"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Juan" }, field))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lastName", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Apellido*"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "P\u00E9rez" }, field))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } })),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "phone", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "Tel\u00E9fono"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "809-555-1234" }, field, { value: field.value || "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "Correo Electr\u00F3nico"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ type: "email", placeholder: "juan.perez@email.com" }, field, { value: field.value || "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "rnc", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "RNC / C\u00E9dula"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "001-1234567-8" }, field, { value: field.value || "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "address", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "Direcci\u00F3n"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Calle, #, Sector, Ciudad..." }, field, { value: field.value || "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    isEditMode && (react_1["default"].createElement(form_1.FormField, { control: form.control, name: "isActive", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm" },
                                react_1["default"].createElement("div", { className: "space-y-0.5" },
                                    react_1["default"].createElement(form_1.FormLabel, null, "Cliente Activo"),
                                    react_1["default"].createElement(form_1.FormDescription, null, "Desactiva para ocultar al cliente en b\u00FAsquedas.")),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(switch_1.Switch, { checked: field.value, onCheckedChange: field.onChange }))));
                        } })),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-4" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: mutation.isPending }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: mutation.isPending },
                            mutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            isEditMode ? "Guardar Cambios" : "Crear Cliente")))))));
}
exports.CustomerFormDialog = CustomerFormDialog;
