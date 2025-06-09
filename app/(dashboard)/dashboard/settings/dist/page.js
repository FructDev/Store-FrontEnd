// app/(dashboard)/settings/page.tsx
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
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var settings_types_1 = require("@/types/settings.types"); // Ajusta ruta si es necesario
var auth_store_1 = require("@/stores/auth.store");
var button_1 = require("@/components/ui/button");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var checkbox_1 = require("@/components/ui/checkbox");
var card_1 = require("@/components/ui/card");
var page_header_1 = require("@/components/common/page-header");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var skeleton_1 = require("@/components/ui/skeleton");
// import { Prisma } from '@prisma/client'; // No deberías necesitar Prisma aquí en el frontend
var ALL_PAYMENT_METHODS = Object.values(settings_types_1.PaymentMethod);
var NULL_SELECT_VALUE = "__NULL__"; // Valor especial para "Ninguna" en Selects
// Schema Zod para el formulario (lo tenías en tu código completo anterior)
// Asegúrate que los coercers estén bien, especialmente para números opcionales/nulos
var storeSettingsFormSchema = z.object({
    name: z.string().min(3, "Nombre muy corto").max(100).optional(),
    address: z.string().max(255).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    defaultTaxRate: z.coerce
        .number()
        .min(0, "Tasa debe ser >= 0")
        .max(1, "Tasa debe ser <= 1")
        .optional()
        .nullable(),
    contactEmail: z
        .string()
        .email("Email inválido")
        .max(100)
        .optional()
        .nullable(),
    website: z.string().url("URL inválida").max(100).optional().nullable(),
    currencySymbol: z.string().max(5).optional().nullable(),
    quoteTerms: z.string().optional().nullable(),
    repairTerms: z.string().optional().nullable(),
    defaultRepairWarrantyDays: z.coerce
        .number()
        .int()
        .min(0, "Días debe ser >= 0")
        .optional()
        .nullable(),
    saleNumberPrefix: z.string().max(10).optional().nullable(),
    saleNumberPadding: z.coerce
        .number()
        .int()
        .min(3)
        .max(10)
        .optional()
        .nullable(),
    lastSaleNumber: z.coerce.number().int().min(0).optional().nullable(),
    repairNumberPrefix: z.string().max(10).optional().nullable(),
    repairNumberPadding: z.coerce
        .number()
        .int()
        .min(3)
        .max(10)
        .optional()
        .nullable(),
    lastRepairNumber: z.coerce.number().int().min(0).optional().nullable(),
    poNumberPrefix: z.string().max(10).optional().nullable(),
    poNumberPadding: z.coerce.number().int().min(3).max(10).optional().nullable(),
    lastPoNumber: z.coerce.number().int().min(0).optional().nullable(),
    stockCountNumberPrefix: z.string().max(10).optional().nullable(),
    stockCountNumberPadding: z.coerce
        .number()
        .int()
        .min(3)
        .max(10)
        .optional()
        .nullable(),
    lastStockCountNumber: z.coerce.number().int().min(0).optional().nullable(),
    acceptedPaymentMethods: z.array(z.nativeEnum(settings_types_1.PaymentMethod)).optional(),
    defaultReturnLocationId: z.string().optional().nullable(),
    defaultPoReceiveLocationId: z.string().optional().nullable()
});
function StoreSettingsPage() {
    var _this = this;
    var queryClient = react_query_1.useQueryClient();
    var _a = auth_store_1.useAuthStore(), user = _a.user, setAuthStoreName = _a.setStoreName; // Para actualizar nombre en sidebar
    var _b = react_query_1.useQuery({
        queryKey: ["storeSettings"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, api_1["default"].get("/stores/settings").then(function (res) { return res.data; })];
        }); }); }
    }), currentSettings = _b.data, isLoadingSettings = _b.isLoading, isError = _b.isError, error = _b.error;
    var _c = react_query_1.useQuery({
        queryKey: ["inventoryLocationsListForSettings"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, api_1["default"]
                        .get("/inventory/locations?limit=500&fields=id,name")
                        .then(function (res) { return res.data; })];
            });
        }); },
        enabled: !!currentSettings
    }), locations = _c.data, isLoadingLocations = _c.isLoading;
    var form = react_hook_form_1.useForm({
        // Usar FormValues inferido de Zod
        resolver: zod_1.zodResolver(storeSettingsFormSchema),
        // --- VALORES INICIALES DEFINIDOS para evitar inputs no controlados ---
        defaultValues: {
            name: "",
            address: "",
            phone: "",
            defaultTaxRate: 0.18,
            contactEmail: "",
            website: "",
            currencySymbol: "$",
            quoteTerms: "",
            repairTerms: "",
            defaultRepairWarrantyDays: 30,
            saleNumberPrefix: "VTA-",
            saleNumberPadding: 5,
            lastSaleNumber: 0,
            repairNumberPrefix: "REP-",
            repairNumberPadding: 5,
            lastRepairNumber: 0,
            poNumberPrefix: "PO-",
            poNumberPadding: 5,
            lastPoNumber: 0,
            stockCountNumberPrefix: "SC-",
            stockCountNumberPadding: 5,
            lastStockCountNumber: 0,
            acceptedPaymentMethods: [],
            defaultReturnLocationId: null,
            defaultPoReceiveLocationId: null
        }
    });
    react_1.useEffect(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (currentSettings) {
            form.reset({
                name: currentSettings.name || "",
                address: currentSettings.address || "",
                phone: currentSettings.phone || "",
                defaultTaxRate: currentSettings.defaultTaxRate !== null &&
                    currentSettings.defaultTaxRate !== undefined
                    ? parseFloat(String(currentSettings.defaultTaxRate))
                    : 0.18,
                contactEmail: currentSettings.contactEmail || "",
                website: currentSettings.website || "",
                currencySymbol: currentSettings.currencySymbol || "$",
                quoteTerms: currentSettings.quoteTerms || "",
                repairTerms: currentSettings.repairTerms || "",
                defaultRepairWarrantyDays: (_a = currentSettings.defaultRepairWarrantyDays) !== null && _a !== void 0 ? _a : 30,
                saleNumberPrefix: ((_b = currentSettings.counter) === null || _b === void 0 ? void 0 : _b.saleNumberPrefix) || "VTA-",
                saleNumberPadding: ((_c = currentSettings.counter) === null || _c === void 0 ? void 0 : _c.saleNumberPadding) || 5,
                lastSaleNumber: ((_d = currentSettings.counter) === null || _d === void 0 ? void 0 : _d.lastSaleNumber) || 0,
                repairNumberPrefix: ((_e = currentSettings.counter) === null || _e === void 0 ? void 0 : _e.repairNumberPrefix) || "REP-",
                repairNumberPadding: ((_f = currentSettings.counter) === null || _f === void 0 ? void 0 : _f.repairNumberPadding) || 5,
                lastRepairNumber: ((_g = currentSettings.counter) === null || _g === void 0 ? void 0 : _g.lastRepairNumber) || 0,
                poNumberPrefix: ((_h = currentSettings.counter) === null || _h === void 0 ? void 0 : _h.poNumberPrefix) || "PO-",
                poNumberPadding: ((_j = currentSettings.counter) === null || _j === void 0 ? void 0 : _j.poNumberPadding) || 5,
                lastPoNumber: ((_k = currentSettings.counter) === null || _k === void 0 ? void 0 : _k.lastPoNumber) || 0,
                stockCountNumberPrefix: ((_l = currentSettings.counter) === null || _l === void 0 ? void 0 : _l.stockCountNumberPrefix) || "SC-",
                stockCountNumberPadding: ((_m = currentSettings.counter) === null || _m === void 0 ? void 0 : _m.stockCountNumberPadding) || 5,
                lastStockCountNumber: ((_o = currentSettings.counter) === null || _o === void 0 ? void 0 : _o.lastStockCountNumber) || 0,
                acceptedPaymentMethods: currentSettings.acceptedPaymentMethods || [],
                defaultReturnLocationId: currentSettings.defaultReturnLocationId || null,
                defaultPoReceiveLocationId: currentSettings.defaultPoReceiveLocationId || null
            });
        }
    }, [currentSettings, form]);
    var updateSettingsMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var cleanData, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleanData = {};
                        Object.keys(data).forEach(function (key) {
                            var formValue = data[key];
                            // Comparamos con el valor inicial obtenido de currentSettings para enviar solo lo que cambió
                            // O, si currentSettings no está disponible, asumimos que queremos enviar el valor si está definido.
                            // Para simplificar, enviamos si no es undefined, el backend maneja si no hay cambios.
                            // Pero para los `nullable` string que el input convierte a "", los volvemos null.
                            if (formValue === "" &&
                                [
                                    "address",
                                    "phone",
                                    "contactEmail",
                                    "website",
                                    "currencySymbol",
                                    "quoteTerms",
                                    "repairTerms",
                                ].includes(key)) {
                                // @ts-expect-error An Error may be occur
                                cleanData[key] = null;
                            }
                            else if (formValue !== undefined) {
                                // @ts-expect-error Another error may occur
                                cleanData[key] = formValue;
                            }
                            // Específicamente para IDs de ubicación, si es el valor especial, enviar null
                            if (key === "defaultReturnLocationId" &&
                                formValue === NULL_SELECT_VALUE)
                                cleanData[key] = null;
                            if (key === "defaultPoReceiveLocationId" &&
                                formValue === NULL_SELECT_VALUE)
                                cleanData[key] = null;
                        });
                        return [4 /*yield*/, api_1["default"].patch("/stores/settings", cleanData)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (updatedData) {
            sonner_1.toast.success("Configuración actualizada.");
            queryClient.setQueryData(["storeSettings"], updatedData);
            if (updatedData.name && (user === null || user === void 0 ? void 0 : user.storeName) !== updatedData.name) {
                setAuthStoreName(updatedData.name);
            }
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al actualizar la configuración.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        updateSettingsMutation.mutate(data);
    }
    if (isLoadingSettings) {
        return (React.createElement("div", { className: "space-y-4" },
            React.createElement(page_header_1.PageHeader, { title: "Configuraci\u00F3n de la Tienda", description: "Cargando configuraci\u00F3n..." }),
            React.createElement(skeleton_1.Skeleton, { className: "h-32 w-full" }),
            React.createElement(skeleton_1.Skeleton, { className: "h-32 w-full" }),
            React.createElement(skeleton_1.Skeleton, { className: "h-32 w-full" })));
    }
    if (isError) {
        return (React.createElement("div", { className: "text-red-500" },
            "Error cargando configuraci\u00F3n: ",
            error.message));
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(page_header_1.PageHeader, { title: "Configuraci\u00F3n de la Tienda", description: "Personaliza la informaci\u00F3n y el funcionamiento de tu tienda." }),
        React.createElement(form_1.Form, __assign({}, form),
            React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-8" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Informaci\u00F3n General")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                            React.createElement(form_1.FormField, { control: form.control, name: "name", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        " ",
                                        React.createElement(form_1.FormLabel, null, "Nombre de la Tienda"),
                                        " ",
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({}, field))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null),
                                        " "));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "contactEmail", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        " ",
                                        React.createElement(form_1.FormLabel, null, "Email de Contacto"),
                                        " ",
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "email" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null),
                                        " "));
                                } })),
                        React.createElement(form_1.FormField, { control: form.control, name: "address", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Direcci\u00F3n"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(textarea_1.Textarea, __assign({}, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }),
                        React.createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                            React.createElement(form_1.FormField, { control: form.control, name: "phone", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        " ",
                                        React.createElement(form_1.FormLabel, null, "Tel\u00E9fono"),
                                        " ",
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({}, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null),
                                        " "));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "website", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        " ",
                                        React.createElement(form_1.FormLabel, null, "Sitio Web"),
                                        " ",
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "url" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null),
                                        " "));
                                } })),
                        React.createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                            React.createElement(form_1.FormField, { control: form.control, name: "currencySymbol", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        " ",
                                        React.createElement(form_1.FormLabel, null, "S\u00EDmbolo de Moneda"),
                                        " ",
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ maxLength: 5 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        " ",
                                        React.createElement(form_1.FormMessage, null),
                                        " "));
                                } }),
                            React.createElement(form_1.FormField, { control: form.control, name: "defaultTaxRate", render: function (_a) {
                                    var field = _a.field;
                                    return (React.createElement(form_1.FormItem, null,
                                        React.createElement(form_1.FormLabel, null, "Tasa de Impuesto General (Ej: 0.18 para 18%)"),
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(input_1.Input, __assign({ type: "number", step: "0.01" }, field, { 
                                                // El valor del input es string o number. Si field.value es null/undefined, usa ""
                                                value: field.value === null || field.value === undefined
                                                    ? ""
                                                    : String(field.value), onChange: function (e) {
                                                    return field.onChange(e.target.value === ""
                                                        ? null
                                                        : parseFloat(e.target.value));
                                                } }))),
                                        React.createElement(form_1.FormMessage, null)));
                                } })))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Secuencias de Numeraci\u00F3n")),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", null,
                            React.createElement("h4", { className: "font-medium mb-2" }, "Ventas"),
                            React.createElement("div", { className: "grid md:grid-cols-3 gap-4" },
                                React.createElement(form_1.FormField, { control: form.control, name: "saleNumberPrefix", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Prefijo"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "saleNumberPadding", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Relleno (d\u00EDgitos)"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "lastSaleNumber", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "\u00DAltimo N\u00FAmero Usado"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }))),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "font-medium mb-2" }, "Reparaciones"),
                            React.createElement("div", { className: "grid md:grid-cols-3 gap-4" },
                                React.createElement(form_1.FormField, { control: form.control, name: "repairNumberPrefix", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Prefijo"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "repairNumberPadding", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Relleno"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "lastRepairNumber", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "\u00DAltimo Usado"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }))),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "font-medium mb-2" }, "\u00D3rdenes de Compra"),
                            React.createElement("div", { className: "grid md:grid-cols-3 gap-4" },
                                React.createElement(form_1.FormField, { control: form.control, name: "poNumberPrefix", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Prefijo"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "poNumberPadding", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Relleno"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "lastPoNumber", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "\u00DAltimo Usado"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }))),
                        React.createElement("div", null,
                            React.createElement("h4", { className: "font-medium mb-2" }, "Conteos de Stock"),
                            React.createElement("div", { className: "grid md:grid-cols-3 gap-4" },
                                React.createElement(form_1.FormField, { control: form.control, name: "stockCountNumberPrefix", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Prefijo"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({}, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "stockCountNumberPadding", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "Relleno"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }),
                                React.createElement(form_1.FormField, { control: form.control, name: "lastStockCountNumber", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, null,
                                            React.createElement(form_1.FormLabel, null, "\u00DAltimo Usado"),
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            React.createElement(form_1.FormMessage, null)));
                                    } }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Operaciones y Pagos")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement(form_1.FormField, { control: form.control, name: "acceptedPaymentMethods", render: function () { return (React.createElement(form_1.FormItem, null,
                                React.createElement("div", { className: "mb-4" },
                                    React.createElement(form_1.FormLabel, { className: "text-base" }, "M\u00E9todos de Pago Aceptados"),
                                    React.createElement(form_1.FormDescription, null, "Selecciona los m\u00E9todos de pago que tu tienda aceptar\u00E1.")),
                                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4" }, ALL_PAYMENT_METHODS.map(function (method) { return (React.createElement(form_1.FormField, { key: method, control: form.control, name: "acceptedPaymentMethods", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (React.createElement(form_1.FormItem, { className: "flex flex-row items-center space-x-3 space-y-0" },
                                            React.createElement(form_1.FormControl, null,
                                                React.createElement(checkbox_1.Checkbox, { checked: (_b = field.value) === null || _b === void 0 ? void 0 : _b.includes(method), onCheckedChange: function (checked) {
                                                        var currentValue = field.value || [];
                                                        return checked
                                                            ? field.onChange(__spreadArrays(currentValue, [
                                                                method,
                                                            ]))
                                                            : field.onChange(currentValue.filter(function (value) { return value !== method; }));
                                                    } })),
                                            React.createElement(form_1.FormLabel, { className: "font-normal capitalize" }, method.toLowerCase().replace("_", " "))));
                                    } })); })),
                                React.createElement(form_1.FormMessage, null))); } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "defaultReturnLocationId", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Ubicaci\u00F3n Default para Devoluciones"),
                                    React.createElement(select_1.Select, { onValueChange: function (value) {
                                            return field.onChange(value === NULL_SELECT_VALUE ? null : value);
                                        }, value: field.value === null
                                            ? NULL_SELECT_VALUE
                                            : field.value || undefined },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Selecciona ubicaci\u00F3n..." }))),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: NULL_SELECT_VALUE },
                                                React.createElement("em", null, "Ninguna")),
                                            isLoadingLocations && (React.createElement(select_1.SelectItem, { value: "loading_loc_ret", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                            locations.map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "defaultPoReceiveLocationId", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Ubicaci\u00F3n Default para Recepci\u00F3n de PO"),
                                    React.createElement(select_1.Select, { onValueChange: function (value) {
                                            return field.onChange(value === NULL_SELECT_VALUE ? null : value);
                                        }, value: field.value === null
                                            ? NULL_SELECT_VALUE
                                            : field.value || undefined },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Selecciona ubicaci\u00F3n..." }))),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: NULL_SELECT_VALUE },
                                                React.createElement("em", null, "Ninguna")),
                                            isLoadingLocations && (React.createElement(select_1.SelectItem, { value: "loading_loc_po", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                            locations.map(function (loc) { return (React.createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "T\u00E9rminos y Condiciones")),
                    React.createElement(card_1.CardContent, { className: "space-y-4" },
                        React.createElement(form_1.FormField, { control: form.control, name: "quoteTerms", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "T\u00E9rminos para Cotizaciones"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(textarea_1.Textarea, __assign({ rows: 4 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "repairTerms", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "T\u00E9rminos para Reparaciones"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(textarea_1.Textarea, __assign({ rows: 4 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "defaultRepairWarrantyDays", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "D\u00EDas de Garant\u00EDa Default para Reparaciones"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ type: "number" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                return field.onChange(e.target.value === ""
                                                    ? null
                                                    : parseInt(e.target.value, 10));
                                            } }))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }))),
                React.createElement("div", { className: "flex justify-end pt-4" },
                    React.createElement(button_1.Button, { type: "submit", disabled: updateSettingsMutation.isPending || isLoadingSettings },
                        updateSettingsMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                        "Guardar Cambios"))))));
}
exports["default"] = StoreSettingsPage;
