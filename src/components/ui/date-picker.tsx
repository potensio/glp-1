"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { formatDateWithOrdinal } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  placeholder?: string;
}

export function DatePicker({
  selectedDate,
  onDateSelect,
  disabled = false,
  className,
  align = "end",
  placeholder = "Pick a date",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 justify-between font-normal text-sm px-3",
            className
          )}
          disabled={disabled}
        >
          {/* Show full date text on larger screens, only icon on small screens */}
          <span className="hidden sm:inline">
            {selectedDate ? formatDateWithOrdinal(selectedDate) : placeholder}
          </span>
          <span className="sm:hidden">
            {/* Only show icon on small screens */}
          </span>
          <CalendarIcon className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align={align}>
        <Calendar
          mode="single"
          selected={selectedDate}
          captionLayout="dropdown"
          onSelect={(date) => {
            if (date) {
              onDateSelect(date);
            }
          }}
          disabled={(date) => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}