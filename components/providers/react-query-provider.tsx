// components/providers/react-query-provider.tsx
"use client"; // Este componente usa React.useState, por lo que es un Client Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Usamos React.useState para asegurar que QueryClient solo se cree una vez por renderizado del lado del cliente
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 1, // 1 minuto de staleTime como ejemplo
            refetchOnWindowFocus: false, // Puede ser útil desactivarlo en desarrollo
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
