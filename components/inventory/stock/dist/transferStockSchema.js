// components/inventory/stock/transfer-stock-form.tsx
"use client";
"use strict";
exports.__esModule = true;
var auth_store_1 = require("@/stores/auth.store");
var z = require("zod");
var transferStockSchema = z
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
        .optional(),
    imei: z.string().optional().nullable(),
    notes: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
})
    .refine(function (data) {
    var selectedProduct = auth_store_1.useAuthStore.getState().tempSelectedProductForTransfer; // Necesitaremos una forma de acceder a tracksImei
    if (selectedProduct === null || selectedProduct === void 0 ? void 0 : selectedProduct.tracksImei) {
        return !!data.imei && data.imei.length > 0;
    }
    else {
        return !!data.quantity && data.quantity > 0;
    }
}, {
    message: "Debes especificar IMEI/Serial para productos serializados, o Cantidad para no serializados."
});
