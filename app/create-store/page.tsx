// app/create-store/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { useAuthStore, User } from "@/stores/auth.store"; // Importa el store y el tipo User

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, PartyPopper, Rocket } from "lucide-react";
import { useEffect } from "react";

// Schema de validación con Zod para el nombre de la tienda
const createStoreFormSchema = z.object({
  name: z
    .string()
    .min(3, {
      message: "El nombre de la tienda debe tener al menos 3 caracteres.",
    })
    .max(100, { message: "El nombre no puede exceder los 100 caracteres." }),
  // Podríamos añadir más campos si el DTO del backend los requiere al crear tienda,
  // pero nuestro CreateStoreDto actual solo pide 'name'.
});

type CreateStoreFormValues = z.infer<typeof createStoreFormSchema>;

// Interfaz para la respuesta esperada del API de creación de tienda (modelo Store)
interface StoreResponse {
  id: string;
  name: string;
  // ...otros campos del modelo Store que devuelve el backend
}

export default function CreateStorePage() {
  const router = useRouter();
  const { user, setUser, token, isAuthenticated } = useAuthStore(); // Obtener usuario y acción setUser
  //   const queryClient = useQueryClient(); // Para invalidar queries si es necesario

  // Redirigir si ya tiene tienda o no está logueado
  useEffect(() => {
    if (!isAuthenticated && token) {
      // Todavía cargando o token existe pero no user
      // Podríamos esperar a que useAuthStore termine de hidratarse
      // o si el token es inválido, el interceptor de API lo manejará
    } else if (!isAuthenticated && !token) {
      router.replace("/login");
    } else if (user?.storeId) {
      router.replace("/dashboard"); // Si ya tiene tienda, al dashboard
    }
  }, [user, token, isAuthenticated, router]);

  const form = useForm<CreateStoreFormValues>({
    resolver: zodResolver(createStoreFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const createStoreMutation = useMutation<
    StoreResponse,
    Error,
    CreateStoreFormValues
  >({
    mutationFn: async (data: CreateStoreFormValues) => {
      const response = await apiClient.post<StoreResponse>("/stores", data); // Endpoint de backend
      return response.data;
    },
    onSuccess: (newStoreData) => {
      toast.success(`¡Tienda "${newStoreData.name}" creada exitosamente!`);

      // Actualizar el storeId en el usuario del store de Zustand
      if (user) {
        const updatedUser: User = {
          ...user,
          storeId: newStoreData.id,
          // Los roles podrían cambiar a STORE_ADMIN aquí si el backend los asigna
          // y el login inicial no lo hizo. Sería ideal re-autenticar o
          // pedir al backend que devuelva el usuario actualizado con el rol.
          // Por ahora, solo actualizamos storeId.
        };
        setUser(updatedUser); // Actualiza el usuario en Zustand
      }

      // Opcional: Invalidar queries que dependan de la info del usuario/tienda
      // queryClient.invalidateQueries({ queryKey: ['authUserProfile'] });

      router.push("/dashboard"); // Redirigir al dashboard
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "Error al crear la tienda.";
      toast.error(errorMessage);
      console.error(
        "Create store error:",
        error.response?.data || error.message
      );
    },
  });

  function onSubmit(data: CreateStoreFormValues) {
    createStoreMutation.mutate(data);
  }

  // Si el usuario aún no se ha cargado o ya tiene tienda, y estamos redirigiendo
  if (!user || user.storeId) {
    return <div>Cargando o redirigiendo...</div>; // Evitar renderizar el form innecesariamente
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-black">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f633,#02081700)]"></div>
      </div>

      <div className="w-full max-w-lg text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 mb-6 bg-primary/10 rounded-2xl">
          <PartyPopper className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          ¡Estás a un paso!
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Bienvenido, {user.firstName}. Dale un nombre a tu tienda para
          finalizar la configuración de tu cuenta.
        </p>

        <div className="mt-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto max-w-sm space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">
                      Nombre de la Tienda
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: El Palacio del Celular"
                        {...field}
                        disabled={createStoreMutation.isPending}
                        className="h-12 text-center text-base" // Input más grande y centrado
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={createStoreMutation.isPending}
                size="lg"
              >
                {createStoreMutation.isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Crear mi Tienda y Despegar
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Podrás cambiar este nombre y otros detalles más tarde en la
          configuración.
        </p>
      </div>
    </div>
  );
}
