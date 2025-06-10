// types/reports.types.ts (FRONTEND)

import {
  SaleStatus,
  PaymentMethod,
  DiscountType,
  MovementType as PrismaMovementType,
  RepairStatus,
} from "./prisma-enums"; // Tu archivo de enums del frontend
// import { CustomerBasic } from "./customer.types"; // Asumiendo que tienes este
// import { UserMinimal } from "./user.types";     // Asumiendo que tienes este
// import { ProductBasic } from "./inventory.types";

// Estos tipos deben coincidir con DetailedSaleLineDto, DetailedSalePaymentDto,
// DetailedSaleItemDto, ReportGrandTotalsDto, y PaginatedDetailedSalesResponseDto del backend.

export interface ReportDetailedSaleLine {
  lineId: string;
  productId?: string | null;
  productName?: string | null;
  productSku?: string | null;
  miscDescription?: string | null;
  quantity: number;
  unitPrice: number;
  lineDiscountType?: DiscountType | null;
  lineDiscountValue?: number | null;
  lineDiscountAmount: number;
  lineTotalBeforeTax: number;
  lineTaxAmount: number;
  lineTotalAfterTax: number;
  unitCost?: number | null;
  totalLineCost?: number | null;
  lineProfit?: number | null;
}

export interface ReportDetailedSalePayment {
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: string | Date; // Viene como string ISO, se puede parsear a Date
  reference?: string | null;
  notes?: string | null;
}

export interface ReportDetailedSaleItem {
  saleId: string;
  saleNumber: string;
  saleDate: string | Date;
  customerName?: string | null;
  customerId?: string | null;
  salespersonName?: string | null;
  salespersonId?: string | null;
  status: SaleStatus;
  subTotal: number;
  totalLineDiscounts: number;
  subTotalAfterLineDiscounts: number;
  discountOnTotalType?: DiscountType | null;
  discountOnTotalValue?: number | null;
  discountOnTotalAmount: number;
  taxableAmount: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  changeGiven?: number | null;
  totalCostOfGoodsSold?: number | null;
  totalSaleProfit?: number | null;
  notes?: string | null;
  ncf?: string | null; // Si lo incluyes en el DTO del backend
  lines: ReportDetailedSaleLine[];
  payments: ReportDetailedSalePayment[];
}

export interface ReportGrandTotals {
  totalRevenue: number;
  totalOverallDiscounts: number;
  totalAllLineDiscounts: number;
  totalNetDiscounts: number;
  totalTaxes: number;
  totalCostOfGoodsSold?: number;
  totalProfit?: number;
  totalSalesCount: number;
}

export interface PaginatedDetailedSalesReport {
  data: ReportDetailedSaleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  reportGrandTotals?: ReportGrandTotals;
}

export interface ReportSalesByProductItem {
  // Coincide con SalesByProductItemDto
  productId: string;
  productName: string;
  productSku?: string | null;
  totalQuantitySold: number;
  totalRevenue: number;
  averageSellingPrice?: number;
  totalCostOfGoodsSold?: number | null;
  averageCost?: number | null;
  totalProfit?: number | null;
}

export interface ReportSalesByProductGrandTotals {
  // Coincide con SalesByProductReportGrandTotalsDto
  totalUniqueProductsSold: number;
  totalItemsSold: number;
  totalRevenue: number;
  totalCostOfGoodsSold?: number;
  totalProfit?: number;
}

export interface PaginatedSalesByProductReport {
  // Coincide con PaginatedSalesByProductResponseDto
  data: ReportSalesByProductItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  reportGrandTotals?: ReportSalesByProductGrandTotals;
}

export interface ReportStockByLocation {
  // Coincide con StockByLocationDto
  locationId: string;
  locationName: string;
  quantityAvailable: number;
}

export interface ReportLowStockItem {
  // Coincide con LowStockItemDto
  productId: string;
  productName: string;
  productSku?: string | null;
  currentStock: number;
  reorderLevel: number;
  idealStockLevel?: number | null;
  quantityToOrder?: number;
  supplierName?: string | null;
  categoryName?: string | null;
  stockByLocation?: ReportStockByLocation[];
}

