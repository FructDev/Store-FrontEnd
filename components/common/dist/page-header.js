"use strict";
exports.__esModule = true;
exports.PageHeader = void 0;
// components/common/page-header.tsx
var react_1 = require("react");
function PageHeader(_a) {
    var title = _a.title, description = _a.description, actionButton = _a.actionButton;
    return (react_1["default"].createElement("div", { className: "flex items-center justify-between space-y-2 mb-6" },
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, title),
            description && react_1["default"].createElement("p", { className: "text-muted-foreground" }, description)),
        actionButton && (react_1["default"].createElement("div", { className: "flex items-center space-x-2" }, actionButton))));
}
exports.PageHeader = PageHeader;
