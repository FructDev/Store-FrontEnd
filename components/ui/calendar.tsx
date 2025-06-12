"use client";

import * as React from "react";
import {
  DayPicker,
  type DayPickerProps,
  type ClassNames,
  type NavProps as NavbarProps,
} from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/* -------------------------------------------------- */
/*  Custom navbar                                     */
/* -------------------------------------------------- */

function CalendarNavbar({
  onPreviousClick,
  onNextClick,
  dir,
}: NavbarProps): React.ReactElement {
  const isRtl = dir === "rtl";

  return (
    <div className="flex items-center justify-between w-full px-1">
      <button
        type="button"
        onClick={isRtl ? onNextClick : onPreviousClick}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        )}
      >
        <ChevronLeft className="size-4" />
      </button>

      <button
        type="button"
        onClick={isRtl ? onPreviousClick : onNextClick}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        )}
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Calendar wrapper                                  */
/* -------------------------------------------------- */

export type CalendarProps = DayPickerProps & { className?: string };

export function Calendar({
  className,
  showOutsideDays = true,
  classNames: clsFromProps,
  components: cmpFromProps,
  ...rest
}: CalendarProps) {
  /* ----- class names base ----- */
  const classNames: Partial<ClassNames> = {
    months: "flex flex-col sm:flex-row gap-2",
    month: "flex flex-col gap-4",
    caption: "flex justify-center pt-1 relative items-center w-full",
    caption_label: "text-sm font-medium",
    nav: "flex items-center gap-1",
    table: "w-full border-collapse space-x-1",
    head_row: "flex",
    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
    row: "flex w-full mt-2",
    cell:
      "relative p-0 text-center text-sm focus-within:z-20 " +
      "[&:has([aria-selected])]:bg-accent " +
      "[&:has([aria-selected].day-range-end)]:rounded-r-md",
    day: cn(
      buttonVariants({ variant: "ghost" }),
      "size-8 p-0 font-normal aria-selected:opacity-100"
    ),
    day_selected:
      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside:
      "day-outside text-muted-foreground aria-selected:text-muted-foreground",
    day_disabled: "text-muted-foreground opacity-50",
    ...clsFromProps,
  };

  /* ----- components map ----- */
  const components = {
    Navbar: CalendarNavbar,
    ...cmpFromProps,
  };

  return (
    <DayPicker
      {...rest}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={classNames}
      components={components}
    />
  );
}
