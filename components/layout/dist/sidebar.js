// components/layout/sidebar.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.Sidebar = void 0;
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var utils_1 = require("@/lib/utils");
var auth_store_1 = require("@/stores/auth.store");
var lucide_react_1 = require("lucide-react");
// Mover navItems a una constante separada o incluso a un archivo de configuración
var NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: lucide_react_1.LayoutDashboard },
    { href: "/dashboard/sales", label: "Ventas", icon: lucide_react_1.ShoppingCart },
    { href: "/dashboard/repairs", label: "Reparaciones", icon: lucide_react_1.Wrench },
    { href: "/dashboard/inventory", label: "Inventario", icon: lucide_react_1.Package },
    { href: "/dashboard/reports", label: "Reportes", icon: lucide_react_1.FileText },
    { href: "/dashboard/customers", label: "Clientes", icon: lucide_react_1.Users },
    {
        href: "/dashboard/users",
        label: "Usuarios",
        icon: lucide_react_1.UserCircle,
        adminOnly: true
    },
    {
        href: "/dashboard/settings",
        label: "Configuración",
        icon: lucide_react_1.Settings,
        adminOnly: true
    },
];
function Sidebar() {
    var pathname = navigation_1.usePathname();
    var user = auth_store_1.useAuthStore().user;
    // const isAdmin = user?.roles.includes('STORE_ADMIN'); // O tu lógica de roles
    // Filtrar navItems basados en roles/permisos si es necesario
    var visibleNavItems = NAV_ITEMS.filter(function (item) {
        // if (item.adminOnly && !isAdmin) return false; // Ejemplo simple de filtro por rol
        // if (item.permission && !userHasPermission(item.permission)) return false; // Lógica de permisos más granular
        return true; // Mostrar todos por ahora
    });
    return (React.createElement("aside", { className: "fixed top-0 left-0 z-30 h-full w-60 flex-col border-r bg-background hidden md:flex print:hidden" },
        " ",
        React.createElement("div", { className: "flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0" },
            " ",
            React.createElement(link_1["default"], { href: "/dashboard", className: "flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity" // Tamaño de texto y efecto hover
             },
                React.createElement(lucide_react_1.Building, { className: "h-6 w-6 text-primary" }),
                " ",
                React.createElement("span", { className: "text-foreground" }, (user === null || user === void 0 ? void 0 : user.storeName) || "SaaShopix"))),
        React.createElement("div", { className: "flex-1 overflow-y-auto py-3" },
            " ",
            React.createElement("nav", { className: "grid items-start gap-0.5 px-2 text-sm font-medium lg:px-4" },
                " ",
                visibleNavItems.map(function (item) {
                    var isActive = (item.href === "/dashboard" && pathname === item.href) ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    // TODO: Implementar lógica para subItems con <Collapsible> si se decide usar
                    // if (item.subItems && item.subItems.length > 0) {
                    //   return ( <Collapsible key={item.label}> ... </Collapsible> );
                    // }
                    return (React.createElement(link_1["default"], { key: item.label, href: item.href, className: utils_1.cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground transition-colors duration-150 ease-in-out", // py-2.5 para un poco más de altura
                        "hover:bg-accent hover:text-accent-foreground", // Hover state más claro
                        isActive && "bg-primary/10 text-primary font-semibold", // Estado activo más distintivo
                        item.disabled && "opacity-50 cursor-not-allowed" // Para ítems deshabilitados
                        ), "aria-disabled": item.disabled, onClick: function (e) { return item.disabled && e.preventDefault(); } },
                        React.createElement(item.icon, { className: utils_1.cn("h-4 w-4", isActive
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-accent-foreground") }),
                        item.label));
                })))));
}
exports.Sidebar = Sidebar;
