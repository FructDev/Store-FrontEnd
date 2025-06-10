// components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Package,
  Users,
  UserCircle,
  Settings,
  Building,
  FileText,
  //ChevronDown, // Para futuros submenús
  //ChevronRight // Para futuros submenús
} from "lucide-react";
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"; // Para futuros submenús

export interface NavItem {
  // Definir un tipo para los ítems
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  permission?: string; // Para un futuro sistema de permisos más granular
  subItems?: NavItem[];
  disabled?: boolean; // Para deshabilitar enlaces temporalmente
}

// Mover navItems a una constante separada o incluso a un archivo de configuración
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/sales", label: "Ventas", icon: ShoppingCart },
  { href: "/dashboard/repairs", label: "Reparaciones", icon: Wrench },
  { href: "/dashboard/inventory", label: "Inventario", icon: Package },
  { href: "/dashboard/reports", label: "Reportes", icon: FileText },
  { href: "/dashboard/customers", label: "Clientes", icon: Users },
  {
    href: "/dashboard/users",
    label: "Usuarios",
    icon: UserCircle,
    adminOnly: true,
  },
  {
    href: "/dashboard/settings",
    label: "Configuración",
    icon: Settings,
    adminOnly: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  // const isAdmin = user?.roles.includes('STORE_ADMIN'); // O tu lógica de roles

  // Filtrar navItems basados en roles/permisos si es necesario
  const visibleNavItems = NAV_ITEMS.filter(() => {
    // if (item.adminOnly && !isAdmin) return false; // Ejemplo simple de filtro por rol
    // if (item.permission && !userHasPermission(item.permission)) return false; // Lógica de permisos más granular
    return true; // Mostrar todos por ahora
  });

  return (
    <aside className="fixed top-0 left-0 z-30 h-full w-60 flex-col border-r bg-background hidden md:flex print:hidden">
      {" "}
      {/* print:hidden para no imprimir el sidebar */}
      {/* Encabezado del Sidebar (Logo/Nombre Tienda) */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
        {" "}
        {/* shrink-0 para que no se encoja */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-lg hover:opacity-80 transition-opacity" // Tamaño de texto y efecto hover
        >
          <Building className="h-6 w-6 text-primary" />{" "}
          {/* Icono con color primario */}
          <span className="text-foreground">
            {user?.storeName || "SaaShopix"}
          </span>
        </Link>
      </div>
      {/* Contenedor de Navegación Scrolleable */}
      <div className="flex-1 overflow-y-auto py-3">
        {" "}
        {/* Ajustar padding vertical si es necesario */}
        <nav className="grid items-start gap-0.5 px-2 text-sm font-medium lg:px-4">
          {" "}
          {/* space-y-1 a gap-0.5 para control más fino */}
          {visibleNavItems.map((item) => {
            const isActive =
              (item.href === "/dashboard" && pathname === item.href) ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            // TODO: Implementar lógica para subItems con <Collapsible> si se decide usar
            // if (item.subItems && item.subItems.length > 0) {
            //   return ( <Collapsible key={item.label}> ... </Collapsible> );
            // }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-muted-foreground transition-colors duration-150 ease-in-out", // py-2.5 para un poco más de altura
                  "hover:bg-accent hover:text-accent-foreground", // Hover state más claro
                  isActive && "bg-primary/10 text-primary font-semibold", // Estado activo más distintivo
                  item.disabled && "opacity-50 cursor-not-allowed" // Para ítems deshabilitados
                )}
                aria-disabled={item.disabled}
                onClick={(e) => item.disabled && e.preventDefault()}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-accent-foreground"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* (Opcional) Sección inferior del Sidebar, ej. perfil de usuario o botón de logout rápido */}
      {/* <div className="mt-auto p-4 border-t">
           <Button variant="ghost" className="w-full justify-start">
             <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión (Ejemplo)
           </Button>
         </div> */}
    </aside>
  );
}
