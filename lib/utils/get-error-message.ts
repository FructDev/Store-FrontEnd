// lib/utils/get-error-message.ts

// Interfaz que describe la estructura de un error de Axios
interface AxiosErrorWithMessage {
  response?: {
    data?: unknown; // La data puede ser cualquier cosa, la inspeccionaremos después
  };
}

// Type Guard para verificar si un error tiene la forma de un error de Axios
function isAxiosError(error: unknown): error is AxiosErrorWithMessage {
  return typeof error === "object" && error !== null && "response" in error;
}

// --- NUEVO TYPE GUARD ---
// Verifica si un valor es un objeto con una propiedad 'message' que es un string
function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}
// --- FIN NUEVO TYPE GUARD ---

/**
 * Extrae un mensaje de error legible de un objeto de error desconocido.
 * Es asíncrona para poder leer blobs de error.
 * @param error El error capturado (de tipo unknown).
 * @param defaultMessage Un mensaje por defecto.
 * @returns Una Promesa que se resuelve a un string con el mensaje de error.
 */
export async function getErrorMessage(
  error: unknown,
  defaultMessage: string = "Ocurrió un error inesperado."
): Promise<string> {
  // Primero, vemos si es un error de Axios
  if (isAxiosError(error) && error.response?.data) {
    const errorData = error.response.data;

    // Caso 1: La data del error es un Blob que en realidad es JSON
    if (errorData instanceof Blob && errorData.type === "application/json") {
      try {
        const errorJson = JSON.parse(await errorData.text());
        // Ahora usamos nuestro nuevo type guard en el JSON parseado
        if (isErrorWithMessage(errorJson)) {
          return errorJson.message;
        }
      } catch {
        // Si el parseo falla, continuamos con los otros chequeos
      }
    }

    // Caso 2: La data del error ya es un objeto con una propiedad 'message'
    if (isErrorWithMessage(errorData)) {
      return errorData.message;
    }
  }

  // Caso 3: Es una instancia de Error estándar de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  // Caso 4: Es un string
  if (typeof error === "string") {
    return error;
  }

  // Último recurso: el mensaje por defecto
  return defaultMessage;
}
