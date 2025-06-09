"use strict";
exports.__esModule = true;
exports.StockValuationSortBy = exports.StockValuationThreshold = exports.RepairsReportSortBy = exports.StockMovementsOrderBy = exports.MovementType = exports.SalesByProductOrderBy = exports.RepairStatus = exports.DiscountType = exports.PaymentMethod = exports.SaleStatus = exports.StockCountStatus = exports.PurchaseOrderStatus = exports.InventoryItemStatus = exports.ProductType = void 0;
var ProductType;
(function (ProductType) {
    ProductType["GENERAL"] = "GENERAL";
    ProductType["NEW"] = "NEW";
    ProductType["USED"] = "USED";
    ProductType["REFURBISHED"] = "REFURBISHED";
    ProductType["ACCESSORY"] = "ACCESSORY";
    ProductType["SPARE_PART"] = "SPARE_PART";
    ProductType["SERVICE"] = "SERVICE";
    ProductType["BUNDLE"] = "BUNDLE";
    ProductType["OTHER"] = "OTHER";
    // El antiguo 'SERIALIZED' se elimina si no existe en el backend.
    // Los tipos NEW, USED, REFURBISHED implicarán tracksImei: true en muchos casos.
})(ProductType = exports.ProductType || (exports.ProductType = {}));
var InventoryItemStatus;
(function (InventoryItemStatus) {
    InventoryItemStatus["AVAILABLE"] = "AVAILABLE";
    InventoryItemStatus["RESERVED"] = "RESERVED";
    InventoryItemStatus["SOLD"] = "SOLD";
    InventoryItemStatus["USED_IN_REPAIR"] = "USED_IN_REPAIR";
    InventoryItemStatus["RETURNED"] = "RETURNED";
    InventoryItemStatus["DAMAGED"] = "DAMAGED";
    InventoryItemStatus["IN_TRANSIT"] = "IN_TRANSIT";
    InventoryItemStatus["CONSIGNMENT"] = "CONSIGNMENT";
    InventoryItemStatus["REMOVED"] = "REMOVED";
    // Si tienes más, añádelos. Si alguno de estos no está en tu schema, quítalo.
    // El que yo había puesto AWAITING_STOCK no parece estar en tu lista.
})(InventoryItemStatus = exports.InventoryItemStatus || (exports.InventoryItemStatus = {}));
var PurchaseOrderStatus;
(function (PurchaseOrderStatus) {
    PurchaseOrderStatus["DRAFT"] = "DRAFT";
    PurchaseOrderStatus["ORDERED"] = "ORDERED";
    PurchaseOrderStatus["PARTIALLY_RECEIVED"] = "PARTIALLY_RECEIVED";
    PurchaseOrderStatus["RECEIVED"] = "RECEIVED";
    PurchaseOrderStatus["CANCELLED"] = "CANCELLED";
    PurchaseOrderStatus["CLOSED"] = "CLOSED";
})(PurchaseOrderStatus = exports.PurchaseOrderStatus || (exports.PurchaseOrderStatus = {}));
var StockCountStatus;
(function (StockCountStatus) {
    StockCountStatus["PENDING"] = "PENDING";
    StockCountStatus["IN_PROGRESS"] = "IN_PROGRESS";
    StockCountStatus["COMPLETED"] = "COMPLETED";
    StockCountStatus["CANCELLED"] = "CANCELLED";
})(StockCountStatus = exports.StockCountStatus || (exports.StockCountStatus = {}));
var SaleStatus;
(function (SaleStatus) {
    SaleStatus["PENDING_PAYMENT"] = "PENDING_PAYMENT";
    SaleStatus["COMPLETED"] = "COMPLETED";
    SaleStatus["CANCELLED"] = "CANCELLED";
    SaleStatus["RETURNED"] = "RETURNED";
    SaleStatus["PARTIALLY_RETURNED"] = "PARTIALLY_RETURNED";
    // Podrías tener más estados si tu lógica de negocio lo requiere
})(SaleStatus = exports.SaleStatus || (exports.SaleStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD_CREDIT"] = "CARD_CREDIT";
    PaymentMethod["CARD_DEBIT"] = "CARD_DEBIT";
    PaymentMethod["TRANSFER"] = "TRANSFER";
    PaymentMethod["MOBILE_WALLET"] = "MOBILE_WALLET";
    PaymentMethod["STORE_CREDIT"] = "STORE_CREDIT";
    PaymentMethod["OTHER"] = "OTHER";
})(PaymentMethod = exports.PaymentMethod || (exports.PaymentMethod = {}));
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "PERCENTAGE";
    DiscountType["FIXED"] = "FIXED";
})(DiscountType = exports.DiscountType || (exports.DiscountType = {}));
var RepairStatus;
(function (RepairStatus) {
    RepairStatus["RECEIVED"] = "RECEIVED";
    RepairStatus["DIAGNOSING"] = "DIAGNOSING";
    RepairStatus["QUOTE_PENDING"] = "QUOTE_PENDING";
    RepairStatus["AWAITING_QUOTE_APPROVAL"] = "AWAITING_QUOTE_APPROVAL";
    RepairStatus["QUOTE_APPROVED"] = "QUOTE_APPROVED";
    RepairStatus["QUOTE_REJECTED"] = "QUOTE_REJECTED";
    RepairStatus["AWAITING_PARTS"] = "AWAITING_PARTS";
    RepairStatus["IN_REPAIR"] = "IN_REPAIR";
    RepairStatus["ASSEMBLING"] = "ASSEMBLING";
    RepairStatus["TESTING_QC"] = "TESTING_QC";
    RepairStatus["REPAIR_COMPLETED"] = "REPAIR_COMPLETED";
    RepairStatus["PENDING_PICKUP"] = "PENDING_PICKUP";
    RepairStatus["COMPLETED_PICKED_UP"] = "COMPLETED_PICKED_UP";
    RepairStatus["CANCELLED"] = "CANCELLED";
    RepairStatus["UNREPAIRABLE"] = "UNREPAIRABLE";
})(RepairStatus = exports.RepairStatus || (exports.RepairStatus = {}));
var SalesByProductOrderBy;
(function (SalesByProductOrderBy) {
    SalesByProductOrderBy["PRODUCT_NAME"] = "productName";
    SalesByProductOrderBy["QUANTITY_SOLD"] = "totalQuantitySold";
    SalesByProductOrderBy["REVENUE"] = "totalRevenue";
    SalesByProductOrderBy["PROFIT"] = "totalProfit";
})(SalesByProductOrderBy = exports.SalesByProductOrderBy || (exports.SalesByProductOrderBy = {}));
var MovementType;
(function (MovementType) {
    MovementType["SALE"] = "SALE";
    MovementType["PURCHASE_RECEIPT"] = "PURCHASE_RECEIPT";
    MovementType["ADJUSTMENT_IN"] = "ADJUSTMENT_IN";
    MovementType["ADJUSTMENT_OUT"] = "ADJUSTMENT_OUT";
    MovementType["TRANSFER_OUT"] = "TRANSFER_OUT";
    MovementType["TRANSFER_IN"] = "TRANSFER_IN";
    MovementType["RETURN_RESTOCK"] = "RETURN_RESTOCK";
    MovementType["REPAIR_CONSUMPTION"] = "REPAIR_CONSUMPTION";
    MovementType["INITIAL_STOCK"] = "INITIAL_STOCK";
    MovementType["STOCK_COUNT_ADJUSTMENT"] = "STOCK_COUNT_ADJUSTMENT";
    MovementType["PRODUCTION_IN"] = "PRODUCTION_IN";
    MovementType["PRODUCTION_OUT"] = "PRODUCTION_OUT";
    // Asegúrate que todos los valores de tu enum MovementType de Prisma estén aquí
})(MovementType = exports.MovementType || (exports.MovementType = {}));
var StockMovementsOrderBy;
(function (StockMovementsOrderBy) {
    StockMovementsOrderBy["MOVEMENT_DATE"] = "movementDate";
    StockMovementsOrderBy["PRODUCT_NAME"] = "productName";
    StockMovementsOrderBy["MOVEMENT_TYPE"] = "movementType";
})(StockMovementsOrderBy = exports.StockMovementsOrderBy || (exports.StockMovementsOrderBy = {}));
var RepairsReportSortBy;
(function (RepairsReportSortBy) {
    RepairsReportSortBy["RECEIVED_AT"] = "receivedAt";
    RepairsReportSortBy["REPAIR_NUMBER"] = "repairNumber";
    RepairsReportSortBy["CUSTOMER_NAME"] = "customerName";
    RepairsReportSortBy["TECHNICIAN_NAME"] = "technicianName";
    RepairsReportSortBy["STATUS"] = "status";
    RepairsReportSortBy["COMPLETED_AT"] = "completedAt";
})(RepairsReportSortBy = exports.RepairsReportSortBy || (exports.RepairsReportSortBy = {}));
var StockValuationThreshold;
(function (StockValuationThreshold) {
    StockValuationThreshold["ALL_PRODUCTS"] = "all";
    StockValuationThreshold["POSITIVE_STOCK_ONLY"] = "positiveStockOnly";
})(StockValuationThreshold = exports.StockValuationThreshold || (exports.StockValuationThreshold = {}));
var StockValuationSortBy;
(function (StockValuationSortBy) {
    StockValuationSortBy["PRODUCT_NAME"] = "productName";
    StockValuationSortBy["TOTAL_STOCK_VALUE"] = "totalStockValue";
    StockValuationSortBy["CURRENT_STOCK_QUANTITY"] = "currentStockQuantity";
})(StockValuationSortBy = exports.StockValuationSortBy || (exports.StockValuationSortBy = {}));
