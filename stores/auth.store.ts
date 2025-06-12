// stores/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Define la interfaz User para que coincida con lo que devuelve tu API de login
// Asegúrate de incluir 'permissions' como lo configuramos en el backend.
export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: Array<{ id: string; name: string }>;
  storeId: string | null;
  permissions: string[]; // Array de strings de permisos
  isActive: boolean;
  storeName?: string | null;
  // Añade otros campos que devuelve tu API si los necesitas globalmente
  // createdAt?: string | Date;
  // updatedAt?: string | Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  setUser: (userData: User | null) => void;
  setToken: (token: string | null) => void; // Útil para inicializar desde localStorage
  setStoreName: (name: string) => void;
  tempSelectedProductForTransfer: { tracksImei: boolean } | null;
  setTempSelectedProductForTransfer: (
    product: { tracksImei: boolean } | null
  ) => void;
  // Podríamos añadir un estado de 'loading' si la verificación inicial es asíncrona
}

export const useAuthStore = create<AuthState>()(
  persist(
    // Usamos el middleware 'persist' para guardar en localStorage
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, userData) => {
        set({ token, user: userData, isAuthenticated: true });
        // Si usamos Axios globalmente, podríamos setear el header aquí,
        // pero es mejor hacerlo en el interceptor de Axios.
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
        // Limpiar cualquier otro estado relacionado si es necesario
        // if (typeof window !== "undefined") {
        //   window.location.href = '/login'; // Forzar redirección si es necesario
        // }
      },
      setUser: (userData) =>
        set({ user: userData, isAuthenticated: !!userData }),
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setStoreName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, storeName: name } : null,
        })),
      tempSelectedProductForTransfer: null,
      setTempSelectedProductForTransfer: (product) =>
        set({ tempSelectedProductForTransfer: product }),
    }),
    {
      name: "saashopix-auth-storage", // Nombre para el item en localStorage
      storage: createJSONStorage(() => localStorage), // Especificar localStorage
      // Opcional: onRehydrateStorage para saber cuándo terminó de cargar del storage
      onRehydrateStorage: () => {
        console.log("AuthStore: Hydration finished");
        // Podrías llamar a setToken aquí si el estado inicial no se carga bien
        // if (state?.token) useAuthStore.getState().setToken(state.token);
        return (state, error) => {
          if (error) {
            console.error("AuthStore: Failed to rehydrate state", error);
          }
        };
      },
    }
  )
);

// Inicializar el estado desde localStorage al cargar la app (si no lo hace persist automáticamente)
// Esto es importante para que isAuthenticated sea correcto al recargar la página.
// 'persist' middleware usualmente maneja esto, pero un chequeo explícito puede ser útil.
if (typeof window !== "undefined") {
  const initialToken = useAuthStore.getState().token;
  if (initialToken) {
    useAuthStore.getState().setToken(initialToken);
  }
}
