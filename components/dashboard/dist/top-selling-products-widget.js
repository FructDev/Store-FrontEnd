// components/dashboard/top-selling-products-widget.tsx
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var api_1 = require("@/lib/api");
var card_1 = require("@/components/ui/card");
var skeleton_1 = require("@/components/ui/skeleton");
var lucide_react_1 = require("lucide-react"); // Iconos
var select_1 = require("@/components/ui/select");
var formatters_1 = require("@/lib/utils/formatters");
var link_1 = require("next/link");
var button_1 = require("../ui/button");
function TopSellingProductsWidget(_a) {
    var _this = this;
    var dateRange = _a.dateRange, className = _a.className;
    var limit = react_1.useState(5)[0]; // Mostrar Top 5 en el widget
    var _b = react_1.useState("quantity"), orderBy = _b[0], setOrderBy = _b[1]; // Default a cantidad
    var _c = react_query_1.useQuery({
        // Espera un array
        queryKey: [
            "dashboardTopSellingProducts",
            dateRange.startDate,
            dateRange.endDate,
            limit,
            orderBy,
        ],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var params, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = __assign(__assign({}, dateRange), { limit: limit, orderByCriteria: orderBy });
                        return [4 /*yield*/, api_1["default"].get("/dashboard/top-selling-products", {
                                params: params
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data || []]; // El backend ya debería devolver un array
                }
            });
        }); }
    }), topProducts = _c.data, isLoading = _c.isLoading, isError = _c.isError, error = _c.error;
    if (isError) {
        return (react_1["default"].createElement(card_1.Card, { className: className },
            react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Top Productos"),
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-destructive" })),
            react_1["default"].createElement(card_1.CardContent, null,
                react_1["default"].createElement("p", { className: "text-xs text-destructive" },
                    "Error al cargar datos: ",
                    error.message))));
    }
    return (react_1["default"].createElement(card_1.Card, { className: className },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center" },
                    react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5 mr-2 text-muted-foreground group-hover:text-primary" }),
                    "Top ",
                    limit,
                    " Productos Vendidos"),
                react_1["default"].createElement(select_1.Select, { value: orderBy, onValueChange: function (value) { return setOrderBy(value); } },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "h-8 w-[130px] text-xs" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Ordenar por..." })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "quantity" }, "Por Cantidad"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "revenue" }, "Por Ingresos")))),
            react_1["default"].createElement(card_1.CardDescription, { className: "text-xs text-muted-foreground pt-1" }, "Productos m\u00E1s populares en el per\u00EDodo seleccionado.")),
        react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "space-y-2" }, __spreadArrays(Array(limit)).map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center justify-between" },
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-3/5" }),
            " ",
            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-1/5" }))); }))) : topProducts && topProducts.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-2 text-xs" }, topProducts.map(function (product, index) { return (react_1["default"].createElement("div", { key: product.productId || index, className: "flex items-center justify-between py-1 hover:bg-muted/50 rounded px-1 -mx-1" },
            react_1["default"].createElement("div", { className: "flex items-center truncate" },
                react_1["default"].createElement("span", { className: "font-medium mr-2" },
                    index + 1,
                    "."),
                react_1["default"].createElement(lucide_react_1.ShoppingBag, { className: "h-3.5 w-3.5 mr-1.5 text-muted-foreground flex-shrink-0" }),
                react_1["default"].createElement("span", { className: "truncate", title: product.productName },
                    product.productName,
                    product.productSku && product.productSku !== "N/A" && (react_1["default"].createElement("span", { className: "text-muted-foreground text-[10px] ml-1" },
                        "(",
                        product.productSku,
                        ")")))),
            react_1["default"].createElement("span", { className: "font-semibold whitespace-nowrap" }, orderBy === "quantity"
                ? product.totalQuantitySold + " und."
                : formatters_1.formatCurrency(product.totalRevenueGenerated)))); }))) : (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-4" }, "No hay datos de productos vendidos para mostrar."))),
        react_1["default"].createElement(card_1.CardFooter, { className: "pt-3" },
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", asChild: true, className: "w-full" },
                react_1["default"].createElement(link_1["default"], { href: "/dashboard/reports/sales/by-product", className: "block truncate" },
                    react_1["default"].createElement("span", { className: "truncate" }, "Ver Reporte Completo de Productos"))))));
}
exports["default"] = TopSellingProductsWidget;
