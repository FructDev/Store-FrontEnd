// components/ui/date-picker.tsx
"use client";
import * as React from "react";
import { format as formatDateFn } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  selected: Date | null | undefined;
  onSelect: (date: Date | undefined) => void; // React Hook Form espera 'undefined' si se limpia
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = "Selecciona una fecha",
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? (
            formatDateFn(selected, "PPP", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected || undefined} // Calendar espera Date | undefined
          onSelect={onSelect}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}
