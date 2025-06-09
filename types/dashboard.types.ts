// types/dashboard.types.ts

export interface SalesTrendItemData {
  // Coincide con SalesTrendItemDto del backend
  date: string; // Formato "YYYY-MM-DD"
  totalRevenue: number;
  numberOfSales: number;
}

export interface RepairsOverviewData {
  byStatus: Record<RepairStatus, number>; // ej: { RECEIVED: 5, IN_REPAIR: 3, ... }
  totalActive: number;
}

// types/prisma-enums.ts (Ejemplo de archivo en tu frontend)

export enum PaymentMethod {
  CASH = "CASH",
  CARD_CREDIT = "CARD_CREDIT",
  CARD_DEBIT = "CARD_DEBIT",
  TRANSFER = "TRANSFER",
  MOBILE_WALLET = "MOBILE_WALLET", // Ej. Yape, Plin, etc.
  STORE_CREDIT = "STORE_CREDIT", // Crédito de tienda
  OTHER = "OTHER",
  // Asegúrate que estos valores coincidan 100% con tu enum en schema.prisma
}

export enum RepairStatus {
  RECEIVED = "RECEIVED",
  DIAGNOSING = "DIAGNOSING",
  QUOTE_PENDING = "QUOTE_PENDING",
  AWAITING_QUOTE_APPROVAL = "AWAITING_QUOTE_APPROVAL",
  QUOTE_REJECTED = "QUOTE_REJECTED",
  AWAITING_PARTS = "AWAITING_PARTS",
  IN_REPAIR = "IN_REPAIR",
  ASSEMBLING = "ASSEMBLING",
  TESTING_QC = "TESTING_QC",
  REPAIR_COMPLETED = "REPAIR_COMPLETED",
  PENDING_PICKUP = "PENDING_PICKUP",
  COMPLETED_PICKED_UP = "COMPLETED_PICKED_UP",
  CANCELLED = "CANCELLED",
  UNREPAIRABLE = "UNREPAIRABLE",
  // Asegúrate que estos valores coincidan 100% con tu enum en schema.prisma
}

// types/dashboard.types.ts o directamente en la página
export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string | null;
  currentStock: number;
  reorderLevel: number | null;
}
// Podrías añadir otros enums que necesites del backend, como SaleStatus, etc.
export interface PaymentBreakdownItem {
  // Coincide con PaymentBreakdownItemDto del backend
  method: PaymentMethod;
  totalAmount: number;
  count: number;
}

export interface SalesSummaryData {
  // Coincide con SalesSummaryResponseDto del backend
  totalSalesRevenue: number;
  numberOfSales: number;
  averageSaleValue: number;
  totalCostOfGoodsSold?: number;
  grossProfit?: number;
  paymentsBreakdown?: PaymentBreakdownItem[];
  periodStartDate?: string;
  periodEndDate?: string;
}

// Para el widget de Resumen de Inventario
export interface InventorySummaryData {
  // Coincide con InventorySummaryDto del backend
  totalActiveProducts: number;
  productsWithLowStock: number;
  pendingPurchaseOrders: number;
  activeStockCounts: number;
}

// Para el widget de Resumen de Reparaciones
export interface RepairsOverviewData {
  // Coincide con RepairsOverviewDto del backend
  byStatus: Record<RepairStatus, number>;
  totalActiveRepairs: number;
  periodStartDate?: string;
  periodEndDate?: string;
}

// Para el widget de Productos Más Vendidos
export interface TopSellingProductData {
  // Coincide con TopSellingProductDto del backend
  productId: string;
  productName: string;
  productSku?: string | null;
  totalQuantitySold: number;
  totalRevenueGenerated: number;
}

// Para el widget de Ventas por Vendedor
export interface SalesBySalespersonData {
  // Coincide con SalesBySalespersonItemDto del backend
  salespersonId: string;
  salespersonFirstName: string | null;
  salespersonLastName: string | null;
  salespersonEmail?: string | null;
  totalSalesAmount: number;
  numberOfSales: number;
}
