// components/common/data-table.tsx
"use client";
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.DataTable = void 0;
var react_1 = require("react");
var react_table_1 = require("@tanstack/react-table");
var table_1 = require("@/components/ui/table");
var data_table_pagination_1 = require("./data-table-pagination"); // Importar tu componente de paginación
var skeleton_1 = require("@/components/ui/skeleton");
function DataTable(_a) {
    var _b;
    var columns = _a.columns, data = _a.data, _c = _a.isLoading, isLoading = _c === void 0 ? false : _c, pageCount = _a.pageCount, pagination = _a.pagination, onPaginationChange = _a.onPaginationChange, filterComponent = _a.filterComponent, tableMeta = _a.tableMeta;
    var _d = react_1.useState([]), sorting = _d[0], setSorting = _d[1];
    var table = react_table_1.useReactTable({
        data: data,
        columns: columns,
        getCoreRowModel: react_table_1.getCoreRowModel(),
        getPaginationRowModel: react_table_1.getPaginationRowModel(),
        getSortedRowModel: react_table_1.getSortedRowModel(),
        onSortingChange: setSorting,
        manualPagination: true,
        pageCount: pageCount,
        onPaginationChange: onPaginationChange,
        state: {
            sorting: sorting,
            pagination: pagination
        },
        meta: tableMeta
    });
    return (React.createElement("div", { className: "space-y-4" },
        filterComponent && (React.createElement("div", { className: "flex items-center py-4" }, filterComponent)),
        React.createElement("div", { className: "rounded-md border" },
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null, table.getHeaderGroups().map(function (headerGroup) { return (React.createElement(table_1.TableRow, { key: headerGroup.id }, headerGroup.headers.map(function (header) {
                    return (React.createElement(table_1.TableHead, { key: header.id }, header.isPlaceholder
                        ? null
                        : react_table_1.flexRender(header.column.columnDef.header, header.getContext())));
                }))); })),
                React.createElement(table_1.TableBody, null, isLoading ? (
                // Mostrar skeletons durante la carga
                __spreadArrays(Array(pagination.pageSize)).map(function (_, i) { return (React.createElement(table_1.TableRow, { key: "skel-row-" + i }, columns.map(function (col, j) { return (React.createElement(table_1.TableCell, { key: "skel-cell-<span class=\"math-inline\">{i}-</span>{j}" },
                    React.createElement(skeleton_1.Skeleton, { className: "h-6 w-full" }))); }))); })) : ((_b = table.getRowModel().rows) === null || _b === void 0 ? void 0 : _b.length) ? (table.getRowModel().rows.map(function (row) { return (React.createElement(table_1.TableRow, { key: row.id, "data-state": row.getIsSelected() && "selected" }, row.getVisibleCells().map(function (cell) { return (React.createElement(table_1.TableCell, { key: cell.id }, react_table_1.flexRender(cell.column.columnDef.cell, cell.getContext()))); }))); })) : (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: columns.length, className: "h-24 text-center" }, "No se encontraron resultados.")))))),
        React.createElement(data_table_pagination_1.DataTablePagination, { table: table })));
}
exports.DataTable = DataTable;
