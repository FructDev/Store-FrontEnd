// app/login/page.tsx
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
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var navigation_1 = require("next/navigation");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner"); // Usaremos sonner directamente
var api_1 = require("@/lib/api"); // Nuestro cliente Axios
var auth_store_1 = require("@/stores/auth.store"); // Nuestro store de Zustand y tipo User
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
var lucide_react_1 = require("lucide-react"); // Para el spinner de carga
var link_1 = require("next/link");
var fa_1 = require("react-icons/fa");
// Definir el schema de validación con Zod
var loginFormSchema = z.object({
    email: z
        .string()
        .email({ message: "Por favor, introduce un correo válido." }),
    password: z.string().min(6, {
        // Ajusta el minLength si es diferente en tu backend
        message: "La contraseña debe tener al menos 6 caracteres."
    })
});
function LoginPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var authLogin = auth_store_1.useAuthStore().login; // Renombrar para evitar conflicto con la función 'login' del mutation
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });
    var loginMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].post("/auth/login", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (data) {
            sonner_1.toast.success("¡Inicio de sesión exitoso!");
            authLogin(data.accessToken, data.user); // Actualizar store de Zustand
            // Redirigir basado en si la tienda está configurada
            if (data.user.storeId) {
                router.push("/dashboard"); // Si tiene tienda, al dashboard
            }
            else {
                router.push("/create-store"); // Si no tiene tienda, a la página de creación de tienda
            }
        },
        onError: function (error) {
            var _a, _b, _c;
            // Manejar errores específicos del backend
            var errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al iniciar sesión. Verifica tus credenciales.";
            sonner_1.toast.error(errorMessage);
            console.error("Login error:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        }
    });
    function onSubmit(data) {
        loginMutation.mutate(data);
    }
    return (React.createElement("div", { className: "w-full min-h-screen lg:grid lg:grid-cols-2" },
        React.createElement("div", { className: "flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" },
            React.createElement("div", { className: "mx-auto w-full max-w-sm space-y-8" },
                React.createElement("div", { className: "text-left" },
                    React.createElement(link_1["default"], { href: "/", className: "inline-block mb-6" },
                        React.createElement(lucide_react_1.Building, { className: "h-8 w-8 text-primary" })),
                    React.createElement("h1", { className: "text-3xl font-bold tracking-tight text-foreground" }, "Bienvenido de Nuevo"),
                    React.createElement("p", { className: "mt-2 text-muted-foreground" }, "Ingresa tus credenciales para acceder a tu dashboard.")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(button_1.Button, { variant: "outline", className: "w-full h-10" },
                        React.createElement(fa_1.FaGoogle, { className: "mr-2 h-4 w-4" }),
                        " Iniciar sesi\u00F3n con Google"),
                    React.createElement("div", { className: "relative my-4" },
                        React.createElement("div", { className: "absolute inset-0 flex items-center" },
                            React.createElement("span", { className: "w-full border-t" })),
                        React.createElement("div", { className: "relative flex justify-center text-xs uppercase" },
                            React.createElement("span", { className: "bg-background px-2 text-muted-foreground" }, "O contin\u00FAa con"))),
                    React.createElement(form_1.Form, __assign({}, form),
                        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4" },
                            React.createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Correo Electr\u00F3nico"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "email", placeholder: "tu@correo.com" }, field, { disabled: loginMutation.isPending, className: "h-10" }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "password", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement("div", { className: "flex items-center" },
                                            React.createElement(form_1.FormLabel, null, "Contrase\u00F1a"),
                                            React.createElement(link_1["default"], { href: "/forgot-password", className: "ml-auto inline-block text-sm underline" }, "\u00BFLa olvidaste?")),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "password", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }, field, { disabled: loginMutation.isPending, className: "h-10" }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } }),
                            React.createElement(button_1.Button, { type: "submit", className: "w-full h-10 text-sm font-semibold", disabled: loginMutation.isPending },
                                loginMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                                "Iniciar Sesi\u00F3n")))),
                React.createElement("p", { className: "mt-8 text-center text-sm text-muted-foreground" },
                    "\u00BFNo tienes una cuenta?",
                    " ",
                    React.createElement(link_1["default"], { href: "/register", className: "font-semibold text-primary hover:underline" }, "Reg\u00EDstrate aqu\u00ED")))),
        React.createElement("div", { className: "hidden bg-muted lg:flex flex-col items-center justify-center p-12 text-center relative overflow-hidden" },
            React.createElement("div", { className: "absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_90%_10%,_#3b82f644_0%,#f1f5f900_40%)] dark:bg-[radial-gradient(circle_at_90%_10%,_#3b82f633_0%,#020817_40%)]" }),
            React.createElement("div", { className: "relative z-10" },
                React.createElement("h2", { className: "text-3xl font-bold text-foreground" }, "' El control de nuestro inventario y reparaciones nunca fue tan sencillo.'"),
                React.createElement("p", { className: "mt-4 text-muted-foreground" }, "\u2014 Gerente, TechFix RD")))));
}
exports["default"] = LoginPage;
