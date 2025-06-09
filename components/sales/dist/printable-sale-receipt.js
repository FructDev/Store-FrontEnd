// components/sales/printable-sale-receipt.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.PrintableSaleReceipt = void 0;
var react_1 = require("react");
var formatters_1 = require("@/lib/utils/formatters");
var separator_1 = require("@/components/ui/separator");
var utils_1 = require("@/lib/utils");
// Este objeto de mapeo sigue siendo útil para mostrar el nombre del método de pago
var paymentMethodLabels = {
    CASH: "Efectivo",
    CARD_CREDIT: "T. Crédito",
    CARD_DEBIT: "T. Débito",
    TRANSFER: "Transferencia",
    MOBILE_WALLET: "Billetera Móvil",
    STORE_CREDIT: "Crédito Tienda",
    OTHER: "Otro"
};
// --- SIMPLIFICACIÓN: Ya no se necesita React.forwardRef ---
function PrintableSaleReceipt(_a) {
    var _b;
    var sale = _a.sale, storeSettings = _a.storeSettings, _c = _a.paperSize, paperSize = _c === void 0 ? "POS_RECEIPT_80MM" : _c;
    if (!sale) {
        return (react_1["default"].createElement("div", { className: "p-4 text-center text-muted-foreground" }, "No hay datos de venta para previsualizar."));
    }
    var currency = (storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.currencySymbol) || "RD$";
    // La tasa de impuesto se usa para mostrar el % en el recibo
    var taxRate = (_b = storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.defaultTaxRate) !== null && _b !== void 0 ? _b : 0;
    return (
    // El 'ref' se ha eliminado. Este div es solo para estilizar la previsualización.
    react_1["default"].createElement("div", { className: utils_1.cn("printable-receipt-area bg-white text-black font-mono text-xs mx-auto p-3 shadow-md", 
        // Clases de ancho para simular el tamaño del papel en pantalla
        paperSize === "POS_RECEIPT_58MM"
            ? "w-[300px]"
            : paperSize === "POS_RECEIPT_80MM"
                ? "w-[400px]"
                : "w-full max-w-4xl" // Para A4
        // Ya no necesitamos las clases 'print:...' aquí porque este componente no se imprime directamente.
        ) },
        react_1["default"].createElement("header", { className: "text-center mb-2" },
            (storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.logoUrl) && (react_1["default"].createElement("img", { src: storeSettings.logoUrl, alt: "Logo Tienda", className: "h-12 max-w-[150px] mx-auto mb-1" })),
            react_1["default"].createElement("h2", { className: "font-bold text-sm uppercase" }, (storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.name) || "NOMBRE DE TIENDA"),
            (storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.address) && react_1["default"].createElement("p", null, storeSettings.address),
            (storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.rnc) && react_1["default"].createElement("p", null,
                "RNC: ",
                storeSettings.rnc),
            (storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.phone) && react_1["default"].createElement("p", null,
                "Tel: ",
                storeSettings.phone)),
        react_1["default"].createElement(separator_1.Separator, { className: "my-2 border-dashed border-black" }),
        react_1["default"].createElement("section", { className: "space-y-0.5 text-[10pt]" },
            react_1["default"].createElement("div", { className: "flex justify-between" },
                react_1["default"].createElement("span", null, "Venta #:"),
                react_1["default"].createElement("span", { className: "font-semibold" }, sale.saleNumber)),
            sale.ncf && (react_1["default"].createElement("div", { className: "flex justify-between" },
                react_1["default"].createElement("span", null, "NCF:"),
                react_1["default"].createElement("span", { className: "font-semibold" }, sale.ncf))),
            react_1["default"].createElement("div", { className: "flex justify-between" },
                react_1["default"].createElement("span", null, "Fecha:"),
                react_1["default"].createElement("span", null, formatters_1.formatDate(sale.saleDate, "dd/MM/yy HH:mm"))),
            sale.user && (react_1["default"].createElement("div", { className: "flex justify-between" },
                react_1["default"].createElement("span", null, "Cajero/a:"),
                react_1["default"].createElement("span", null, sale.salespersonName || "N/A")))),
        sale.customer && (react_1["default"].createElement(react_1["default"].Fragment, null,
            react_1["default"].createElement(separator_1.Separator, { className: "my-2 border-dashed border-black" }),
            react_1["default"].createElement("section", { className: "text-[10pt] text-left" },
                react_1["default"].createElement("div", { className: "font-semibold" }, "Cliente:"),
                react_1["default"].createElement("div", null, sale.customerName),
                sale.customer.rnc && (react_1["default"].createElement("div", null,
                    "RNC/ID: ",
                    sale.customer.rnc)),
                sale.customer.phone && react_1["default"].createElement("div", null,
                    "Tel: ",
                    sale.customer.phone)))),
        react_1["default"].createElement(separator_1.Separator, { className: "my-2 border-dashed border-black" }),
        react_1["default"].createElement("table", { className: "w-full my-1 text-[10pt]" },
            react_1["default"].createElement("thead", null,
                react_1["default"].createElement("tr", { className: "border-b border-dashed border-black" },
                    react_1["default"].createElement("th", { className: "text-left font-semibold pb-1 pr-1" }, "Descripci\u00F3n"),
                    react_1["default"].createElement("th", { className: "text-center font-semibold pb-1" }, "Cant."),
                    react_1["default"].createElement("th", { className: "text-right font-semibold pb-1 px-1" }, "Precio"),
                    react_1["default"].createElement("th", { className: "text-right font-semibold pb-1 pl-1" }, "Total"))),
            react_1["default"].createElement("tbody", null, sale.lines.map(function (line, index) {
                var _a;
                return (react_1["default"].createElement("tr", { key: line.id || index, className: "align-top" },
                    react_1["default"].createElement("td", { className: "py-1 pr-1" },
                        ((_a = line.product) === null || _a === void 0 ? void 0 : _a.name) ||
                            line.miscItemDescription ||
                            "Ítem Desconocido",
                        line.imei && (react_1["default"].createElement("div", { className: "text-[8pt] text-gray-600" },
                            "S/N: ",
                            line.imei)),
                        line.discountAmount > 0 && (react_1["default"].createElement("div", { className: "text-[8pt] text-gray-600" },
                            "(Desc: -",
                            formatters_1.formatCurrency(line.discountAmount, currency),
                            ")"))),
                    react_1["default"].createElement("td", { className: "text-center py-1" }, line.quantity),
                    react_1["default"].createElement("td", { className: "text-right py-1 px-1" }, formatters_1.formatCurrency(line.unitPrice, currency)),
                    react_1["default"].createElement("td", { className: "text-right py-1 pl-1" }, formatters_1.formatCurrency(line.lineTotalAfterTax))));
            }))),
        react_1["default"].createElement(separator_1.Separator, { className: "my-2 border-dashed border-black" }),
        react_1["default"].createElement("section", { className: "text-[10pt] space-y-1" },
            react_1["default"].createElement("div", { className: "flex justify-between" },
                react_1["default"].createElement("span", null, "SUBTOTAL:"),
                react_1["default"].createElement("span", null, formatters_1.formatCurrency(sale.subTotalAfterLineDiscounts, currency))),
            sale.discountOnTotalAmount > 0 && (react_1["default"].createElement("div", { className: "flex justify-between" },
                react_1["default"].createElement("span", null, "DESCUENTO:"),
                react_1["default"].createElement("span", null,
                    "-",
                    formatters_1.formatCurrency(sale.discountOnTotalAmount, currency)))),
            react_1["default"].createElement("div", { className: "flex justify-between" },
                react_1["default"].createElement("span", null,
                    "IMPUESTOS (",
                    (taxRate * 100).toFixed(0),
                    "%):"),
                react_1["default"].createElement("span", null, formatters_1.formatCurrency(sale.taxTotal, currency))),
            react_1["default"].createElement("div", { className: "flex justify-between font-bold text-base mt-1" },
                react_1["default"].createElement("span", null, "TOTAL:"),
                react_1["default"].createElement("span", null, formatters_1.formatCurrency(sale.totalAmount, currency)))),
        react_1["default"].createElement(separator_1.Separator, { className: "my-2 border-dashed border-black" }),
        react_1["default"].createElement("section", { className: "text-[10pt] space-y-1" },
            react_1["default"].createElement("p", { className: "font-semibold" }, "Forma(s) de Pago:"),
            sale.payments.map(function (payment, index) { return (react_1["default"].createElement("div", { key: index, className: "flex justify-between" },
                react_1["default"].createElement("span", null,
                    paymentMethodLabels[payment.paymentMethod] ||
                        payment.paymentMethod,
                    ":"),
                react_1["default"].createElement("span", null, formatters_1.formatCurrency(payment.amount, currency)))); }),
            sale.changeGiven && sale.changeGiven > 0 && (react_1["default"].createElement("div", { className: "flex justify-between font-semibold" },
                react_1["default"].createElement("span", null, "CAMBIO:"),
                react_1["default"].createElement("span", null, formatters_1.formatCurrency(sale.changeGiven, currency))))),
        react_1["default"].createElement("footer", { className: "text-center mt-4 text-[8pt]" },
            (storeSettings === null || storeSettings === void 0 ? void 0 : storeSettings.receiptFooterNotes) && (react_1["default"].createElement("div", { className: "space-y-1" }, storeSettings.receiptFooterNotes.split("\n").map(function (textLine, i) { return (react_1["default"].createElement("p", { key: i, className: "leading-tight" }, textLine)); }))),
            react_1["default"].createElement("p", { className: "mt-2 leading-tight" }, "\u00A1Gracias por su compra!"))));
}
exports.PrintableSaleReceipt = PrintableSaleReceipt;
