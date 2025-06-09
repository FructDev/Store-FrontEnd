// components/inventory/catalog/category-form-dialog.tsx
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
exports.CategoryFormDialog = void 0;
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
var categoryFormSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Nombre debe tener al menos 2 caracteres." })
        .max(100),
    description: z.string().max(255).optional().nullable()
});
function CategoryFormDialog(_a) {
    var _this = this;
    var category = _a.category, triggerButton = _a.triggerButton, controlledIsOpen = _a.isOpen, controlledOnOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var _b = react_1.useState(false), internalIsOpen = _b[0], setInternalIsOpen = _b[1];
    var queryClient = react_query_1.useQueryClient();
    var isControlled = controlledIsOpen !== undefined && controlledOnOpenChange !== undefined;
    var isOpen = isControlled ? controlledIsOpen : internalIsOpen;
    var setIsOpen = isControlled ? controlledOnOpenChange : setInternalIsOpen;
    var isEditMode = !!(category === null || category === void 0 ? void 0 : category.id);
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(categoryFormSchema),
        defaultValues: {
            name: (category === null || category === void 0 ? void 0 : category.name) || "",
            description: (category === null || category === void 0 ? void 0 : category.description) || ""
        }
    });
    react_1.useEffect(function () {
        if (isOpen) {
            // Solo resetear si el diálogo está abierto o se va a abrir
            if (isEditMode && category) {
                console.log("EDIT MODE - Resetting form with category:", category); // DEBUG
                form.reset({
                    name: category.name,
                    description: category.description || ""
                });
            }
            else if (!isEditMode) {
                // Si es modo creación y se abre
                console.log("CREATE MODE - Resetting form for new category"); // DEBUG
                form.reset({ name: "", description: "" });
            }
        }
    }, [category, isEditMode, isOpen, form]);
    var mutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var apiData, response, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        apiData = {
                            name: data.name,
                            description: data.description || null
                        };
                        if (!(isEditMode && (category === null || category === void 0 ? void 0 : category.id))) return [3 /*break*/, 2];
                        // Asegurar que category.id exista
                        console.log("EDIT MODE - Patching to /inventory/categories/" + category.id, apiData); // DEBUG
                        return [4 /*yield*/, api_1["default"].patch("/inventory/categories/" + category.id, apiData)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 2:
                        console.log("CREATE MODE - Posting to /inventory/categories", apiData); // DEBUG
                        return [4 /*yield*/, api_1["default"].post("/inventory/categories", apiData)];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (createdOrUpdatedCategory) {
            sonner_1.toast.success("Categor\u00EDa \"" + createdOrUpdatedCategory.name + "\" " + (isEditMode ? "actualizada" : "creada") + " correctamente.");
            queryClient.invalidateQueries({ queryKey: ["inventoryCategories"] });
            setIsOpen(false);
            if (onSuccess)
                onSuccess();
            // No resetear aquí si queremos que el usuario vea los datos guardados si reabre
            // El reset ya se hace en el useEffect cuando isOpen o category cambia.
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                "Error al " + (isEditMode ? "actualizar" : "crear") + " categor\u00EDa.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        mutation.mutate(data);
    }
    return (react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: setIsOpen },
        triggerButton ? (react_1["default"].createElement(dialog_1.DialogTrigger, { asChild: true }, triggerButton)) : (react_1["default"].createElement(dialog_1.DialogTrigger, { asChild: true },
            react_1["default"].createElement(button_1.Button, null,
                react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-2 h-4 w-4" }),
                " Crear Categor\u00EDa"))),
        react_1["default"].createElement(dialog_1.DialogContent, { className: "sm:max-w-[425px]" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, isEditMode ? "Editar Categoría" : "Crear Nueva Categoría"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, isEditMode
                    ? "Modifica los detalles de la categoría."
                    : "Añade una nueva categoría para tus productos.")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4" },
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "name", render: function (_a) {
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null, "Nombre"),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "Ej: Smartphones" }, field))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "description", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (react_1["default"].createElement(form_1.FormItem, null,
                                react_1["default"].createElement(form_1.FormLabel, null,
                                    "Descripci\u00F3n",
                                    " ",
                                    react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "(Opcional)")),
                                react_1["default"].createElement(form_1.FormControl, null,
                                    react_1["default"].createElement(textarea_1.Textarea, __assign({ placeholder: "Breve descripci\u00F3n de la categor\u00EDa" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                react_1["default"].createElement(form_1.FormMessage, null)));
                        } }),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setIsOpen(false); }, disabled: mutation.isPending }, "Cancelar"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: mutation.isPending },
                            mutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            isEditMode ? "Guardar Cambios" : "Crear Categoría")))))));
}
exports.CategoryFormDialog = CategoryFormDialog;
