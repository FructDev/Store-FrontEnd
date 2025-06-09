// app/create-store/page.tsx
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
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var auth_store_1 = require("@/stores/auth.store"); // Importa el store y el tipo User
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Schema de validación con Zod para el nombre de la tienda
var createStoreFormSchema = z.object({
    name: z
        .string()
        .min(3, {
        message: "El nombre de la tienda debe tener al menos 3 caracteres."
    })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." })
});
function CreateStorePage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var _a = auth_store_1.useAuthStore(), user = _a.user, setUser = _a.setUser, token = _a.token, isAuthenticated = _a.isAuthenticated; // Obtener usuario y acción setUser
    //   const queryClient = useQueryClient(); // Para invalidar queries si es necesario
    // Redirigir si ya tiene tienda o no está logueado
    react_1.useEffect(function () {
        if (!isAuthenticated && token) {
            // Todavía cargando o token existe pero no user
            // Podríamos esperar a que useAuthStore termine de hidratarse
            // o si el token es inválido, el interceptor de API lo manejará
        }
        else if (!isAuthenticated && !token) {
            router.replace("/login");
        }
        else if (user === null || user === void 0 ? void 0 : user.storeId) {
            router.replace("/dashboard"); // Si ya tiene tienda, al dashboard
        }
    }, [user, token, isAuthenticated, router]);
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(createStoreFormSchema),
        defaultValues: {
            name: ""
        }
    });
    var createStoreMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1["default"].post("/stores", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (newStoreData) {
            sonner_1.toast.success("\u00A1Tienda \"" + newStoreData.name + "\" creada exitosamente!");
            // Actualizar el storeId en el usuario del store de Zustand
            if (user) {
                var updatedUser = __assign(__assign({}, user), { storeId: newStoreData.id });
                setUser(updatedUser); // Actualiza el usuario en Zustand
            }
            // Opcional: Invalidar queries que dependan de la info del usuario/tienda
            // queryClient.invalidateQueries({ queryKey: ['authUserProfile'] });
            router.push("/dashboard"); // Redirigir al dashboard
        },
        onError: function (error) {
            var _a, _b, _c;
            var errorMessage = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al crear la tienda.";
            sonner_1.toast.error(errorMessage);
            console.error("Create store error:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error.message);
        }
    });
    function onSubmit(data) {
        createStoreMutation.mutate(data);
    }
    // Si el usuario aún no se ha cargado o ya tiene tienda, y estamos redirigiendo
    if (!user || user.storeId) {
        return React.createElement("div", null, "Cargando o redirigiendo..."); // Evitar renderizar el form innecesariamente
    }
    return (React.createElement("div", { className: "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4" },
        React.createElement("div", { className: "absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-black" },
            React.createElement("div", { className: "absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f633,#02081700)]" })),
        React.createElement("div", { className: "w-full max-w-lg text-center" },
            React.createElement("div", { className: "inline-flex items-center justify-center h-16 w-16 mb-6 bg-primary/10 rounded-2xl" },
                React.createElement(lucide_react_1.PartyPopper, { className: "h-8 w-8 text-primary" })),
            React.createElement("h1", { className: "text-3xl font-bold tracking-tight text-foreground sm:text-4xl" }, "\u00A1Est\u00E1s a un paso!"),
            React.createElement("p", { className: "mt-3 text-lg text-muted-foreground" },
                "Bienvenido, ",
                user.firstName,
                ". Dale un nombre a tu tienda para finalizar la configuraci\u00F3n de tu cuenta."),
            React.createElement("div", { className: "mt-8" },
                React.createElement(form_1.Form, __assign({}, form),
                    React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "mx-auto max-w-sm space-y-4" },
                        React.createElement(form_1.FormField, { control: form.control, name: "name", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, { className: "sr-only" }, "Nombre de la Tienda"),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "Ej: El Palacio del Celular" }, field, { disabled: createStoreMutation.isPending, className: "h-12 text-center text-base" // Input más grande y centrado
                                         }))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(button_1.Button, { type: "submit", className: "w-full h-12 text-base font-semibold", disabled: createStoreMutation.isPending, size: "lg" }, createStoreMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-5 w-5 animate-spin" })) : (React.createElement(React.Fragment, null,
                            React.createElement(lucide_react_1.Rocket, { className: "mr-2 h-5 w-5" }),
                            "Crear mi Tienda y Despegar")))))),
            React.createElement("p", { className: "mt-6 text-xs text-muted-foreground" }, "Podr\u00E1s cambiar este nombre y otros detalles m\u00E1s tarde en la configuraci\u00F3n."))));
}
exports["default"] = CreateStorePage;
