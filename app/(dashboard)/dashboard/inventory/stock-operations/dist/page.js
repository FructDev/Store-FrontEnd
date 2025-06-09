// app/(dashboard)/inventory/stock-operations/page.tsx
"use client";
"use strict";
exports.__esModule = true;
var page_header_1 = require("@/components/common/page-header");
var tabs_1 = require("@/components/ui/tabs");
var add_non_serialized_stock_form_1 = require("@/components/inventory/stock/add-non-serialized-stock-form");
var add_serialized_stock_form_1 = require("@/components/inventory/stock/add-serialized-stock-form");
var card_1 = require("@/components/ui/card");
var adjust_stock_form_1 = require("@/components/inventory/stock/adjust-stock-form");
var transfer_stock_form_1 = require("@/components/inventory/stock/transfer-stock-form");
function StockOperationsPage() {
    return (React.createElement(React.Fragment, null,
        React.createElement(page_header_1.PageHeader, { title: "Operaciones de Stock", description: "Gestiona las entradas, salidas y movimientos de tu inventario." }),
        React.createElement(tabs_1.Tabs, { defaultValue: "add-non-serialized", className: "w-full" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full sm:grid-cols-4 md:w-auto" },
                React.createElement(tabs_1.TabsTrigger, { value: "add-non-serialized" }, "A\u00F1adir Stock General"),
                React.createElement(tabs_1.TabsTrigger, { value: "add-serialized" }, "A\u00F1adir Stock Serializado"),
                React.createElement(tabs_1.TabsTrigger, { value: "adjust-stock" }, "Ajustar Stock"),
                React.createElement(tabs_1.TabsTrigger, { value: "transfer-stock" }, "Transferir Stock")),
            React.createElement(tabs_1.TabsContent, { value: "add-non-serialized" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "A\u00F1adir Stock General/No Serializado"),
                        React.createElement(card_1.CardDescription, null, "Incrementa la cantidad de un producto existente en una ubicaci\u00F3n o crea un nuevo lote.")),
                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                        React.createElement(add_non_serialized_stock_form_1.AddNonSerializedStockForm, null)))),
            React.createElement(tabs_1.TabsContent, { value: "add-serialized" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "A\u00F1adir Stock Serializado"),
                        React.createElement(card_1.CardDescription, null, "Registra \u00EDtems individuales con n\u00FAmero de serie o IMEI.")),
                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                        React.createElement(add_serialized_stock_form_1.AddSerializedStockForm, null)))),
            React.createElement(tabs_1.TabsContent, { value: "adjust-stock" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Ajustar Stock (No Serializado)"),
                        React.createElement(card_1.CardDescription, null, "Incrementa o disminuye la cantidad de un producto no serializado en una ubicaci\u00F3n espec\u00EDfica.")),
                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                        React.createElement(adjust_stock_form_1.AdjustStockForm, null)))),
            React.createElement(tabs_1.TabsContent, { value: "transfer-stock" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Transferir Stock entre Ubicaciones"),
                        React.createElement(card_1.CardDescription, null, "Mueve unidades de un producto de una ubicaci\u00F3n a otra dentro de tu tienda.")),
                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                        React.createElement(transfer_stock_form_1.TransferStockForm, null)))))));
}
exports["default"] = StockOperationsPage;
