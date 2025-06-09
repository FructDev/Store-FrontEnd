// app/(marketing)/landing-page-client.tsx
"use client"; // <-- MUY IMPORTANTE

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBox, FaTools, FaShoppingCart } from "react-icons/fa";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  CheckCircle,
  BarChart2,
  Archive,
  Wrench,
  Loader2,
  Building,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Sub-componente para animaciones al hacer scroll
const AnimatedSection = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Componente para tarjetas de características con animación
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={cardVariants}
      className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full">
        <Icon className="text-primary text-3xl" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
};

// El nombre del componente exportado por defecto
export function LandingPageClient() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <main className="bg-white dark:bg-gray-950 text-foreground">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_50%_50%,_#818cf844_0%,#FFFFFF00_100%)] dark:bg-[radial-gradient(40%_50%_at_50%_50%,_#383d8166_0%,#030712_100%)]"></div>
        <div className="container px-6 mx-auto">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-7xl">
              La Gestión de tu Tienda,{" "}
              <span className="text-primary">Reinventada</span>.
            </h1>
            <p className="mt-6 text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
              Shopix es la plataforma todo-en-uno que centraliza tus ventas,
              inventario y reparaciones. Dedica más tiempo a tus clientes y
              menos a las hojas de cálculo.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-8 text-base shadow-lg hover:shadow-primary/30 transition-shadow"
              >
                <Link href="/register">
                  Comienza Gratis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Features Section */}
      <section
        id="features"
        className="py-20 md:py-24 bg-gray-50 dark:bg-black"
      >
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Un Sistema, Posibilidades Infinitas
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Integramos las herramientas esenciales para el éxito de tu negocio
              en una sola plataforma intuitiva.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={FaShoppingCart}
              title="Punto de Venta Eficiente"
              description="Procesa ventas rápidamente, acepta múltiples métodos de pago y aplica descuentos complejos sin esfuerzo."
              delay={0.1}
            />
            <FeatureCard
              icon={FaBox}
              title="Control de Inventario Total"
              description="Desde productos serializados (IMEI) hasta lotes y ubicaciones. Tus órdenes de compra y conteos, simplificados."
              delay={0.2}
            />
            <FeatureCard
              icon={FaTools}
              title="Flujo de Reparaciones Claro"
              description="Gestiona cada reparación desde el diagnóstico hasta la facturación. Mantén a tus clientes y técnicos informados."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* 3. Pricing Section (Simplificada y Profesional) */}
      <section
        id="pricing"
        className="py-20 md:py-24 bg-white dark:bg-gray-950"
      >
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Un Precio Justo y Transparente
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Comienza con nuestro plan beta y ayúdanos a construir la mejor
              herramienta para tu negocio.
            </p>
          </AnimatedSection>
          <div className="flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-md"
            >
              <Card className="relative border-2 border-primary shadow-2xl shadow-primary/20">
                <Badge
                  variant="secondary"
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                >
                  Acceso Beta
                </Badge>
                <CardHeader className="text-center p-8">
                  <CardTitle className="text-2xl font-bold">
                    Plan Profesional
                  </CardTitle>
                  <p className="text-5xl font-extrabold tracking-tight my-4">
                    Gratis
                  </p>
                  <CardDescription>
                    Todas las funcionalidades durante la fase beta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                  <ul className="grid gap-3 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                      Ventas y POS Ilimitados
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                      Gestión de Inventario y Reparaciones
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                      Reportes Esenciales y Dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                      Soporte Directo
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="p-6">
                  <Button className="w-full" asChild size="lg">
                    <Link href="/register">Crear mi Cuenta Gratis</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Final CTA Section */}
      <section className="bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-6 py-24 text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              ¿Listo para Llevar tu Tienda al Siguiente Nivel?
            </h2>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="rounded-full h-12 px-8 text-base"
              >
                <Link href="/register">Regístrate en 60 Segundos</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
