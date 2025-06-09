// app/(marketing)/page.tsx

import type { Metadata } from "next";
import { LandingPageClient } from "./landing-page-client"; // Importa el componente de cliente

// 1. Exportar Metadata para SEO (SOLO FUNCIONA EN SERVER COMPONENTS)
export const metadata: Metadata = {
  title: "Shopix - Gestión Profesional para Tiendas de Celulares",
  description:
    "La plataforma todo-en-uno para manejar ventas (POS), inventario, reparaciones y reportes. Optimiza y haz crecer tu negocio.",
  openGraph: {
    title: "Shopix - Gestión Profesional para Tiendas de Celulares",
    description: "Optimiza tu tienda con la plataforma más completa.",
    url: "https://www.tudominio.com", // Reemplaza con tu dominio real
    siteName: "Shopix",
    images: [{ url: "/images/shopix-og-image.png" /* 1200x630px */ }],
    locale: "es_DO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopix - Gestión Profesional para Tiendas de Celulares",
    description: "POS, Inventario, Reparaciones y Reportes en un solo lugar.",
    images: ["/images/shopix-og-image.png"],
  },
};

// 2. Este es el componente de página que se renderiza en el servidor
export default function LandingPage() {
  // Simplemente renderiza el componente de cliente que contiene toda la lógica y el JSX
  return <LandingPageClient />;
}
