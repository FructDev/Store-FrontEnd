// components/customers/create-customer-dialog.tsx
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
exports.CreateCustomerDialog = void 0;
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
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var textarea_1 = require("../ui/textarea");
// Schema Zod para el formulario de creación rápida de cliente
// Ajusta según los campos que tu CreateCustomerDto del backend espera como mínimos/opcionales
var createCustomerSchema = z.object({
    firstName: z
        .string()
        .min(2, "Nombre es requerido y debe tener al menos 2 caracteres.")
        .max(50),
    lastName: z
        .string()
        .min(2, "Apellido es requerido y debe tener al menos 2 caracteres.")
        .max(50),
    phone: z
        .string()
        .max(20)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    email: z
        .string()
        .email("Email inválido.")
        .max(100)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    rnc: z
        .string()
        .max(20)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    address: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
function CreateCustomerDialog(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(createCustomerSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            rnc: "",
            address: ""
        }
    });
    react_1.useEffect(function () {
        if (isOpen) {
            form.reset({
                // Resetear al abrir
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
                rnc: "",
                address: ""
            });
        }
    }, [isOpen, form]);
    var createCustomerMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].post("/customers", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (newCustomer) {
            sonner_1.toast.success("Cliente \"" + newCustomer.firstName + " " + newCustomer.lastName + "\" creado exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["customers"] }); // Para refrescar listas de clientes
            queryClient.invalidateQueries({ queryKey: ["posCustomerSearch"] }); // Para refrescar búsqueda en POS
            onOpenChange(false); // Cerrar este diálogo
            onSuccess(newCustomer); // Llamar al callback con el nuevo cliente
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al crear el cliente.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        createCustomerMutation.mutate(data);
    }
    if (!isOpen)
        return null;
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) {
            if (!createCustomerMutation.isPending)
                onOpenChange(open);
        } },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, "Crear Nuevo Cliente"),
                React.createElement(dialog_1.DialogDescription, null, "Ingresa los datos del nuevo cliente. Los campos marcados con * son requeridos.")),
            React.createElement(form_1.Form, __assign({}, form),
                React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-2" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement(form_1.FormField, { control: form.control, name: "firstName", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Nombre*"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "Juan" }, field))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "lastName", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Apellido*"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "P\u00E9rez" }, field))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } })),
                    React.createElement(form_1.FormField, { control: form.control, name: "phone", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                " ",
                                React.createElement(form_1.FormLabel, null, "Tel\u00E9fono"),
                                " ",
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ placeholder: "809-123-4567" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                " ",
                                React.createElement(form_1.FormMessage, null),
                                " "));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                " ",
                                React.createElement(form_1.FormLabel, null, "Email"),
                                " ",
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "email", placeholder: "juan.perez@email.com" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                " ",
                                React.createElement(form_1.FormMessage, null),
                                " "));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "rnc", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                " ",
                                React.createElement(form_1.FormLabel, null, "RNC/C\u00E9dula"),
                                " ",
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ placeholder: "N\u00FAmero de identificaci\u00F3n fiscal" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                " ",
                                React.createElement(form_1.FormMessage, null),
                                " "));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "address", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                " ",
                                React.createElement(form_1.FormLabel, null, "Direcci\u00F3n"),
                                " ",
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(textarea_1.Textarea, __assign({ placeholder: "Direcci\u00F3n del cliente..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", rows: 2 }))),
                                " ",
                                React.createElement(form_1.FormMessage, null),
                                " "));
                        } }),
                    React.createElement(dialog_1.DialogFooter, { className: "pt-4" },
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: createCustomerMutation.isPending }, "Cancelar"),
                        React.createElement(button_1.Button, { type: "submit", disabled: createCustomerMutation.isPending },
                            createCustomerMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Crear Cliente")))))));
}
exports.CreateCustomerDialog = CreateCustomerDialog;
