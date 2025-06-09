// lib/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth.store"; // Ajusta la ruta si es diferente

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", // URL base de tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de Solicitud: Añadir token JWT a las cabeceras
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Tipar config explícitamente
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Respuesta: Manejar errores (ej. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Tipar error como AxiosError
    if (error.response) {
      if (error.response.status === 401) {
        // Token inválido/expirado o no autorizado
        console.error("API Client: 401 Unauthorized, logging out.");
        useAuthStore.getState().logout(); // Limpiar sesión
        // Redirigir a login. En Next.js App Router, esto se hace mejor
        // desde el componente/layout que detecta la falta de autenticación.
        // Evitar hard redirects (window.location.href) aquí si es posible.
        // El layout del dashboard se encargará de la redirección.
      }
      // Podrías manejar otros errores comunes aquí (403, 500)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
