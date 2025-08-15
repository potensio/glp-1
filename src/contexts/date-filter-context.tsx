"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { subWeeks } from "date-fns";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateFilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  resetToDefault: () => void;
  getDateRangeForAPI: () => { startDate: string; endDate: string };
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(
  undefined
);

// Default to last 2 weeks
const getDefaultDateRange = (): DateRange => {
  const to = new Date();
  const from = subWeeks(to, 2);
  return { from, to };
};

interface DateFilterProviderProps {
  children: ReactNode;
  initialDateRange?: {
    from: Date;
    to: Date;
  };
}

export function DateFilterProvider({ children, initialDateRange }: DateFilterProviderProps) {
  const getInitialDateRange = () => {
    if (initialDateRange) {
      return initialDateRange;
    }
    return getDefaultDateRange();
  };

  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange());

  const resetToDefault = () => {
    setDateRange(getDefaultDateRange());
  };

  const getDateRangeForAPI = () => ({
    startDate: dateRange.from.toISOString().split("T")[0],
    endDate: dateRange.to.toISOString().split("T")[0],
  });

  return (
    <DateFilterContext.Provider
      value={{
        dateRange,
        setDateRange,
        resetToDefault,
        getDateRangeForAPI,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
}

export function useDateFilter() {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error("useDateFilter must be used within a DateFilterProvider");
  }
  return context;
}
