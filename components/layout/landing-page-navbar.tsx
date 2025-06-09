// components/layout/landing-page-navbar.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LandingPageNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo y Nombre */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg mr-6"
        >
          <Building className="h-6 w-6 text-primary" />
          <span className="font-bold">Shopix</span>
        </Link>

        {/* Enlaces de Navegación (puedes añadirlos aquí si quieres) */}
        {/* <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features">Características</Link>
          <Link href="#pricing">Precios</Link>
        </nav> */}

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isAuthenticated ? (
            // --- VISTA PARA USUARIO AUTENTICADO ---
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Hola, {user?.firstName}
              </span>
              <Button asChild>
                <Link href="/dashboard">Ir al Dashboard</Link>
              </Button>
            </>
          ) : (
            // --- VISTA PARA VISITANTE ---
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Registrarse Gratis</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
