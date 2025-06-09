// app/(marketing)/landing-page-client.tsx
"use client"; // <-- MUY IMPORTANTE
"use strict";
exports.__esModule = true;
exports.LandingPageClient = void 0;
var react_1 = require("react");
var link_1 = require("next/link");
var navigation_1 = require("next/navigation");
var fa_1 = require("react-icons/fa");
var framer_motion_1 = require("framer-motion");
var react_intersection_observer_1 = require("react-intersection-observer");
var auth_store_1 = require("@/stores/auth.store");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var badge_1 = require("@/components/ui/badge");
// Sub-componente para animaciones al hacer scroll
var AnimatedSection = function (_a) {
    var children = _a.children, className = _a.className;
    var controls = framer_motion_1.useAnimation();
    var _b = react_intersection_observer_1.useInView({ triggerOnce: true, threshold: 0.1 }), ref = _b[0], inView = _b[1];
    react_1.useEffect(function () {
        if (inView)
            controls.start("visible");
    }, [controls, inView]);
    return (react_1["default"].createElement(framer_motion_1.motion.div, { ref: ref, initial: "hidden", animate: controls, variants: {
            hidden: { opacity: 0, y: 50 },
            visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.7, ease: "easeOut" }
            }
        }, className: className }, children));
};
// Componente para tarjetas de características con animación
var FeatureCard = function (_a) {
    var Icon = _a.icon, title = _a.title, description = _a.description, _b = _a.delay, delay = _b === void 0 ? 0 : _b;
    var controls = framer_motion_1.useAnimation();
    var _c = react_intersection_observer_1.useInView({ triggerOnce: true, threshold: 0.1 }), ref = _c[0], inView = _c[1];
    react_1["default"].useEffect(function () {
        if (inView) {
            controls.start("visible");
        }
    }, [controls, inView]);
    var cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: delay } }
    };
    return (react_1["default"].createElement(framer_motion_1.motion.div, { ref: ref, initial: "hidden", animate: controls, variants: cardVariants, className: "flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300" },
        react_1["default"].createElement("div", { className: "flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full" },
            react_1["default"].createElement(Icon, { className: "text-primary text-3xl" })),
        react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-2 text-gray-900 dark:text-white" }, title),
        react_1["default"].createElement("p", { className: "text-gray-600 dark:text-gray-300" }, description)));
};
// El nombre del componente exportado por defecto
function LandingPageClient() {
    var isAuthenticated = auth_store_1.useAuthStore().isAuthenticated;
    var router = navigation_1.useRouter();
    react_1.useEffect(function () {
        if (isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [isAuthenticated, router]);
    if (isAuthenticated) {
        return (react_1["default"].createElement("div", { className: "flex h-screen w-full items-center justify-center bg-background" },
            react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" })));
    }
    return (react_1["default"].createElement("main", { className: "bg-white dark:bg-gray-950 text-foreground" },
        react_1["default"].createElement("section", { className: "relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28" },
            react_1["default"].createElement("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_50%_50%,_#818cf844_0%,#FFFFFF00_100%)] dark:bg-[radial-gradient(40%_50%_at_50%_50%,_#383d8166_0%,#030712_100%)]" }),
            react_1["default"].createElement("div", { className: "container px-6 mx-auto" },
                react_1["default"].createElement(framer_motion_1.motion.div, { className: "mx-auto max-w-4xl text-center", initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 } },
                    react_1["default"].createElement("h1", { className: "text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-7xl" },
                        "La Gesti\u00F3n de tu Tienda,",
                        " ",
                        react_1["default"].createElement("span", { className: "text-primary" }, "Reinventada"),
                        "."),
                    react_1["default"].createElement("p", { className: "mt-6 text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300" }, "Shopix es la plataforma todo-en-uno que centraliza tus ventas, inventario y reparaciones. Dedica m\u00E1s tiempo a tus clientes y menos a las hojas de c\u00E1lculo."),
                    react_1["default"].createElement("div", { className: "mt-10 flex justify-center gap-4" },
                        react_1["default"].createElement(button_1.Button, { asChild: true, size: "lg", className: "rounded-full h-12 px-8 text-base shadow-lg hover:shadow-primary/30 transition-shadow" },
                            react_1["default"].createElement(link_1["default"], { href: "/register" },
                                "Comienza Gratis ",
                                react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))))))),
        react_1["default"].createElement("section", { id: "features", className: "py-20 md:py-24 bg-gray-50 dark:bg-black" },
            react_1["default"].createElement("div", { className: "container mx-auto px-6" },
                react_1["default"].createElement(AnimatedSection, { className: "text-center max-w-3xl mx-auto mb-16" },
                    react_1["default"].createElement("h2", { className: "text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl" }, "Un Sistema, Posibilidades Infinitas"),
                    react_1["default"].createElement("p", { className: "mt-4 text-lg text-gray-600 dark:text-gray-300" }, "Integramos las herramientas esenciales para el \u00E9xito de tu negocio en una sola plataforma intuitiva.")),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8" },
                    react_1["default"].createElement(FeatureCard, { icon: fa_1.FaShoppingCart, title: "Punto de Venta Eficiente", description: "Procesa ventas r\u00E1pidamente, acepta m\u00FAltiples m\u00E9todos de pago y aplica descuentos complejos sin esfuerzo.", delay: 0.1 }),
                    react_1["default"].createElement(FeatureCard, { icon: fa_1.FaBox, title: "Control de Inventario Total", description: "Desde productos serializados (IMEI) hasta lotes y ubicaciones. Tus \u00F3rdenes de compra y conteos, simplificados.", delay: 0.2 }),
                    react_1["default"].createElement(FeatureCard, { icon: fa_1.FaTools, title: "Flujo de Reparaciones Claro", description: "Gestiona cada reparaci\u00F3n desde el diagn\u00F3stico hasta la facturaci\u00F3n. Mant\u00E9n a tus clientes y t\u00E9cnicos informados.", delay: 0.3 })))),
        react_1["default"].createElement("section", { id: "pricing", className: "py-20 md:py-24 bg-white dark:bg-gray-950" },
            react_1["default"].createElement("div", { className: "container mx-auto px-6" },
                react_1["default"].createElement(AnimatedSection, { className: "text-center max-w-3xl mx-auto mb-16" },
                    react_1["default"].createElement("h2", { className: "text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl" }, "Un Precio Justo y Transparente"),
                    react_1["default"].createElement("p", { className: "mt-4 text-lg text-gray-600 dark:text-gray-300" }, "Comienza con nuestro plan beta y ay\u00FAdanos a construir la mejor herramienta para tu negocio.")),
                react_1["default"].createElement("div", { className: "flex justify-center" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { opacity: 0, scale: 0.95 }, whileInView: { opacity: 1, scale: 1 }, viewport: { once: true }, transition: { duration: 0.5, delay: 0.2 }, className: "w-full max-w-md" },
                        react_1["default"].createElement(card_1.Card, { className: "relative border-2 border-primary shadow-2xl shadow-primary/20" },
                            react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "absolute -top-3 left-1/2 -translate-x-1/2" }, "Acceso Beta"),
                            react_1["default"].createElement(card_1.CardHeader, { className: "text-center p-8" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-2xl font-bold" }, "Plan Profesional"),
                                react_1["default"].createElement("p", { className: "text-5xl font-extrabold tracking-tight my-4" }, "Gratis"),
                                react_1["default"].createElement(card_1.CardDescription, null, "Todas las funcionalidades durante la fase beta.")),
                            react_1["default"].createElement(card_1.CardContent, { className: "px-8" },
                                react_1["default"].createElement("ul", { className: "grid gap-3 text-sm" },
                                    react_1["default"].createElement("li", { className: "flex items-center" },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 mr-2 text-primary" }),
                                        "Ventas y POS Ilimitados"),
                                    react_1["default"].createElement("li", { className: "flex items-center" },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 mr-2 text-primary" }),
                                        "Gesti\u00F3n de Inventario y Reparaciones"),
                                    react_1["default"].createElement("li", { className: "flex items-center" },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 mr-2 text-primary" }),
                                        "Reportes Esenciales y Dashboard"),
                                    react_1["default"].createElement("li", { className: "flex items-center" },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 mr-2 text-primary" }),
                                        "Soporte Directo"))),
                            react_1["default"].createElement(card_1.CardFooter, { className: "p-6" },
                                react_1["default"].createElement(button_1.Button, { className: "w-full", asChild: true, size: "lg" },
                                    react_1["default"].createElement(link_1["default"], { href: "/register" }, "Crear mi Cuenta Gratis")))))))),
        react_1["default"].createElement("section", { className: "bg-gray-100 dark:bg-gray-900" },
            react_1["default"].createElement("div", { className: "container mx-auto px-6 py-24 text-center" },
                react_1["default"].createElement(AnimatedSection, null,
                    react_1["default"].createElement("h2", { className: "text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl" }, "\u00BFListo para Llevar tu Tienda al Siguiente Nivel?"),
                    react_1["default"].createElement("div", { className: "mt-8" },
                        react_1["default"].createElement(button_1.Button, { asChild: true, size: "lg", className: "rounded-full h-12 px-8 text-base" },
                            react_1["default"].createElement(link_1["default"], { href: "/register" }, "Reg\u00EDstrate en 60 Segundos"))))))));
}
exports.LandingPageClient = LandingPageClient;
