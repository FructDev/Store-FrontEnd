// app/components/Footer.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.Footer = void 0;
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react");
var fa_1 = require("react-icons/fa");
function Footer() {
    return (React.createElement("footer", { className: "bg-gray-900 text-gray-400" },
        React.createElement("div", { className: "container mx-auto px-6 py-12" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8" },
                React.createElement("div", { className: "col-span-1 md:col-span-2 lg:col-span-1" },
                    React.createElement(link_1["default"], { href: "/", className: "flex items-center gap-2 mb-4" },
                        React.createElement(lucide_react_1.Building, { className: "h-7 w-7 text-primary" }),
                        React.createElement("span", { className: "text-xl font-bold text-white" }, "Shopix")),
                    React.createElement("p", { className: "text-sm" }, "La plataforma definitiva para la gesti\u00F3n de tiendas de celulares y centros de reparaci\u00F3n.")),
                React.createElement("div", null,
                    React.createElement("h3", { className: "font-semibold text-white tracking-wider uppercase mb-4" }, "Producto"),
                    React.createElement("nav", { className: "flex flex-col space-y-2" },
                        React.createElement(link_1["default"], { href: "#features", className: "hover:text-primary transition-colors" }, "Caracter\u00EDsticas"),
                        React.createElement(link_1["default"], { href: "#pricing", className: "hover:text-primary transition-colors" }, "Precios"),
                        React.createElement(link_1["default"], { href: "#faq", className: "hover:text-primary transition-colors" }, "FAQ"))),
                React.createElement("div", null,
                    React.createElement("h3", { className: "font-semibold text-white tracking-wider uppercase mb-4" }, "Legal"),
                    React.createElement("nav", { className: "flex flex-col space-y-2" },
                        React.createElement(link_1["default"], { href: "/privacy", className: "hover:text-primary transition-colors" }, "Pol\u00EDtica de Privacidad"),
                        React.createElement(link_1["default"], { href: "/terms", className: "hover:text-primary transition-colors" }, "T\u00E9rminos de Servicio"))),
                React.createElement("div", null,
                    React.createElement("h3", { className: "font-semibold text-white tracking-wider uppercase mb-4" }, "S\u00EDguenos"),
                    React.createElement("div", { className: "flex space-x-4" },
                        React.createElement(link_1["default"], { href: "#", className: "hover:text-primary transition-colors" },
                            React.createElement(fa_1.FaTwitter, null)),
                        React.createElement(link_1["default"], { href: "#", className: "hover:text-primary transition-colors" },
                            React.createElement(fa_1.FaFacebookF, null)),
                        React.createElement(link_1["default"], { href: "#", className: "hover:text-primary transition-colors" },
                            React.createElement(fa_1.FaInstagram, null))))),
            React.createElement("div", { className: "mt-12 border-t border-gray-700 pt-8 text-center text-sm" },
                React.createElement("p", null,
                    "\u00A9 ",
                    new Date().getFullYear(),
                    " SaaShopix. Construido con pasi\u00F3n en la Rep\u00FAblica Dominicana.")))));
}
exports.Footer = Footer;
