// components/inventory/purchase-orders/receive-stock-dialog.tsx
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
exports.ReceiveStockDialog = void 0;
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
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var react_scroll_area_1 = require("@radix-ui/react-scroll-area");
var card_1 = require("@/components/ui/card");
var serializedItemSchema = z.object({
    imei: z
        .string()
        .min(5, "IMEI/Serial debe tener al menos 5 caracteres.")
        .max(50),
    condition: z
        .string()
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    notes: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
// Schema Zod dinámico
var generateReceiveStockSchema = function (isSerialized, maxPendingQuantity // Cantidad máxima que se puede recibir
) {
    return z
        .object({
        locationId: z.string().min(1, "Ubicación de destino es requerida."),
        // Este campo 'receivedQuantity' es el que el usuario ingresa para NO SERIALIZADOS
        // o el que se calcula para SERIALIZADOS.
        receivedQuantity: z.coerce
            .number({ invalid_type_error: "Cantidad debe ser un número." })
            .int({ message: "Cantidad debe ser un entero." })
            .min(1, "Cantidad recibida debe ser al menos 1.")
            .max(maxPendingQuantity, "No puedes recibir m\u00E1s de " + maxPendingQuantity + " unidades pendientes."),
        // 'serializedItems' es el array de objetos para productos serializados
        // y es donde el usuario ingresará los datos de IMEI, condición, notas.
        serializedItems: isSerialized
            ? z
                .array(serializedItemSchema)
                .min(1, "Debes añadir al menos un ítem serializado.")
                .max(maxPendingQuantity, "No puedes recibir m\u00E1s de " + maxPendingQuantity + " \u00EDtems serializados.")
            : z.array(serializedItemSchema).optional()["default"]([])
    })
        .refine(function (data) {
        if (isSerialized) {
            // Para serializados, la cantidad de items en el array DEBE coincidir con receivedQuantity.
            // O, más bien, receivedQuantity SE DERIVA de serializedItems.length.
            // El refine aquí asegura que si hay serializedItems, receivedQuantity coincida con su longitud.
            // Y que serializedItems.length no exceda maxPendingQuantity (ya cubierto por .max en serializedItems).
            return data.serializedItems
                ? data.serializedItems.length === data.receivedQuantity
                : data.receivedQuantity === 0;
        }
        return true; // Para no serializados, la validación de maxQuantity ya está en receivedQuantity
    }, {
        // Este mensaje se mostrará si el conteo de serializedItems no coincide con quantityReceived
        // (si el usuario edita quantityReceived manualmente para serializados, lo cual no debería poder hacer)
        message: "La cantidad de ítems serializados debe coincidir con la Cantidad Recibida.",
        path: ["receivedQuantity"]
    });
};
function ReceiveStockDialog(_a) {
    var _this = this;
    var _b, _c, _d;
    var poId = _a.poId, line = _a.line, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onStockReceived = _a.onStockReceived;
    // const queryClient = useQueryClient();
    var isSerializedProduct = !!((_b = line === null || line === void 0 ? void 0 : line.product) === null || _b === void 0 ? void 0 : _b.tracksImei);
    var pendingQuantity = line
        ? line.orderedQuantity - line.receivedQuantity
        : 0;
    var currentSchema = react_1.useMemo(function () { return generateReceiveStockSchema(isSerializedProduct, pendingQuantity); }, [isSerializedProduct, pendingQuantity]);
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(currentSchema),
        defaultValues: {
            locationId: undefined,
            receivedQuantity: undefined,
            serializedItems: []
        }
    });
    var _e = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "serializedItems"
    }), fields = _e.fields, append = _e.append, remove = _e.remove;
    react_1.useEffect(function () {
        if (isOpen && line) {
            var defaultQtyForNonSerialized = !isSerializedProduct
                ? pendingQuantity > 0
                    ? Math.min(1, pendingQuantity)
                    : undefined
                : undefined;
            form.reset({
                locationId: undefined,
                receivedQuantity: defaultQtyForNonSerialized,
                // Para serializados, iniciar con un campo si pendingQuantity > 0, o vacío
                serializedItems: isSerializedProduct && pendingQuantity > 0
                    ? [{ imei: "", condition: "Nuevo en PO", notes: "" }]
                    : []
            });
        }
    }, [line, isOpen, form, isSerializedProduct, pendingQuantity]);
    var watchedSerializedItems = form.watch("serializedItems");
    react_1.useEffect(function () {
        if (isSerializedProduct) {
            // La cantidad recibida es la longitud del array de items serializados
            form.setValue("receivedQuantity", (watchedSerializedItems === null || watchedSerializedItems === void 0 ? void 0 : watchedSerializedItems.length) || 0, {
                shouldValidate: true
            });
        }
    }, [watchedSerializedItems, isSerializedProduct, form]);
    // Cargar ubicaciones para el Select
    var _f = react_query_1.useQuery({
        queryKey: ["allActiveLocationsForReceiving"],
        queryFn: function () {
            return api_1["default"]
                .get("/inventory/locations?isActive=true&limit=100")
                .then(function (res) { return res.data.data || res.data; });
        }
    }), locations = _f.data, isLoadingLocations = _f.isLoading;
    var mutation = react_query_1.useMutation({
        mutationFn: function (payload) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Recibe el payload ya construido
                        if (!line)
                            throw new Error("Línea de PO no seleccionada.");
                        console.log("Enviando para recibir stock (payload final):", payload);
                        return [4 /*yield*/, api_1["default"].post("/inventory/purchase-orders/" + poId + "/lines/" + line.id + "/receive", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function () {
            var _a;
            sonner_1.toast.success("Stock recibido para \"" + (((_a = line === null || line === void 0 ? void 0 : line.product) === null || _a === void 0 ? void 0 : _a.name) || "producto") + "\" exitosamente.");
            onStockReceived(); // Llama al callback del padre (para invalidar query de PO y cerrar diálogo)
        },
        onError: function (error) {
            var _a, _b, _c;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al registrar recepción de stock.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
            console.error("Receive stock error:", ((_c = error.response) === null || _c === void 0 ? void 0 : _c.data) || error);
        }
    });
    function onSubmit(data) {
        // data tiene serializedItems: Array<{imei, condition?, notes?}>
        if (!line)
            return;
        var payloadToSubmit;
        if (isSerializedProduct) {
            if (!data.serializedItems || data.serializedItems.length === 0) {
                // Zod ya debería haber validado esto con .min(1) en el array
                form.setError("serializedItems", {
                    // O un error general
                    message: "Debe añadir al menos un ítem serializado."
                });
                return;
            }
            // La validación refine de Zod ya comparó data.serializedItems.length con data.receivedQuantity
            // y data.receivedQuantity se actualiza por el useEffect.
            // No necesitamos re-validar explícitamente aquí si Zod funciona.
            payloadToSubmit = {
                locationId: data.locationId,
                receivedQuantity: data.serializedItems.length,
                serializedItems: data.serializedItems
            };
        }
        else {
            // No serializado
            if (data.receivedQuantity === undefined ||
                data.receivedQuantity === null ||
                data.receivedQuantity <= 0) {
                form.setError("receivedQuantity", {
                    message: "Cantidad debe ser positiva."
                });
                return;
            }
            if (data.receivedQuantity > pendingQuantity) {
                form.setError("receivedQuantity", {
                    message: "No puedes recibir m\u00E1s de " + pendingQuantity + " unidades."
                });
                return;
            }
            payloadToSubmit = {
                locationId: data.locationId,
                receivedQuantity: data.receivedQuantity
            };
        }
        console.log("Datos del formulario VALIDADOS POR ZOD listos para mutación:", data);
        console.log("Payload que se enviará al backend:", payloadToSubmit);
        mutation.mutate(payloadToSubmit); // Enviar el payload correcto
    }
    if (!line || !isOpen)
        return null; // No renderizar si no hay línea o no está abierto
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] flex flex-col" },
            " ",
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null,
                    "Recibir Stock: ", (_c = line.product) === null || _c === void 0 ? void 0 :
                    _c.name),
                react_1["default"].createElement(dialog_1.DialogDescription, null,
                    "Ordenado: ",
                    line.orderedQuantity,
                    " | Ya Recibido:",
                    " ",
                    line.receivedQuantity,
                    " | Pendiente: ",
                    pendingQuantity)),
            pendingQuantity > 0 ? (react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-2 flex-1 flex flex-col overflow-hidden" },
                    react_1["default"].createElement(react_scroll_area_1.ScrollArea, { className: "flex-1 pr-3 -mr-3" },
                        " ",
                        react_1["default"].createElement("div", { className: "space-y-4 pr-1" },
                            " ",
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "locationId", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        react_1["default"].createElement(form_1.FormLabel, null, "Ubicaci\u00F3n de Destino*"),
                                        react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingLocations },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Selecciona la ubicaci\u00F3n..." }))),
                                            react_1["default"].createElement(select_1.SelectContent, null,
                                                isLoadingLocations && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-loc", disabled: true }, "Cargando...")), locations === null || locations === void 0 ? void 0 :
                                                locations.map(function (loc) { return (react_1["default"].createElement(select_1.SelectItem, { key: loc.id, value: loc.id }, loc.name)); }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            !isSerializedProduct && (react_1["default"].createElement(form_1.FormField, { control: form.control, name: "receivedQuantity", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        react_1["default"].createElement(form_1.FormLabel, null, "Cantidad Recibida Hoy*"),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(input_1.Input, __assign({ type: "number", min: 1, max: pendingQuantity }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                    var val = e.target.value;
                                                    field.onChange(val === "" ? undefined : parseInt(val, 10));
                                                } }))),
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } })),
                            isSerializedProduct && (react_1["default"].createElement("div", { className: "space-y-3 pt-2" },
                                react_1["default"].createElement("div", { className: "flex justify-between items-baseline" },
                                    react_1["default"].createElement(form_1.FormLabel, null, "IMEIs / N\u00FAmeros de Serie Recibidos*"),
                                    react_1["default"].createElement(form_1.FormDescription, { className: "text-xs" },
                                        "(Total: ",
                                        fields.length,
                                        ")")),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "receivedQuantity", render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "sr-only" },
                                            react_1["default"].createElement(form_1.FormLabel, null, "Cantidad (Calculada)"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number" }, field, { readOnly: true }))),
                                            react_1["default"].createElement(form_1.FormMessage, null)));
                                    } }),
                                react_1["default"].createElement("div", { className: "space-y-3 max-h-[250px] overflow-y-auto border p-2 rounded-md" },
                                    " ",
                                    fields.length === 0 && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground py-2 text-center" }, "A\u00F1ade \u00EDtems serializados.")),
                                    fields.map(function (itemField, index) { return (react_1["default"].createElement(card_1.Card, { key: itemField.id, className: "p-3 space-y-3 relative bg-muted/50" },
                                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return remove(index); }, className: "absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive/80 z-10" },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })),
                                        react_1["default"].createElement("p", { className: "text-xs font-medium text-muted-foreground" },
                                            "\u00CDtem Serializado #",
                                            index + 1),
                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "serializedItems." + index + ".imei", render: function (_a) {
                                                var field = _a.field;
                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "IMEI/Serial*"),
                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ingresa IMEI o N/S" }, field))),
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormMessage, null)));
                                            } }),
                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "serializedItems." + index + ".condition", render: function (_a) {
                                                var _b;
                                                var field = _a.field;
                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Condici\u00F3n"),
                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                        react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Nuevo, Caja Abierta" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormMessage, null)));
                                            } }),
                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "serializedItems." + index + ".notes", render: function (_a) {
                                                var _b;
                                                var field = _a.field;
                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Notas"),
                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                        react_1["default"].createElement(textarea_1.Textarea, __assign({ rows: 1, placeholder: "Notas para este \u00EDtem..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                                    " ",
                                                    react_1["default"].createElement(form_1.FormMessage, null)));
                                            } }))); })),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                        return append({
                                            imei: "",
                                            condition: "Nuevo en PO",
                                            notes: ""
                                        });
                                    }, disabled: fields.length >= pendingQuantity || mutation.isPending, className: "mt-2" },
                                    react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                                    " A\u00F1adir \u00CDtem Serializado"),
                                ((_d = form.formState.errors.serializedItems) === null || _d === void 0 ? void 0 : _d.root) && (react_1["default"].createElement("p", { className: "text-sm font-medium text-destructive mt-1" }, form.formState.errors.serializedItems.root.message)),
                                form.formState.errors.receivedQuantity && (react_1["default"].createElement("p", { className: "text-sm font-medium text-destructive mt-1" }, form.formState.errors.receivedQuantity.message)))))),
                    " ",
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-4 border-t mt-auto" },
                        " ",
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: mutation.isPending },
                            " ",
                            "Cancelar",
                            " "),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: mutation.isPending },
                            mutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Confirmar Recepci\u00F3n"))))) : (react_1["default"].createElement("div", { className: "py-4 text-center" },
                react_1["default"].createElement("p", { className: "text-green-600 font-medium" }, "\u00A1Todas las unidades de esta l\u00EDnea ya han sido recibidas!"),
                react_1["default"].createElement(dialog_1.DialogFooter, { className: "mt-6" },
                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); } }, "Cerrar")))))));
}
exports.ReceiveStockDialog = ReceiveStockDialog;
