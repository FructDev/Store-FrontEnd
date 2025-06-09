// app/(dashboard)/customers/columns.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.columns = void 0;
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var formatters_1 = require("@/lib/utils/formatters");
exports.columns = [
    {
        accessorKey: "firstName",
        header: function (_a) {
            var column = _a.column;
            return (React.createElement(button_1.Button, { variant: "ghost", onClick: function () { return column.toggleSorting(column.getIsSorted() === "asc"); } },
                "Nombre",
                React.createElement(lucide_react_1.ArrowUpDown, { className: "ml-2 h-4 w-4" })));
        },
        cell: function (_a) {
            var row = _a.row;
            var fullName = ((row.original.firstName || "") + " " + (row.original.lastName || "")).trim();
            return React.createElement("div", { className: "font-medium" }, fullName || "N/A");
        }
    },
    {
        accessorKey: "email",
        header: "Correo Electrónico"
    },
    {
        accessorKey: "phone",
        header: "Teléfono"
    },
    {
        accessorKey: "rnc",
        header: "RNC/Cédula"
    },
    {
        accessorKey: "isActive",
        header: "Estado",
        cell: function (_a) {
            var row = _a.row;
            var isActive = row.getValue("isActive");
            return (React.createElement(badge_1.Badge, { variant: isActive ? "success" : "destructive" }, isActive ? "Activo" : "Inactivo"));
        }
    },
    {
        accessorKey: "createdAt",
        header: "Fecha de Registro",
        cell: function (_a) {
            var row = _a.row;
            return React.createElement("div", null, formatters_1.formatDate(row.getValue("createdAt")));
        }
    },
    {
        id: "actions",
        cell: function (_a) {
            var row = _a.row, table = _a.table;
            var customer = row.original;
            var _b = table.options.meta.actions, onEdit = _b.onEdit, onDelete = _b.onDelete;
            return (React.createElement(dropdown_menu_1.DropdownMenu, null,
                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                    React.createElement(button_1.Button, { variant: "ghost", className: "h-8 w-8 p-0" },
                        React.createElement("span", { className: "sr-only" }, "Abrir men\u00FA"),
                        React.createElement(lucide_react_1.MoreHorizontal, { className: "h-4 w-4" }))),
                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                    React.createElement(dropdown_menu_1.DropdownMenuLabel, null, "Acciones"),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigator.clipboard.writeText(customer.id); } }, "Copiar ID Cliente"),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return onEdit(customer); } }, "Editar Cliente"),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { className: "text-destructive", onClick: function () { return onDelete(customer); } }, customer.isActive ? "Desactivar Cliente" : "Activar Cliente"))));
        }
    },
];
