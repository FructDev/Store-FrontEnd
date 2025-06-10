// types/sales.types.ts

import {
  PaymentMethod as PrismaPaymentMethod,
  SaleStatus as PrismaSaleStatus,
} from "./prisma-enums"; // Asumiendo que tus enums están en types/prisma-enums.ts

import { ProductBasic } from "./inventory.types"; // Para la info del producto en SaleLine
// Necesitaremos CustomerBasic y UserMinimal. Los definiré aquí si no los tienes en archivos separados.

// --- INTERFACES BÁSICAS (si no las tienes en archivos separados) ---
export interface CustomerBasic {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  // rnc?: string | null; // Si lo necesitas para el POS o recibos
}

export interface ProductInSaleLine extends ProductBasic {
  // BaseProductBasic ya tiene id, name, sku. tracksImei es crucial.
  // Si BaseProductBasic no tiene tracksImei, añádelo aquí o directamente en BaseProductBasic.
  tracksImei: boolean; // Necesario para lógica en el POS y en la línea de detalle de venta
}

export interface UserMinimal {
  // Para el vendedor/usuario que registra
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string; // Útil para mostrar
}
// --- FIN INTERFACES BÁSICAS ---

// --- TIPOS PARA LA ENTIDAD VENTA (Como viene del Backend y se usa en Listas/Detalles) ---

// Interfaz para una línea de venta (como la devuelve el backend)
export interface SaleLineFromAPI {
  id: string;
  saleId: string;
  productId: string | null; // Puede ser null para venta libre
  product?: ProductBasic | null; // ProductBasic ya tiene name, sku, tracksImei, sellingPrice
  inventoryItemId?: string | null; // Si se vendió un ítem serializado específico
  imei?: string | null; // El IMEI/Serial vendido (si aplica)
  description?: string | null; // Para venta libre o descripción personalizada
  quantity: number;
  unitPrice: string; // Prisma Decimal viene como string
  discountType?: "PERCENTAGE" | "FIXED" | null;
  discountAmount?: string | null; // Prisma Decimal
  lineTotal: string; // Prisma Decimal (unitPrice * quantity - discount)
  taxAmount?: string | null; // Prisma Decimal (si el impuesto se calcula por línea)
  costPriceAtSale?: string | null; // Decimal, costo del producto al momento de la venta
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Interfaz para un pago de venta (como la devuelve el backend)
export interface SalePaymentFromAPI {
  id: string;
  inventoryItemId?: string | null; // El ID del item de inventario vendido
  inventoryItem?: {
    // El objeto inventoryItem anidado que envía el backend
    id: string;
    imei: string | null;
    // Añade otros campos de inventoryItem si el backend los envía y los necesitas
  } | null;
  saleId: string;
  paymentMethod: PrismaPaymentMethod;
  amount: string; // Prisma Decimal
  reference?: string | null;
  amountTendered?: string | null; // Decimal viene como string, puede ser null
  changeGiven?: string | null; // Decimal viene como string, puede ser null
  cardLast4?: string | null;
  cardBrand?: string | null; // Si el backend lo envía
  cardAuthCode?: string | null; // Si el backend lo envía
  transferConfirmation?: string | null;
  paymentDate: string | Date; // Fecha del pago
  isRefund?: boolean; // Si es un pago de reembolso
  userId?: string | null; // Quién registró el pago
  user?: UserMinimal | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Interfaz para la Venta completa (como la devuelve el backend)
export interface SaleFromAPI {
  id: string;
  saleNumber: string;
  storeId: string;
  userId: string;
  user?: UserMinimal | null;
  customerId: string | null;
  customer?: CustomerBasic | null;
  status: PrismaSaleStatus;

  product?: ProductInSaleLine | null; // ProductInSaleLine debe tener 'name: string'
  miscItemDescription?: string | null;

  subTotal: string; // Decimal del backend (suma de lineTotal antes de descuento general)
  discountOnTotalType?: "PERCENTAGE" | "FIXED" | null;
  discountOnTotalValue?: string | null;
  discountTotal: string; // <--- NOMBRE DEL BACKEND
  taxTotal: string; // Decimal del backend (impuesto total sobre el subtotal - descuento)
  totalAmount: string; // Decimal del backend (final)

  amountPaid: string; // Decimal del backend (suma de pagos positivos - suma de reembolsos)
  amountDue: string; // Decimal del backend (totalAmount - amountPaid)
  changeGiven?: string | null; // Decimal del backend

  notes?: string | null;
  saleDate: string | Date; // O createdAt
  createdAt: string | Date;
  updatedAt: string | Date;

  lines: SaleLineFromAPI[];
  payments: SalePaymentFromAPI[];

  // Campos adicionales que tu backend podría devolver
  linkedRepairId?: string | null;
  // ...otros...
}

// --- TIPOS PROCESADOS/ENRIQUECIDOS PARA LA UI DEL FRONTEND ---
// (Cuando necesitas parsear strings a números, o añadir campos calculados)

export interface EnrichedSaleLineItem
  extends Omit<
    SaleLineFromAPI,
    | "unitPrice"
    | "discountAmount"
    | "taxAmount"
    | "lineTotal"
    | "miscItemDescription"
  > {
  imei?: string | null; // IMEI extraído
  unitPrice: number;
  miscItemDescription?: string | null;
  discountAmount: number;
  taxAmount: number;
  lineTotal: number;
  // Aquí podrías añadir 'pendingReturnQuantity' si lo calculas para devoluciones
}

export interface EnrichedSalePaymentItem
  extends Omit<
    SalePaymentFromAPI,
    "amount" | "amountTendered" | "changeGiven"
  > {
  amount: number;
  amountTendered?: number | null;
  changeGiven?: number | null;
}

export interface EnrichedSaleDetailed {
  id: string;
  saleNumber: string;
  storeId: string;
  userId: string;
  user?: UserMinimal | null;
  customerId: string | null;
  customer?: CustomerBasic | null;
  status: PrismaSaleStatus;
  saleDate: string | Date; // Mantener como Date después del parseo
  notes?: string | null;

