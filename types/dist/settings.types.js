"use strict";
// types/settings.types.ts
exports.__esModule = true;
exports.PaymentMethod = void 0;
// Importar o redefinir el enum PaymentMethod tal como está en tu schema.prisma
// Si ya lo tienes en 'types/prisma-enums.ts', podrías importarlo desde allí.
// Por ahora, lo definimos aquí para que este archivo sea autocontenido.
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
