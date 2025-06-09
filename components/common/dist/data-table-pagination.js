// components/common/data-table-pagination.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.DataTablePagination = void 0;
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
function DataTablePagination(_a) {
    var page = _a.page, totalPages = _a.totalPages, totalRecords = _a.totalRecords, onNextPage = _a.onNextPage, onPreviousPage = _a.onPreviousPage, isFetching = _a.isFetching;
    if (totalPages <= 0)
        return null;
    var canPreviousPage = page > 1;
    var canNextPage = page < totalPages;
    return (React.createElement("div", { className: "flex items-center justify-between space-x-2 py-4 px-2" },
        React.createElement("div", { className: "flex-1 text-sm text-muted-foreground" },
            "Total: ",
            totalRecords,
            "."),
        React.createElement("div", { className: "flex items-center space-x-2" },
            React.createElement("span", { className: "text-sm text-muted-foreground" },
                "P\u00E1gina ",
                page,
                " de ",
                totalPages),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: onPreviousPage, disabled: !canPreviousPage || isFetching },
                React.createElement(lucide_react_1.ChevronLeft, { className: "mr-2 h-4 w-4" }),
                "Anterior"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: onNextPage, disabled: !canNextPage || isFetching },
                "Siguiente",
                React.createElement(lucide_react_1.ChevronRight, { className: "ml-2 h-4 w-4" })))));
}
exports.DataTablePagination = DataTablePagination;
