"use strict";
// types/dashboard.types.ts
exports.__esModule = true;
exports.RepairStatus = exports.PaymentMethod = void 0;
// types/prisma-enums.ts (Ejemplo de archivo en tu frontend)
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "CASH";
    PaymentMethod["CARD_CREDIT"] = "CARD_CREDIT";
    PaymentMethod["CARD_DEBIT"] = "CARD_DEBIT";
    PaymentMethod["TRANSFER"] = "TRANSFER";
    PaymentMethod["MOBILE_WALLET"] = "MOBILE_WALLET";
    PaymentMethod["STORE_CREDIT"] = "STORE_CREDIT";
    PaymentMethod["OTHER"] = "OTHER";
    // Asegúrate que estos valores coincidan 100% con tu enum en schema.prisma
})(PaymentMethod = exports.PaymentMethod || (exports.PaymentMethod = {}));
var RepairStatus;
(function (RepairStatus) {
    RepairStatus["RECEIVED"] = "RECEIVED";
    RepairStatus["DIAGNOSING"] = "DIAGNOSING";
    RepairStatus["QUOTE_PENDING"] = "QUOTE_PENDING";
    RepairStatus["AWAITING_QUOTE_APPROVAL"] = "AWAITING_QUOTE_APPROVAL";
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
    // Asegúrate que estos valores coincidan 100% con tu enum en schema.prisma
})(RepairStatus = exports.RepairStatus || (exports.RepairStatus = {}));
