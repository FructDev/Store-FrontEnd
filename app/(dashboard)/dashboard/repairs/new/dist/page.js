// app/(dashboard)/repairs/new/page.tsx
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var page_header_1 = require("@/components/common/page-header");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
var popover_1 = require("@/components/ui/popover");
var command_1 = require("@/components/ui/command");
var checkbox_1 = require("@/components/ui/checkbox"); // Para "Nuevo Cliente"
var lucide_react_1 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
// --- SCHEMAS ZOD Y TIPOS (COPIARLOS AQUÍ DESDE EL PASO 1 DE ARRIBA) ---
// Schema Zod para la creación rápida de cliente (si se usa dentro de este form)
var newCustomerFieldsSchema = z.object({
    firstName: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    lastName: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    phone: z
        .string()
        .max(20)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    email: z
        .string()
        .max(100)
        // Hacer que .email() solo se aplique si el string no está vacío y no es null/undefined
        // O, si el campo es verdaderamente opcional, .optional() debe ir antes de .email() si el string puede estar vacío.
        // Zod v3: .optional().or(z.literal("")).or(z.string().email("Email inválido.")) es complicado.
        // Mejor enfoque: permitir string vacío, y el .transform lo convierte a null.
        // La validación .email() fallará para string vacío.
        // La solución es refinarlo para que solo valide .email() si el string tiene contenido.
        .refine(function (val) {
        return val === null ||
            val === undefined ||
            val === "" ||
            z.string().email().safeParse(val).success;
    }, {
        message: "Email inválido."
    })
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
var createRepairOrderFormSchema = z
    .object({
    customerId: z.string().optional().nullable(),
    isNewCustomer: z.boolean()["default"](false),
    newCustomer: newCustomerFieldsSchema.optional(),
    deviceBrand: z.string().min(1, "Marca es requerida.").max(100),
    deviceModel: z.string().min(1, "Modelo es requerido.").max(100),
    deviceColor: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    deviceImei: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    devicePassword: z
        .string()
        .max(100)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    customerNameDisplay: z.string().optional(),
    accessoriesReceived: z
        .string()
        .max(500)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    reportedIssue: z
        .string()
        .min(5, "Problema reportado es requerido (mín. 5 caracteres).")
        .max(1000),
    intakeNotes: z
        .string()
        .max(1000)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    intakeChecklist: z.any().optional().nullable()
})
    .refine(function (data) {
    if (data.isNewCustomer) {
        // Si es nuevo cliente, customerId debe ser null o undefined
        // Y newCustomer debe tener al menos firstName y lastName
        return (!data.customerId &&
            data.newCustomer &&
            data.newCustomer.firstName &&
            data.newCustomer.lastName);
    }
    else {
        // Si no es nuevo cliente, customerId debe estar presente
        return !!data.customerId;
    }
}, {
    message: "Debe seleccionar un cliente existente o ingresar los datos obligatorios (nombre, apellido) de un nuevo cliente.",
    path: ["customerId"]
})
    .superRefine(function (data, ctx) {
    // superRefine para validar newCustomer solo si isNewCustomer es true
    if (data.isNewCustomer) {
        // Schema estricto para cuando SÍ es un nuevo cliente
        var strictNewCustomerSchema = z.object({
            firstName: z
                .string()
                .min(2, "Nombre de nuevo cliente es requerido (mín. 2 caracteres).")
                .max(50),
            lastName: z
                .string()
                .min(2, "Apellido de nuevo cliente es requerido (mín. 2 caracteres).")
                .max(50),
            phone: z.string().max(20).optional().nullable(),
            email: z
                .string()
                .email("Email inválido.")
                .max(100)
                .optional()
                .nullable(),
            rnc: z.string().max(20).optional().nullable(),
            address: z.string().max(255).optional().nullable()
        });
        var newCustomerResult = strictNewCustomerSchema.safeParse(data.newCustomer);
        if (!newCustomerResult.success) {
            newCustomerResult.error.errors.forEach(function (err) {
                ctx.addIssue(__assign(__assign({}, err), { path: __spreadArrays(["newCustomer"], err.path) }));
            });
        }
    }
    // No es necesario un 'else' aquí; si no es nuevo cliente, no se valida newCustomer con el schema estricto.
    // El schema base 'newCustomerFieldsSchema' permite que los campos estén vacíos o nulos.
});
// --- FIN SCHEMAS Y TIPOS ---
function CreateRepairOrderPage() {
    var _this = this;
    var router = navigation_1.useRouter();
    var queryClient = react_query_1.useQueryClient();
    var _a = react_1.useState(""), customerSearchTerm = _a[0], setCustomerSearchTerm = _a[1];
    var debouncedCustomerSearchTerm = use_debounce_1.useDebounce(customerSearchTerm, 300);
    var _b = react_1.useState(false), isCustomerSearchOpen = _b[0], setIsCustomerSearchOpen = _b[1];
    // Ejemplo de checklist, esto podría venir de una configuración o ser más dinámico
    var intakeChecklistItems = [
        { id: "screen_condition", label: "Pantalla (Rayones, Rotura)" },
        { id: "body_condition", label: "Carcasa (Golpes, Marcas)" },
        { id: "buttons_functional", label: "Botones Funcionales" },
        { id: "ports_clear", label: "Puertos Limpios" },
        { id: "has_sim", label: "Tiene SIM" },
        { id: "has_sd", label: "Tiene Tarjeta SD" },
    ];
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(createRepairOrderFormSchema),
        defaultValues: {
            customerId: null,
            isNewCustomer: false,
            newCustomer: {
                firstName: "",
                lastName: "",
                phone: "",
                email: "",
                rnc: "",
                address: ""
            },
            deviceBrand: "",
            deviceModel: "",
            deviceColor: "",
            deviceImei: "",
            devicePassword: "",
            accessoriesReceived: "",
            reportedIssue: "",
            intakeNotes: "",
            intakeChecklist: intakeChecklistItems.reduce(function (acc, item) {
                var _a;
                return (__assign(__assign({}, acc), (_a = {}, _a[item.id] = false, _a)));
            }, {})
        }
    });
    var isNewCustomerMode = form.watch("isNewCustomer");
    // Fetch para Clientes (para el selector/búsqueda)
    var _c = react_query_1.useQuery({
        queryKey: ["repairCustomerSearch", debouncedCustomerSearchTerm],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!debouncedCustomerSearchTerm ||
                    debouncedCustomerSearchTerm.length < 2)
                    return [2 /*return*/, []];
                return [2 /*return*/, api_1["default"]
                        .get("/customers?search=" + debouncedCustomerSearchTerm + "&isActive=true&limit=10")
                        .then(function (res) { return res.data.data || []; })];
            });
        }); },
        enabled: debouncedCustomerSearchTerm.length >= 2 &&
            isCustomerSearchOpen &&
            !isNewCustomerMode
    }), searchedCustomers = _c.data, isLoadingSearchedCustomers = _c.isLoading;
    var createRepairMutation = react_query_1.useMutation({
        mutationFn: function (formData) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            // Construir el payload para CreateRepairOrderDto
                            customerId: formData.isNewCustomer ? undefined : formData.customerId,
                            newCustomer: formData.isNewCustomer ? formData.newCustomer : undefined,
                            deviceBrand: formData.deviceBrand,
                            deviceModel: formData.deviceModel,
                            deviceColor: formData.deviceColor || null,
                            deviceImei: formData.deviceImei || null,
                            devicePassword: formData.devicePassword || null,
                            accessoriesReceived: formData.accessoriesReceived || null,
                            reportedIssue: formData.reportedIssue,
                            intakeNotes: formData.intakeNotes || null,
                            intakeChecklist: formData.intakeChecklist || null
                        };
                        console.log("create");
                        // Remover newCustomer si no es nuevo cliente para evitar enviar objeto vacío
                        if (!formData.isNewCustomer)
                            delete payload.newCustomer;
                        // Remover customerId si es nuevo cliente
                        if (formData.isNewCustomer)
                            delete payload.customerId;
                        console.log("Enviando payload de Reparación:", payload);
                        return [4 /*yield*/, api_1["default"].post("/repairs", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (createdRepairOrder) {
            sonner_1.toast.success("Orden de Reparaci\u00F3n #" + createdRepairOrder.repairNumber + " creada exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["repairsList"] });
            router.push("/dashboard/repairs/" + createdRepairOrder.id); // Ir al detalle de la reparación
        },
        onError: function (error) {
            var _a, _b, _c;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al crear la Orden de Reparación.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg.toString());
            console.error("Error en createRepairMutation:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error);
        }
    });
    function onSubmit(data) {
        console.log("Datos Formulario Reparación:", data);
        createRepairMutation.mutate(data);
    }
    var handleSelectCustomer = function (customer) {
        form.setValue("customerId", customer.id, { shouldValidate: true });
        form.setValue("isNewCustomer", false); // Desmarcar nuevo cliente
        form.setValue("customerNameDisplay", customer.firstName + " " + customer.lastName);
        // Limpiar campos de nuevo cliente por si acaso
        form.setValue("newCustomer", {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            rnc: "",
            address: ""
        });
        setIsCustomerSearchOpen(false);
        setCustomerSearchTerm("");
    };
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement(page_header_1.PageHeader, { title: "Registrar Nueva Orden de Reparaci\u00F3n", description: "Completa los datos para ingresar un nuevo dispositivo a reparaci\u00F3n." }),
        react_1["default"].createElement(form_1.Form, __assign({}, form),
            react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-8" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Informaci\u00F3n del Cliente")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "isNewCustomer", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-row items-center space-x-3 space-y-0" },
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(checkbox_1.Checkbox, { checked: field.value, onCheckedChange: function (checked) {
                                                field.onChange(checked);
                                                if (checked) {
                                                    // Si se marca nuevo cliente, limpiar customerId seleccionado
                                                    form.setValue("customerId", null);
                                                }
                                            } })),
                                    react_1["default"].createElement(form_1.FormLabel, { className: "font-normal" }, "Registrar Nuevo Cliente")));
                            } }),
                        !isNewCustomerMode ? (react_1["default"].createElement(form_1.FormField, { control: form.control, name: "customerId", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-col" },
                                    " ",
                                    react_1["default"].createElement(form_1.FormLabel, null, "Cliente Existente*"),
                                    react_1["default"].createElement(popover_1.Popover, { open: isCustomerSearchOpen, onOpenChange: setIsCustomerSearchOpen },
                                        react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", "aria-expanded": isCustomerSearchOpen, className: "w-full justify-between" },
                                                    form.watch("customerNameDisplay") ||
                                                        "Seleccionar cliente...",
                                                    react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })))),
                                        react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0" },
                                            react_1["default"].createElement(command_1.Command, { filter: function (value, search) {
                                                    return value
                                                        .toLowerCase()
                                                        .indexOf(search.toLowerCase()) > -1
                                                        ? 1
                                                        : 0;
                                                } },
                                                react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar cliente...", value: customerSearchTerm, onValueChange: setCustomerSearchTerm }),
                                                react_1["default"].createElement(command_1.CommandList, null,
                                                    react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingSearchedCustomers
                                                        ? "Buscando..."
                                                        : "No clientes."), searchedCustomers === null || searchedCustomers === void 0 ? void 0 :
                                                    searchedCustomers.map(function (customer) { return (react_1["default"].createElement(command_1.CommandItem, { key: customer.id, value: customer.firstName + " " + customer.lastName + " " + customer.email + " " + customer.phone, onSelect: function () {
                                                            field.onChange(customer.id);
                                                            handleSelectCustomer(customer);
                                                        } },
                                                        react_1["default"].createElement(lucide_react_1.Check, { className: utils_1.cn("mr-2 h-4 w-4", field.value === customer.id
                                                                ? "opacity-100"
                                                                : "opacity-0") }),
                                                        react_1["default"].createElement("div", null,
                                                            react_1["default"].createElement("p", null,
                                                                customer.firstName,
                                                                " ",
                                                                customer.lastName),
                                                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, customer.phone || customer.email)))); }))))),
                                    " ",
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } })) : (react_1["default"].createElement("div", { className: "space-y-4 border p-4 rounded-md bg-muted/30" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-foreground" }, "Datos del Nuevo Cliente"),
                            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "newCustomer.firstName", render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            react_1["default"].createElement(form_1.FormLabel, null, "Nombre*"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Juan" }, field))),
                                            react_1["default"].createElement(form_1.FormMessage, null)));
                                    } }),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "newCustomer.lastName", render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            react_1["default"].createElement(form_1.FormLabel, null, "Apellido*"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ placeholder: "P\u00E9rez" }, field))),
                                            react_1["default"].createElement(form_1.FormMessage, null)));
                                    } })),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "newCustomer.phone", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        react_1["default"].createElement(form_1.FormLabel, null, "Tel\u00E9fono"),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(input_1.Input, __assign({ placeholder: "809-123-4567" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "newCustomer.email", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        react_1["default"].createElement(form_1.FormLabel, null, "Email"),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(input_1.Input, __assign({ type: "email", placeholder: "juan.perez@email.com" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "newCustomer.rnc", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        react_1["default"].createElement(form_1.FormLabel, null, "RNC/C\u00E9dula"),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(input_1.Input, __assign({ placeholder: "RNC o C\u00E9dula" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "newCustomer.address", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        react_1["default"].createElement(form_1.FormLabel, null, "Direcci\u00F3n"),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Direcci\u00F3n..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", rows: 2 }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Informaci\u00F3n del Dispositivo")),
                    react_1["default"].createElement(card_1.CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4" },
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "deviceBrand", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Marca*"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Apple, Samsung" }, field))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "deviceModel", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Modelo*"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: iPhone 13, Galaxy S22" }, field))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "deviceColor", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Color"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Negro Medianoche" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "deviceImei", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "IMEI / N\u00FAmero de Serie"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "IMEI o S/N del dispositivo" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "devicePassword", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Contrase\u00F1a/Patr\u00F3n"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Para acceso t\u00E9cnico" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    react_1["default"].createElement(form_1.FormDescription, { className: "text-xs" }, "Si es necesario para diagn\u00F3stico."),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "accessoriesReceived", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Accesorios Recibidos"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: SIM, Cargador, Caja" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Detalles de la Reparaci\u00F3n")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "reportedIssue", render: function (_a) {
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Problema Reportado por el Cliente*"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Describe detalladamente el problema..." }, field, { rows: 3 }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "intakeNotes", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    react_1["default"].createElement(form_1.FormLabel, null, "Notas de Recepci\u00F3n (T\u00E9cnico)"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Observaciones al recibir el dispositivo, estado f\u00EDsico, etc." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", rows: 3 }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(form_1.FormLabel, { className: "text-sm font-medium" }, "Checklist de Ingreso (Condici\u00F3n)"),
                            react_1["default"].createElement(card_1.Card, { className: "p-4 mt-2 space-y-2 border bg-muted/30" }, intakeChecklistItems.map(function (item) { return (react_1["default"].createElement(form_1.FormField, { key: item.id, control: form.control, name: "intakeChecklist." + item.id, render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-row items-center space-x-3 space-y-0" },
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(checkbox_1.Checkbox, { checked: field.value, onCheckedChange: field.onChange })),
                                        react_1["default"].createElement(form_1.FormLabel, { className: "font-normal text-sm" }, item.label)));
                                } })); }))))),
                react_1["default"].createElement("div", { className: "flex justify-end space-x-3 pt-4" },
                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return router.back(); }, disabled: createRepairMutation.isPending },
                        react_1["default"].createElement(lucide_react_1.X, { className: "mr-2 h-4 w-4" }),
                        " Cancelar"),
                    react_1["default"].createElement(button_1.Button, { type: "submit" // Mantenemos type="submit"
                        , onClick: function () {
                            // Añadir este onClick para depuración
                            console.log("Valores del formulario ANTES de handleSubmit:", form.getValues());
                            console.log("Errores del formulario ANTES de handleSubmit:", form.formState.errors);
                            console.log("Formulario es válido ANTES de handleSubmit?:", form.formState.isValid);
                            // ¡OJO! isValid puede no estar completamente actualizado aquí
                            // Es mejor ver los errores.
                        }, disabled: createRepairMutation.isPending },
                        createRepairMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        react_1["default"].createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                        " Registrar Orden de Reparaci\u00F3n"))))));
}
exports["default"] = CreateRepairOrderPage;
