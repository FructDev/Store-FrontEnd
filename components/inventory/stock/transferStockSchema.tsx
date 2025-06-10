// components/inventory/stock/transfer-stock-form.tsx
"use client";
import { useAuthStore } from "@/stores/auth.store";
import * as z from "zod";

const transferStockSchema = z
  .object({
    productId: z.string().min(1, "Debes seleccionar un producto."),
    fromLocationId: z
      .string()
      .min(1, "Debes seleccionar una ubicación de origen."),
    toLocationId: z
      .string()
      .min(1, "Debes seleccionar una ubicación de destino."),
    quantity: z.coerce
      .number()
      .positive("Cantidad debe ser positiva.")
      .optional(), // Opcional, requerido si no es serializado
    imei: z.string().optional().nullable(), // Opcional, requerido si es serializado
    notes: z
      .string()
      .max(255)
      .optional()
      .nullable()
      .transform((val) => (val === "" ? null : val)),
  })
  .refine(
    (data) => {
      const selectedProduct =
        useAuthStore.getState().tempSelectedProductForTransfer; // Necesitaremos una forma de acceder a tracksImei
      if (selectedProduct?.tracksImei) {
        return !!data.imei && data.imei.length > 0;
      } else {
        return !!data.quantity && data.quantity > 0;
      }
    },
    {
      message:
        "Debes especificar IMEI/Serial para productos serializados, o Cantidad para no serializados.",
      // Path podría ser 'imei' o 'quantity' pero es una validación a nivel de objeto
    }
  );
console.log(typeof transferStockSchema);
