"use strict";
// lib/utils/formatters.ts
exports.__esModule = true;
exports.formatDate = exports.formatCurrency = void 0;
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
/**
 * Formatea un monto numérico como moneda.
 * @param amount El monto a formatear (puede ser string, number, null, o undefined).
 * @param currencySymbol El símbolo de la moneda (ej: "RD$", "$", "€").
 * @param locale El locale para el formateo de números (ej: 'es-DO', 'en-US').
 * @returns El string formateado o un guion si el monto no es válido.
 */
exports.formatCurrency = function (amount, currencySymbol, // Default para RD
locale // Default para formato de RD
) {
    if (currencySymbol === void 0) { currencySymbol = "RD$"; }
    if (locale === void 0) { locale = "es-DO"; }
    if (amount === null || amount === undefined || amount === "")
        return "-";
    var numericAmount = typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;
    if (isNaN(numericAmount)) {
        // console.warn(`formatCurrency: Valor inválido para monto: ${amount}`);
        return "-"; // O puedes devolver el valor original o un error
    }
    try {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency: currencySymbol === "RD$"
                ? "DOP"
                : currencySymbol === "$"
                    ? "USD"
                    : "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
            .format(numericAmount)
            .replace("DOP", currencySymbol)
            .replace("USD", currencySymbol)
            .replace("EUR", currencySymbol); // Reemplazar código ISO por símbolo
    }
    catch (e) {
        // console.error(`formatCurrency: Error formateando: ${numericAmount}`, e);
        // Fallback a un formato simple si Intl no funciona (ej. para símbolos no estándar)
        return currencySymbol + " " + numericAmount.toFixed(2);
    }
};
/**
 * Formatea una fecha a un string legible.
 * @param dateInput La fecha a formatear (string, Date, null, o undefined).
 * @param formatString El string de formato para date-fns (default: "dd/MM/yyyy").
 * @returns El string formateado o un guion si la fecha no es válida.
 */
exports.formatDate = function (dateInput, formatString) {
    if (formatString === void 0) { formatString = "dd/MM/yyyy"; }
    if (!dateInput)
        return "-";
    var date = new Date(dateInput);
    if (!date_fns_1.isValid(date)) {
        // Verifica si la fecha es válida con date-fns
        // console.warn(`formatDate: Valor inválido para fecha: ${dateInput}`);
        return String(dateInput); // Devuelve el input original si no es parseable
    }
    try {
        return date_fns_1.format(date, formatString, { locale: locale_1.es });
    }
    catch (e) {
        // console.error(`formatDate: Error formateando: ${dateInput}`, e);
        return String(dateInput);
    }
};
