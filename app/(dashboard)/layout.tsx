// app/(dashboard)/layout.tsx
"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useAuthStore } from "@/stores/auth.store"; // Asegúrate que el tipo User esté exportado de tu store
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactQueryProvider from "@/components/providers/react-query-provider"; // Re-añadimos este provider
import NextTopLoader from "nextjs-toploader";
import apiClient from "@/lib/api";

interface StoreSettingsResponse {
  // Tipo para la respuesta de /stores/settings
  id: string;
  name: string;
  // ... otros campos que devuelve el endpoint ...
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isAuthenticated, setStoreName } = useAuthStore(); // Obtener isAuthenticated
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const fetchStoreName = async () => {
      if (user?.storeId && !user.storeName) {
        // Si tenemos storeId pero no storeName
        try {
          const response = await apiClient.get<StoreSettingsResponse>(
            "/stores/settings"
          );
          if (response.data?.name) {
            setStoreName(response.data.name);
          }
        } catch (error) {
          console.error("Error fetching store settings for name:", error);
        }
      }
    };

    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      const tokenAfterHydration = useAuthStore.getState().token;
      const hydratedUser = useAuthStore.getState().user;
      if (!tokenAfterHydration) {
        router.replace("/login");
      } else {
        setIsVerifying(false);
        if (hydratedUser?.storeId && !hydratedUser.storeName) {
          fetchStoreName(); // Llamar después de confirmar autenticación y storeId
        }
      }
    });

    if (useAuthStore.persist.hasHydrated()) {
      const tokenFromState = useAuthStore.getState().token;
      const hydratedUser = useAuthStore.getState().user;
      if (!tokenFromState) {
        router.replace("/login");
      } else {
        setIsVerifying(false);
        if (hydratedUser?.storeId && !hydratedUser.storeName) {
          fetchStoreName(); // Llamar después de confirmar autenticación y storeId
        }
      }
    }

    return () => {
      unsubscribe();
    };
  }, [user, setStoreName, router]);

  if (isVerifying) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Verificando sesión y cargando...
      </div>
    );
  }

  // Este chequeo es una salvaguarda si la redirección del useEffect no es inmediata
  if (
    !isAuthenticated &&
    useAuthStore.persist.hasHydrated() &&
    typeof window !== "undefined"
  ) {
    router.replace("/login");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        Redirigiendo al login...
      </div>
    );
  }

  return (
    // Envolver con ReactQueryProvider
    <ReactQueryProvider>
      <NextTopLoader color="#2563eb" showSpinner={false} />
      {/* Contenedor Flex Principal para Sidebar y Contenido */}
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar />{" "}
        {/* El Sidebar es 'fixed' y se superpondrá si no se maneja el margen */}
        {/* Contenedor para Header y Main Content que SÍ tendrá margen */}
        <div className="flex flex-1 flex-col md:ml-60">
          {" "}
          {/* <-- ¡CAMBIO CLAVE AQUÍ! ml-60 en md y mayores */}
          <Header user={user} onLogout={logout} />
          <main className="flex-1 overflow-y-auto p-4 sm:px-6 sm:py-6 md:gap-8">
            {" "}
            {/* overflow-y-auto para scroll en main */}
            {children}
          </main>
        </div>
      </div>
    </ReactQueryProvider>
  );
}
