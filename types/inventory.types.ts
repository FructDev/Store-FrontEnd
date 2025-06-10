// types/inventory.types.ts
import {
  ProductType as PrismaProductType,
  InventoryItemStatus,
  PurchaseOrderStatus as PrismaPurchaseOrderStatus,
  StockCountStatus as PrismaStockCountStatus,
  SaleStatus as PrismaSaleStatus,
  PaymentMethod as PrismaPaymentMethod,
  ProductType,
} from "@/types/prisma-enums"; // Para usar enums
import { CustomerBasic } from "./customer.types";
import { UserMinimal } from "./user.types";

export interface SupplierBasic {
  id: string;
  name: string;
  // Puedes añadir más campos si el backend los devuelve y los necesitas para el Select
  // contactName?: string | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  storeId: string; // Aunque no se muestre, es bueno tenerla para consistencia
  // createdAt?: string | Date; // Opcional si lo necesitas mostrar
  // updatedAt?: string | Date; // Opcional
}

export interface PaginatedCategoriesResponse {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  storeId: string;
  // createdAt?: string | Date; // Opcional
  // updatedAt?: string | Date; // Opcional
}

export interface PaginatedSuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  storeId: string;
  locationId: string | null;
  location?: InventoryLocationBasic | null; // Relación anidada
  imei: string | null;
  quantity: number;
  costPrice: number | string; // Prisma Decimal viene como string o number
  condition: string | null;
  status: InventoryItemStatus;
  entryDate?: string | Date | null; // Fecha de ingreso
  soldAt?: string | Date | null;
  usedAt?: string | Date | null;
  purchaseOrderLineId?: string | null;
  saleLineId?: string | null;
  repairLineId?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // product?: Partial<Product>; // Para evitar dependencia circular si Product usa InventoryItem
}

export interface InventoryLocation {
  id: string;
  name: string;
  description?: string | null;
  isDefault: boolean; // Indica si es la ubicación por defecto (el backend puede tener una lógica para asegurar solo una)
  isActive: boolean; // Para activar/desactivar ubicaciones
  storeId: string;
  // createdAt?: string | Date;
  // updatedAt?: string | Date;
}

