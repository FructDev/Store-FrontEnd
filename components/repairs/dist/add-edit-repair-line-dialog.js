// components/repairs/add-edit-repair-line-dialog.tsx
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
exports.AddEditRepairLineDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums"); // Para filtrar productos
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var popover_1 = require("@/components/ui/popover");
var command_1 = require("@/components/ui/command");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react"); // React import
var use_debounce_1 = require("@/hooks/use-debounce");
var utils_1 = require("@/lib/utils");
// Schema Zod para el formulario de línea de reparación
// (Asegúrate que coincida con AddRepairLineDto y UpdateRepairLineDto del backend)
var repairLineFormSchema = z
    .object({
    id: z.string().optional(),
    productId: z.string().optional().nullable(),
    productName: z.string().optional().nullable(),
    miscDescription: z.string().max(255, "Máx 255 chars").optional().nullable(),
    quantity: z.coerce
        .number()
        .int("Debe ser entero.")
        .positive("Cantidad debe ser mayor a 0."),
    unitPrice: z.coerce.number().min(0, "Precio no puede ser negativo."),
    unitCost: z.coerce.number().min(0).optional().nullable()
})
    .refine(function (data) {
    return data.productId ||
        (data.miscDescription && data.miscDescription.trim() !== "");
}, {
    message: "Debe seleccionar un Producto/Servicio del catálogo o ingresar una Descripción Manual.",
    path: ["productId"]
})
    .refine(function (data) {
    return !(data.productId &&
        data.miscDescription &&
        data.miscDescription.trim() !== "");
}, {
    message: "No puede seleccionar un Producto del catálogo Y tener una Descripción Manual al mismo tiempo.",
    path: ["miscDescription"]
});
function AddEditRepairLineDialog(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, repairId = _a.repairId, lineData = _a.lineData, onSuccess = _a.onSuccess;
    var isEditMode = !!(lineData === null || lineData === void 0 ? void 0 : lineData.id);
    var queryClient = react_query_1.useQueryClient();
    var _b = react_1.useState(""), productSearchTerm = _b[0], setProductSearchTerm = _b[1];
    var debouncedProductSearchTerm = use_debounce_1.useDebounce(productSearchTerm, 300);
    var _c = react_1.useState(false), isProductSearchOpen = _c[0], setIsProductSearchOpen = _c[1];
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(repairLineFormSchema),
        defaultValues: __assign({ productId: null, productName: null, miscDescription: "", quantity: 1, unitPrice: 0, unitCost: null }, (lineData && {
            // Si estamos editando, poblar con lineData
            id: lineData.id,
            productId: lineData.productId || null,
            miscDescription: lineData.miscDescription || "",
            quantity: lineData.quantity,
            unitPrice: Number(lineData.unitPrice) || 0,
            unitCost: lineData.unitCost !== null && lineData.unitCost !== undefined
                ? Number(lineData.unitCost)
                : null
        }))
    });
    // Resetear y poblar el form cuando el diálogo se abre o lineData cambia
    react_1.useEffect(function () {
        var _a;
        if (isOpen) {
            if (isEditMode && lineData) {
                form.reset({
                    id: lineData.id,
                    productId: lineData.productId || null,
                    productName: ((_a = lineData.product) === null || _a === void 0 ? void 0 : _a.name) || null,
                    miscDescription: lineData.miscDescription || "",
                    quantity: lineData.quantity,
                    unitPrice: Number(lineData.unitPrice) || 0,
                    unitCost: lineData.unitCost !== null && lineData.unitCost !== undefined
                        ? Number(lineData.unitCost)
                        : null
                });
            }
            else {
                // Modo creación
                form.reset({
                    productId: null,
                    productName: null,
                    miscDescription: "",
                    quantity: 1,
                    unitPrice: 0,
                    unitCost: null
                });
            }
        }
    }, [isOpen, lineData, isEditMode, form]);
    // Fetch de productos/servicios para el selector
    var _d = react_query_1.useQuery({
        queryKey: ["productsForRepairLineSelect", debouncedProductSearchTerm],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, desiredProductTypes, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!debouncedProductSearchTerm &&
                            !isEditMode &&
                            !form.getValues("productId"))
                            return [2 /*return*/, []]; // No buscar si no hay término y no estamos editando con un producto ya seleccionado
                        params = {
                            isActive: true,
                            limit: 15
                        };
                        if (debouncedProductSearchTerm)
                            params.search = debouncedProductSearchTerm;
                        desiredProductTypes = [
                            prisma_enums_1.ProductType.SERVICE,
                            prisma_enums_1.ProductType.SPARE_PART,
                        ];
                        params.productTypes_in = desiredProductTypes.join(","); // Enviar como "SERVICE,SPARE_PART"
                        return [4 /*yield*/, api_1["default"].get("/inventory/products", { params: params })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.data || response.data || []];
                }
            });
        }); },
        enabled: isOpen
    }), productsForSelect = _d.data, isLoadingProducts = _d.isLoading;
    var saveLineMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            // Construir payload para AddRepairLineDto o UpdateRepairLineDto
                            productId: data.productId || null,
                            miscDescription: data.productId ? null : data.miscDescription,
                            quantity: data.quantity,
                            unitPrice: data.unitPrice,
                            unitCost: data.unitCost
                        };
                        if (!(isEditMode && (lineData === null || lineData === void 0 ? void 0 : lineData.id))) return [3 /*break*/, 2];
                        return [4 /*yield*/, api_1["default"].patch("/repairs/" + repairId + "/lines/" + lineData.id, payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2: return [4 /*yield*/, api_1["default"].post("/repairs/" + repairId + "/lines", payload)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function () {
            sonner_1.toast.success("L\u00EDnea de reparaci\u00F3n " + (isEditMode ? "actualizada" : "añadida") + " exitosamente.");
            onSuccess(); // Llama al callback para refrescar la lista de líneas en la página padre
            onOpenChange(false); // Cierra este diálogo
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al " + (isEditMode ? "actualizar" : "añadir") + " la l\u00EDnea.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg.toString());
        }
    });
    function onSubmit(data) {
        saveLineMutation.mutate(data);
    }
    var handleProductSelection = function (product) {
        form.setValue("productId", product.id, { shouldValidate: true });
        form.setValue("productName", product.name, { shouldValidate: true });
        form.setValue("miscDescription", "", { shouldValidate: true }); // Limpiar descripción manual
        form.setValue("unitPrice", Number(product.sellingPrice) || 0, {
            shouldValidate: true
        });
        // Opcional: setear unitCost si el producto lo tiene
        // form.setValue("unitCost", Number(product.costPrice) || null, { shouldValidate: true });
        setIsProductSearchOpen(false);
        setProductSearchTerm(product.name); // Mostrar nombre en input de búsqueda
    };
    if (!isOpen)
        return null;
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null,
                    isEditMode ? "Editar" : "Añadir",
                    " L\u00EDnea de Servicio/Repuesto"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, isEditMode
                    ? "Modifica los detalles de la línea."
                    : "Añade un nuevo servicio o repuesto a la orden de reparación.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-2" },
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "productId", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-col" },
                                react_1["default"].createElement(form_1.FormLabel, null, "Producto/Servicio del Cat\u00E1logo (Opcional)"),
                                react_1["default"].createElement(popover_1.Popover, { open: isProductSearchOpen, onOpenChange: setIsProductSearchOpen },
                                    react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", className: utils_1.cn("w-full justify-between", !field.value && "text-muted-foreground") },
                                                form.watch("productName") || // Usa el productName del estado del formulario
                                                    (field.value
                                                        ? "Producto seleccionado (ID)"
                                                        : "Seleccionar producto/servicio..."),
                                                react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })))),
                                    react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[--radix-popover-trigger-width] p-0" },
                                        react_1["default"].createElement(command_1.Command, { filter: function (value, search) {
                                                return value.toLowerCase().includes(search.toLowerCase())
                                                    ? 1
                                                    : 0;
                                            } },
                                            react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar producto/servicio...", value: productSearchTerm, onValueChange: function (search) {
                                                    setProductSearchTerm(search);
                                                    // Si el usuario borra la búsqueda, limpiar productId
                                                    if (search === "")
                                                        form.setValue("productId", null);
                                                } }),
                                            react_1["default"].createElement(command_1.CommandList, null,
                                                isLoadingProducts && (react_1["default"].createElement(command_1.CommandItem, { disabled: true }, "Buscando...")),
                                                react_1["default"].createElement(command_1.CommandEmpty, null, "No se encontraron productos/servicios."),
                                                (productsForSelect || []).map(function (product) { return (react_1["default"].createElement(command_1.CommandItem, { key: product.id, value: product.name + (product.sku || ""), onSelect: function () { return handleProductSelection(product); } },
                                                    react_1["default"].createElement(lucide_react_1.Check, { className: utils_1.cn("mr-2 h-4 w-4", product.id === field.value
                                                            ? "opacity-100"
                                                            : "opacity-0") }),
                                                    product.name,
                                                    " ",
                                                    product.sku && "(" + product.sku + ")")); }))))),
                                react_1["default"].createElement(form_1.FormDescription, null, "Deja vac\u00EDo si es una descripci\u00F3n manual."),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "miscDescription", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "O Descripci\u00F3n Manual (si no es de cat\u00E1logo)"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Limpieza de contactos, Resistencia XYZ" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", disabled: !!form.watch("productId"), onChange: function (e) {
                                            field.onChange(e.target.value);
                                            if (e.target.value)
                                                form.setValue("productId", null); // Limpiar productId si se escribe aquí
                                        } }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "quantity", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    " ",
                                    react_1["default"].createElement(form_1.FormLabel, null, "Cantidad*"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ type: "number", min: 1 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                return field.onChange(parseInt(e.target.value) || 1);
                                            } }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } }),
                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "unitPrice", render: function (_a) {
                                var _b;
                                var field = _a.field;
                                return (react_1["default"].createElement(form_1.FormItem, null,
                                    " ",
                                    react_1["default"].createElement(form_1.FormLabel, null, "Precio Unitario*"),
                                    react_1["default"].createElement(form_1.FormControl, null,
                                        react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                return field.onChange(parseFloat(e.target.value) || 0);
                                            } }))),
                                    react_1["default"].createElement(form_1.FormMessage, null)));
                            } })),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "unitCost", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                " ",
                                react_1["default"].createElement(form_1.FormLabel, null, "Costo Unitario (Opcional, para repuestos)"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0 }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                            return field.onChange(e.target.value === ""
                                                ? null
                                                : parseFloat(e.target.value));
                                        } }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-6" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: saveLineMutation.isPending }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: saveLineMutation.isPending ||
                                (!form.formState.isDirty && isEditMode) },
                            saveLineMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            isEditMode ? "Guardar Cambios" : "Añadir Línea")))))));
}
exports.AddEditRepairLineDialog = AddEditRepairLineDialog;
