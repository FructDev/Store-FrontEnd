// app/components/PublicNavbar.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react"; // Usaremos lucide-react para el logo por consistencia

export function PublicNavbar() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo y Nombre */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Building className="h-6 w-6 text-primary" />
          <span className="font-bold">Shopix</span>
        </Link>

        {/* Acciones */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            // --- VISTA PARA USUARIO AUTENTICADO ---
            <Button asChild>
              <Link href="/dashboard">Ir al Dashboard</Link>
            </Button>
          ) : (
            // --- VISTA PARA VISITANTE ---
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/register">Comenzar Gratis</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