  subTotal: number; // Suma bruta de líneas (qty * unitPrice) ANTES de descuentos de línea
  totalLineDiscounts: number; // Suma de todos los line.discountAmount
  subTotalAfterLineDiscounts: number; // subTotal (bruto) - totalLineDiscounts

  discountOnTotalType?: "PERCENTAGE" | "FIXED" | null;
  discountOnTotalValue?: number | null;
  discountOnTotalAmount: number; // MONTO del descuento general (este es el que se usaría en la plantilla como "Descuento Total")

  taxableAmount: number; // subTotalAfterLineDiscounts - discountOnTotalAmount
  taxTotal: number; // Impuesto total sobre taxableAmount

  totalAmount: number; // Total final
  amountPaid: number;
  amountDue: number;
  changeGiven?: number | null;

  // Campos importantes para rentabilidad
  totalCostOfGoodsSold?: number | null; // Calculado: Suma de totalLineCost de todas las líneas
  totalSaleProfit?: number | null; // Calculado: taxableAmount - totalCostOfGoodsSold (o una definición similar)

  ncf?: string | null; // Si lo tienes
  rnc?: string | null; // Si lo tienes
  linkedRepairId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;

  lines: EnrichedSaleLineItem[];
  payments: EnrichedSalePaymentItem[];
}

export interface EnrichedSale
  extends Omit<
    SaleFromAPI,
    | "lines"
    | "payments"
    | "subTotal"
    | "discountOnTotalAmount"
    | "taxes"
    | "totalAmount"
    | "amountPaid"
    | "amountDue"
    | "changeGiven"
  > {
  subTotal: number;
  discountOnTotalAmount?: number | null;
  taxes?: number | null;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  changeGiven?: number | null;
  lines: EnrichedSaleLineItem[];
  payments: EnrichedSalePaymentItem[];
}

// --- TIPOS PARA RESPUESTAS PAGINADAS ---
export interface PaginatedData<T> {
  // Ya la teníamos, la reafirmo
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export type PaginatedSalesResponse = PaginatedData<SaleFromAPI>; // Para listados, usar el tipo de la API

// --- TIPOS PARA EL FORMULARIO DEL PUNTO DE VENTA (POS) ---

export interface POSCartLineItem {
  fieldId: string; // ID único para el useFieldArray (React Hook Form)
  productId: string | null; // Null para venta libre
  productName: string; // Para mostrar en el carrito
  sku?: string | null;
  quantity: number;
  unitPrice: number; // Siempre número en el form
  lineTotal: number; // Calculado (quantity * unitPrice) - (descuento de línea)
  tracksImei: boolean;
  inventoryItemId?: string | null; // Para serializados, el ID del InventoryItem específico
  imei?: string | null; // Para serializados, el IMEI/Serial a vender
  locationId?: string | null; // <-- AÑADIR para no serializados
  locationName?: string | null;
  // Campos para descuento por línea (opcional, añadir a schema si se implementa)
  // lineDiscountType?: 'PERCENTAGE' | 'FIXED' | null;
  // lineDiscountValue?: number | null;
}

export interface POSPaymentItem {
  fieldId: string; // ID único para el useFieldArray
  method?: PrismaPaymentMethod;
  amount: number;
  reference?: string | null;
  cardLast4?: string | null;
  // ... otros detalles de pago
}

export interface POSFormValues {
  customerId: string | null;
  customerNameDisplay?: string; // Solo para mostrar en el UI del POS

  // Para creación rápida de cliente (opcional)
  isNewCustomer?: boolean; // flag para indicar si se están creando datos de nuevo cliente
  newCustomerFirstName?: string;
  newCustomerLastName?: string;
  newCustomerPhone?: string;
  newCustomerEmail?: string;
  newCustomerRnc?: string; // Si es necesario
  newCustomerAddress?: string; // Si es necesario

  lines: POSCartLineItem[];
  payments: POSPaymentItem[];

  subTotal: number; // Calculado
  taxAmount: number; // Calculado
  discountAmount: number; // Descuento GENERAL sobre el total
  totalAmount: number; // Calculado

  amountTenderedCash?: number; // Para calcular el cambio si el primer pago es efectivo
  changeGiven?: number; // Calculado
  notes?: string | null;
}

// --- TIPOS PARA DEVOLUCIONES DE VENTA (si los necesitas separados) ---
export interface SaleReturnLineInput {
  saleLineId: string;
  quantity: number;
  reason?: string | null;
}

export interface CreateSaleReturnPayload {
  // Payload para el backend
  saleId: string;
  lines: SaleReturnLineInput[];
  refundPaymentMethod: PrismaPaymentMethod;
  refundAmount: number;
  notes?: string | null;
  restockLocationId?: string | null;
}

export interface SaleReturnLineDetails extends SaleReturnLineInput {
  id: string; // ID de la línea de devolución
  saleReturnId: string;
  saleLine?: Partial<SaleLineFromAPI>; // Línea original
  // createdAt, updatedAt
}

export interface SaleReturnDetails {
  id: string;
  storeId: string;
  saleId: string;
  sale?: Partial<SaleFromAPI>;
  userId: string;
  user?: UserMinimal;
  returnDate: string | Date;
  totalRefundAmount: string; // Decimal
  parsedTotalRefundAmount?: number;
  notes?: string | null;
  lines: SaleReturnLineDetails[];
  // createdAt, updatedAt
}
