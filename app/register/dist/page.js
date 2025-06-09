// app/register/page.tsx
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
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var navigation_1 = require("next/navigation");
var link_1 = require("next/link");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api"); // Nuestro cliente Axios
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var fa_1 = require("react-icons/fa");
// Schema de validación con Zod
var registerFormSchema = z
    .object({
    firstName: z
        .string()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(50, { message: "El nombre no puede exceder los 50 caracteres." }),
    lastName: z
        .string()
        .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
        .max(50, { message: "El apellido no puede exceder los 50 caracteres." }),
    email: z
        .string()
        .email({ message: "Por favor, introduce un correo electrónico válido." }),
    password: z
        .string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
        .max(100, {
        message: "La contraseña no puede exceder los 100 caracteres."
    }),
    // Podríamos añadir regex para complejidad de contraseña aquí si quisiéramos
    confirmPassword: z.string()
})
    .refine(function (data) { return data.password === data.confirmPassword; }, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"]
});
function RegisterPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(registerFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });
    var registerMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var confirmPassword, submissionData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        confirmPassword = data.confirmPassword, submissionData = __rest(data, ["confirmPassword"]);
                        return [4 /*yield*/, api_1["default"].post("/auth/register", submissionData)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (data) {
            sonner_1.toast.success("¡Registro exitoso! Ahora puedes iniciar sesión.");
            router.push("/login"); // Redirigir a la página de login
        },
        onError: function (error) {
            var _a, _b, _c;
            var errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error en el registro. Inténtalo de nuevo.";
            // Si el mensaje es un array (como a veces devuelve class-validator), lo unimos.
            var displayMessage = Array.isArray(errorMessage)
                ? errorMessage.join(", ")
                : errorMessage;
            sonner_1.toast.error(displayMessage);
            console.error("Register error:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        }
    });
    function onSubmit(data) {
        registerMutation.mutate(data);
    }
    return (React.createElement("div", { className: "w-full lg:grid lg:min-h-screen lg:grid-cols-2" },
        React.createElement("div", { className: "hidden bg-muted lg:flex flex-col justify-between p-12 text-foreground" },
            React.createElement(link_1["default"], { href: "/", className: "flex items-center gap-2 font-semibold text-2xl" },
                React.createElement(lucide_react_1.Building, { className: "h-7 w-7 text-primary" }),
                React.createElement("span", { className: "font-bold" }, "Shopix")),
            React.createElement("div", { className: "mb-20" },
                React.createElement("h2", { className: "text-3xl font-bold mb-4" }, "Comienza a transformar tu negocio hoy."),
                React.createElement("ul", { className: "space-y-3 text-lg text-muted-foreground" },
                    React.createElement("li", { className: "flex items-start gap-3" },
                        React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-primary mt-1 shrink-0" }),
                        React.createElement("span", null, "Centraliza tus ventas, inventario y reparaciones.")),
                    React.createElement("li", { className: "flex items-start gap-3" },
                        React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-primary mt-1 shrink-0" }),
                        React.createElement("span", null, "Toma decisiones inteligentes con reportes claros.")),
                    React.createElement("li", { className: "flex items-start gap-3" },
                        React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-primary mt-1 shrink-0" }),
                        React.createElement("span", null, "Ofrece un servicio excepcional a tus clientes.")))),
            React.createElement("div", null)),
        React.createElement("div", { className: "flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" },
            React.createElement("div", { className: "mx-auto w-full max-w-md space-y-6" },
                React.createElement("div", { className: "text-center" },
                    React.createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Crea tu Cuenta"),
                    React.createElement("p", { className: "mt-2 text-muted-foreground" }, "Es r\u00E1pido, f\u00E1cil y el primer paso para optimizar tu tienda.")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(button_1.Button, { variant: "outline", className: "w-full h-10" },
                        React.createElement(fa_1.FaGoogle, { className: "mr-2 h-4 w-4" }),
                        " Registrarse con Google"),
                    React.createElement("div", { className: "relative my-4" },
                        React.createElement("div", { className: "absolute inset-0 flex items-center" },
                            React.createElement("span", { className: "w-full border-t" })),
                        React.createElement("div", { className: "relative flex justify-center text-xs uppercase" },
                            React.createElement("span", { className: "bg-background px-2 text-muted-foreground" }, "O reg\u00EDstrate con tu correo"))),
                    React.createElement(form_1.Form, __assign({}, form),
                        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                React.createElement(form_1.FormField, { control: form.control, name: "firstName", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Nombre"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ placeholder: "Juan" }, field, { disabled: registerMutation.isPending, className: "h-10" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "lastName", render: function (_a) {
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Apellido"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ placeholder: "P\u00E9rez" }, field, { disabled: registerMutation.isPending, className: "h-10" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } })),
                            React.createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Correo Electr\u00F3nico"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "email", placeholder: "tu@correo.com" }, field, { disabled: registerMutation.isPending, className: "h-10" }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "password", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Contrase\u00F1a"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }, field, { disabled: registerMutation.isPending, className: "h-10" }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "confirmPassword", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Confirmar Contrase\u00F1a"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }, field, { disabled: registerMutation.isPending, className: "h-10" }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(button_1.Button, { type: "submit", className: "w-full h-10 font-semibold", disabled: registerMutation.isPending },
                                registerMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                                "Crear Cuenta")))),
                React.createElement("p", { className: "mt-6 px-8 text-center text-xs text-muted-foreground" },
                    "Al hacer clic en Crear Cuenta, aceptas nuestros",
                    " ",
                    React.createElement(link_1["default"], { href: "/terms", className: "underline hover:text-primary" }, "T\u00E9rminos de Servicio"),
                    " ",
                    "y nuestra",
                    " ",
                    React.createElement(link_1["default"], { href: "/privacy", className: "underline hover:text-primary" }, "Pol\u00EDtica de Privacidad"),
                    "."),
                React.createElement("p", { className: "mt-4 text-center text-sm text-muted-foreground" },
                    "\u00BFYa tienes una cuenta?",
                    " ",
                    React.createElement(link_1["default"], { href: "/login", className: "font-semibold text-primary hover:underline" }, "Inicia sesi\u00F3n aqu\u00ED"))))));
}
exports["default"] = RegisterPage;
