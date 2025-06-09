// components/layout/header.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.Header = void 0;
var link_1 = require("next/link");
var navigation_1 = require("next/navigation"); // Para un posible título de página simple
var button_1 = require("@/components/ui/button");
var sheet_1 = require("@/components/ui/sheet");
var lucide_react_1 = require("lucide-react");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var sidebar_1 = require("./sidebar"); // Para el menú móvil
// Función simple para obtener un título basado en el pathname (puedes expandirla)
var getPageTitle = function (pathname) {
    if (pathname === "/dashboard")
        return "Dashboard Principal";
    if (pathname.startsWith("/dashboard/sales/pos"))
        return "Punto de Venta (POS)";
    if (pathname.startsWith("/dashboard/sales"))
        return "Gestión de Ventas";
    if (pathname.startsWith("/dashboard/repairs/new"))
        return "Nueva Orden de Reparación";
    if (pathname.startsWith("/dashboard/repairs"))
        return "Gestión de Reparaciones";
    if (pathname.startsWith("/dashboard/inventory"))
        return "Gestión de Inventario";
    if (pathname.startsWith("/dashboard/reports"))
        return "Centro de Reportes";
    if (pathname.startsWith("/dashboard/customers"))
        return "Clientes";
    if (pathname.startsWith("/dashboard/users"))
        return "Gestión de Usuarios";
    if (pathname.startsWith("/dashboard/settings"))
        return "Configuración";
    // Añade más rutas según sea necesario
    return "Panel de Control"; // Fallback
};
function Header(_a) {
    var user = _a.user, onLogout = _a.onLogout;
    var pathname = navigation_1.usePathname();
    var pageTitle = getPageTitle(pathname);
    return (React.createElement("header", { className: "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden" },
        " ",
        React.createElement("div", { className: "container flex h-14 items-center px-4 sm:px-6" },
            " ",
            React.createElement("div", { className: "md:hidden mr-3" },
                " ",
                React.createElement(sheet_1.Sheet, null,
                    React.createElement(sheet_1.SheetTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "outline", size: "icon", className: "shrink-0" },
                            React.createElement(lucide_react_1.Menu, { className: "h-5 w-5" }))),
                    React.createElement(sheet_1.SheetContent, { side: "left", className: "flex flex-col p-0 w-72 sm:w-80" },
                        " ",
                        React.createElement("div", { className: "flex h-14 items-center border-b px-4 shrink-0" },
                            React.createElement(link_1["default"], { href: "/dashboard", className: "flex items-center gap-2 font-semibold text-lg" },
                                React.createElement(lucide_react_1.Building, { className: "h-6 w-6 text-primary" }),
                                React.createElement("span", null, (user === null || user === void 0 ? void 0 : user.storeName) || "SaaShopix"))),
                        React.createElement("div", { className: "flex-1 overflow-y-auto" },
                            React.createElement(sidebar_1.Sidebar, null),
                            " ")))),
            React.createElement("div", { className: "hidden md:flex items-center mr-auto" },
                " ",
                React.createElement(link_1["default"], { href: "/dashboard", className: "flex items-center gap-2 font-semibold text-foreground/90 hover:text-foreground" },
                    React.createElement(lucide_react_1.Building, { className: "h-5 w-5 text-primary" }),
                    React.createElement("span", { className: "hidden lg:inline-block" }, (user === null || user === void 0 ? void 0 : user.storeName) || "SaaShopix"))),
            React.createElement("div", { className: "flex-1 text-center hidden sm:block" },
                React.createElement("h1", { className: "text-md font-semibold text-foreground truncate px-2", title: pageTitle }, pageTitle)),
            React.createElement("div", { className: "flex items-center space-x-2 sm:space-x-3 ml-auto" },
                " ",
                React.createElement("span", { className: "text-sm text-muted-foreground hidden lg:inline" },
                    " ",
                    "Hola, ",
                    (user === null || user === void 0 ? void 0 : user.firstName) || "Usuario"),
                React.createElement(dropdown_menu_1.DropdownMenu, null,
                    React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                        React.createElement(button_1.Button, { variant: "ghost", className: "relative h-9 w-9 rounded-full" },
                            " ",
                            React.createElement(lucide_react_1.UserCircle2, { className: "h-5 w-5" }))),
                    React.createElement(dropdown_menu_1.DropdownMenuContent, { className: "w-56", align: "end", forceMount: true },
                        React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "font-normal" },
                            React.createElement("div", { className: "flex flex-col space-y-1" },
                                React.createElement("p", { className: "text-sm font-medium leading-none" }, (((user === null || user === void 0 ? void 0 : user.firstName) || "") + " " + ((user === null || user === void 0 ? void 0 : user.lastName) || "")).trim()),
                                React.createElement("p", { className: "text-xs leading-none text-muted-foreground" }, user === null || user === void 0 ? void 0 : user.email))),
                        React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                        React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: onLogout, className: "cursor-pointer text-red-600 dark:text-red-500 hover:!bg-red-500/10 focus:!bg-red-500/10 focus:!text-red-700 dark:focus:!text-red-400" },
                            React.createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4" }),
                            "Cerrar Sesi\u00F3n")))))));
}
exports.Header = Header;
