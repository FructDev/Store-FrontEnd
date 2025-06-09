// app/components/Footer.tsx
"use client";

import Link from "next/link";
import { Building } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Logo y Descripción */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Building className="h-7 w-7 text-primary" />
              <span className="text-xl font-bold text-white">Shopix</span>
            </Link>
            <p className="text-sm">
              La plataforma definitiva para la gestión de tiendas de celulares y
              centros de reparación.
            </p>
          </div>

          {/* Columna 2: Producto */}
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase mb-4">
              Producto
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="#features"
                className="hover:text-primary transition-colors"
              >
                Características
              </Link>
              <Link
                href="#pricing"
                className="hover:text-primary transition-colors"
              >
                Precios
              </Link>
              <Link
                href="#faq"
                className="hover:text-primary transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase mb-4">
              Legal
            </h3>
            <nav className="flex flex-col space-y-2">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Términos de Servicio
              </Link>
            </nav>
          </div>

          {/* Columna 4: Redes Sociales */}
          <div>
            <h3 className="font-semibold text-white tracking-wider uppercase mb-4">
              Síguenos
            </h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-primary transition-colors">
                <FaTwitter />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <FaFacebookF />
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                <FaInstagram />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm">
          <p>
            © {new Date().getFullYear()} SaaShopix. Construido con pasión en la
            República Dominicana.
          </p>
        </div>
      </div>
    </footer>
  );
}
