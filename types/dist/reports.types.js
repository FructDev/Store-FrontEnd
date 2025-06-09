"use strict";
// types/reports.types.ts (FRONTEND)
exports.__esModule = true;
exports.StockValuationSortBy = exports.ReportStockValuationThreshold = void 0;
// Coincide con StockValuationThreshold enum del backend DTO
var ReportStockValuationThreshold;
(function (ReportStockValuationThreshold) {
    ReportStockValuationThreshold["ALL_PRODUCTS"] = "all";
    ReportStockValuationThreshold["POSITIVE_STOCK_ONLY"] = "positiveStockOnly";
})(ReportStockValuationThreshold = exports.ReportStockValuationThreshold || (exports.ReportStockValuationThreshold = {}));
// Coincide con los valores permitidos para sortBy en FindStockValuationQueryDto
var StockValuationSortBy;
(function (StockValuationSortBy) {
    StockValuationSortBy["PRODUCT_NAME"] = "productName";
    StockValuationSortBy["TOTAL_STOCK_VALUE"] = "totalStockValue";
    StockValuationSortBy["CURRENT_STOCK_QUANTITY"] = "currentStockQuantity";
})(StockValuationSortBy = exports.StockValuationSortBy || (exports.StockValuationSortBy = {}));
