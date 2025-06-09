"use strict";
exports.__esModule = true;
// app/(marketing)/layout.tsx
var PublicNavbar_1 = require("@/components/layout/PublicNavbar"); // Ajusta la ruta
var Footer_1 = require("@/components/layout/Footer"); // Ajusta la ruta
function MarketingLayout(_a) {
    var children = _a.children;
    return (React.createElement("div", { className: "flex min-h-screen flex-col bg-gray-50" },
        React.createElement(PublicNavbar_1.PublicNavbar, null),
        React.createElement("main", { className: "flex-1" }, children),
        React.createElement(Footer_1.Footer, null)));
}
exports["default"] = MarketingLayout;
