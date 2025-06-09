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
exports.__esModule = true;
exports.useAuthStore = void 0;
// stores/auth.store.ts
var zustand_1 = require("zustand");
var middleware_1 = require("zustand/middleware");
exports.useAuthStore = zustand_1.create()(middleware_1.persist(
// Usamos el middleware 'persist' para guardar en localStorage
function (set) { return ({
    user: null,
    token: null,
    isAuthenticated: false,
    login: function (token, userData) {
        set({ token: token, user: userData, isAuthenticated: true });
        // Si usamos Axios globalmente, podríamos setear el header aquí,
        // pero es mejor hacerlo en el interceptor de Axios.
    },
    logout: function () {
        set({ token: null, user: null, isAuthenticated: false });
        // Limpiar cualquier otro estado relacionado si es necesario
        // if (typeof window !== "undefined") {
        //   window.location.href = '/login'; // Forzar redirección si es necesario
        // }
    },
    setUser: function (userData) {
        return set({ user: userData, isAuthenticated: !!userData });
    },
    setToken: function (token) { return set({ token: token, isAuthenticated: !!token }); },
    setStoreName: function (name) {
        return set(function (state) { return ({
            user: state.user ? __assign(__assign({}, state.user), { storeName: name }) : null
        }); });
    }
}); }, {
    name: "saashopix-auth-storage",
    storage: middleware_1.createJSONStorage(function () { return localStorage; }),
    // Opcional: onRehydrateStorage para saber cuándo terminó de cargar del storage
    onRehydrateStorage: function () {
        console.log("AuthStore: Hydration finished");
        // Podrías llamar a setToken aquí si el estado inicial no se carga bien
        // if (state?.token) useAuthStore.getState().setToken(state.token);
        return function (state, error) {
            if (error) {
                console.error("AuthStore: Failed to rehydrate state", error);
            }
        };
    }
}));
// Inicializar el estado desde localStorage al cargar la app (si no lo hace persist automáticamente)
// Esto es importante para que isAuthenticated sea correcto al recargar la página.
// 'persist' middleware usualmente maneja esto, pero un chequeo explícito puede ser útil.
if (typeof window !== "undefined") {
    var initialToken = exports.useAuthStore.getState().token;
    if (initialToken) {
        exports.useAuthStore.getState().setToken(initialToken);
    }
}
