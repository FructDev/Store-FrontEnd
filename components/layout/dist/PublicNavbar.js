// app/components/PublicNavbar.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.PublicNavbar = void 0;
var link_1 = require("next/link");
var auth_store_1 = require("@/stores/auth.store");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react"); // Usaremos lucide-react para el logo por consistencia
function PublicNavbar() {
    var isAuthenticated = auth_store_1.useAuthStore().isAuthenticated;
    return (React.createElement("header", { className: "fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm" },
        React.createElement("div", { className: "container mx-auto flex h-16 items-center justify-between px-6" },
            React.createElement(link_1["default"], { href: "/", className: "flex items-center gap-2 font-semibold text-lg" },
                React.createElement(lucide_react_1.Building, { className: "h-6 w-6 text-primary" }),
                React.createElement("span", { className: "font-bold" }, "Shopix")),
            React.createElement("div", { className: "flex items-center space-x-2" }, isAuthenticated ? (
            // --- VISTA PARA USUARIO AUTENTICADO ---
            React.createElement(button_1.Button, { asChild: true },
                React.createElement(link_1["default"], { href: "/dashboard" }, "Ir al Dashboard"))) : (
            // --- VISTA PARA VISITANTE ---
            React.createElement(React.Fragment, null,
                React.createElement(button_1.Button, { variant: "ghost", asChild: true },
                    React.createElement(link_1["default"], { href: "/login" }, "Iniciar Sesi\u00F3n")),
                React.createElement(button_1.Button, { asChild: true, className: "rounded-full" },
                    React.createElement(link_1["default"], { href: "/register" }, "Comenzar Gratis"))))))));
}
exports.PublicNavbar = PublicNavbar;
