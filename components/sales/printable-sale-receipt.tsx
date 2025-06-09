// components/sales/printable-sale-receipt.tsx
"use client";

import React from "react";
import { EnrichedSaleDetailed } from "@/types/sales.types";
import { StoreSettings } from "@/types/settings.types";
import { formatCurrency, formatDate } from "@/lib/utils/formatters";
import { Separator } from "@/components/ui/separator";
import { PaymentMethod as PrismaPaymentMethod } from "@/types/prisma-enums";
import { cn } from "@/lib/utils";

// Este objeto de mapeo sigue siendo útil para mostrar el nombre del método de pago
const paymentMethodLabels: Record<PrismaPaymentMethod, string> = {
  CASH: "Efectivo",
  CARD_CREDIT: "T. Crédito",
  CARD_DEBIT: "T. Débito",
  TRANSFER: "Transferencia",
  MOBILE_WALLET: "Billetera Móvil",
  STORE_CREDIT: "Crédito Tienda",
  OTHER: "Otro",
};

// El tipo para los tamaños de papel sigue siendo útil para controlar los estilos de la previsualización
export type ReceiptPaperSize =
  | "POS_RECEIPT_58MM"
  | "POS_RECEIPT_80MM"
  | "A4_INVOICE";

interface PrintableSaleReceiptProps {
  sale: EnrichedSaleDetailed | null;
  storeSettings: Partial<
    Pick<
      StoreSettings,
      | "name"
      | "address"
      | "phone"
      | "email"
      | "rnc"
      | "logoUrl"
      | "receiptFooterNotes"
      | "currencySymbol"
      | "defaultTaxRate"
    >
  > | null;
  paperSize?: ReceiptPaperSize;
}

