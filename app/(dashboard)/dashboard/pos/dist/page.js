// app/(dashboard)/pos/page.tsx
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
exports.__esModule = true;
var react_1 = require("react");
var react_hook_form_1 = require("react-hook-form"); // Controller no se usa directamente aquí
var zod_1 = require("@hookform/resolvers/zod");
var z = require("zod");
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
var api_1 = require("@/lib/api");
var prisma_enums_1 = require("@/types/prisma-enums");
var prisma_enums_2 = require("@/types/prisma-enums");
var auth_store_1 = require("@/stores/auth.store");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var scroll_area_1 = require("@/components/ui/scroll-area");
var dialog_1 = require("@/components/ui/dialog");
var form_1 = require("@/components/ui/form");
var popover_1 = require("@/components/ui/popover");
var command_1 = require("@/components/ui/command");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var use_debounce_1 = require("@/hooks/use-debounce");
var formatters_1 = require("@/lib/utils/formatters");
var separator_1 = require("@/components/ui/separator");
var navigation_1 = require("next/navigation"); // <-- IMPORTAR useRouter
var utils_1 = require("@/lib/utils"); // <-- IMPORTAR cn
var non_serialized_product_to_cart_dialog_1 = require("@/components/pos/non-serialized-product-to-cart-dialog");
var create_customer_quick_dialog_1 = require("@/components/customers/create-customer-quick-dialog"); // Ajusta la ruta
var badge_1 = require("@/components/ui/badge");
// Schemas Zod
var saleLineItemSchema = z.object({
    fieldId: z.string(),
    productId: z.string().min(1, "Producto es requerido."),
    productName: z.string(),
    sku: z.string().optional().nullable(),
    quantity: z.coerce.number().positive("Cantidad debe ser positiva."),
    unitPrice: z.coerce.number().min(0, "Precio no puede ser negativo."),
    lineDiscountType: z.nativeEnum(prisma_enums_1.DiscountType).optional().nullable(),
    lineDiscountValue: z.coerce
        .number()
        .min(0, "Descuento no puede ser negativo.")
        .optional()
        .nullable(),
    lineTotal: z.coerce.number(),
    tracksImei: z.boolean()["default"](false),
    inventoryItemId: z.string().optional().nullable(),
    imei: z.string().optional().nullable(),
    locationId: z.string().optional().nullable(),
    locationName: z.string().optional().nullable()
});
var paymentSchema = z.object({
    fieldId: z.string(),
    method: z.nativeEnum(prisma_enums_2.PaymentMethod, {
        required_error: "Método es requerido."
    }),
    amount: z.coerce.number().min(0, "Monto no puede ser negativo."),
    reference: z
        .string()
        .max(100, "Máx 100 chars.")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); }),
    cardLast4: z
        .string()
        .max(4, "Máx 4 chars.")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
});
var posFormSchema = z
    .object({
    customerId: z
        .string()
        .uuid("ID de cliente inválido.")
        .optional()
        .nullable(),
    customerNameDisplay: z.string().optional(),
    isNewCustomer: z.boolean().optional()["default"](false),
    newCustomerFirstName: z
        .string()
        .optional()
        .transform(function (val) { return (val === "" ? undefined : val); }),
    newCustomerLastName: z
        .string()
        .optional()
        .transform(function (val) { return (val === "" ? undefined : val); }),
    newCustomerPhone: z
        .string()
        .optional()
        .transform(function (val) { return (val === "" ? undefined : val); }),
    newCustomerEmail: z
        .string()
        .email("Email inválido.")
        .optional()
        .or(z.literal(""))
        .transform(function (val) { return (val === "" ? undefined : val); }),
    // Añadir más campos de newCustomer si son necesarios y están en el DTO de creación de cliente
    discountOnTotalType: z.nativeEnum(prisma_enums_1.DiscountType).optional().nullable(),
    discountOnTotalValue: z.coerce.number().min(0).optional().nullable(),
    lines: z
        .array(saleLineItemSchema)
        .min(1, "El carrito no puede estar vacío."),
    payments: z
        .array(paymentSchema)
        .min(1, "Se requiere al menos un método de pago."),
    subTotal: z.number()["default"](0),
    taxAmount: z.number()["default"](0),
    discountAmount: z
        .number()
        .min(0, "Descuento no puede ser negativo.")["default"](0),
    totalAmount: z.number()["default"](0),
    amountTenderedCash: z.coerce.number().min(0).optional().nullable(),
    changeGiven: z.number().optional().nullable(),
    notes: z
        .string()
        .max(500, "Máx 500 caracteres.")
        .optional()
        .nullable()
        .transform(function (val) { return (val === "" ? null : val); })
})
    .refine(function (data) {
    var totalPaid = data.payments.reduce(function (acc, p) { return acc + (Number(p.amount) || 0); }, 0);
    return totalPaid >= data.totalAmount - 0.001;
}, {
    message: "El monto pagado es menor al total de la venta.",
    path: ["payments"]
});
var ALL_PAYMENT_METHODS = Object.values(prisma_enums_2.PaymentMethod);
var NO_DISCOUNT_TYPE_VALUE = "__NO_DISCOUNT_TYPE__";
function POSPage() {
    var _this = this;
    var _a, _b, _c, _d;
    var router = navigation_1.useRouter(); // <-- DEFINIR ROUTER
    var queryClient = react_query_1.useQueryClient();
    var authUser = auth_store_1.useAuthStore(function (state) { return state.user; });
    var currentStoreSettings = react_query_1.useQuery({
        // Asumiendo que tienes StoreSettings
        queryKey: ["storeSettingsForPOS"],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!(authUser === null || authUser === void 0 ? void 0 : authUser.storeId))
                    throw new Error("ID de tienda no disponible.");
                return [2 /*return*/, api_1["default"]
                        .get("/stores/settings")
                        .then(function (res) { return res.data; })];
            });
        }); },
        enabled: !!(authUser === null || authUser === void 0 ? void 0 : authUser.storeId),
        staleTime: Infinity
    }).data;
    var storeSettings = react_1.useMemo(function () {
        var _a, _b;
        return ({
            defaultTaxRate: (currentStoreSettings === null || currentStoreSettings === void 0 ? void 0 : currentStoreSettings.defaultTaxRate) !== null &&
                (currentStoreSettings === null || currentStoreSettings === void 0 ? void 0 : currentStoreSettings.defaultTaxRate) !== undefined
                ? Number(currentStoreSettings.defaultTaxRate)
                : 0.18,
            currencySymbol: (_a = currentStoreSettings === null || currentStoreSettings === void 0 ? void 0 : currentStoreSettings.currencySymbol) !== null && _a !== void 0 ? _a : "RD$",
            acceptedPaymentMethods: ((_b = currentStoreSettings === null || currentStoreSettings === void 0 ? void 0 : currentStoreSettings.acceptedPaymentMethods) === null || _b === void 0 ? void 0 : _b.length) ? currentStoreSettings.acceptedPaymentMethods
                : ALL_PAYMENT_METHODS
        });
    }, [currentStoreSettings]);
    var _e = react_1.useState(""), productSearchTerm = _e[0], setProductSearchTerm = _e[1];
    var debouncedProductSearchTerm = use_debounce_1.useDebounce(productSearchTerm, 300);
    var _f = react_1.useState(""), customerSearchTerm = _f[0], setCustomerSearchTerm = _f[1];
    var debouncedCustomerSearchTerm = use_debounce_1.useDebounce(customerSearchTerm, 300);
    var _g = react_1.useState(false), isCustomerSearchOpen = _g[0], setIsCustomerSearchOpen = _g[1];
    var _h = react_1.useState(false), isCreateCustomerDialogOpen = _h[0], setIsCreateCustomerDialogOpen = _h[1];
    var _j = react_1.useState(null), selectedProductForSerial = _j[0], setSelectedProductForSerial = _j[1];
    var _k = react_1.useState(false), isSerialSelectOpen = _k[0], setIsSerialSelectOpen = _k[1];
    var form = react_hook_form_1.useForm({
        // Usar el tipo inferido localmente
        resolver: zod_1.zodResolver(posFormSchema),
        defaultValues: {
            lines: [],
            payments: [
                {
                    fieldId: crypto.randomUUID(),
                    method: undefined,
                    amount: 0,
                    reference: "",
                    cardLast4: ""
                },
            ],
            subTotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            totalAmount: 0,
            customerId: null,
            customerNameDisplay: "Cliente Genérico",
            isNewCustomer: false,
            newCustomerFirstName: "",
            newCustomerLastName: "",
            newCustomerPhone: "",
            newCustomerEmail: "",
            notes: "",
            amountTenderedCash: undefined,
            changeGiven: undefined
        }
    });
    var _l = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "lines",
        keyName: "fieldId"
    }), cartLines = _l.fields, appendCartLine = _l.append, removeCartLine = _l.remove, updateCartLine = _l.update;
    var _m = react_hook_form_1.useFieldArray({
        control: form.control,
        name: "payments",
        keyName: "fieldId"
    }), paymentFields = _m.fields, appendPayment = _m.append, removePayment = _m.remove;
    // --- DATA FETCHING ---
    var _o = react_query_1.useQuery({
        queryKey: ["posProductSearch", debouncedProductSearchTerm],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!debouncedProductSearchTerm ||
                    debouncedProductSearchTerm.length < 2)
                    return [2 /*return*/, []];
                // Asegúrate que ProductBasic incluya 'sellingPrice'
                return [2 /*return*/, api_1["default"]
                        .get("/inventory/products?search=" + debouncedProductSearchTerm + "&isActive=true&limit=10")
                        .then(function (res) { return res.data.data || []; })];
            });
        }); },
        enabled: debouncedProductSearchTerm.length >= 2
    }), searchedProducts = _o.data, isLoadingSearchedProducts = _o.isLoading;
    var _p = react_query_1.useQuery({
        // Customer debe tener los campos que usas
        queryKey: ["posCustomerSearch", debouncedCustomerSearchTerm],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!debouncedCustomerSearchTerm ||
                    debouncedCustomerSearchTerm.length < 2)
                    return [2 /*return*/, []];
                return [2 /*return*/, api_1["default"]
                        .get("/customers?search=" + debouncedCustomerSearchTerm + "&isActive=true&limit=10")
                        .then(function (res) { return res.data.data || []; })];
            });
        }); },
        enabled: debouncedCustomerSearchTerm.length >= 2 && isCustomerSearchOpen
    }), searchedCustomers = _p.data, isLoadingSearchedCustomers = _p.isLoading;
    var _q = react_query_1.useQuery({
        queryKey: ["availableSerialsForProduct", selectedProductForSerial === null || selectedProductForSerial === void 0 ? void 0 : selectedProductForSerial.id],
        queryFn: function () { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(selectedProductForSerial === null || selectedProductForSerial === void 0 ? void 0 : selectedProductForSerial.id))
                            return [2 /*return*/, []];
                        return [4 /*yield*/, api_1["default"].get("/inventory/stock/product/" + selectedProductForSerial.id)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data.items.filter(function (item) { return item.status === prisma_enums_2.InventoryItemStatus.AVAILABLE && !!item.imei; })]; // Usar PrismaInventoryItemStatus
                }
            });
        }); },
        enabled: !!selectedProductForSerial && isSerialSelectOpen
    }), availableSerials = _q.data, isLoadingSerials = _q.isLoading;
    // --- CALCULATIONS ---
    react_1.useEffect(function () {
        var subscription = form.watch(function (values, _a) {
            var name = _a.name, type = _a.type;
            var localValues = values; // Tu tipo de Zod
            var needsRecalculation = false;
            // --- (1) SECCIÓN DE CÁLCULO DE TOTALES DE LÍNEAS Y VENTA ---
            if ((name === null || name === void 0 ? void 0 : name.startsWith("lines")) || // Si cambia algo en una línea
                name === "discountOnTotalType" || // Si cambia el tipo de descuento general
                name === "discountOnTotalValue" || // Si cambia el valor del descuento general
                // (Quitamos 'name === "discountAmount"' si 'discountAmount' es ahora solo para el MONTO calculado del descuento general)
                (type === "change" && name === undefined) // Al cargar o resetear
            ) {
                var currentLines = localValues.lines || [];
                var calculatedSubTotalAfterLineDiscounts_1 = 0; // Este es el subtotal después de descuentos de línea
                // Recalcular el lineTotal para cada línea CON su descuento y acumular
                var linesWithRecalculatedTotals = currentLines.map(function (line, index) {
                    var unitPrice = Number(line.unitPrice) || 0;
                    var quantity = Number(line.quantity) || 0;
                    var lineBaseTotal = unitPrice * quantity; // Subtotal de la línea antes de su descuento
                    var lineDiscountAmountNum = 0;
                    // Aplicar descuento de línea
                    if (line.lineDiscountType &&
                        line.lineDiscountValue !== null &&
                        line.lineDiscountValue !== undefined &&
                        line.lineDiscountValue > 0) {
                        var discountVal = Number(line.lineDiscountValue) || 0;
                        if (line.lineDiscountType === prisma_enums_1.DiscountType.PERCENTAGE) {
                            if (discountVal > 100)
                                lineDiscountAmountNum = lineBaseTotal;
                            else
                                lineDiscountAmountNum = lineBaseTotal * (discountVal / 100);
                        }
                        else {
                            // FIXED
                            lineDiscountAmountNum = discountVal;
                        }
                        lineDiscountAmountNum = Math.min(lineBaseTotal, lineDiscountAmountNum);
                    }
                    var lineTotalAfterIndividualDiscount = lineBaseTotal - lineDiscountAmountNum;
                    calculatedSubTotalAfterLineDiscounts_1 +=
                        lineTotalAfterIndividualDiscount;
                    // Actualizar el lineTotal en el estado del formulario para esta línea
                    // Hacemos esto para que la tabla muestre el total de línea correcto y para que el payload sea correcto
                    // Comprobar si realmente cambió para evitar re-renders innecesarios del setValue
                    if (form.getValues("lines." + index + ".lineTotal") !==
                        parseFloat(lineTotalAfterIndividualDiscount.toFixed(2))) {
                        form.setValue("lines." + index + ".lineTotal", parseFloat(lineTotalAfterIndividualDiscount.toFixed(2)), { shouldValidate: false });
                    }
                    return __assign(__assign({}, line), { lineTotal: parseFloat(lineTotalAfterIndividualDiscount.toFixed(2)) }); // Retornar la línea con su total actualizado
                });
                // --- (2) APLICAR DESCUENTO GENERAL ---
                var actualGeneralDiscountAmount = 0;
                // 'discountAmount' en tu form es para el MONTO del descuento general.
                // 'discountOnTotalType' y 'discountOnTotalValue' son para CALCULAR ese monto.
                if (localValues.discountOnTotalType &&
                    localValues.discountOnTotalValue !== undefined &&
                    localValues.discountOnTotalValue > 0) {
                    var discountValue = Number(localValues.discountOnTotalValue) || 0;
                    if (localValues.discountOnTotalType === prisma_enums_1.DiscountType.PERCENTAGE) {
                        actualGeneralDiscountAmount =
                            calculatedSubTotalAfterLineDiscounts_1 * (discountValue / 100);
                    }
                    else {
                        // FIXED
                        actualGeneralDiscountAmount = discountValue;
                    }
                    actualGeneralDiscountAmount = Math.min(calculatedSubTotalAfterLineDiscounts_1, actualGeneralDiscountAmount); // No exceder el subtotal
                    // Actualizar el campo 'discountAmount' del formulario (que es el MONTO)
                    if (form.getValues("discountAmount") !==
                        parseFloat(actualGeneralDiscountAmount.toFixed(2))) {
                        form.setValue("discountAmount", parseFloat(actualGeneralDiscountAmount.toFixed(2)), { shouldValidate: false });
                    }
                }
                else if (localValues.discountOnTotalType === "" ||
                    localValues.discountOnTotalValue === 0 ||
                    localValues.discountOnTotalValue === null) {
                    // Si se quita el tipo de descuento o el valor es 0, el monto del descuento es 0
                    actualGeneralDiscountAmount = 0;
                    if (form.getValues("discountAmount") !== 0) {
                        form.setValue("discountAmount", 0, { shouldValidate: false });
                    }
                }
                else {
                    // Si no hay tipo/valor, pero hay un monto en discountAmount, lo usamos
                    actualGeneralDiscountAmount = Number(localValues.discountAmount) || 0;
                }
                // --- (3) CALCULAR IMPUESTOS Y TOTAL FINAL ---
                var taxRate = storeSettings.defaultTaxRate; // Ya es número
                // El impuesto se calcula sobre el subtotal DESPUÉS del descuento general
                var taxableAmount = calculatedSubTotalAfterLineDiscounts_1 - actualGeneralDiscountAmount;
                var newTaxAmount = taxableAmount * taxRate;
                var newTotalAmount = taxableAmount + newTaxAmount;
                // Actualizar los campos de totales en el formulario
                if (form.getValues("subTotal") !==
                    parseFloat(calculatedSubTotalAfterLineDiscounts_1.toFixed(2))) {
                    form.setValue("subTotal", parseFloat(calculatedSubTotalAfterLineDiscounts_1.toFixed(2)));
                }
                if (form.getValues("taxAmount") !== parseFloat(newTaxAmount.toFixed(2))) {
                    form.setValue("taxAmount", parseFloat(newTaxAmount.toFixed(2)));
                }
                if (form.getValues("totalAmount") !==
                    parseFloat(newTotalAmount.toFixed(2))) {
                    form.setValue("totalAmount", parseFloat(newTotalAmount.toFixed(2)), {
                        shouldValidate: true
                    });
                }
                var currentTotalAmountInForm = form.getValues("totalAmount");
                var newTotalAmountRounded = parseFloat(newTotalAmount.toFixed(2));
                if (currentTotalAmountInForm !== newTotalAmountRounded) {
                    form.setValue("totalAmount", newTotalAmountRounded, {
                        shouldValidate: true
                    });
                    // Si el total de la venta CAMBIÓ y solo hay UN método de pago,
                    // actualizamos su monto para que coincida con el nuevo total.
                    // Esto permite que el usuario edite, pero si el total de la venta cambia, el monto del pago se ajusta.
                    var currentPayments = form.getValues("payments");
                    if (currentPayments.length === 1) {
                        // Solo actualiza si el monto actual del pago es diferente al nuevo total de la venta,
                        // O si el monto del pago era 0 (para el caso inicial).
                        // Esto es un intento de no sobrescribir una edición manual si el total no ha cambiado drásticamente.
                        // Una lógica más compleja podría requerir un estado para saber si el usuario editó manualmente.
                        if (currentPayments[0].amount !== newTotalAmountRounded ||
                            currentPayments[0].amount === 0) {
                            console.log("AUTO-UPDATING payment 0 amount to: " + newTotalAmountRounded + " because totalAmount changed.");
                            form.setValue("payments.0.amount", newTotalAmountRounded, {
                                shouldValidate: false
                            });
                        }
                    }
                }
            }
            // --- (4) SECCIÓN DE CÁLCULO DE PAGOS Y CAMBIO ---
            if ((name === null || name === void 0 ? void 0 : name.startsWith("payments")) ||
                name === "totalAmount" ||
                name === "amountTenderedCash" ||
                needsRecalculation || // Esta variable la definiste como 'false' y no parece cambiar. ¿Es necesaria?
                (type === "change" && name === undefined)) {
                console.log("--- INICIO CÁLCULO DE CAMBIO ---");
                console.log("Campo que cambió (name):", name, "Tipo de evento (type):", type);
                var currentFormValues = form.getValues();
                var saleTotalAmount = Number(currentFormValues.totalAmount) || 0;
                var tenderedCash = Number(currentFormValues.amountTenderedCash) || 0;
                var currentPaymentsArray = currentFormValues.payments || [];
                console.log("Valores actuales del formulario:", JSON.stringify(currentFormValues, null, 2));
                console.log("Total Venta (saleTotalAmount):", saleTotalAmount);
                console.log("Efectivo Recibido (tenderedCash):", tenderedCash);
                console.log("Pagos Actuales (currentPaymentsArray):", JSON.stringify(currentPaymentsArray, null, 2));
                var totalPaidByOtherMethods_1 = 0;
                var cashPaymentIndex_1 = -1;
                var originalCashPaymentAmount_1 = 0; // Para saber cuánto era antes de nuestro cálculo
                currentPaymentsArray.forEach(function (payment, index) {
                    if (payment.method === prisma_enums_2.PaymentMethod.CASH &&
                        cashPaymentIndex_1 === -1) {
                        cashPaymentIndex_1 = index;
                        originalCashPaymentAmount_1 = Number(payment.amount) || 0; // Guardar monto original del pago en efectivo
                    }
                    else {
                        totalPaidByOtherMethods_1 += Number(payment.amount) || 0;
                    }
                });
                console.log("Índice Pago Efectivo (cashPaymentIndex):", cashPaymentIndex_1);
                console.log("Total Pagado por Otros Métodos:", totalPaidByOtherMethods_1);
                console.log("Monto Original Pago Efectivo:", originalCashPaymentAmount_1);
                var amountDueAfterOtherPayments = Math.max(0, saleTotalAmount - totalPaidByOtherMethods_1);
                console.log("Monto Pendiente Después de Otros Pagos:", amountDueAfterOtherPayments);
                var cashPaymentAmountApplied = 0;
                var calculatedChange = 0;
                if (tenderedCash > 0) {
                    if (cashPaymentIndex_1 !== -1) {
                        // Hay una línea de pago en efectivo
                        cashPaymentAmountApplied = Math.min(tenderedCash, amountDueAfterOtherPayments);
                        console.log("Monto Efectivo Aplicado (cashPaymentAmountApplied):", cashPaymentAmountApplied);
                        // Actualizar el monto del pago en efectivo
                        var currentCashPaymentAmountInForm = form.getValues("payments." + cashPaymentIndex_1 + ".amount");
                        if (currentCashPaymentAmountInForm !==
                            parseFloat(cashPaymentAmountApplied.toFixed(2))) {
                            console.log("Actualizando payments." + cashPaymentIndex_1 + ".amount de " + currentCashPaymentAmountInForm + " a " + cashPaymentAmountApplied.toFixed(2));
                            form.setValue("payments." + cashPaymentIndex_1 + ".amount", parseFloat(cashPaymentAmountApplied.toFixed(2)), { shouldValidate: false });
                        }
                        if (tenderedCash >= amountDueAfterOtherPayments) {
                            calculatedChange = tenderedCash - amountDueAfterOtherPayments;
                        }
                    }
                    else if (currentPaymentsArray.length === 0 &&
                        tenderedCash >= saleTotalAmount) {
                        // Caso: no hay pagos, se ingresa efectivo para cubrir todo
                        calculatedChange = tenderedCash - saleTotalAmount;
                        cashPaymentAmountApplied = saleTotalAmount; // Todo el total se "aplica" del efectivo
                        console.log("Caso: Sin pagos previos, efectivo cubre todo. Monto aplicado:", cashPaymentAmountApplied);
                    }
                }
                else {
                    // tenderedCash es 0 o null
                    if (cashPaymentIndex_1 !== -1) {
                        // Si se borra el efectivo recibido, el monto del pago en efectivo vuelve a ser lo que falta
                        // (o 0 si el total ya está cubierto por otros pagos)
                        cashPaymentAmountApplied = Math.max(0, amountDueAfterOtherPayments);
                        console.log("Efectivo recibido es 0, ajustando pago en efectivo a:", cashPaymentAmountApplied);
                        if (form.getValues("payments." + cashPaymentIndex_1 + ".amount") !==
                            parseFloat(cashPaymentAmountApplied.toFixed(2))) {
                            form.setValue("payments." + cashPaymentIndex_1 + ".amount", parseFloat(cashPaymentAmountApplied.toFixed(2)), { shouldValidate: false });
                        }
                    }
                }
                console.log("Cambio Calculado (antes de Math.max):", calculatedChange);
                var finalChange = parseFloat(Math.max(0, calculatedChange).toFixed(2));
                console.log("Cambio Final a Establecer (finalChange):", finalChange);
                var currentChangeInForm = form.getValues("changeGiven");
                console.log("Valor Actual de changeGiven en Formulario:", currentChangeInForm);
                if (currentChangeInForm !== finalChange) {
                    console.log("Actualizando changeGiven de " + currentChangeInForm + " a " + finalChange);
                    form.setValue("changeGiven", finalChange, { shouldValidate: false });
                }
                else {
                    console.log("changeGiven no necesita actualizarse, ya es:", finalChange);
                }
                console.log("--- FIN CÁLCULO DE CAMBIO ---");
            }
        });
        return function () { return subscription.unsubscribe(); };
    }, [form, storeSettings.defaultTaxRate]);
    // --- CART ACTIONS ---
    var addProductToCart = function (product, imeiDetails, sourceLocation) {
        var sellingPriceNum = Number(product.sellingPrice) || 0; // Asegurar que sellingPrice exista en ProductBasic
        var existingLineIndex = cartLines.findIndex(function (line) {
            return line.productId === product.id &&
                (product.tracksImei
                    ? line.inventoryItemId === (imeiDetails === null || imeiDetails === void 0 ? void 0 : imeiDetails.inventoryItemId)
                    : true);
        });
        if (existingLineIndex > -1 && !product.tracksImei) {
            var existingLine = cartLines[existingLineIndex];
            updateCartLine(existingLineIndex, __assign(__assign({}, existingLine), { quantity: existingLine.quantity + 1, lineTotal: (existingLine.quantity + 1) * sellingPriceNum }));
        }
        else {
            appendCartLine({
                fieldId: crypto.randomUUID(),
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: 1,
                unitPrice: sellingPriceNum,
                lineTotal: sellingPriceNum,
                tracksImei: product.tracksImei,
                inventoryItemId: product.tracksImei
                    ? imeiDetails === null || imeiDetails === void 0 ? void 0 : imeiDetails.inventoryItemId : null,
                imei: product.tracksImei ? imeiDetails === null || imeiDetails === void 0 ? void 0 : imeiDetails.imei : null,
                locationId: !product.tracksImei ? sourceLocation === null || sourceLocation === void 0 ? void 0 : sourceLocation.locationId : null,
                locationName: !product.tracksImei ? sourceLocation === null || sourceLocation === void 0 ? void 0 : sourceLocation.locationName : null
            });
        }
        setProductSearchTerm("");
        if (isSerialSelectOpen)
            setIsSerialSelectOpen(false);
        setSelectedProductForSerial(null);
    };
    var handleProductSelectFromSearch = function (product) {
        console.log("Producto seleccionado de búsqueda:", product); // DEBUG
        setProductSearchTerm(""); // Limpiar resultados de búsqueda (esto está bien)
        if (product.tracksImei) {
            console.log("Es serializado, abriendo diálogo de serial..."); // DEBUG
            setSelectedProductForSerial(product); // Para el diálogo de selección de IMEI
            setIsSerialSelectOpen(true);
        }
        else {
            console.log("NO es serializado, abriendo diálogo de cantidad/ubicación..."); // DEBUG
            setProductForNonSerializedDialog(product); // Para el nuevo diálogo
            setIsNonSerializedDialogOpen(true); // <-- ESTO DEBERÍA PONER EL ESTADO EN TRUE
        }
    };
    var handleSerialSelect = function (inventoryItem) {
        if (selectedProductForSerial && inventoryItem.imei && inventoryItem.id) {
            var alreadyInCart = cartLines.some(function (line) { return line.inventoryItemId === inventoryItem.id; });
            if (alreadyInCart) {
                sonner_1.toast.warning("El \u00EDtem con IMEI " + inventoryItem.imei + " ya est\u00E1 en el carrito.");
                return;
            }
            addProductToCart(selectedProductForSerial, {
                inventoryItemId: inventoryItem.id,
                imei: inventoryItem.imei
            });
        }
        // No cerrar aquí si el usuario quiere añadir más seriales del mismo producto
        // setIsSerialSelectOpen(false);
        // setSelectedProductForSerial(null);
    };
    var updateCartQuantity = function (index, newQuantity) {
        var line = cartLines[index];
        if (newQuantity <= 0) {
            removeCartLine(index);
        }
        else {
            updateCartLine(index, __assign(__assign({}, line), { quantity: newQuantity, lineTotal: newQuantity * line.unitPrice }));
        }
    };
    var _r = react_1.useState(false), isNonSerializedDialogOpen = _r[0], setIsNonSerializedDialogOpen = _r[1];
    var _s = react_1.useState(null), productForNonSerializedDialog = _s[0], setProductForNonSerializedDialog = _s[1];
    var handleSelectCustomer = function (customer) {
        // Customer es tu tipo completo
        form.setValue("customerId", customer.id);
        form.setValue("customerNameDisplay", ((customer.firstName || "") + " " + (customer.lastName || "")).trim() ||
            customer.email ||
            "ID: " + customer.id.slice(-6) // Fallback si no hay nombre/email
        );
        setIsCustomerSearchOpen(false); // Cierra el popover de búsqueda
        setCustomerSearchTerm("");
        // Si el diálogo de creación rápida estaba abierto, ciérralo.
        if (isCreateCustomerDialogOpen) {
            setIsCreateCustomerDialogOpen(false);
        }
        // Resetear campos de nuevo cliente en el formulario del POS
        form.setValue("isNewCustomer", false);
        form.setValue("newCustomerFirstName", "");
        form.setValue("newCustomerLastName", "");
        form.setValue("newCustomerPhone", "");
        form.setValue("newCustomerEmail", "");
        // Resetear otros campos de newCustomer si los tienes
    };
    // --- SALE MUTATION ---
    var createSaleMutation = react_query_1.useMutation({
        // Usa POSFormValuesZod
        mutationFn: function (formData) { return __awaiter(_this, void 0, void 0, function () {
            var payload, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            customerId: formData.customerId,
                            notes: formData.notes,
                            // Si tienes newCustomer y isNewCustomer, aquí deberías manejar la creación del cliente
                            // o enviar los datos del nuevo cliente al backend para que los cree con la venta.
                            // Por ahora, solo customerId.
                            discountOnTotalType: formData.discountOnTotalType,
                            discountOnTotalValue: formData.discountOnTotalValue,
                            lines: formData.lines.map(function (line) { return ({
                                productId: line.productId,
                                quantity: line.quantity,
                                unitPrice: line.unitPrice,
                                discountType: line.lineDiscountType,
                                discountValue: line.lineDiscountValue,
                                inventoryItemId: line.inventoryItemId,
                                description: !line.productId ? line.productName : undefined,
                                imei: line.tracksImei ? line.imei : undefined,
                                locationId: !line.tracksImei ? line.locationId : undefined
                            }); }),
                            payments: formData.payments.map(function (p) { return ({
                                paymentMethod: p.method,
                                amount: p.amount,
                                reference: p.reference || null,
                                cardLast4: p.cardLast4 || null
                            }); })
                        };
                        console.log("Enviando Venta al Backend:", payload);
                        return [4 /*yield*/, api_1["default"].post("/sales", payload)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                }
            });
        }); },
        onSuccess: function (createdSale) {
            sonner_1.toast.success("Venta #" + createdSale.saleNumber + " creada.");
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            createdSale.lines.forEach(function (line) {
                if (line.productId)
                    queryClient.invalidateQueries({
                        queryKey: ["inventoryProductStock", line.productId]
                    });
                if (line.inventoryItemId)
                    queryClient.invalidateQueries({
                        queryKey: ["availableSerialsForProduct", line.productId]
                    });
            });
            form.reset({
                lines: [],
                payments: [
                    {
                        fieldId: crypto.randomUUID(),
                        method: undefined,
                        amount: 0,
                        reference: "",
                        cardLast4: ""
                    },
                ],
                subTotal: 0,
                taxAmount: 0,
                discountAmount: 0,
                totalAmount: 0,
                customerId: null,
                customerNameDisplay: "Cliente Genérico",
                isNewCustomer: false,
                newCustomerFirstName: "",
                newCustomerLastName: "",
                newCustomerPhone: "",
                newCustomerEmail: "",
                notes: "",
                amountTenderedCash: undefined,
                changeGiven: undefined
            });
            router.push("/dashboard/sales/" + createdSale.id);
        },
        onError: function (error) {
            var _a, _b;
            sonner_1.toast.error(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || "Error al crear la venta.");
        }
    });
    function onSubmitPOS(data) {
        console.log("onSubmitPOS fue llamado");
        // Usa POSFormValuesZod
        var totalPaid = data.payments.reduce(function (acc, p) { return acc + (Number(p.amount) || 0); }, 0);
        if (totalPaid < data.totalAmount - 0.001) {
            // Pequeño margen para errores de flotantes
            sonner_1.toast.error("El monto pagado es menor al total de la venta.");
            form.setError("payments." + (data.payments.length - 1) + ".amount", {
                message: "Monto total de pagos insuficiente."
            });
            return;
        }
        createSaleMutation.mutate(data);
    }
    //   const handleProductSelectFromSearch = (product: ProductBasic) => {
    //     setProductSearchTerm(""); // Limpiar resultados de búsqueda
    //     if (product.tracksImei) {
    //       setSelectedProductForSerial(product); // Para el diálogo de selección de IMEI
    //       setIsSerialSelectOpen(true);
    //     } else {
    //       setProductForNonSerializedDialog(product); // Para el nuevo diálogo
    //       setIsNonSerializedDialogOpen(true);
    //     }
    //   };
    // --- JSX ---
    return (react_1["default"].createElement(react_1["default"].Fragment, null,
        react_1["default"].createElement("div", { className: "h-screen flex flex-col fixed inset-0 md:ml-60 bg-muted/20" },
            react_1["default"].createElement("header", { className: "bg-background border-b p-3 h-14 flex items-center justify-between shrink-0" },
                react_1["default"].createElement("h1", { className: "text-lg font-semibold" }, "Punto de Venta (POS)"),
                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return router.back(); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeftRight, { className: "mr-2 h-4 w-4" }),
                    " Salir del POS")),
            react_1["default"].createElement(form_1.Form, __assign({}, form),
                react_1["default"].createElement("form", { onSubmit: form.handleSubmit(onSubmitPOS), className: "flex-1 grid grid-cols-12 gap-0 overflow-hidden" },
                    react_1["default"].createElement("div", { className: "col-span-12 md:col-span-7 lg:col-span-8 p-3 flex flex-col gap-3 overflow-y-auto" },
                        react_1["default"].createElement("div", { className: "relative" },
                            react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                            react_1["default"].createElement(input_1.Input, { type: "search", placeholder: "Buscar producto por nombre, SKU...", value: productSearchTerm, onChange: function (e) { return setProductSearchTerm(e.target.value); }, className: "pl-10 h-10" }),
                            isLoadingSearchedProducts && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground absolute mt-1 ml-3" }, "Buscando...")),
                            debouncedProductSearchTerm.length >= 2 &&
                                searchedProducts &&
                                !isLoadingSearchedProducts && (react_1["default"].createElement(card_1.Card, { className: "absolute z-20 w-full mt-1 shadow-lg max-h-80 overflow-y-auto" },
                                react_1["default"].createElement(card_1.CardContent, { className: "p-1" },
                                    searchedProducts.length === 0 && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground p-3 text-center" }, "No se encontraron productos.")),
                                    searchedProducts.map(function (product) { return (react_1["default"].createElement(button_1.Button, { key: product.id, variant: "ghost", className: "w-full justify-start h-auto py-1.5 px-2 mb-0.5 text-left", type: "button", onClick: function () {
                                            return handleProductSelectFromSearch(product);
                                        } },
                                        react_1["default"].createElement("div", null,
                                            react_1["default"].createElement("p", { className: "font-medium text-sm" }, product.name),
                                            react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                                "SKU: ",
                                                product.sku || "N/A",
                                                " - Precio:",
                                                " ",
                                                formatters_1.formatCurrency(Number(product.sellingPrice) || 0))))); }))))),
                        react_1["default"].createElement(card_1.Card, { className: "flex-1 flex flex-col min-h-[300px]" },
                            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-md" },
                                    "Carrito (",
                                    cartLines.length,
                                    " \u00EDtems)")),
                            react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "flex-1" },
                                react_1["default"].createElement(card_1.CardContent, { className: "p-0" },
                                    cartLines.length === 0 && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground text-center py-10" }, "Carrito vac\u00EDo.")),
                                    cartLines.length > 0 && (react_1["default"].createElement(table_1.Table, { className: "text-xs sm:text-sm" },
                                        react_1["default"].createElement(table_1.TableHeader, null,
                                            react_1["default"].createElement(table_1.TableRow, null,
                                                react_1["default"].createElement(table_1.TableHead, { className: "w-[45%] pl-3" }, "Producto"),
                                                react_1["default"].createElement(table_1.TableHead, { className: "w-[15%] text-center" }, "Cant."),
                                                react_1["default"].createElement(table_1.TableHead, { className: "w-[20%] text-right" }, "P.Unit."),
                                                react_1["default"].createElement(table_1.TableHead, { className: "w-[20%] text-right pr-3" }, "Subtotal"),
                                                react_1["default"].createElement(table_1.TableHead, { className: "w-10 p-0" }))),
                                        react_1["default"].createElement(table_1.TableBody, null, cartLines.map(function (line, index) { return (react_1["default"].createElement(table_1.TableRow, { key: line.fieldId },
                                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium py-2 pl-3" },
                                                line.productName,
                                                line.lineDiscountValue &&
                                                    line.lineDiscountValue > 0 && (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "ml-2 text-xs border-green-500 text-green-600" },
                                                    "Desc:",
                                                    " ",
                                                    line.lineDiscountType ===
                                                        prisma_enums_1.DiscountType.PERCENTAGE
                                                        ? line.lineDiscountValue + "%"
                                                        : formatters_1.formatCurrency(line.lineDiscountValue))),
                                                line.tracksImei && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                                    "S/N: ",
                                                    line.imei || "PENDIENTE"))),
                                            react_1["default"].createElement(table_1.TableCell, { className: "text-center py-2" }, !line.tracksImei ? (react_1["default"].createElement(input_1.Input, { type: "number", value: line.quantity, onChange: function (e) {
                                                    return updateCartQuantity(index, parseInt(e.target.value) || 1);
                                                }, className: "h-8 w-16 text-center", min: 1 })) : (line.quantity)),
                                            react_1["default"].createElement(table_1.TableCell, { className: "text-right py-2" }, formatters_1.formatCurrency(line.unitPrice)),
                                            react_1["default"].createElement(table_1.TableCell, { className: "text-right py-2 pr-1" }, formatters_1.formatCurrency(line.lineTotal)),
                                            " ",
                                            react_1["default"].createElement(table_1.TableCell, { className: "p-0 py-1 text-center w-12" },
                                                react_1["default"].createElement("div", { className: "flex items-center justify-center" },
                                                    react_1["default"].createElement(popover_1.Popover, null,
                                                        react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", className: "h-8 w-8 text-blue-600 hover:text-blue-700" },
                                                                react_1["default"].createElement(lucide_react_1.PercentCircle, { className: "h-4 w-4" }),
                                                                " ")),
                                                        react_1["default"].createElement(popover_1.PopoverContent, { className: "w-64 p-3", side: "left", align: "start" },
                                                            react_1["default"].createElement("div", { className: "space-y-3" },
                                                                react_1["default"].createElement("p", { className: "text-sm font-medium text-center border-b pb-2" }, "Descuento en L\u00EDnea"),
                                                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".lineDiscountType", render: function (_a) {
                                                                        var field = _a.field;
                                                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                                                            react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Tipo"),
                                                                            react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "" },
                                                                                react_1["default"].createElement(form_1.FormControl, null,
                                                                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9" },
                                                                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Tipo..." }))),
                                                                                react_1["default"].createElement(select_1.SelectContent, null,
                                                                                    react_1["default"].createElement(select_1.SelectItem, { value: "NO_DISCOUNTS" }, "Sin Descuento"),
                                                                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.DiscountType.PERCENTAGE }, "Porcentaje (%)"),
                                                                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.DiscountType.FIXED },
                                                                                        "Monto Fijo (",
                                                                                        storeSettings.currencySymbol,
                                                                                        ")")))));
                                                                    } }),
                                                                form.watch("lines." + index + ".lineDiscountType") && ( // Solo mostrar valor si hay tipo
                                                                react_1["default"].createElement(form_1.FormField, { control: form.control, name: "lines." + index + ".lineDiscountValue", render: function (_a) {
                                                                        var _b;
                                                                        var field = _a.field;
                                                                        return (react_1["default"].createElement(form_1.FormItem, null,
                                                                            react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Valor"),
                                                                            react_1["default"].createElement(form_1.FormControl, null,
                                                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0, className: "h-9" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                                                        return field.onChange(e.target.value === ""
                                                                                            ? null
                                                                                            : parseFloat(e.target.value));
                                                                                    } }))),
                                                                            react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                                                    } }))))),
                                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", type: "button", onClick: function () { return removeCartLine(index); }, className: "h-8 w-8 text-destructive" },
                                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); })))))))),
                    react_1["default"].createElement("div", { className: "col-span-12 md:col-span-5 lg:col-span-4 bg-slate-100 dark:bg-slate-800/50 p-3 flex flex-col gap-3 overflow-y-auto border-l" },
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-md flex justify-between items-center" },
                                    "Cliente",
                                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () {
                                            console.log("Botón 'Nuevo Cliente' presionado (sin abrir diálogo)");
                                            form.setValue("isNewCustomer", true, {
                                                shouldValidate: true
                                            });
                                            form.setValue("customerId", null, {
                                                shouldValidate: true
                                            });
                                            setIsCreateCustomerDialogOpen(true); // <--- COMENTADO
                                        }, className: "text-xs" },
                                        react_1["default"].createElement(lucide_react_1.UserPlus, { className: "mr-1 h-3 w-3" }),
                                        " Nuevo"))),
                            react_1["default"].createElement(card_1.CardContent, { className: "pb-3 px-4" },
                                react_1["default"].createElement(popover_1.Popover, { open: isCustomerSearchOpen, onOpenChange: setIsCustomerSearchOpen },
                                    react_1["default"].createElement(popover_1.PopoverTrigger, { asChild: true },
                                        react_1["default"].createElement(button_1.Button, { variant: "outline", role: "combobox", "aria-expanded": isCustomerSearchOpen, type: "button", className: "w-full justify-between h-10" },
                                            form.getValues("customerNameDisplay") ||
                                                "Seleccionar cliente...",
                                            react_1["default"].createElement(lucide_react_1.ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" }))),
                                    react_1["default"].createElement(popover_1.PopoverContent, { className: "w-[calc(100vw-40px-theme(space.60))] sm:w-[350px] p-0" },
                                        react_1["default"].createElement(command_1.Command, { filter: function (value, search) {
                                                return value.toLowerCase().indexOf(search.toLowerCase()) > -1
                                                    ? 1
                                                    : 0;
                                            } },
                                            react_1["default"].createElement(command_1.CommandInput, { placeholder: "Buscar cliente...", value: customerSearchTerm, onValueChange: setCustomerSearchTerm }),
                                            react_1["default"].createElement(command_1.CommandList, null,
                                                react_1["default"].createElement(command_1.CommandEmpty, null, isLoadingSearchedCustomers
                                                    ? "Buscando..."
                                                    : "No se encontraron clientes."),
                                                react_1["default"].createElement(command_1.CommandGroup, null, searchedCustomers === null || searchedCustomers === void 0 ? void 0 : searchedCustomers.map(function (customer) { return (react_1["default"].createElement(command_1.CommandItem, { key: customer.id, value: (customer.firstName || "") + " " + (customer.lastName || "") + " " + (customer.email || "") + " " + (customer.phone || ""), onSelect: function () { return handleSelectCustomer(customer); } },
                                                    react_1["default"].createElement(lucide_react_1.Check, { className: utils_1.cn("mr-2 h-4 w-4", form.getValues("customerId") === customer.id
                                                            ? "opacity-100"
                                                            : "opacity-0") }),
                                                    react_1["default"].createElement("div", null,
                                                        react_1["default"].createElement("p", { className: "text-sm" },
                                                            customer.firstName,
                                                            " ",
                                                            customer.lastName),
                                                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, customer.phone || customer.email)))); })))))),
                                form.getValues("customerId") && (react_1["default"].createElement(button_1.Button, { variant: "link", size: "sm", type: "button", className: "p-0 h-auto mt-1 text-xs", onClick: function () {
                                        form.setValue("customerId", null);
                                        form.setValue("customerNameDisplay", "Cliente Genérico");
                                    } }, "Usar Cliente Gen\u00E9rico")))),
                        react_1["default"].createElement(card_1.Card, { className: "flex-1" },
                            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-md" }, "Resumen")),
                            react_1["default"].createElement(card_1.CardContent, { className: "space-y-1.5 text-sm px-4 pb-3" },
                                react_1["default"].createElement("div", { className: "flex justify-between" },
                                    react_1["default"].createElement("span", null, "Subtotal:"),
                                    " ",
                                    react_1["default"].createElement("span", null, formatters_1.formatCurrency(form.getValues("subTotal")))),
                                react_1["default"].createElement("div", { className: "flex justify-between" },
                                    react_1["default"].createElement("span", null,
                                        "Impuestos (",
                                        ((storeSettings.defaultTaxRate || 0) * 100).toFixed(0),
                                        "%):"),
                                    react_1["default"].createElement("span", null, formatters_1.formatCurrency(form.getValues("taxAmount")))),
                                react_1["default"].createElement(form_1.FormField // Para el TIPO de descuento general
                                , { control: form.control, name: "discountOnTotalType" // Este campo en Zod es z.nativeEnum(DiscountType).optional().nullable()
                                    , render: function (_a) {
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "flex justify-between items-center" },
                                            react_1["default"].createElement(form_1.FormLabel, { className: "text-sm" }, "Tipo Descuento Total:"),
                                            react_1["default"].createElement(select_1.Select, { onValueChange: function (value) {
                                                    // Convertir el valor especial a null para el estado del formulario
                                                    // Si se selecciona un tipo de descuento real, también limpiar el valor del descuento
                                                    // para evitar inconsistencias si el usuario cambia de tipo.
                                                    if (value === NO_DISCOUNT_TYPE_VALUE) {
                                                        field.onChange(null);
                                                        form.setValue("discountOnTotalValue", null, {
                                                            shouldValidate: true
                                                        }); // Limpiar valor también
                                                    }
                                                    else {
                                                        field.onChange(value); // Castear a DiscountType
                                                        // Opcional: podrías querer resetear discountOnTotalValue si el tipo cambia
                                                        // form.setValue("discountOnTotalValue", 0, { shouldValidate: true });
                                                    }
                                                }, 
                                                // Si field.value es null o undefined, usa el valor especial para seleccionar "Ninguno"
                                                // o deja que el placeholder del SelectTrigger actúe si es undefined y no hay "Ninguno"
                                                value: field.value || NO_DISCOUNT_TYPE_VALUE },
                                                react_1["default"].createElement(form_1.FormControl, null,
                                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "h-8 w-[160px] sm:w-[180px]" },
                                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Tipo..." }))),
                                                react_1["default"].createElement(select_1.SelectContent, null,
                                                    react_1["default"].createElement(select_1.SelectItem, { value: NO_DISCOUNT_TYPE_VALUE }, "Ninguno"),
                                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.DiscountType.PERCENTAGE }, "Porcentaje (%)"),
                                                    react_1["default"].createElement(select_1.SelectItem, { value: prisma_enums_1.DiscountType.FIXED },
                                                        "Monto Fijo (",
                                                        storeSettings.currencySymbol,
                                                        ")")))));
                                    } }),
                                react_1["default"].createElement(form_1.FormField // Para el VALOR del descuento general
                                , { name: "discountOnTotalValue", control: form.control, 
                                    // name="discountOnTotalValue" // Debe estar en posFormSchema y POSFormValuesZod
                                    render: function (_a) {
                                        var _b;
                                        var field = _a.field;
                                        return (react_1["default"].createElement(form_1.FormItem, { className: "flex justify-between items-center" },
                                            react_1["default"].createElement(form_1.FormLabel, { className: "text-sm whitespace-nowrap mr-2" }, "Valor Descuento Total:"),
                                            react_1["default"].createElement(form_1.FormControl, null,
                                                react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0, className: "h-8 text-right w-24" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                        return field.onChange(parseFloat(e.target.value) || null);
                                                    }, disabled: !form.watch("discountOnTotalType") })))));
                                    } }),
                                react_1["default"].createElement("div", { className: "flex justify-between" },
                                    react_1["default"].createElement("span", null, "Monto Descuento Total:"),
                                    react_1["default"].createElement("span", null, formatters_1.formatCurrency(form.getValues("discountAmount") // Este campo 'discountAmount' debe ser el MONTO CALCULADO
                                    ))),
                                react_1["default"].createElement(separator_1.Separator, null),
                                react_1["default"].createElement(form_1.FormMessage, null, (_a = form.formState.errors.discountAmount) === null || _a === void 0 ? void 0 : _a.message),
                                react_1["default"].createElement(separator_1.Separator, null),
                                react_1["default"].createElement("div", { className: "flex justify-between font-bold text-xl pt-1" },
                                    react_1["default"].createElement("span", null, "TOTAL:"),
                                    " ",
                                    react_1["default"].createElement("span", null, formatters_1.formatCurrency(form.getValues("totalAmount")))))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "py-3 px-4" },
                                react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                                    react_1["default"].createElement(card_1.CardTitle, { className: "text-md" }, "Forma de Pago"),
                                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                            var currentTotalSale = form.getValues("totalAmount") || 0;
                                            var currentTotalPaid = form
                                                .getValues("payments")
                                                .reduce(function (sum, p) { return sum + (Number(p.amount) || 0); }, 0);
                                            var amountStillDue = Math.max(0, currentTotalSale - currentTotalPaid);
                                            appendPayment({
                                                fieldId: crypto.randomUUID(),
                                                method: undefined,
                                                amount: parseFloat(amountStillDue.toFixed(2)),
                                                reference: "",
                                                cardLast4: ""
                                            });
                                        }, disabled: paymentFields.length >= 3 },
                                        react_1["default"].createElement(lucide_react_1.PlusCircle, { className: "mr-1 h-3 w-3" }),
                                        " A\u00F1adir"))),
                            react_1["default"].createElement(card_1.CardContent, { className: "space-y-2 px-4 pb-3" },
                                paymentFields.map(function (paymentItem, index // <-- Asegúrate que aquí haya un PARÉNTESIS
                                ) { return (react_1["default"].createElement("div", { key: paymentItem.fieldId, className: "space-y-2 border-b pb-2 last:border-b-0 last:pb-0 mb-2" // Añadí mb-2 para separar visualmente los métodos de pago
                                 },
                                    react_1["default"].createElement("div", { className: "grid grid-cols-[1fr_110px_min-content] gap-2 items-start" },
                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "payments." + index + ".method", render: function (_a) {
                                                var field = _a.field;
                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs sr-only" }, "M\u00E9todo"),
                                                    react_1["default"].createElement(select_1.Select, { onValueChange: field.onChange, value: field.value || "" },
                                                        react_1["default"].createElement(form_1.FormControl, null,
                                                            react_1["default"].createElement(select_1.SelectTrigger, { className: "h-9" },
                                                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "M\u00E9todo..." }))),
                                                        react_1["default"].createElement(select_1.SelectContent, null, storeSettings.acceptedPaymentMethods.map(function (m) { return (react_1["default"].createElement(select_1.SelectItem, { key: m, value: m }, m.replace("_", " "))); }))),
                                                    react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                            } }),
                                        react_1["default"].createElement(form_1.FormField, { control: form.control, name: "payments." + index + ".amount", render: function (_a) {
                                                var _b;
                                                var field = _a.field;
                                                return (react_1["default"].createElement(form_1.FormItem, null,
                                                    react_1["default"].createElement(form_1.FormLabel, { className: "text-xs sr-only" }, "Monto"),
                                                    react_1["default"].createElement(form_1.FormControl, null,
                                                        react_1["default"].createElement(input_1.Input, __assign({ type: "number", step: "0.01", min: 0, className: "h-9 text-right" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                                return field.onChange(parseFloat(e.target.value) || 0);
                                                            } }))),
                                                    react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                            } }),
                                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return removePayment(index); }, className: "h-9 w-9 text-destructive self-center" // self-center para alinear con inputs
                                            , disabled: paymentFields.length <= 1 },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))),
                                    form.watch("payments." + index + ".method") ===
                                        prisma_enums_2.PaymentMethod.CASH &&
                                        index === 0 && (react_1["default"].createElement(form_1.FormField, { control: form.control, name: "amountTenderedCash", render: function (_a) {
                                            var _b;
                                            var field = _a.field;
                                            return (react_1["default"].createElement(form_1.FormItem, { className: "mt-1" },
                                                " ",
                                                react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Efectivo Recibido"),
                                                react_1["default"].createElement(form_1.FormControl, null,
                                                    react_1["default"].createElement(input_1.Input, __assign({ type: "number", placeholder: "Monto recibido", className: "h-9" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "", onChange: function (e) {
                                                            return field.onChange(parseFloat(e.target.value) ||
                                                                undefined);
                                                        } }))),
                                                react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                        } })),
                                    form.watch("payments." + index + ".method") &&
                                        form.watch("payments." + index + ".method") !==
                                            prisma_enums_2.PaymentMethod.CASH &&
                                        form.watch("payments." + index + ".method") !==
                                            prisma_enums_2.PaymentMethod.STORE_CREDIT && // Asumiendo que crédito de tienda no necesita ref
                                        form.watch("payments." + index + ".method") !==
                                            prisma_enums_2.PaymentMethod.OTHER && ( // Asumiendo que "Otro" no necesita ref
                                    react_1["default"].createElement(form_1.FormField, { control: form.control, name: "payments." + index + ".reference", render: function (_a) {
                                            var _b;
                                            var field = _a.field;
                                            return (react_1["default"].createElement(form_1.FormItem, { className: "mt-1" },
                                                react_1["default"].createElement(form_1.FormLabel, { className: "text-xs" }, "Referencia"),
                                                react_1["default"].createElement(form_1.FormControl, null,
                                                    react_1["default"].createElement(input_1.Input, __assign({ placeholder: "\u00DAltimos 4, Nro. Ref, etc.", className: "h-9" }, field, { value: (_b = field.value) !== null && _b !== void 0 ? _b : "" }))),
                                                react_1["default"].createElement(form_1.FormMessage, { className: "text-xs" })));
                                        } }))) // Cierre del div principal para cada paymentItem
                                ); }),
                                react_1["default"].createElement(form_1.FormMessage, null, ((_b = form.formState.errors.payments) === null || _b === void 0 ? void 0 : _b.message) || ((_d = (_c = form.formState.errors.payments) === null || _c === void 0 ? void 0 : _c.root) === null || _d === void 0 ? void 0 : _d.message)),
                                react_1["default"].createElement(separator_1.Separator, { className: "my-2" }),
                                react_1["default"].createElement("div", { className: "text-sm space-y-0.5" },
                                    react_1["default"].createElement("div", { className: "flex justify-between" },
                                        react_1["default"].createElement("span", null, "Total Pagado:"),
                                        react_1["default"].createElement("span", { className: "font-medium" }, formatters_1.formatCurrency(paymentFields.reduce(function (acc, p) { return acc + (Number(p.amount) || 0); }, 0)))),
                                    react_1["default"].createElement("div", { className: "flex justify-between" },
                                        react_1["default"].createElement("span", null, "Pendiente por Pagar:"),
                                        react_1["default"].createElement("span", { className: "font-medium" }, formatters_1.formatCurrency(Math.max(0, form.getValues("totalAmount") -
                                            paymentFields.reduce(function (acc, p) { return acc + (Number(p.amount) || 0); }, 0))))),
                                    form.watch("payments.0.method") === prisma_enums_2.PaymentMethod.CASH &&
                                        (form.getValues("amountTenderedCash") || 0) > 0 && (react_1["default"].createElement("div", { className: "flex justify-between text-green-600 font-semibold" },
                                        react_1["default"].createElement("span", null, "Cambio:"),
                                        react_1["default"].createElement("span", null, formatters_1.formatCurrency(form.watch("changeGiven"))))))),
                            react_1["default"].createElement(card_1.CardFooter, null,
                                react_1["default"].createElement(button_1.Button, { type: "submit", size: "lg", className: "w-full text-lg py-6", disabled: createSaleMutation.isPending || cartLines.length === 0 },
                                    createSaleMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                                    react_1["default"].createElement(lucide_react_1.DollarSign, { className: "mr-2" }),
                                    " Cobrar / Finalizar Venta")))))),
            react_1["default"].createElement(dialog_1.Dialog, { open: isSerialSelectOpen, onOpenChange: function (open) {
                    if (!open)
                        setSelectedProductForSerial(null);
                    setIsSerialSelectOpen(open);
                } },
                react_1["default"].createElement(dialog_1.DialogContent, null,
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null,
                            "Seleccionar IMEI/Serial para: ", selectedProductForSerial === null || selectedProductForSerial === void 0 ? void 0 :
                            selectedProductForSerial.name)),
                    isLoadingSerials && (react_1["default"].createElement("div", { className: "py-4 text-center" },
                        "Cargando seriales...",
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "inline-block h-4 w-4 animate-spin" }))),
                    !isLoadingSerials &&
                        (!availableSerials || availableSerials.length === 0) && (react_1["default"].createElement("p", { className: "py-4 text-center text-muted-foreground" }, "No hay stock serializado disponible para este producto en estado Disponible.")),
                    availableSerials && availableSerials.length > 0 && (react_1["default"].createElement(scroll_area_1.ScrollArea, { className: "max-h-64 my-4" },
                        react_1["default"].createElement("div", { className: "space-y-1" }, availableSerials.map(function (item) {
                            var _a;
                            return (react_1["default"].createElement(button_1.Button, { key: item.id, variant: "outline", type: "button", className: "w-full justify-start flex gap-2 items-center", onClick: function () { return handleSerialSelect(item); } },
                                react_1["default"].createElement(checkbox_1.Checkbox, { checked: cartLines.some(function (line) { return line.inventoryItemId === item.id; }), readOnly: true, className: "mr-2" }),
                                react_1["default"].createElement("span", null, item.imei),
                                react_1["default"].createElement("span", { className: "ml-auto text-xs text-muted-foreground" },
                                    "(Ubic: ", (_a = item.location) === null || _a === void 0 ? void 0 :
                                    _a.name,
                                    ", Cond:",
                                    " ",
                                    item.condition || "N/A",
                                    ")")));
                        })))),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                                setIsSerialSelectOpen(false);
                                setSelectedProductForSerial(null);
                            } }, "Cerrar")))),
            react_1["default"].createElement(non_serialized_product_to_cart_dialog_1.NonSerializedProductToCartDialog, { product: productForNonSerializedDialog, isOpen: isNonSerializedDialogOpen, onOpenChange: setIsNonSerializedDialogOpen, onAddToCart: function (product, location) {
                    addProductToCart(product, null, {
                        locationId: location.locationId,
                        locationName: location.locationName
                    });
                } }),
            react_1["default"].createElement(create_customer_quick_dialog_1.CreateCustomerDialog, { isOpen: isCreateCustomerDialogOpen, onOpenChange: setIsCreateCustomerDialogOpen, onSuccess: function (newlyCreatedCustomer) {
                    // Cuando el cliente se crea exitosamente desde el diálogo,
                    // selecciónalo automáticamente en el formulario del POS.
                    handleSelectCustomer(newlyCreatedCustomer);
                    // El diálogo se cierra a sí mismo a través de su onOpenChange y el onSuccess de su propia mutación.
                    // No es necesario setIsCreateCustomerDialogOpen(false) aquí si el diálogo lo hace.
                } }))));
}
exports["default"] = POSPage;
