export enum ProductType {
  GENERAL = "GENERAL",
  NEW = "NEW", // Nuevo tipo para indicar "Nuevo Serializado"
  USED = "USED",
  REFURBISHED = "REFURBISHED", // Nuevo tipo para indicar "Reacondicionado Serializado"
  ACCESSORY = "ACCESSORY",
  SPARE_PART = "SPARE_PART",
  SERVICE = "SERVICE",
  BUNDLE = "BUNDLE",
  OTHER = "OTHER",
  // El antiguo 'SERIALIZED' se elimina si no existe en el backend.
  // Los tipos NEW, USED, REFURBISHED implicarán tracksImei: true en muchos casos.
}

export enum InventoryItemStatus {
  AVAILABLE = "AVAILABLE", // Ready to be sold or used
  RESERVED = "RESERVED", // Held for a specific sale, repair, or transfer
  SOLD = "SOLD", // Sold to a customer
  USED_IN_REPAIR = "USED_IN_REPAIR", // Consumed as a spare part
  RETURNED = "RETURNED", // Returned by customer, needs inspection
  DAMAGED = "DAMAGED", // Damaged, not usable
  IN_TRANSIT = "IN_TRANSIT", // Being moved between locations
  CONSIGNMENT = "CONSIGNMENT", // In stock but owned by a third party
  REMOVED = "REMOVED", // Removed due to manual adjustment (loss, etc.)
  // Si tienes más, añádelos. Si alguno de estos no está en tu schema, quítalo.
  // El que yo había puesto AWAITING_STOCK no parece estar en tu lista.
}

export enum PurchaseOrderStatus {
  DRAFT = "DRAFT", // Being created
  ORDERED = "ORDERED", // Sent to supplier
  PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED",
  RECEIVED = "RECEIVED", // Fully received
  CANCELLED = "CANCELLED",
  CLOSED = "CLOSED", // Finalized after receipt/billing, opcional
}

export enum StockCountStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum SaleStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  RETURNED = "RETURNED", // Venta completamente devuelta
  PARTIALLY_RETURNED = "PARTIALLY_RETURNED", // Venta parcialmente devuelta
  // Podrías tener más estados si tu lógica de negocio lo requiere
}

export enum PaymentMethod {
  CASH = "CASH",
  CARD_CREDIT = "CARD_CREDIT",
  CARD_DEBIT = "CARD_DEBIT",
  TRANSFER = "TRANSFER",
  MOBILE_WALLET = "MOBILE_WALLET", // Ej: Yape, Plin
  STORE_CREDIT = "STORE_CREDIT", // Crédito de tienda (si lo implementas)
  OTHER = "OTHER",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export enum RepairStatus {
  RECEIVED = "RECEIVED", // Recibido del cliente
  DIAGNOSING = "DIAGNOSING", // En diagnóstico
  QUOTE_PENDING = "QUOTE_PENDING", // Diagnóstico listo, pendiente generar/enviar cotización
  AWAITING_QUOTE_APPROVAL = "AWAITING_QUOTE_APPROVAL", // Cotización enviada, esperando respuesta
  QUOTE_APPROVED = "QUOTE_APPROVED", // Cotización aprobada por el cliente
  QUOTE_REJECTED = "QUOTE_REJECTED", // Cliente rechazó
  AWAITING_PARTS = "AWAITING_PARTS", // Aprobado, pero esperando repuestos
  IN_REPAIR = "IN_REPAIR", // Reparación activa en progreso
  ASSEMBLING = "ASSEMBLING", // Reensamblando dispositivo
  TESTING_QC = "TESTING_QC", // En pruebas / Control de Calidad
  REPAIR_COMPLETED = "REPAIR_COMPLETED", // Reparación finalizada internamente
  PENDING_PICKUP = "PENDING_PICKUP", // Listo y notificado al cliente para retiro
  COMPLETED_PICKED_UP = "COMPLETED_PICKED_UP", // Entregado al cliente (y presumiblemente pagado)
  CANCELLED = "CANCELLED", // Cancelado por cliente o tienda
  UNREPAIRABLE = "UNREPAIRABLE", // No se pudo reparar / No vale la pena
}

export enum SalesByProductOrderBy {
  PRODUCT_NAME = "productName",
  QUANTITY_SOLD = "totalQuantitySold",
  REVENUE = "totalRevenue",
  PROFIT = "totalProfit",
}

export enum MovementType { // Usa el nombre exacto de tu enum en Prisma
  SALE = "SALE",
  PURCHASE_RECEIPT = "PURCHASE_RECEIPT",
  ADJUSTMENT_IN = "ADJUSTMENT_IN",
  ADJUSTMENT_OUT = "ADJUSTMENT_OUT",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  RETURN_RESTOCK = "RETURN_RESTOCK",
  REPAIR_CONSUMPTION = "REPAIR_CONSUMPTION",
  INITIAL_STOCK = "INITIAL_STOCK",
  STOCK_COUNT_ADJUSTMENT = "STOCK_COUNT_ADJUSTMENT",
  PRODUCTION_IN = "PRODUCTION_IN", // Si los tienes
  PRODUCTION_OUT = "PRODUCTION_OUT", // Si los tienes
  // Asegúrate que todos los valores de tu enum MovementType de Prisma estén aquí
}

export enum StockMovementsOrderBy { // Este enum define los valores permitidos
  MOVEMENT_DATE = "movementDate",
  PRODUCT_NAME = "productName",
  MOVEMENT_TYPE = "movementType",
}

export enum RepairsReportSortBy { // Coincide con los valores que espera el backend
  RECEIVED_AT = "receivedAt",
  REPAIR_NUMBER = "repairNumber",
  CUSTOMER_NAME = "customerName",
  TECHNICIAN_NAME = "technicianName",
  STATUS = "status",
  COMPLETED_AT = "completedAt",
}

export enum StockValuationThreshold { // Ya lo teníamos
  ALL_PRODUCTS = "all",
  POSITIVE_STOCK_ONLY = "positiveStockOnly",
}

export enum StockValuationSortBy { // Ya lo teníamos
  PRODUCT_NAME = "productName",
  TOTAL_STOCK_VALUE = "totalStockValue",
  CURRENT_STOCK_QUANTITY = "currentStockQuantity",
}
