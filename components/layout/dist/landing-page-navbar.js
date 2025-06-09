// components/layout/landing-page-navbar.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.LandingPageNavbar = void 0;
var link_1 = require("next/link");
var auth_store_1 = require("@/stores/auth.store");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
function LandingPageNavbar() {
    var _a = auth_store_1.useAuthStore(), isAuthenticated = _a.isAuthenticated, user = _a.user, logout = _a.logout;
    return (React.createElement("header", { className: "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" },
        React.createElement("div", { className: "container flex h-14 items-center" },
            React.createElement(link_1["default"], { href: "/", className: "flex items-center gap-2 font-semibold text-lg mr-6" },
                React.createElement(lucide_react_1.Building, { className: "h-6 w-6 text-primary" }),
                React.createElement("span", { className: "font-bold" }, "Shopix")),
            React.createElement("div", { className: "flex flex-1 items-center justify-end space-x-2" }, isAuthenticated ? (
            // --- VISTA PARA USUARIO AUTENTICADO ---
            React.createElement(React.Fragment, null,
                React.createElement("span", { className: "hidden sm:inline text-sm text-muted-foreground" },
                    "Hola, ", user === null || user === void 0 ? void 0 :
                    user.firstName),
                React.createElement(button_1.Button, { asChild: true },
                    React.createElement(link_1["default"], { href: "/dashboard" }, "Ir al Dashboard")))) : (
            // --- VISTA PARA VISITANTE ---
            React.createElement(React.Fragment, null,
                React.createElement(button_1.Button, { variant: "ghost", asChild: true },
                    React.createElement(link_1["default"], { href: "/login" }, "Iniciar Sesi\u00F3n")),
                React.createElement(button_1.Button, { asChild: true },
                    React.createElement(link_1["default"], { href: "/register" }, "Registrarse Gratis"))))))));
}
exports.LandingPageNavbar = LandingPageNavbar;
