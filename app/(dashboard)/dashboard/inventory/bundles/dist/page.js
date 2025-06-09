// app/(dashboard)/inventory/bundles/page.tsx
"use client";
"use strict";
exports.__esModule = true;
var page_header_1 = require("@/components/common/page-header");
var tabs_1 = require("@/components/ui/tabs");
var assemble_bundle_form_1 = require("@/components/inventory/bundles/assemble-bundle-form");
var disassemble_bundle_form_1 = require("@/components/inventory/bundles/disassemble-bundle-form");
var card_1 = require("@/components/ui/card");
function BundleOperationsPage() {
    return (React.createElement(React.Fragment, null,
        React.createElement(page_header_1.PageHeader, { title: "Gesti\u00F3n de Bundles/Kits", description: "Ensambla nuevos kits a partir de componentes o desensambla kits existentes." }),
        React.createElement(tabs_1.Tabs, { defaultValue: "assemble-bundle", className: "w-full" },
            React.createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2 md:w-[400px]" },
                React.createElement(tabs_1.TabsTrigger, { value: "assemble-bundle" }, "Ensamblar Bundle"),
                React.createElement(tabs_1.TabsTrigger, { value: "disassemble-bundle" }, "Desensamblar Bundle")),
            React.createElement(tabs_1.TabsContent, { value: "assemble-bundle" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Ensamblar Nuevo Bundle/Kit"),
                        React.createElement(card_1.CardDescription, null, "Selecciona un producto tipo Bundle y los componentes se descontar\u00E1n del stock para crear el kit.")),
                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                        React.createElement(assemble_bundle_form_1.AssembleBundleForm, null)))),
            React.createElement(tabs_1.TabsContent, { value: "disassemble-bundle" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Desensamblar Bundle/Kit Existente"),
                        React.createElement(card_1.CardDescription, null, "Selecciona un kit en stock para desarmarlo y devolver sus componentes al inventario.")),
                    React.createElement(card_1.CardContent, { className: "space-y-2" },
                        React.createElement(disassemble_bundle_form_1.DisassembleBundleForm, null)))))));
}
exports["default"] = BundleOperationsPage;
