// components/users/create-user-dialog.tsx
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
exports.CreateUserDialog = void 0;
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
var select_1 = require("@/components/ui/select"); // Para roles
var switch_1 = require("@/components/ui/switch"); // Para isActive
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Schema de validación con Zod (similar al CreateUserDto del backend)
var createUserFormSchema = z.object({
    firstName: z.string().min(2, "Nombre muy corto").max(50),
    lastName: z.string().min(2, "Apellido muy corto").max(50),
    email: z.string().email("Email inválido."),
    password: z
        .string()
        .min(8, "Contraseña debe tener al menos 8 caracteres.")
        .max(100),
    roleName: z["enum"](["SALESPERSON", "TECHNICIAN"], {
        required_error: "Debes seleccionar un rol."
    }),
    isActive: z.boolean().optional()
});
function CreateUserDialog() {
    var _this = this;
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(createUserFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            roleName: undefined,
            isActive: true
        }
    });
    var createUserMutation = react_query_1.useMutation({
        mutationFn: function (dataToSubmit) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("mutationFn: Enviando datos al backend:", dataToSubmit); // DEBUG
                        return [4 /*yield*/, api_1["default"].post("/users", dataToSubmit)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (data) {
            console.log("mutationFn: Éxito", data); // DEBUG
            sonner_1.toast.success("Usuario creado exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["storeUsers"] });
            setIsOpen(false);
            form.reset();
        },
        onError: function (error) {
            var _a, _b, _c;
            console.error("mutationFn: Error", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message); // DEBUG
            var errorMsg = ((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || "Error al crear usuario.";
            var displayMessage = Array.isArray(errorMsg)
                ? errorMsg.join(", ")
                : errorMsg;
            sonner_1.toast.error(displayMessage);
        }
    });
    function onSubmit(data) {
        createUserMutation.mutate(data);
    }
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: setIsOpen },
        React.createElement(dialog_1.DialogTrigger, { asChild: true },
            React.createElement(button_1.Button, null,
                React.createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                "A\u00F1adir Usuario")),
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[475px]" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, "Crear Nuevo Usuario"),
                React.createElement(dialog_1.DialogDescription, null, "Completa los datos para a\u00F1adir un nuevo miembro a tu tienda.")),
            React.createElement(form_1.Form, __assign({}, form),
                React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement(form_1.FormField, { control: form.control, name: "firstName", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Nombre"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "Juan" }, field))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "lastName", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, "Apellido"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "P\u00E9rez" }, field))),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                    React.createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Correo Electr\u00F3nico"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "email", placeholder: "juan.perez@correo.com" }, field))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "password", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Contrase\u00F1a"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }, field))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "roleName", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Rol"),
                                React.createElement(select_1.Select, { onValueChange: field.onChange, defaultValue: field.value },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Selecciona un rol" }))),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "SALESPERSON" }, "Vendedor"),
                                        React.createElement(select_1.SelectItem, { value: "TECHNICIAN" }, "T\u00E9cnico"))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "isActive", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, { className: "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm" },
                                React.createElement("div", { className: "space-y-0.5" },
                                    React.createElement(form_1.FormLabel, null, "Activo"),
                                    React.createElement(form_1.FormDescription, null, "El usuario podr\u00E1 iniciar sesi\u00F3n y acceder al sistema.")),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(switch_1.Switch, { checked: field.value, onCheckedChange: field.onChange }))));
                        } }),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(dialog_1.DialogClose, { asChild: true },
                            React.createElement(button_1.Button, { type: "button", variant: "outline", disabled: createUserMutation.isPending }, "Cancelar")),
                        React.createElement(button_1.Button, { type: "submit", disabled: createUserMutation.isPending },
                            createUserMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Crear Usuario")))))));
}
exports.CreateUserDialog = CreateUserDialog;
