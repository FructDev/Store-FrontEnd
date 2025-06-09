// app/login/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; // Usaremos sonner directamente

import apiClient from "@/lib/api"; // Nuestro cliente Axios
import { useAuthStore, User } from "@/stores/auth.store"; // Nuestro store de Zustand y tipo User

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import { Building, Loader2 } from "lucide-react"; // Para el spinner de carga
import Link from "next/link";
import { FaGoogle } from "react-icons/fa";

// Definir el schema de validación con Zod
const loginFormSchema = z.object({
  email: z
    .string()
    .email({ message: "Por favor, introduce un correo válido." }),
  password: z.string().min(6, {
    // Ajusta el minLength si es diferente en tu backend
    message: "La contraseña debe tener al menos 6 caracteres.", // O el que sea
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// Interfaz para la respuesta esperada del API de login
interface LoginResponse {
  accessToken: string;
  user: User; // Usamos la interfaz User de nuestro auth.store
}

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuthStore(); // Renombrar para evitar conflicto con la función 'login' del mutation

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: async (data: LoginFormValues) => {
      const response = await apiClient.post<LoginResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("¡Inicio de sesión exitoso!");
      authLogin(data.accessToken, data.user); // Actualizar store de Zustand

      // Redirigir basado en si la tienda está configurada
      if (data.user.storeId) {
        router.push("/dashboard"); // Si tiene tienda, al dashboard
      } else {
        router.push("/create-store"); // Si no tiene tienda, a la página de creación de tienda
      }
    },
    onError: (error: any) => {
      // Manejar errores específicos del backend
      const errorMessage =
        error.response?.data?.message ||
        "Error al iniciar sesión. Verifica tus credenciales.";
      toast.error(errorMessage);
      console.error("Login error:", error.response?.data || error.message);
    },
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate(data);
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      {/* --- Columna Derecha (Formulario) --- */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="text-left">
            <Link href="/" className="inline-block mb-6">
              <Building className="h-8 w-8 text-primary" />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bienvenido de Nuevo
            </h1>
            <p className="mt-2 text-muted-foreground">
              Ingresa tus credenciales para acceder a tu dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {/* Botones de Login Social (Placeholder) */}
            <Button variant="outline" className="w-full h-10">
              <FaGoogle className="mr-2 h-4 w-4" /> Iniciar sesión con Google
            </Button>
            {/* Puedes añadir más proveedores como GitHub, etc. */}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O continúa con
                </span>
              </div>
            </div>

            {/* Formulario Principal */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="tu@correo.com"
                          {...field}
                          disabled={loginMutation.isPending}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center">
                        <FormLabel>Contraseña</FormLabel>
                        <Link
                          href="/forgot-password"
                          className="ml-auto inline-block text-sm underline"
                        >
                          ¿La olvidaste?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={loginMutation.isPending}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-10 text-sm font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Iniciar Sesión
                </Button>
              </form>
            </Form>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* --- Columna Izquierda (Visual/Marca) - Ahora a la derecha en el código para mejor orden en móvil --- */}
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_90%_10%,_#3b82f644_0%,#f1f5f900_40%)] dark:bg-[radial-gradient(circle_at_90%_10%,_#3b82f633_0%,#020817_40%)]"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-foreground">
            &apos; El control de nuestro inventario y reparaciones nunca fue tan
            sencillo.&apos;
          </h2>
          <p className="mt-4 text-muted-foreground">— Gerente, TechFix RD</p>
        </div>
      </div>
    </div>
  );
}
