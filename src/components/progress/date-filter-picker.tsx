"use client";

import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useDateFilter } from "@/contexts/date-filter-context";

export function DateFilterPicker() {
  const { dateRange, setDateRange } = useDateFilter();

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({
        from: range.from,
        to: range.to,
      });
    }
  };

  return (
    <DateRangePicker
      date={dateRange}
      onDateChange={handleDateChange}
      placeholder="Select date range"
      className="w-auto"
    />
  );
}
