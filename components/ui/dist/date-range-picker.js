// components/ui/date-range-picker.tsx (o donde lo tengas)
"use client";
"use strict";
exports.__esModule = true;
exports.DatePickerWithRange = void 0;
var React = require("react");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
var button_1 = require("@/components/ui/button");
var calendar_1 = require("@/components/ui/calendar");
var popover_1 = require("@/components/ui/popover");
function DatePickerWithRange(_a) {
    var className = _a.className, date = _a.date, onDateChange = _a.onDateChange;
    return (React.createElement("div", { className: utils_1.cn("grid gap-2", className) },
        React.createElement(popover_1.Popover, null,
            React.createElement(popover_1.PopoverTrigger, { asChild: true },
                React.createElement(button_1.Button, { id: "date", variant: "outline", className: utils_1.cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground") },
                    React.createElement(lucide_react_1.CalendarIcon, { className: "mr-2 h-4 w-4" }),
                    (date === null || date === void 0 ? void 0 : date.from) ? (date.to ? (React.createElement(React.Fragment, null,
                        date_fns_1.format(date.from, "LLL dd, y", { locale: locale_1.es }),
                        " -",
                        " ",
                        date_fns_1.format(date.to, "LLL dd, y", { locale: locale_1.es }))) : (date_fns_1.format(date.from, "LLL dd, y", { locale: locale_1.es }))) : (React.createElement("span", null, "Selecciona un rango")))),
            React.createElement(popover_1.PopoverContent, { className: "w-auto p-0", align: "start" },
                React.createElement(calendar_1.Calendar, { initialFocus: true, mode: "range", defaultMonth: date === null || date === void 0 ? void 0 : date.from, selected: date, onSelect: onDateChange, numberOfMonths: 2, locale: locale_1.es })))));
}
exports.DatePickerWithRange = DatePickerWithRange;
