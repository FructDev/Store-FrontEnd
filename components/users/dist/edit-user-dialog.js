// components/users/edit-user-dialog.tsx
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
exports.__esModule = true;
exports.EditUserDialog = void 0;
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
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
// Schema Zod para editar (sin password, email podría ser readonly o no editable)
var editUserFormSchema = z.object({
    firstName: z.string().min(2, "Nombre muy corto").max(50),
    lastName: z.string().min(2, "Apellido muy corto").max(50),
    email: z.string().email("Email inválido."),
    // roleName: z.enum(["SALESPERSON", "TECHNICIAN"]),
    isActive: z.boolean()
});
function EditUserDialog(_a) {
    var _b;
    var user = _a.user, isOpen = _a.isOpen, onOpenChange = _a.onOpenChange;
    var queryClient = react_query_1.useQueryClient();
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(editUserFormSchema),
        defaultValues: {
            firstName: (user === null || user === void 0 ? void 0 : user.firstName) || "",
            lastName: (user === null || user === void 0 ? void 0 : user.lastName) || "",
            email: (user === null || user === void 0 ? void 0 : user.email) || "",
            isActive: (_b = user === null || user === void 0 ? void 0 : user.isActive) !== null && _b !== void 0 ? _b : true
        }
    });
    // Resetear el formulario cuando el usuario cambie o el diálogo se abra/cierre
    react_1.useEffect(function () {
        if (user) {
            form.reset({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                isActive: user.isActive
            });
        }
        else {
            form.reset({
                // Valores por defecto si no hay usuario (aunque no debería abrirse sin user)
                firstName: "",
                lastName: "",
                email: "",
                isActive: true
            });
        }
    }, [user, isOpen, form]);
    var updateUserMutation = react_query_1.useMutation({
        mutationFn: function (data) { return api_1["default"].patch("/users/" + (user === null || user === void 0 ? void 0 : user.id), data); },
        onSuccess: function () {
            sonner_1.toast.success("Usuario actualizado exitosamente.");
            queryClient.invalidateQueries({ queryKey: ["storeUsers"] });
            onOpenChange(false); // Cerrar diálogo
        },
        onError: function (error) {
            var _a, _b;
            var errorMsg = ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al actualizar usuario.";
            sonner_1.toast.error(Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg);
        }
    });
    function onSubmit(data) {
        if (!user)
            return;
        var dataForBackend = {
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: data.isActive
        };
        updateUserMutation.mutate(dataForBackend);
    }
    if (!user)
        return null; // No renderizar si no hay usuario para editar
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[475px]" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null,
                    "Editar Usuario: ",
                    user.firstName,
                    " ",
                    user.lastName),
                React.createElement(dialog_1.DialogDescription, null, "Modifica los datos del usuario. La contrase\u00F1a solo se puede cambiar por separado.")),
            React.createElement(form_1.Form, __assign({}, form),
                React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-4" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                        React.createElement(form_1.FormField, { control: form.control, name: "firstName", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Nombre"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({}, field))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } }),
                        React.createElement(form_1.FormField, { control: form.control, name: "lastName", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    " ",
                                    React.createElement(form_1.FormLabel, null, "Apellido"),
                                    " ",
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({}, field))),
                                    " ",
                                    React.createElement(form_1.FormMessage, null),
                                    " "));
                            } })),
                    React.createElement(form_1.FormField, { control: form.control, name: "email", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, "Correo Electr\u00F3nico"),
                                " ",
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(input_1.Input, __assign({ type: "email" }, field, { readOnly: true, disabled: true }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    (user === null || user === void 0 ? void 0 : user.roles) && user.roles.length > 0 && (React.createElement("div", { className: "space-y-2 pt-4" },
                        React.createElement(form_1.FormLabel, null, "Rol Actual"),
                        React.createElement("div", { className: "flex flex-wrap gap-1" }, user.roles.map(function (roleObj) {
                            // --- AÑADIR CONSOLE LOGS AQUÍ --- V V V
                            console.log("Objeto de Rol Completo (roleObj):", JSON.stringify(roleObj));
                            console.log("Valor de roleObj.name:", roleObj.name);
                            // Intentar mostrar el nombre sin formatear primero para ver el valor crudo
                            var rawRoleName = roleObj.name || "Nombre de Rol Vacío/Inválido";
                            console.log("Nombre de Rol Crudo a Mostrar:", rawRoleName);
                            var displayName = typeof roleObj.name === "string"
                                ? roleObj.name.toLowerCase().replace("_", " ")
                                : "Error: Rol no es string";
                            console.log("Nombre de Rol Formateado (displayName):", displayName);
                            // --- FIN CONSOLE LOGS --- V V V
                            return (React.createElement(badge_1.Badge, { key: roleObj.id, variant: "secondary", className: "capitalize" },
                                displayName,
                                " "));
                        })),
                        React.createElement(form_1.FormDescription, null, "El rol del usuario no se puede modificar desde esta pantalla."))),
                    React.createElement(form_1.FormField, { control: form.control, name: "isActive", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, { className: "flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm" },
                                React.createElement("div", { className: "space-y-0.5" },
                                    React.createElement(form_1.FormLabel, null, "Activo"),
                                    " ",
                                    React.createElement(form_1.FormDescription, null, "El usuario podr\u00E1 iniciar sesi\u00F3n."),
                                    " "),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(switch_1.Switch, { checked: field.value, onCheckedChange: field.onChange }))));
                        } }),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: updateUserMutation.isPending }, "Cancelar"),
                        React.createElement(button_1.Button, { type: "submit", disabled: updateUserMutation.isPending },
                            updateUserMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Guardar Cambios")))))));
}
exports.EditUserDialog = EditUserDialog;
