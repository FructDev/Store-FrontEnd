// app/(dashboard)/layout.tsx
"use client";
"use strict";
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
var sidebar_1 = require("@/components/layout/sidebar");
var header_1 = require("@/components/layout/header");
var auth_store_1 = require("@/stores/auth.store"); // Asegúrate que el tipo User esté exportado de tu store
var navigation_1 = require("next/navigation");
var react_1 = require("react");
var react_query_provider_1 = require("@/components/providers/react-query-provider"); // Re-añadimos este provider
var nextjs_toploader_1 = require("nextjs-toploader");
var api_1 = require("@/lib/api");
function DashboardLayout(_a) {
    var _this = this;
    var children = _a.children;
    var _b = auth_store_1.useAuthStore(), user = _b.user, logout = _b.logout, isAuthenticated = _b.isAuthenticated, setStoreName = _b.setStoreName; // Obtener isAuthenticated
    var router = navigation_1.useRouter();
    var _c = react_1.useState(true), isVerifying = _c[0], setIsVerifying = _c[1];
    react_1.useEffect(function () {
        var fetchStoreName = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((user === null || user === void 0 ? void 0 : user.storeId) && !user.storeName)) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, api_1["default"].get("/stores/settings")];
                    case 2:
                        response = _b.sent();
                        if ((_a = response.data) === null || _a === void 0 ? void 0 : _a.name) {
                            setStoreName(response.data.name);
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Error fetching store settings for name:", error_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        var unsubscribe = auth_store_1.useAuthStore.persist.onFinishHydration(function () {
            var tokenAfterHydration = auth_store_1.useAuthStore.getState().token;
            var hydratedUser = auth_store_1.useAuthStore.getState().user;
            if (!tokenAfterHydration) {
                router.replace("/login");
            }
            else {
                setIsVerifying(false);
                if ((hydratedUser === null || hydratedUser === void 0 ? void 0 : hydratedUser.storeId) && !hydratedUser.storeName) {
                    fetchStoreName(); // Llamar después de confirmar autenticación y storeId
                }
            }
        });
        if (auth_store_1.useAuthStore.persist.hasHydrated()) {
            var tokenFromState = auth_store_1.useAuthStore.getState().token;
            var hydratedUser = auth_store_1.useAuthStore.getState().user;
            if (!tokenFromState) {
                router.replace("/login");
            }
            else {
                setIsVerifying(false);
                if ((hydratedUser === null || hydratedUser === void 0 ? void 0 : hydratedUser.storeId) && !hydratedUser.storeName) {
                    fetchStoreName(); // Llamar después de confirmar autenticación y storeId
                }
            }
        }
        return function () {
            unsubscribe();
        };
    }, [user, setStoreName, router]);
    if (isVerifying) {
        return (react_1["default"].createElement("div", { className: "flex h-screen w-full items-center justify-center" }, "Verificando sesi\u00F3n y cargando..."));
    }
    // Este chequeo es una salvaguarda si la redirección del useEffect no es inmediata
    if (!isAuthenticated &&
        auth_store_1.useAuthStore.persist.hasHydrated() &&
        typeof window !== "undefined") {
        router.replace("/login");
        return (react_1["default"].createElement("div", { className: "flex h-screen w-full items-center justify-center" }, "Redirigiendo al login..."));
    }
    return (
    // Envolver con ReactQueryProvider
    react_1["default"].createElement(react_query_provider_1["default"], null,
        react_1["default"].createElement(nextjs_toploader_1["default"], { color: "#2563eb", showSpinner: false }),
        react_1["default"].createElement("div", { className: "flex min-h-screen w-full bg-muted/40" },
            react_1["default"].createElement(sidebar_1.Sidebar, null),
            " ",
            react_1["default"].createElement("div", { className: "flex flex-1 flex-col md:ml-60" },
                " ",
                react_1["default"].createElement(header_1.Header, { user: user, onLogout: logout }),
                react_1["default"].createElement("main", { className: "flex-1 overflow-y-auto p-4 sm:px-6 sm:py-6 md:gap-8" },
                    " ",
                    children)))));
}
exports["default"] = DashboardLayout;
