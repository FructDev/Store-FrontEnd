"use strict";
exports.__esModule = true;
exports.useDebounce = void 0;
// hooks/use-debounce.ts
var react_1 = require("react");
function useDebounce(value, delay) {
    var _a = react_1.useState(value), debouncedValue = _a[0], setDebouncedValue = _a[1];
    react_1.useEffect(function () {
        // Actualizar el valor debounced después del delay
        var handler = setTimeout(function () {
            setDebouncedValue(value);
        }, delay);
        // Limpiar el timeout si el valor cambia (o si el delay cambia o el componente se desmonta)
        // Esto es para evitar que el valor debounced se actualice si el valor original cambia rápidamente
        return function () {
            clearTimeout(handler);
        };
    }, [value, delay]); // Solo re-ejecutar el efecto si el valor o el delay cambian
    return debouncedValue;
}
exports.useDebounce = useDebounce;
