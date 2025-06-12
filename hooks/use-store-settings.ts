// hooks/use-store-settings.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { StoreSettings } from "@/types/settings.types";
import { useAuthStore } from "@/stores/auth.store";

export function useStoreSettings() {
  const { user } = useAuthStore();

  return useQuery<StoreSettings, Error>({
    // La clave de la query es simple. React Query la usará para cachear los datos.
    queryKey: ["storeSettings", user?.storeId],

    // La función que obtiene los datos
    queryFn: async () => {
      const response = await apiClient.get<StoreSettings>("/stores/settings");
      return response.data;
    },

    // Opciones para optimizar:
    enabled: !!user, // Solo ejecuta esta query si el usuario está logueado
    staleTime: 1000 * 60 * 60, // Considera los datos "frescos" por 1 hora
    refetchOnWindowFocus: false, // No recargar solo por cambiar de pestaña
  });
}
