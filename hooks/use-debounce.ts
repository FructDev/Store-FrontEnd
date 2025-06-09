// hooks/use-debounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Actualizar el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timeout si el valor cambia (o si el delay cambia o el componente se desmonta)
    // Esto es para evitar que el valor debounced se actualice si el valor original cambia rápidamente
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo re-ejecutar el efecto si el valor o el delay cambian

  return debouncedValue;
}