// --- SIMPLIFICACIÓN: Ya no se necesita React.forwardRef ---
export function PrintableSaleReceipt({
  sale,
  storeSettings,
  paperSize = "POS_RECEIPT_80MM", // Default a 80mm para la previsualización
}: PrintableSaleReceiptProps) {
  if (!sale) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No hay datos de venta para previsualizar.
      </div>
    );
  }

  const currency = storeSettings?.currencySymbol || "RD$";
  // La tasa de impuesto se usa para mostrar el % en el recibo
  const taxRate = storeSettings?.defaultTaxRate ?? 0;

  return (
    // El 'ref' se ha eliminado. Este div es solo para estilizar la previsualización.
    <div
      className={cn(
        "printable-receipt-area bg-white text-black font-mono text-xs mx-auto p-3 shadow-md",
        // Clases de ancho para simular el tamaño del papel en pantalla
        paperSize === "POS_RECEIPT_58MM"
          ? "w-[300px]"
          : paperSize === "POS_RECEIPT_80MM"
          ? "w-[400px]"
          : "w-full max-w-4xl" // Para A4
        // Ya no necesitamos las clases 'print:...' aquí porque este componente no se imprime directamente.
      )}
    >
      {/* 1. Encabezado de la Tienda */}
      <header className="text-center mb-2">
        {storeSettings?.logoUrl && (
          <img
            src={storeSettings.logoUrl}
            alt="Logo Tienda"
            className="h-12 max-w-[150px] mx-auto mb-1"
          />
        )}
        <h2 className="font-bold text-sm uppercase">
          {storeSettings?.name || "NOMBRE DE TIENDA"}
        </h2>
        {storeSettings?.address && <p>{storeSettings.address}</p>}
        {storeSettings?.rnc && <p>RNC: {storeSettings.rnc}</p>}
        {storeSettings?.phone && <p>Tel: {storeSettings.phone}</p>}
      </header>

      <Separator className="my-2 border-dashed border-black" />

      {/* 2. Detalles de la Transacción */}
      <section className="space-y-0.5 text-[10pt]">
        <div className="flex justify-between">
          <span>Venta #:</span>
          <span className="font-semibold">{sale.saleNumber}</span>
        </div>
        {sale.ncf && (
          <div className="flex justify-between">
            <span>NCF:</span>
            <span className="font-semibold">{sale.ncf}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Fecha:</span>
          <span>{formatDate(sale.saleDate, "dd/MM/yy HH:mm")}</span>
        </div>
        {sale.user && (
          <div className="flex justify-between">
            <span>Cajero/a:</span>
            <span>{sale.salespersonName || "N/A"}</span>
          </div>
        )}
      </section>

      {/* 3. Información del Cliente */}
      {sale.customer && (
        <>
          <Separator className="my-2 border-dashed border-black" />
          <section className="text-[10pt] text-left">
            <div className="font-semibold">Cliente:</div>
            <div>{sale.customerName}</div>
            {(sale.customer as any).rnc && (
              <div>RNC/ID: {(sale.customer as any).rnc}</div>
            )}
            {sale.customer.phone && <div>Tel: {sale.customer.phone}</div>}
          </section>
        </>
      )}

      <Separator className="my-2 border-dashed border-black" />

      {/* 4. Tabla de Ítems Vendidos */}
      <table className="w-full my-1 text-[10pt]">
        <thead>
          <tr className="border-b border-dashed border-black">
            <th className="text-left font-semibold pb-1 pr-1">Descripción</th>
            <th className="text-center font-semibold pb-1">Cant.</th>
            <th className="text-right font-semibold pb-1 px-1">Precio</th>
            <th className="text-right font-semibold pb-1 pl-1">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.lines.map((line, index) => (
            <tr key={line.id || index} className="align-top">
              <td className="py-1 pr-1">
                {line.product?.name ||
                  line.miscItemDescription ||
                  "Ítem Desconocido"}
                {line.imei && (
                  <div className="text-[8pt] text-gray-600">
                    S/N: {line.imei}
                  </div>
                )}
                {line.discountAmount > 0 && (
                  <div className="text-[8pt] text-gray-600">
                    (Desc: -{formatCurrency(line.discountAmount, currency)})
                  </div>
                )}
              </td>
              <td className="text-center py-1">{line.quantity}</td>
              <td className="text-right py-1 px-1">
                {formatCurrency(line.unitPrice, currency)}
              </td>
              <td className="text-right py-1 pl-1">
                {formatCurrency(line.lineTotalAfterTax)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Separator className="my-2 border-dashed border-black" />

      {/* 5. Resumen de Totales */}
      <section className="text-[10pt] space-y-1">
        <div className="flex justify-between">
          <span>SUBTOTAL:</span>
          <span>
            {formatCurrency(sale.subTotalAfterLineDiscounts, currency)}
          </span>
        </div>
        {sale.discountOnTotalAmount > 0 && (
          <div className="flex justify-between">
            <span>DESCUENTO:</span>
            <span>-{formatCurrency(sale.discountOnTotalAmount, currency)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>IMPUESTOS ({(taxRate * 100).toFixed(0)}%):</span>
          <span>{formatCurrency(sale.taxTotal, currency)}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.totalAmount, currency)}</span>
        </div>
      </section>

      <Separator className="my-2 border-dashed border-black" />

      {/* 6. Detalle de Pagos */}
      <section className="text-[10pt] space-y-1">
        <p className="font-semibold">Forma(s) de Pago:</p>
        {sale.payments.map((payment, index) => (
          <div key={index} className="flex justify-between">
            <span>
              {paymentMethodLabels[payment.paymentMethod] ||
                payment.paymentMethod}
              :
            </span>
            <span>{formatCurrency(payment.amount, currency)}</span>
          </div>
        ))}
        {sale.changeGiven && sale.changeGiven > 0 && (
          <div className="flex justify-between font-semibold">
            <span>CAMBIO:</span>
            <span>{formatCurrency(sale.changeGiven, currency)}</span>
          </div>
        )}
      </section>

      {/* 7. Pie de Recibo */}
      <footer className="text-center mt-4 text-[8pt]">
        {storeSettings?.receiptFooterNotes && (
          <div className="space-y-1">
            {storeSettings.receiptFooterNotes.split("\n").map((textLine, i) => (
              <p key={i} className="leading-tight">
                {textLine}
              </p>
            ))}
          </div>
        )}
        <p className="mt-2 leading-tight">¡Gracias por su compra!</p>
      </footer>
    </div>
  );
}
