// components/ui/date-picker.tsx
"use client";
"use strict";
exports.__esModule = true;
exports.DatePicker = void 0;
var React = require("react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
function DatePicker(_a) {
    var selected = _a.selected, onSelect = _a.onSelect, _b = _a.placeholder, placeholder = _b === void 0 ? "Selecciona una fecha" : _b, className = _a.className;
    return (React.createElement(popover_1.Popover, null,
        React.createElement(popover_1.PopoverTrigger, { asChild: true },
            React.createElement(button_1.Button, { variant: "outline", className: utils_1.cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground", className) },
                React.createElement(lucide_react_1.Calendar, { className: "mr-2 h-4 w-4" }),
                selected ? (date_fns_1.format(selected, "PPP", { locale: locale_1.es })) : (React.createElement("span", null, placeholder)))),
        React.createElement(popover_1.PopoverContent, { className: "w-auto p-0" },
            React.createElement(calendar_1.Calendar, { mode: "single", selected: selected || undefined, onSelect: onSelect, initialFocus: true, locale: locale_1.es }))));
}
exports.DatePicker = DatePicker;
