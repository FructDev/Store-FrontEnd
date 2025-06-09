// components/inventory/catalog/supplier-form-dialog.tsx
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
exports.SupplierFormDialog = void 0;
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
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Schema Zod para el formulario de proveedor (refleja CreateSupplierDto y UpdateSupplierDto)
var supplierFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Nombre debe tener al menos 2 caracteres." })
        .max(100),
    contactName: z.string().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    email: z
        .string()
        .email({ message: "Email inválido." })
        .max(100)
        .optional()
        .nullable(),
    address: z.string().max(255).optional().nullable(),
    notes: z.string().max(500).optional().nullable()
});
function SupplierFormDialog(_a) {
    var _this = this;
    var supplier = _a.supplier, triggerButton = _a.triggerButton, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var queryClient = react_query_1.useQueryClient();
    var isEditMode = !!(supplier === null || supplier === void 0 ? void 0 : supplier.id);
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(supplierFormSchema),
        defaultValues: {
            name: "",
            contactName: "",
            phone: "",
            email: "",
            address: "",
            notes: ""
        }
    });
    react_1.useEffect(function () {
        if (isOpen) {
            if (isEditMode && supplier) {
                form.reset({
                    name: supplier.name,
                    contactName: supplier.contactName || "",
                    phone: supplier.phone || "",
                    email: supplier.email || "",
                    address: supplier.address || "",
                    notes: supplier.notes || ""
                });
            }
            else {
                form.reset({
                    name: "",
                    contactName: "",
                    phone: "",
                    email: "",
                    address: "",
                    notes: ""
                });
            }
        }
    }, [supplier, isEditMode, isOpen, form]);
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var apiData, url, method, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apiData = __assign(__assign({}, data), { contactName: data.contactName || null, phone: data.phone || null, email: data.email || null, address: data.address || null, notes: data.notes || null });
                        url = isEditMode && supplier
                            ? "/inventory/suppliers/" + supplier.id
                            : "/inventory/suppliers";
                        method = isEditMode ? "patch" : "post";
                        return [4 /*yield*/, api_1["default"][method](url, apiData)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (createdOrUpdatedSupplier) {
            sonner_1.toast.success("Proveedor \"" + createdOrUpdatedSupplier.name + "\" " + (isEditMode ? "actualizado" : "creado") + " correctamente.");
            queryClient.invalidateQueries({ queryKey: ["inventorySuppliers"] });
            onOpenChange(false); // Cerrar diálogo
            if (onSuccess)
                onSuccess();
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al " + (isEditMode ? "actualizar" : "crear") + " proveedor.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        mutation.mutate(data);
    }
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        !triggerButton && isEditMode && null,
        " ",
        !triggerButton && !isEditMode && (react_1["default"].createElement(dialog_1.DialogTrigger, { asChild: true },
            react_1["default"].createElement(button_1.Button, null,
                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                " Crear Proveedor"))),
        triggerButton && react_1["default"].createElement(dialog_1.DialogTrigger, { asChild: true }, triggerButton),
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-md" },
            " ",
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, isEditMode ? "Editar Proveedor" : "Crear Nuevo Proveedor"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, isEditMode
                    ? "Modifica los detalles del proveedor."
                    : "Añade un nuevo proveedor a tu lista.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4" },
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "name", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "Nombre del Proveedor"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Compucell RD" }, field))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "contactName", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null,
                                    "Nombre de Contacto",
                                    " ",
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(Opcional)")),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Ana Torres" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "phone", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null,
                                    "Tel\u00E9fono",
                                    " ",
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(Opcional)")),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: 809-123-4567" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null,
                                    "Email",
                                    " ",
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(Opcional)")),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ type: "email", placeholder: "Ej: ventas@proveedor.com" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "address", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null,
                                    "Direcci\u00F3n",
                                    " ",
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(Opcional)")),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Direcci\u00F3n completa del proveedor" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null,
                                    "Notas",
                                    " ",
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(Opcional)")),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Informaci\u00F3n adicional sobre el proveedor" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: mutation.isPending }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: mutation.isPending },
                            mutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            isEditMode ? "Guardar Cambios" : "Crear Proveedor")))))));
}
exports.SupplierFormDialog = SupplierFormDialog;
