// components/inventory/purchase-orders/edit-po-dialog.tsx
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
exports.EditPODialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var date_picker_1 = require("@/components/ui/date-picker"); // Tu componente DatePicker
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var date_fns_1 = require("date-fns"); // Para formatear fechas para el DTO backend
var NULL_SELECT_VALUE = "__NULL_VALUE__"; // Para Selects opcionales
// Schema Zod para el formulario de edición de PO (campos generales)
var editPOFormSchema = z.object({
    supplierId: z.string().uuid("Proveedor es requerido.").nullable(),
    orderDate: z.date({ required_error: "Fecha de orden es requerida." }),
    expectedDate: z.date().optional().nullable(),
    notes: z
        .string()
        .max(500, "Máximo 500 caracteres.")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
function EditPODialog(_a) {
    var _this = this;
    var po = _a.po, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(editPOFormSchema),
        defaultValues: {
            // Se llenarán en useEffect
            supplierId: null,
            orderDate: new Date(),
            expectedDate: null,
            notes: ""
        }
    });
    // Fetch de proveedores para el Select
    var _b = react_query_1.useQuery({
        queryKey: ["allSuppliersForPOEditForm"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/suppliers?isActive=true&limit=100")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), suppliers = _b.data, isLoadingSuppliers = _b.isLoading;
    react_1.useEffect(function () {
        if (po && isOpen) {
            form.reset({
                supplierId: po.supplierId || null,
                orderDate: po.orderDate ? new Date(po.orderDate) : new Date(),
                expectedDate: po.expectedDate ? new Date(po.expectedDate) : null,
                notes: po.notes || ""
            });
        }
        else if (!po && isOpen) {
            // Si se abre sin PO (no debería pasar para editar)
            form.reset({
                supplierId: null,
                orderDate: new Date(),
                expectedDate: null,
                notes: ""
            });
        }
    }, [po, isOpen, form]);
    var updatePOMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(po === null || po === void 0 ? void 0 : po.id))
                            throw new Error("ID de Orden de Compra no disponible para actualización.");
                        payload = __assign(__assign({}, data), { 
                            // Formatear fechas a string YYYY-MM-DD si el backend lo espera así para PATCH
                            // o asegurarse que el backend DTO con @Type(() => Date) maneje bien el objeto Date.
                            // Si el backend espera string:
                            orderDate: data.orderDate
                                ? date_fns_1.format(data.orderDate, "yyyy-MM-dd")
                                : undefined, expectedDate: data.expectedDate
                                ? date_fns_1.format(data.expectedDate, "yyyy-MM-dd")
                                : null });
                        return [4 /*yield*/, api_1["default"].patch("/inventory/purchase-orders/" + po.id, payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (updatedPO) {
            sonner_1.toast.success("Orden de Compra #" + updatedPO.poNumber + " actualizada.");
            queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] }); // Refrescar lista
            queryClient.invalidateQueries({
                queryKey: ["purchaseOrderDetails", po === null || po === void 0 ? void 0 : po.id]
            }); // Refrescar detalle si está abierto
            onOpenChange(false); // Cerrar diálogo
            if (onSuccess)
                onSuccess();
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al actualizar la Orden de Compra.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        updatePOMutation.mutate(data);
    }
    if (!po)
        return null; // No renderizar si no hay PO
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null,
                    "Editar Orden de Compra: ",
                    po.poNumber),
                React.createElement(dialog_1.DialogDescription, null, "Modifica los detalles generales de la PO. Las l\u00EDneas de producto se gestionan por separado.")),
            React.createElement(form_1.Form, __assign({}, form),
                React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4" },
                    React.createElement(form_1.FormField, { control: form.control, name: "supplierId", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Proveedor*"),
                                React.createElement(select_1.Select, { onValueChange: function (value) {
                                        return field.onChange(value === NULL_SELECT_VALUE ? null : value);
                                    }, value: field.value === null
                                        ? NULL_SELECT_VALUE
                                        : field.value || undefined, disabled: isLoadingSuppliers },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Selecciona un proveedor..." }))),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: NULL_SELECT_VALUE },
                                            React.createElement("em", null, "Mantener actual / Ninguno si es posible")),
                                        isLoadingSuppliers && (React.createElement(select_1.SelectItem, { value: "loading-sup", disabled: true }, "Cargando...")), suppliers === null || suppliers === void 0 ? void 0 :
                                        suppliers.map(function (s) { return (React.createElement(select_1.SelectItem, { key: s.id, value: s.id }, s.name)); }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement(form_1.FormField, { control: form.control, name: "orderDate", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "flex flex-col" },
                                    React.createElement(form_1.FormLabel, null, "Fecha de Orden*"),
                                    React.createElement(date_picker_1.DatePicker, { selected: field.value, onSelect: field.onChange, placeholderText: "Fecha de Orden" }),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "expectedDate", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "flex flex-col" },
                                    React.createElement(form_1.FormLabel, null, "Fecha de Entrega Esperada"),
                                    React.createElement(date_picker_1.DatePicker, { selected: field.value, onSelect: field.onChange, placeholderText: "Fecha Esperada" }),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                    React.createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Notas Adicionales"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(textarea_1.Textarea, __assign({ placeholder: "Notas internas o para el proveedor..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: updatePOMutation.isPending }, "Cancelar"),
                        React.createElement(button_1.Button, { type: "submit", disabled: updatePOMutation.isPending || !form.formState.isDirty },
                            updatePOMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Guardar Cambios")))))));
}
exports.EditPODialog = EditPODialog;
