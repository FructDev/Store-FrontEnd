// app/register/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import apiClient from "@/lib/api"; // Nuestro cliente Axios
// import { User } from "@/stores/auth.store"; // Usamos el tipo User si la API devuelve el usuario

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
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
import { Building, CheckCircle, Loader2 } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { getErrorMessage } from "@/lib/utils/get-error-message";

// Schema de validación con Zod
const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
      .max(50, { message: "El nombre no puede exceder los 50 caracteres." }),
    lastName: z
      .string()
      .min(2, { message: "El apellido debe tener al menos 2 caracteres." })
      .max(50, { message: "El apellido no puede exceder los 50 caracteres." }),
    email: z
      .string()
      .email({ message: "Por favor, introduce un correo electrónico válido." }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
      .max(100, {
        message: "La contraseña no puede exceder los 100 caracteres.",
      }),
    // Podríamos añadir regex para complejidad de contraseña aquí si quisiéramos
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"], // Path del error
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface RegisterResponse {
  id: string;
  email: string;
  firstName: string | null; // Prisma puede devolver null para campos opcionales
  lastName: string | null; // Prisma puede devolver null para campos opcionales
  isActive: boolean;
  createdAt: string; // Las fechas de Prisma se serializan como strings ISO
  updatedAt: string;
  storeId: string | null; // El campo storeId SÍ existe en el modelo User
  // Nota: La relación 'roles' o 'permissions' no se devuelve directamente al registrar
}

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const registerMutation = useMutation<
    RegisterResponse,
    Error,
    RegisterFormValues
  >({
    mutationFn: async (data: RegisterFormValues) => {
      // No necesitamos enviar confirmPassword al backend
      const { confirmPassword, ...submissionData } = data;
      const response = await apiClient.post<RegisterResponse>(
        "/auth/register",
        submissionData
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("¡Registro exitoso! Ahora puedes iniciar sesión.");
      console.log(typeof data, data);
      router.push("/login"); // Redirigir a la página de login
    },
    onError: (error: unknown) => {
      const errorMessage = getErrorMessage(error, "Error al generar el PDF.");
      toast.error(errorMessage);
      // Si el mensaje es un array (como a veces devuelve class-validator), lo unimos.
      const displayMessage = Array.isArray(errorMessage)
        ? errorMessage.join(", ")
        : errorMessage;
      toast.error(displayMessage);
      console.error("Register error:", error || errorMessage);
    },
  });

  function onSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      {/* --- Columna Izquierda (Visual/Marca) --- */}
      <div className="hidden bg-muted lg:flex flex-col justify-between p-12 text-foreground">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-2xl"
        >
          <Building className="h-7 w-7 text-primary" />
          <span className="font-bold">Shopix</span>
        </Link>
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-4">
            Comienza a transformar tu negocio hoy.
          </h2>
          <ul className="space-y-3 text-lg text-muted-foreground">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
              <span>Centraliza tus ventas, inventario y reparaciones.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
              <span>Toma decisiones inteligentes con reportes claros.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-1 shrink-0" />
              <span>Ofrece un servicio excepcional a tus clientes.</span>
            </li>
          </ul>
        </div>
        <div>{/* Espacio para alinear con la parte inferior */}</div>
      </div>

      {/* --- Columna Derecha (Formulario) --- */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Crea tu Cuenta
            </h1>
            <p className="mt-2 text-muted-foreground">
              Es rápido, fácil y el primer paso para optimizar tu tienda.
            </p>
          </div>

          <div className="space-y-4">
            {/* Botones de Registro Social */}
            <Button variant="outline" className="w-full h-10">
              <FaGoogle className="mr-2 h-4 w-4" /> Registrarse con Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  O regístrate con tu correo
                </span>
              </div>
            </div>

            {/* Formulario Principal */}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Juan"
                            {...field}
                            disabled={registerMutation.isPending}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Pérez"
                            {...field}
                            disabled={registerMutation.isPending}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                          disabled={registerMutation.isPending}
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
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={registerMutation.isPending}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={registerMutation.isPending}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-10 font-semibold"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Crear Cuenta
                </Button>
              </form>
            </Form>
          </div>

          <p className="mt-6 px-8 text-center text-xs text-muted-foreground">
            Al hacer clic en Crear Cuenta, aceptas nuestros{" "}
            <Link href="/terms" className="underline hover:text-primary">
              Términos de Servicio
            </Link>{" "}
            y nuestra{" "}
            <Link href="/privacy" className="underline hover:text-primary">
              Política de Privacidad
            </Link>
            .
          </p>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
