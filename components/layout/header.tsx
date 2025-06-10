// components/layout/header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Para un posible título de página simple
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  UserCircle2,
  LogOut,
  Building,
  // Settings, // Ejemplo si añades link de configuración
  // User, // Icono para Perfil
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as AuthUserType } from "@/stores/auth.store"; // Renombrar para evitar conflicto
import { Sidebar } from "./sidebar"; // Para el menú móvil

interface HeaderProps {
  user: AuthUserType | null;
  onLogout: () => void;
}

// Función simple para obtener un título basado en el pathname (puedes expandirla)
const getPageTitle = (pathname: string): string => {
  if (pathname === "/dashboard") return "Dashboard Principal";
  if (pathname.startsWith("/dashboard/sales/pos"))
    return "Punto de Venta (POS)";
  if (pathname.startsWith("/dashboard/sales")) return "Gestión de Ventas";
  if (pathname.startsWith("/dashboard/repairs/new"))
    return "Nueva Orden de Reparación";
  if (pathname.startsWith("/dashboard/repairs"))
    return "Gestión de Reparaciones";
  if (pathname.startsWith("/dashboard/inventory"))
    return "Gestión de Inventario";
  if (pathname.startsWith("/dashboard/reports")) return "Centro de Reportes";
  if (pathname.startsWith("/dashboard/customers")) return "Clientes";
  if (pathname.startsWith("/dashboard/users")) return "Gestión de Usuarios";
  if (pathname.startsWith("/dashboard/settings")) return "Configuración";
  // Añade más rutas según sea necesario
  return "Panel de Control"; // Fallback
};

export function Header({ user, onLogout }: HeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
      {" "}
      {/* Ocultar en impresión */}
      <div className="container flex h-14 items-center px-4 sm:px-6">
        {" "}
        {/* Padding ajustado */}
        {/* Menú Hamburguesa para Móviles (Izquierda) */}
        <div className="md:hidden mr-3">
          {" "}
          {/* mr-3 para un poco de espacio */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col p-0 w-72 sm:w-80"
            >
              {" "}
              {/* Ancho responsive para el sheet */}
              {/* Encabezado dentro del Sheet */}
              <div className="flex h-14 items-center border-b px-4 shrink-0">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 font-semibold text-lg"
                >
                  <Building className="h-6 w-6 text-primary" />
                  <span>{user?.storeName || "SaaShopix"}</span>
                </Link>
              </div>
              {/* Sidebar dentro del Sheet (con su propio scroll) */}
              <div className="flex-1 overflow-y-auto">
                <Sidebar />{" "}
                {/* Sidebar ya tiene su padding interno para los nav items */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {/* Nombre de la Tienda/App - Visible en md+ si no hay título de página, o como fallback */}
        {/* Opcional: Si quieres el nombre de la tienda siempre visible en pantallas grandes a la izquierda */}
        <div className="hidden md:flex items-center mr-auto">
          {" "}
          {/* mr-auto para empujar el resto */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-foreground/90 hover:text-foreground"
          >
            <Building className="h-5 w-5 text-primary" />
            <span className="hidden lg:inline-block">
              {user?.storeName || "SaaShopix"}
            </span>
          </Link>
        </div>
        {/* Título de la Página Actual (Centro) - Se oculta en pantallas muy pequeñas si el espacio es limitado */}
        <div className="flex-1 text-center hidden sm:block">
          <h1
            className="text-md font-semibold text-foreground truncate px-2"
            title={pageTitle}
          >
            {pageTitle}
          </h1>
        </div>
        {/* Acciones del Usuario (Derecha) */}
        <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
          {" "}
          {/* ml-auto para empujar a la derecha */}
          <span className="text-sm text-muted-foreground hidden lg:inline">
            {" "}
            {/* Mostrar en lg+ */}
            Hola, {user?.firstName || "Usuario"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                {" "}
                {/* Botón un poco más grande */}
                <UserCircle2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* TODO: Añadir enlaces reales si se implementan estas páginas */}
              {/* <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer flex items-center">
                  <User className="mr-2 h-4 w-4" /> Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer flex items-center">
                 <Settings className="mr-2 h-4 w-4" /> Configuración Tienda
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer text-red-600 dark:text-red-500 hover:!bg-red-500/10 focus:!bg-red-500/10 focus:!text-red-700 dark:focus:!text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
