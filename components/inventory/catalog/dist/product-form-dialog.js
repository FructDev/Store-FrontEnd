// components/inventory/catalog/product-form-dialog.tsx
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
exports.ProductFormDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums"); // Usa tu enum local
var client_1 = require("@prisma/client"); // Para Prisma.JsonNull
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var input_1 = require("@/components/ui/input");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var switch_1 = require("@/components/ui/switch");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var productTypeLabels = {
    GENERAL: "General",
    NEW: "Nuevo (Serializado)",
    USED: "Usado (Serializado)",
    REFURBISHED: "Reacondicionado (Serializado)",
    ACCESSORY: "Accesorio",
    SPARE_PART: "Repuesto",
    SERVICE: "Servicio",
    BUNDLE: "Bundle/Kit",
    OTHER: "Otro"
};
var ALL_PRODUCT_TYPES = Object.values(prisma_enums_1.ProductType);
var NULL_SELECT_VALUE = "__NULL__";
var productFormSchema = z.object({
    name: z.string().min(2, "Nombre debe tener al menos 2 caracteres.").max(100),
    sku: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    description: z
        .string()
        .max(500)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    brand: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    model: z
        .string()
        .max(50)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    productType: z.nativeEnum(prisma_enums_1.ProductType, {
        required_error: "Tipo es requerido."
    }),
    tracksImei: z.boolean()["default"](false),
    costPrice: z.coerce
        .number()
        .min(0, "Costo debe ser >= 0.")
        .optional()
        .nullable(),
    sellingPrice: z.coerce
        .number()
        .min(0, "Precio debe ser >= 0.")
        .optional()
        .nullable(),
    reorderLevel: z.coerce
        .number()
        .int("Debe ser entero.")
        .min(0)
        .optional()
        .nullable(),
    idealStockLevel: z.coerce
        .number()
        .int("Debe ser entero.")
        .min(0)
        .optional()
        .nullable(),
    attributesArray: z
        .array(z.object({
        key: z
            .string()
            .min(1, "Nombre de atributo no puede estar vacío.")
            .max(50),
        value: z
            .string()
            .min(1, "Valor de atributo no puede estar vacío.")
            .max(100)
    }))
        .optional()["default"]([]),
    isActive: z.boolean()["default"](true),
    categoryId: z
        .string()
        .min(1, "Debe seleccionar una categoría o ninguna")
        .optional()
        .nullable(),
    supplierId: z
        .string()
        .min(1, "Debe seleccionar un proveedor o ninguno")
        .optional()
        .nullable(),
    bundleComponentsData: z
        .array(z.object({
        componentProductId: z
            .string()
            .min(1, { message: "Debe seleccionar un producto componente." }),
        quantity: z.coerce.number().int().positive("Cantidad debe ser > 0.")
    }))
        .optional()["default"]([])
});
function ProductFormDialog(_a) {
    var _this = this;
    var product = _a.product, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var queryClient = react_query_1.useQueryClient();
    var isEditMode = !!(product === null || product === void 0 ? void 0 : product.id);
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(productFormSchema),
        defaultValues: {
            // Estos se sobrescribirán por el useEffect al abrir/cambiar producto
            name: "",
            sku: null,
            description: null,
            brand: null,
            model: null,
            productType: prisma_enums_1.ProductType.GENERAL,
            tracksImei: false,
            costPrice: null,
            sellingPrice: null,
            reorderLevel: null,
            idealStockLevel: null,
            attributes: null,
            isActive: true,
            categoryId: null,
            supplierId: null,
            bundleComponentsData: []
        }
    });
    var _b = react_hook_form_1.useFieldArray({
        // Añadir replace
        control: form.control,
        name: "bundleComponentsData"
    }), fields = _b.fields, append = _b.append, remove = _b.remove, replace = _b.replace;
    var _c = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "attributesArray"
    }), attributeFields = _c.fields, appendAttribute = _c.append, removeAttribute = _c.remove;
    var _d = react_1.useState(null), productToAction = _d[0], setProductToAction = _d[1];
    var _e = react_1.useState(false), isDeactivateActivateDialogOpen = _e[0], setIsDeactivateActivateDialogOpen = _e[1];
    var _f = react_1.useState(false), isDeleteDialogOpen = _f[0], setIsDeleteDialogOpen = _f[1];
    var watchedProductType = form.watch("productType");
    // Fetch para Categorías
    var _g = react_query_1.useQuery({
        queryKey: ["allCategoriesForProductForm"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("FETCHING Categories: /inventory/categories?limit=500&page=1");
                        return [4 /*yield*/, api_1["default"].get("/inventory/categories?limit=500&page=1")];
                    case 1:
                        response = _a.sent();
                        console.log("RAW Category Response:", response.data);
                        // Asumimos que el backend devuelve { data: Category[], ... }
                        if (response.data && Array.isArray(response.data.data)) {
                            return [2 /*return*/, response.data.data];
                        }
                        // Si la respuesta no tiene .data.data pero response.data es el array (menos probable con paginación)
                        if (Array.isArray(response.data)) {
                            return [2 /*return*/, response.data];
                        }
                        console.warn("Formato inesperado de respuesta para categorías:", response.data);
                        return [2 /*return*/, []]; // Devolver array vacío si el formato no es el esperado
                }
            });
        }); }
    }), categories = _g.data, isLoadingCategories = _g.isLoading;
    // Fetch para Proveedores
    var _h = react_query_1.useQuery({
        queryKey: ["allSuppliersForProductForm"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("FETCHING Suppliers: /inventory/suppliers?limit=100&page=1");
                        return [4 /*yield*/, api_1["default"].get("/inventory/suppliers?limit=100&page=1")];
                    case 1:
                        response = _a.sent();
                        console.log("RAW Supplier Response:", response.data);
                        if (response.data && Array.isArray(response.data.data)) {
                            return [2 /*return*/, response.data.data];
                        }
                        if (Array.isArray(response.data)) {
                            return [2 /*return*/, response.data];
                        }
                        console.warn("Formato inesperado de respuesta para proveedores:", response.data);
                        return [2 /*return*/, []];
                }
            });
        }); }
    }), suppliers = _h.data, isLoadingSuppliers = _h.isLoading;
    // Fetch para Productos (para el selector de componentes del bundle)
    var _j = react_query_1.useQuery({
        queryKey: ["allProductsForBundleComponents"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("FETCHING Products: /inventory/products?limit=1000&isActive=true&page=1");
                        return [4 /*yield*/, api_1["default"].get("/inventory/products?limit=1000&isActive=true&page=1")];
                    case 1:
                        response = _a.sent();
                        console.log("RAW All Products Response:", response.data);
                        if (response.data && Array.isArray(response.data.data)) {
                            return [2 /*return*/, response.data.data];
                        }
                        if (Array.isArray(response.data)) {
                            return [2 /*return*/, response.data];
                        }
                        console.warn("Formato inesperado de respuesta para todos los productos:", response.data);
                        return [2 /*return*/, []];
                }
            });
        }); },
        enabled: watchedProductType === prisma_enums_1.ProductType.BUNDLE
    }), allProducts = _j.data, isLoadingAllProducts = _j.isLoading;
    react_1.useEffect(function () {
        var _a, _b, _c;
        if (isOpen) {
            if (isEditMode && product) {
                form.reset({
                    name: product.name,
                    sku: product.sku || null,
                    description: product.description || null,
                    brand: product.brand || null,
                    model: product.model || null,
                    productType: product.productType,
                    tracksImei: product.tracksImei,
                    costPrice: product.costPrice !== null && product.costPrice !== undefined
                        ? parseFloat(String(product.costPrice))
                        : null,
                    sellingPrice: product.sellingPrice !== null && product.sellingPrice !== undefined
                        ? parseFloat(String(product.sellingPrice))
                        : null,
                    reorderLevel: (_a = product.reorderLevel) !== null && _a !== void 0 ? _a : null,
                    idealStockLevel: (_b = product.idealStockLevel) !== null && _b !== void 0 ? _b : null,
                    attributesArray: product.attributes // Asumimos que product.attributes es Record<string, any>
                        ? Object.entries(product.attributes).map(function (_a) {
                            var key = _a[0], value = _a[1];
                            return ({ key: key, value: String(value) });
                        })
                        : [],
                    isActive: product.isActive,
                    categoryId: product.categoryId || null,
                    supplierId: product.supplierId || null,
                    bundleComponentsData: ((_c = product.bundleComponents) === null || _c === void 0 ? void 0 : _c.map(function (c) { return ({
                        componentProductId: c.componentProductId,
                        quantity: c.quantity
                    }); })) || []
                });
            }
            else {
                // Modo Creación o si product es null
                form.reset({
                    name: "",
                    sku: null,
                    description: null,
                    brand: null,
                    model: null,
                    productType: prisma_enums_1.ProductType.GENERAL,
                    tracksImei: false,
                    costPrice: null,
                    sellingPrice: null,
                    reorderLevel: null,
                    idealStockLevel: null,
                    attributes: null,
                    isActive: true,
                    categoryId: null,
                    supplierId: null,
                    bundleComponentsData: []
                });
            }
        }
    }, [product, isEditMode, isOpen, form]);
    var mutation = react_query_1.useMutation({
        mutationFn: function (formData) { return __awaiter(_this, void 0, void 0, function () {
            var apiData, url, method, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apiData = __assign({}, formData);
                        delete apiData.attributesArray;
                        if (formData.attributesArray && formData.attributesArray.length > 0) {
                            apiData.attributes = formData.attributesArray.reduce(function (obj, item) {
                                if (item.key) {
                                    // Solo añadir si la clave tiene un valor
                                    obj[item.key.trim()] = item.value;
                                }
                                return obj;
                            }, {});
                        }
                        else {
                            apiData.attributes = client_1.Prisma.JsonNull; // O null si prefieres
                        }
                        if (apiData.productType !== prisma_enums_1.ProductType.BUNDLE) {
                            apiData.bundleComponentsData = [];
                        }
                        else {
                            // Asegurar que los componentes no estén vacíos si es bundle
                            if (!apiData.bundleComponentsData ||
                                apiData.bundleComponentsData.length === 0) {
                                // No lanzar error, el backend lo validará si es mandatorio
                                // O puedes añadir una validación Zod con refine al schema principal
                            }
                        }
                        // Convertir campos numéricos opcionales a null si están vacíos
                        [
                            "costPrice",
                            "sellingPrice",
                            "reorderLevel",
                            "idealStockLevel",
                        ].forEach(function (key) {
                            if (apiData[key] === "")
                                apiData[key] = null;
                        });
                        url = isEditMode && product
                            ? "/inventory/products/" + product.id
                            : "/inventory/products";
                        method = isEditMode ? "patch" : "post";
                        return [4 /*yield*/, api_1["default"][method](url, apiData)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (savedProduct) {
            sonner_1.toast.success("Producto \"" + savedProduct.name + "\" " + (isEditMode ? "actualizado" : "creado") + ".");
            queryClient.invalidateQueries({ queryKey: ["inventoryProducts"] });
            queryClient.invalidateQueries({
                queryKey: ["allProductsForBundleComponents"]
            });
            onOpenChange(false);
            if (onSuccess)
                onSuccess();
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al " + (isEditMode ? "actualizar" : "crear") + " producto.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        mutation.mutate(data);
    }
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, isEditMode ? "Editar Producto" : "Crear Nuevo Producto"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Completa la informaci\u00F3n del producto. Los campos marcados con * son requeridos.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6 py-4" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Informaci\u00F3n General")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "name", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Nombre*"),
                                        " ",
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: iPhone 15 Pro Max" }, field))),
                                        " ",
                                        react_1["default"].createElement(form_1.FormMessage, null),
                                        " "));
                                } }),
                            react_1["default"].createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "sku", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "SKU"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: APP-IP15PM-256" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            " ",
                                            react_1["default"].createElement(form_1.FormMessage, null),
                                            " "));
                                    } }),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "brand", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Marca"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Apple" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                            " ",
                                            react_1["default"].createElement(form_1.FormMessage, null),
                                            " "));
                                    } })),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "model", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Modelo"),
                                        " ",
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: A2849" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        " ",
                                        react_1["default"].createElement(form_1.FormMessage, null),
                                        " "));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "description", render: function (_a) {
                                    var _b;
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Descripci\u00F3n"),
                                        " ",
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Descripci\u00F3n detallada..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                        " ",
                                        react_1["default"].createElement(form_1.FormMessage, null),
                                        " "));
                                } }))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Tipo y Seguimiento")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "productType", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Tipo de Producto*"),
                                        react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Selecciona un tipo..." }))),
                                            react_1["default"].createElement(select_1.SelectContent, null, ALL_PRODUCT_TYPES.map(function (type) { return (react_1["default"].createElement(select_1.SelectItem, { key: type, value: type }, productTypeLabels[type] || type)); }))),
                                        " ",
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "tracksImei", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm" },
                                        react_1["default"].createElement("div", { className: "space-y-0.5" },
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Rastrea IMEI/Serial"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormDescription, null, "Marcar si tiene serial \u00FAnico."),
                                            " "),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(switch_1.Switch, { checked: field.value, onCheckedChange: field.onChange }))));
                                } }))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Precios y Niveles de Stock")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "sellingPrice", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Precio Venta"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", placeholder: "0.00" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseFloat(e.target.value));
                                                    } }))),
                                            " ",
                                            react_1["default"].createElement(form_1.FormMessage, null),
                                            " "));
                                    } }),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "costPrice", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Precio Costo"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", placeholder: "0.00" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseFloat(e.target.value));
                                                    } }))),
                                            " ",
                                            react_1["default"].createElement(form_1.FormMessage, null),
                                            " "));
                                    } })),
                            react_1["default"].createElement("div", { className: "grid md:grid-cols-2 gap-4" },
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "reorderLevel", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Nivel Reorden"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number", placeholder: "0" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            " ",
                                            react_1["default"].createElement(form_1.FormMessage, null),
                                            " "));
                                    } }),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "idealStockLevel", render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Stock Ideal"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number", placeholder: "0" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(e.target.value === ""
                                                            ? null
                                                            : parseInt(e.target.value, 10));
                                                    } }))),
                                            " ",
                                            react_1["default"].createElement(form_1.FormMessage, null),
                                            " "));
                                    } })))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Clasificaci\u00F3n y Estado")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "categoryId", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Categor\u00EDa"),
                                        react_1["default"].createElement(select_1.Select, { onValueChange: function (value) {
                                                return field.onChange(value === NULL_SELECT_VALUE ? null : value);
                                            }, value: field.value === null
                                                ? NULL_SELECT_VALUE
                                                : field.value || undefined },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Selecciona categor\u00EDa..." }))),
                                            react_1["default"].createElement(select_1.SelectContent, null,
                                                react_1["default"].createElement(select_1.SelectItem, { value: NULL_SELECT_VALUE },
                                                    react_1["default"].createElement("em", null, "Ninguna")),
                                                isLoadingCategories && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-cat", disabled: true }, "Cargando...")), categories === null || categories === void 0 ? void 0 :
                                                categories.map(function (cat) { return (react_1["default"].createElement(select_1.SelectItem, { key: cat.id, value: cat.id }, cat.name)); }))),
                                        " ",
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "supplierId", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, null,
                                        " ",
                                        react_1["default"].createElement(form_1.FormLabel, null, "Proveedor"),
                                        react_1["default"].createElement(select_1.Select, { onValueChange: function (value) {
                                                return field.onChange(value === NULL_SELECT_VALUE ? null : value);
                                            }, value: field.value === null
                                                ? NULL_SELECT_VALUE
                                                : field.value || undefined },
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Selecciona proveedor..." }))),
                                            react_1["default"].createElement(select_1.SelectContent, null,
                                                react_1["default"].createElement(select_1.SelectItem, { value: NULL_SELECT_VALUE },
                                                    react_1["default"].createElement("em", null, "Ninguno")),
                                                isLoadingSuppliers && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-sup", disabled: true }, "Cargando...")), suppliers === null || suppliers === void 0 ? void 0 :
                                                suppliers.map(function (sup) { return (react_1["default"].createElement(select_1.SelectItem, { key: sup.id, value: sup.id }, sup.name)); }))),
                                        " ",
                                        react_1["default"].createElement(form_1.FormMessage, null)));
                                } }),
                            react_1["default"].createElement(form_1.FormField, { control: form.control, name: "isActive", render: function (_a) {
                                    var field = _a.field;
                                    return (react_1["default"].createElement(form_1.FormItem, { className: "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm" },
                                        react_1["default"].createElement("div", { className: "space-y-0.5" },
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Activo"),
                                            " ",
                                            react_1["default"].createElement(form_1.FormDescription, null, "Disponible para venta/uso."),
                                            " "),
                                        react_1["default"].createElement(form_1.FormControl, null,
                                            react_1["default"].createElement(switch_1.Switch, { checked: field.value, onCheckedChange: field.onChange }))));
                                } }))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Atributos Adicionales")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            attributeFields.map(function (item, index) { return (react_1["default"].createElement("div", { key: item.id, className: "flex items-center gap-2 border p-3 rounded-md relative" },
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "attributesArray." + index + ".key", render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "flex-1" },
                                            react_1["default"].createElement(form_1.FormLabel, { className: index !== 0 ? "sr-only" : "" }, "Nombre Atributo"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Color" }, field))),
                                            react_1["default"].createElement(form_1.FormMessage, null)));
                                    } }),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "attributesArray." + index + ".value", render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "flex-1" },
                                            react_1["default"].createElement(form_1.FormLabel, { className: index !== 0 ? "sr-only" : "" }, "Valor Atributo"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Rojo" }, field))),
                                            react_1["default"].createElement(form_1.FormMessage, null)));
                                    } }),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return removeAttribute(index); }, className: "shrink-0 text-destructive hover:text-destructive/80 mt-7" },
                                    " ",
                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () { return appendAttribute({ key: "", value: "" }); } },
                                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                                " A\u00F1adir Atributo"))),
                    watchedProductType === prisma_enums_1.ProductType.BUNDLE && (react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Componentes del Bundle")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            fields.map(function (item, index) { return (react_1["default"].createElement("div", { key: item.id, className: "flex items-end gap-2 border p-3 rounded-md relative" },
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "bundleComponentsData." + index + ".componentProductId", render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "flex-1" },
                                            react_1["default"].createElement(form_1.FormLabel, null, "Componente*"),
                                            react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || undefined },
                                                react_1["default"].createElement(form_1.FormControl, null,
                                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Selecciona componente..." }))),
                                                react_1["default"].createElement(select_1.SelectContent, null,
                                                    isLoadingAllProducts && (react_1["default"].createElement(select_1.SelectItem, { value: "loading-bprod", disabled: true }, "Cargando productos...")), allProducts === null || allProducts === void 0 ? void 0 :
                                                    allProducts.filter(function (p) {
                                                        return p.id !== (product === null || product === void 0 ? void 0 : product.id) &&
                                                            p.productType !== prisma_enums_1.ProductType.BUNDLE;
                                                    }).map(function (p) { return (react_1["default"].createElement(select_1.SelectItem, { key: p.id, value: p.id },
                                                        " ",
                                                        p.name,
                                                        " (",
                                                        p.sku || "N/A",
                                                        ")")); }))),
                                            " ",
                                            react_1["default"].createElement(form_1.FormMessage, null)));
                                    } }),
                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "bundleComponentsData." + index + ".quantity", render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "w-28" },
                                            " ",
                                            react_1["default"].createElement(form_1.FormLabel, null, "Cantidad*"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number", min: 1 }, field, { value: field.value || "", onChange: function (e) {
                                                        return field.onChange(parseInt(e.target.value, 10) || 1);
                                                    } }))),
                                            react_1["default"].createElement(form_1.FormMessage, null)));
                                    } }),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return remove(index); }, className: "shrink-0 text-destructive hover:text-destructive/80 absolute top-1 right-1 h-6 w-6" },
                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); }),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                    return append({ componentProductId: "", quantity: 1 });
                                } },
                                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                                " A\u00F1adir Componente")))),
                    react_1["default"].createElement(dialog_1.DialogFooter, { className: "pt-6 sticky bottom-0 bg-background py-4 border-t" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: mutation.isPending }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: mutation.isPending || (!form.formState.isDirty && isEditMode) },
                            mutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            isEditMode ? "Guardar Cambios" : "Crear Producto")))))));
}
exports.ProductFormDialog = ProductFormDialog;