export interface PaginatedInventoryLocationsResponse {
  data: InventoryLocation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BundleComponentData {
  // Para el DTO de envío
  componentProductId: string;
  quantity: number;
}

export interface BundleComponent extends BundleComponentData {
  // Para el tipo Product
  id: string;
  bundleProductId: string;
  componentProduct?: Partial<Product>; // Solo para mostrar nombre/sku en UI si se incluye
}

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  brand?: string | null;
  model?: string | null;
  productType: PrismaProductType;
  tracksImei: boolean;
  costPrice: number | string | null; // Prisma.Decimal puede ser string o number en JSON
  sellingPrice: number | string | null;
  reorderLevel?: number | null;
  idealStockLevel?: number | null;
  attributes?: Record<string, unknown> | null; // Prisma.JsonValue
  isActive: boolean;
  storeId: string;
  categoryId?: string | null;
  category?: Partial<Category> | null;
  supplierId?: string | null;
  supplier?: Partial<Supplier> | null;
  bundleComponents?: BundleComponent[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PaginatedProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Para los Selects, podrías querer un tipo más simple
export interface ProductBasic {
  id: string;
  name: string;
  sku?: string | null;
  productType: PrismaProductType;
  tracksImei: boolean;
  sellingPrice?: number | string | null;
}

export interface InventoryLocationBasic {
  // Ya lo definimos en settings.types.ts, podemos reusarlo o unificar
  id: string;
  name: string;
}

export interface ProductStockInfo {
  // Asegúrate que esta interfaz exista
  product: Product | null; // El producto principal
  items: Array<
    InventoryItem & {
      location: InventoryLocationBasic | null;
      product?: ProductBasic;
    }
  >; // Items con su ubicación
  totalQuantity: number; // Total disponible o físico según la lógica del backend
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  storeId: string;
  supplierId: string | null;
  supplier?: Partial<SupplierBasic> | null; // Nombre del proveedor
  orderDate: string | Date;
  expectedDate?: string | Date | null;
  receivedDate?: string | Date | null;
  status: PrismaPurchaseOrderStatus;
  notes?: string | null;
  totalAmount: number | string | null; // Prisma Decimal
  shippingCost?: number | string | null;
  taxes?: number | string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  _count?: {
    // Para el conteo de líneas
    lines: number;
  } | null;
  // lines?: PurchaseOrderLine[]; // Opcional si quieres las líneas en el listado
}

export interface PaginatedPurchaseOrdersResponse {
  data: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchaseOrderLine {
  id: string;
  productId: string;
  product?: Partial<Product>; // Nombre, SKU, tracksImei
  orderedQuantity: number; // Corresponde a lo que envía el backend
  receivedQuantity: number;
  unitCost: number | string; // Prisma Decimal
  // lineTotal?: number | string; // Calculado por el backend
}

// Extender PurchaseOrder para incluir líneas detalladas
export interface PurchaseOrderDetailed
  extends Omit<PurchaseOrder, "_count" | "lines"> {
  lines: PurchaseOrderLine[];
  // El _count de líneas ya no es necesario si tenemos el array de líneas completo.
  // Pero si findAll lo devuelve, puedes mantenerlo en el tipo PurchaseOrder para el listado.
}

// Este tipo representa lo que viene del backend para CADA LÍNEA
export interface PurchaseOrderLineFromAPI {
  id: string;
  productId: string;
  product?: ProductBasic; // Asume que el backend incluye esto
  orderedQuantity: number; // Nombre como en tu respuesta de Postman
  receivedQuantity: number; // Nombre como en tu respuesta de Postman
  unitCost: string; // Viene como string desde el backend (ej. "8.35")
  // lineTotal NO viene del backend por línea
  // ...otros campos que envíe el backend por línea...
}

// Este tipo representa la Orden de Compra como viene del backend
export interface PurchaseOrderFromAPI {
  id: string;
  poNumber: string;
  storeId: string;
  supplierId: string | null;
  supplier: SupplierBasic | null; // Ya incluye contactName, phone, email si SupplierBasic los tiene
  status: PrismaPurchaseOrderStatus; // Usa tu enum local
  orderDate: string | Date; // Prisma devuelve string ISO o Date
  expectedDate: string | Date | null;
  receivedDate: string | Date | null;
  notes: string | null;
  shippingCost: string | null; // Decimal como string
  totalAmount: string | null; // Decimal como string
  taxes: string | null; // Decimal como string
  userId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines: PurchaseOrderLineFromAPI[];
}

export interface StockCountLine {
  // Para el detalle del conteo
  id: string;
  productId: string;
  product?: { name: string; sku?: string | null }; // Detalles del producto
  inventoryItemId?: string | null;
  systemQuantity: number;
  countedQuantity?: number | null;
  discrepancy?: number | null;
  unitCostAtCount?: number | string | null; // Decimal
  notes?: string | null;
}

export interface StockCount {
  id: string;
  stockCountNumber?: string | null;
  storeId: string;
  userId: string;
  user?: UserMinimal | null; // Usuario que inició
  locationId?: string | null;
  location?: InventoryLocationBasic | null; // Ubicación del conteo
  status: PrismaStockCountStatus;
  initiatedAt: string | Date;
  completedAt?: string | Date | null;
  notes?: string | null;
  lines?: StockCountLine[]; // Para el detalle
  _count?: {
    // Para la lista
    lines: number;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PaginatedStockCountsResponse {
  data: StockCount[]; // Usará el tipo StockCount que incluye _count.lines para la lista
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaz para un ítem de línea de venta (como viene del backend y como se usa en el form)
export interface SaleLineItem {
  id?: string; // Opcional si es para crear
  productId: string | null; // null para "venta libre"
  product?: Partial<ProductBasic> | null; // Detalles del producto
  inventoryItemId?: string | null; // Para productos serializados vendidos
  imei?: string | null; // Para mostrar el IMEI/Serial vendido
  description?: string | null; // Para "venta libre" o descripción personalizada
  quantity: number;
  unitPrice: number | string; // El backend puede enviar string para Decimal
  discountType?: "PERCENTAGE" | "FIXED" | null; // Opcional, para descuentos por línea
  discountAmount?: number | string | null; // Opcional
  lineTotal: number | string; // El backend puede enviar string para Decimal
  taxAmount?: number | string | null; // Si calculas impuesto por línea
  // Campos parseados/calculados para el frontend
  parsedUnitPrice?: number;
  parsedLineTotal?: number;
}

// Interfaz para un pago de venta
export interface SalePaymentItem {
  id?: string; // Opcional si es para crear
  method: PrismaPaymentMethod;
  amount: number | string; // El backend puede enviar string para Decimal
  reference?: string | null;
  cardLast4?: string | null;
  cardBrand?: string | null;
  paymentDate?: string | Date;
  // Campos parseados para el frontend
  parsedAmount?: number;
}

// Interfaz para la Venta (reflejando el modelo del backend y lo que necesita el frontend)
export interface Sale {
  id: string;
  saleNumber: string;
  storeId: string;
  userId: string; // ID del vendedor
  user?: UserMinimal | null; // Datos básicos del vendedor
  customerId: string | null;
  customer?: CustomerBasic | null; // Datos básicos del cliente
  status: PrismaSaleStatus;

  subTotal: number | string; // Decimal del backend
  discountOnTotal: number | string | null; // Decimal del backend
  taxes: number | string | null; // Decimal del backend
  totalAmount: number | string; // Decimal del backend

  amountPaid: number | string; // Decimal del backend (suma de pagos positivos)
  amountDue: number | string; // Decimal del backend (totalAmount - amountPaid)
  changeGiven?: number | string | null; // Decimal del backend (si es efectivo)

  notes?: string | null;
  saleDate: string | Date; // O createdAt
  createdAt: string | Date;
  updatedAt: string | Date;

  lines: SaleLineItem[];
  payments: SalePaymentItem[];

  // Para la UI, después de procesar en el frontend
  parsedSubTotal?: number;
  parsedDiscountOnTotal?: number;
  parsedTaxes?: number;
  parsedTotalAmount?: number;
  parsedAmountPaid?: number;
  parsedAmountDue?: number;
  parsedChangeGiven?: number;
}

// Interfaz para la respuesta paginada de ventas
export interface PaginatedSalesResponse {
  data: Sale[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// --- Tipos para el Formulario del POS ---
// (Estos ya los habíamos esbozado, los refinamos aquí)

// Para cada línea en el carrito del POS
export interface POSCartLineItem {
  id?: string; // ID temporal del lado del cliente o productId si no hay duplicados sin serial
  productId: string;
  productName: string;
  sku?: string | null;
  quantity: number;
  unitPrice: number; // Siempre número en el form
  lineTotal: number; // Calculado (quantity * unitPrice)
  tracksImei: boolean;
  inventoryItemId?: string | null; // Para serializados, el ID del InventoryItem específico
  imei?: string | null; // Para serializados, el IMEI/Serial a vender
  // Cualquier otro dato necesario para la línea en el POS
}

// Para cada pago en el POS
export interface POSPaymentItem {
  id?: string; // ID temporal del lado del cliente
  method?: PrismaPaymentMethod; // Opcional hasta que se seleccione
  amount: number; // Siempre número
  reference?: string | null;
  cardLast4?: string | null;
  // ...otros detalles de pago como cardBrand, etc.
}

// Para el formulario principal del POS
export interface POSFormValues {
  customerId: string | null; // ID del cliente seleccionado
  // Para creación rápida de cliente
  newCustomerName?: string;
  newCustomerPhone?: string;
  newCustomerEmail?: string;

  lines: POSCartLineItem[];
  payments: POSPaymentItem[];

  // Estos se calculan y se muestran, pero el backend los recalculará
  subTotal: number;
  taxAmount: number;
  discountAmount: number; // Descuento general sobre el total
  totalAmount: number;

  amountTenderedCash?: number; // Para calcular el cambio si se paga en efectivo
  changeGiven?: number; // Calculado
  notes?: string | null;
}

// --- Tipos para Devoluciones de Venta ---
export interface SaleReturnLineInput {
  // Para crear una devolución de línea
  saleLineId: string;
  quantity: number;
  reason?: string | null;
}
export interface CreateSaleReturnDto {
  // Payload para el backend
  saleId: string;
  lines: SaleReturnLineInput[];
  refundPaymentMethod: PrismaPaymentMethod;
  refundAmount: number; // El backend debe validar esto contra el valor de las líneas devueltas
  notes?: string | null;
  restockLocationId?: string | null; // Opcional, si no se envía, usa default de la tienda
}

export interface SaleReturnLine {
  id: string;
  saleReturnId: string;
  saleLineId: string;
  saleLine?: Partial<SaleLineItem>; // Línea original de la venta
  quantity: number;
  reason?: string | null;
  // createdAt, updatedAt
}
export interface SaleReturn {
  id: string;
  storeId: string;
  saleId: string;
  sale?: Partial<Sale>; // La venta original
  userId: string;
  user?: UserMinimal;
  returnDate: string | Date;
  totalRefundAmount: number | string; // Decimal
  notes?: string | null;
  lines: SaleReturnLine[];
  // createdAt, updatedAt
}

export interface ProductApiPayload {
  // Campos de texto y booleanos
  name: string;
  productType: ProductType;
  tracksImei: boolean;
  isActive: boolean;
  categoryId: string;
  sku?: string | null;
  supplierId?: string | null;

  // --- CORRECCIÓN EN LOS TIPOS NUMÉRICOS ---
  // Deben permitir 'number' además de 'null' o 'undefined'
  sellingPrice?: number | null;
  costPrice?: number | null;
  reorderLevel?: number | null;
  idealStockLevel?: number | null;
  // --- FIN DE LA CORRECCIÓN ---

  // Campos de objeto y array
  attributes: Record<string, string> | null;
  bundleComponentsData?: { componentId: string; quantity: number }[];
}