export interface PaginatedLowStockReport {
  // Coincide con PaginatedLowStockResponseDto
  data: ReportLowStockItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportStockMovementItem {
  // Coincide con StockMovementItemDto
  id: string;
  movementDate: string | Date; // Viene como string ISO, se parsea a Date
  productId: string;
  productName: string;
  productSku?: string | null;
  inventoryItemId?: string | null;
  imei?: string | null;
  movementType: PrismaMovementType;
  quantityChange: number;
  unitCostAtTimeOfMovement?: number | null;
  totalValueChange?: number | null;
  fromLocationName?: string | null;
  toLocationName?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  userName?: string | null;
  notes?: string | null;
  balanceAfterMovement?: number | null; // Para Kardex por producto
}

export interface PaginatedStockMovementsReport {
  // Coincide con PaginatedStockMovementsResponseDto
  data: ReportStockMovementItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  openingBalance?: number | null; // Para Kardex por producto
  closingBalance?: number | null; // Para Kardex por producto
}

export interface ReportRepairItem {
  // Coincide con RepairReportItemDto
  repairId: string;
  repairNumber: string;
  receivedAt: string | Date;
  customerName?: string | null;
  customerPhone?: string | null;
  deviceDisplay: string;
  deviceImei?: string | null;
  reportedIssueExcerpt: string;
  technicianName?: string | null;
  status: RepairStatus;
  quotedAmount?: number | null;
  totalBilledAmount?: number | null;
  completedAt?: string | Date | null;
  daysOpenOrToCompletion?: number | null;
}

export interface ReportRepairsTotals {
  // Coincide con RepairsReportTotalsDto
  totalRepairsInPeriod: number;
  repairsByStatusCount: Record<RepairStatus, number>;
  averageDaysOpenActive?: number | null;
  averageCompletionTime?: number | null;
}

export interface PaginatedRepairsReport {
  // Coincide con PaginatedRepairsReportResponseDto
  data: ReportRepairItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  reportTotals?: ReportRepairsTotals;
}

// Coincide con StockValuationThreshold enum del backend DTO
export enum ReportStockValuationThreshold {
  ALL_PRODUCTS = "all",
  POSITIVE_STOCK_ONLY = "positiveStockOnly",
}

// Coincide con los valores permitidos para sortBy en FindStockValuationQueryDto
export enum StockValuationSortBy {
  PRODUCT_NAME = "productName",
  TOTAL_STOCK_VALUE = "totalStockValue",
  CURRENT_STOCK_QUANTITY = "currentStockQuantity",
}

export interface ReportStockValuationItem {
  // Coincide con StockValuationItemDto
  productId: string;
  productName: string;
  productSku?: string | null;
  categoryName?: string | null;
  // supplierName?: string | null; // Descomentar si el backend lo provee
  currentStockQuantity: number;
  costPriceUsed: number;
  totalStockValueByProduct: number;
}

export interface ReportStockValuationGrandTotals {
  // Coincide con StockValuationReportGrandTotalsDto
  totalOverallStockValue: number;
  totalUniqueProductsInStock: number;
  totalStockUnits: number;
}

export interface PaginatedStockValuationReport {
  // Coincide con PaginatedStockValuationResponseDto
  data: ReportStockValuationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  reportGrandTotals?: ReportStockValuationGrandTotals;
}

export interface FindInventoryReportParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  supplierId?: string;
  locationId?: string;
  productId?: string;
  technicianId?: string; // Para filtrar por técnico en reparaciones
  customerId?: string; // Para filtrar por cliente en ventas o reparaciones
  userId?: string; // Para filtrar por usuario que hizo el movimiento
  salespersonId?: string; // Para filtrar por vendedor en ventas
  referenceId?: string; // Para movimientos de inventario
  referenceType?: string; // Para movimientos de inventario
  startDate?: string; // Fecha de inicio del rango
  endDate?: string; // Fecha de fin del rango
  orderBy?: string;
  sortBy?: string; // Para ordenamiento en valoración de inventario
  sortOrder?: "asc" | "desc"; // Para ordenamiento en valoración de inventario
  movementType?: string; // Para filtrar por tipo de movimiento
  threshold?: ReportStockValuationThreshold; // Para filtrar por valoración de inventario
  status?: string; // Para filtrar por estado de reparación
  deviceModel?: string; // Para filtrar por modelo de dispositivo en reparaciones
  deviceImei?: string; // Para filtrar por IMEI de dispositivo en reparaciones
  deviceBrand?: string; // Para filtrar por marca de dispositivo en reparaciones
  // Añade aquí cualquier otro filtro que uses, como 'sortBy', 'sortOrder', etc.
}
