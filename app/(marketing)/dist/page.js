"use strict";
// app/(marketing)/page.tsx
exports.__esModule = true;
exports.metadata = void 0;
var landing_page_client_1 = require("./landing-page-client"); // Importa el componente de cliente
// 1. Exportar Metadata para SEO (SOLO FUNCIONA EN SERVER COMPONENTS)
exports.metadata = {
    title: "Shopix - Gestión Profesional para Tiendas de Celulares",
    description: "La plataforma todo-en-uno para manejar ventas (POS), inventario, reparaciones y reportes. Optimiza y haz crecer tu negocio.",
    openGraph: {
        title: "Shopix - Gestión Profesional para Tiendas de Celulares",
        description: "Optimiza tu tienda con la plataforma más completa.",
        url: "https://www.tudominio.com",
        siteName: "Shopix",
        images: [{ url: "/images/shopix-og-image.png" /* 1200x630px */ }],
        locale: "es_DO",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Shopix - Gestión Profesional para Tiendas de Celulares",
        description: "POS, Inventario, Reparaciones y Reportes en un solo lugar.",
        images: ["/images/shopix-og-image.png"]
    }
};
// 2. Este es el componente de página que se renderiza en el servidor
function LandingPage() {
    // Simplemente renderiza el componente de cliente que contiene toda la lógica y el JSX
    return React.createElement(landing_page_client_1.LandingPageClient, null);
}
exports["default"] = LandingPage;
