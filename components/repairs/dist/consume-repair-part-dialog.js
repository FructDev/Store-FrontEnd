// components/repairs/consume-repair-part-dialog.tsx
"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ConsumeRepairPartDialog = void 0;
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
// import React, { useEffect, useMemo, useState } from "react";
var formatters_1 = require("@/lib/utils/formatters");
var react_1 = require("react");
// Schema Zod para el formulario de consumo de parte
var consumePartSchema = z.object({
    inventoryItemId: z
        .string()
        .min(1, "Debe seleccionar un ítem/lote específico del inventario."),
    // quantityConsumed: z.coerce.number().int().positive(), // Solo si se permite consumir parcial de un lote no serializado
    notes: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
function ConsumeRepairPartDialog(_a) {
    var _this = this;
    var _b, _c;
    var isOpen = _a.isOpen, onOpenChange = _a.onOpenChange, repairId = _a.repairId, repairLine = _a.repairLine, onSuccess = _a.onSuccess;
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(consumePartSchema),
        defaultValues: { inventoryItemId: undefined, notes: "" }
    });
    var productId = repairLine === null || repairLine === void 0 ? void 0 : repairLine.productId;
    var isProductSerialized = (_b = repairLine === null || repairLine === void 0 ? void 0 : repairLine.product) === null || _b === void 0 ? void 0 : _b.tracksImei;
    var quantityNeeded = (repairLine === null || repairLine === void 0 ? void 0 : repairLine.quantity) || 1;
    // Fetch de InventoryItems disponibles para este producto
    var _d = react_query_1.useQuery({
        queryKey: [
            "availableStockForRepairConsume",
            productId,
            isProductSerialized,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!productId)
                            return [2 /*return*/, []];
                        params = {
                            productId: productId,
                            status: prisma_enums_1.InventoryItemStatus.AVAILABLE,
                            limit: 100
                        };
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/items", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.data || response.data || []];
                }
            });
        }); },
        enabled: !!productId && isOpen
    }), availableStockItems = _d.data, isLoadingStockItems = _d.isLoading;
    react_1.useEffect(function () {
        if (isOpen) {
            form.reset({ inventoryItemId: undefined, notes: "" });
        }
    }, [isOpen, form]);
    var consumePartMutation = react_query_1.useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(repairLine === null || repairLine === void 0 ? void 0 : repairLine.id))
                            throw new Error("ID de línea de reparación no disponible.");
                        payload = {
                            inventoryItemId: data.inventoryItemId,
                            notes: data.notes
                        };
                        return [4 /*yield*/, api_1["default"].post("/repairs/" + repairId + "/lines/" + repairLine.id + "/consume-stock", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function () {
            var _a;
            sonner_1.toast.success("Repuesto \"" + (((_a = repairLine === null || repairLine === void 0 ? void 0 : repairLine.product) === null || _a === void 0 ? void 0 : _a.name) || "seleccionado") + "\" consumido del inventario.");
            onSuccess();
            onOpenChange(false);
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al consumir el repuesto.");
        }
    });
    function onSubmit(data) {
        // Si no es serializado, y queremos validar cantidad consumida contra cantidad de la línea
        if (!isProductSerialized) {
            var selectedLot = availableStockItems === null || availableStockItems === void 0 ? void 0 : availableStockItems.find(function (item) { return item.id === data.inventoryItemId; });
            if (selectedLot && quantityNeeded > selectedLot.quantity) {
                form.setError("inventoryItemId", {
                    message: "El lote seleccionado solo tiene " + selectedLot.quantity + " uds. y se necesitan " + quantityNeeded + "."
                });
                return;
            }
        }
        consumePartMutation.mutate(data);
    }
    if (!isOpen || !repairLine || !repairLine.productId)
        return null; // Solo para líneas con producto de catálogo
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: onOpenChange },
        React.createElement(dialog_1.DialogContent, { className: "sm:max-w-lg" },
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null,
                    "Consumir Repuesto para: ", (_c = repairLine.product) === null || _c === void 0 ? void 0 :
                    _c.name),
                React.createElement(dialog_1.DialogDescription, null, isProductSerialized
                    ? "Selecciona el IMEI/Serial espec\u00EDfico a utilizar (Necesitas: " + quantityNeeded + ")."
                    : "Selecciona el lote/ubicaci\u00F3n de donde tomar " + quantityNeeded + " unidad(es).")),
            React.createElement(form_1.Form, __assign({}, form),
                React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4 py-2" },
                    React.createElement(form_1.FormField, { control: form.control, name: "inventoryItemId", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null, isProductSerialized
                                    ? "IMEI/Serial Específico*"
                                    : "Lote de Inventario/Ubicación*"),
                                React.createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "", disabled: isLoadingStockItems ||
                                        !availableStockItems ||
                                        availableStockItems.length === 0 },
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: isLoadingStockItems
                                                    ? "Cargando stock..."
                                                    : !availableStockItems ||
                                                        availableStockItems.length === 0
                                                        ? "No hay stock disponible"
                                                        : "Selecciona ítem/lote..." }))),
                                    React.createElement(select_1.SelectContent, { className: "max-h-60" }, availableStockItems === null || availableStockItems === void 0 ? void 0 : availableStockItems.map(function (item) {
                                        var _a, _b;
                                        return (React.createElement(select_1.SelectItem, { key: item.id, value: item.id, disabled: !isProductSerialized &&
                                                item.quantity < quantityNeeded },
                                            isProductSerialized
                                                ? item.imei + " (Ubic: " + (((_a = item.location) === null || _a === void 0 ? void 0 : _a.name) || "N/A") + ", Cond: " + (item.condition || "N/A") + ")"
                                                : (((_b = item.location) === null || _b === void 0 ? void 0 : _b.name) || "N/A") + " - Lote (Disp: " + item.quantity + ", Costo: " + formatters_1.formatCurrency(item.costPrice) + ")",
                                            !isProductSerialized &&
                                                item.quantity < quantityNeeded && (React.createElement("span", { className: "text-xs text-destructive ml-2" }, "(Insuficiente)"))));
                                    }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(form_1.FormField, { control: form.control, name: "notes", render: function (_a) {
                            var _b;
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                " ",
                                React.createElement(form_1.FormLabel, null, "Notas de Consumo (Opcional)"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(textarea_1.Textarea, __assign({ placeholder: "Notas..." }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", rows: 2 }))),
                                React.createElement(form_1.FormMessage, null)));
                        } }),
                    React.createElement(dialog_1.DialogFooter, { className: "pt-4" },
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: consumePartMutation.isPending }, "Cancelar"),
                        React.createElement(button_1.Button, { type: "submit", disabled: consumePartMutation.isPending ||
                                isLoadingStockItems ||
                                !form.formState.isValid },
                            consumePartMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                            "Confirmar Consumo")))))));
}
exports.ConsumeRepairPartDialog = ConsumeRepairPartDialog;
