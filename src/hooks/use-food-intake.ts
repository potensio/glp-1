import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { FoodIntakeInput } from "@/lib/services/food-intake.service";
import { useMemo } from "react";

// Fetch food intake entries from API
async function fetchFoodIntakeEntries(dateRange?: {
  startDate: string;
  endDate: string;
}) {
  let url = "/api/food-intakes";

  if (dateRange) {
    const params = new URLSearchParams({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    url += `?${params.toString()}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch food intake data");
  }

  return response.json();
}

// Transform food intake data for chart display
function transformFoodIntakeDataForChart(entries: any[]) {
  // Sort by capturedDate ascending to show chronological order
  const sortedEntries = entries.sort(
    (a: any, b: any) =>
      new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
  );

  // Group entries by date and sum calories
  const dailyCalories = new Map<
    string,
    {
      totalCalories: number;
      date: Date;
      entries: any[];
    }
  >();

  sortedEntries.forEach((entry: any) => {
    const date = new Date(entry.capturedDate);
    const dateKey = date.toDateString(); // Use date string as key to group by day

    if (!dailyCalories.has(dateKey)) {
      dailyCalories.set(dateKey, {
        totalCalories: 0,
        date,
        entries: [],
      });
    }

    const dayData = dailyCalories.get(dateKey)!;
    dayData.totalCalories += entry.calories;
    dayData.entries.push(entry);
  });

  // Convert to array and take last 14 days
  const dailyData = Array.from(dailyCalories.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(-14);

  // Transform data for chart with daily totals
  return dailyData.map((dayData, index) => {
    const date = dayData.date;
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    const fullDate = date.toLocaleDateString();

    // Get meal types for the day
    const mealTypes = dayData.entries.map((entry) =>
      entry.mealType
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    );

    // Get unique foods for the day
    const foods = [...new Set(dayData.entries.map((entry) => entry.food))];

    // Create meal-food pairs for structured display
    const mealFoodPairs = dayData.entries.map((entry) => ({
      mealType: entry.mealType
        .split("_")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      food: entry.food,
      calories: entry.calories,
    }));

    return {
      id: `day-${date.toISOString().split("T")[0]}`, // Use date as ID
      name: `${month}/${day}`,
      calories: dayData.totalCalories,
      fullDate,
      time: `${dayData.entries.length} meal${
        dayData.entries.length > 1 ? "s" : ""
      }`,
      mealType: mealTypes.join(", "),
      food: foods.join(", "),
      entryCount: dayData.entries.length,
      mealFoodPairs: mealFoodPairs,
    };
  });
}

// Query keys for consistent caching
const foodIntakeKeys = {
  all: ["food-intakes"] as const,
  lists: () => [...foodIntakeKeys.all, "list"] as const,
  list: (profileId: string) => [...foodIntakeKeys.lists(), profileId] as const,
  filtered: (
    profileId: string,
    dateRange?: { startDate: string; endDate: string }
  ) => [...foodIntakeKeys.list(profileId), "filtered", dateRange] as const,
};

// Create food intake entry function
async function createFoodIntakeEntry(data: FoodIntakeInput) {
  const response = await fetch("/api/food-intakes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mealType: data.mealType,
      food: data.food,
      calories: data.calories,
      capturedDate: data.capturedDate || new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to log food intake");
  }

  return await response.json();
}

// Separate mutation hook for creating food intake entries (matches weight pattern)
export function useCreateFoodIntakeEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createFoodIntakeEntry,
    onSuccess: (data, variables) => {
      // Invalidate all food intake queries including filtered ones
      queryClient.invalidateQueries({ queryKey: foodIntakeKeys.all });
      toast({
        title: "Food logged successfully!",
        description: `${variables.food} (${
          variables.calories
        } cal) has been added to your ${variables.mealType.toLowerCase()}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to log food intake. Please try again.",
        variant: "destructive",
      });
    },
  });
}

// Hook for getting food intake entries for a specific date
export function useFoodIntakeByDate(selectedDate: Date) {
  const { profile, isLoading: authLoading } = useAuth();

  // Create date range for the selected date (start and end of day)
  // Memoize to prevent infinite re-renders
  const dateRange = useMemo(() => {
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  }, [selectedDate]);

  const {
    data: entries = [],
    isLoading: queryLoading,
    error,
  } = useQuery({
    queryKey: profile?.id ? foodIntakeKeys.filtered(profile.id, dateRange) : ["food-intakes", "disabled"],
    queryFn: () => fetchFoodIntakeEntries(dateRange),
    enabled: !!profile?.id && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Don't return error if user is not authenticated - this is expected
  const shouldShowError = error && !!profile?.id;

  return {
    entries,
    isLoading: authLoading || queryLoading,
    error: shouldShowError ? error : null,
  };
}

// Hook to get all food intake entries (for finding dates with data)
export function useAllFoodIntake() {
  const { profile, isLoading: authLoading } = useAuth();

  const {
    data: entries = [],
    isLoading: queryLoading,
    error,
  } = useQuery({
    queryKey: profile?.id ? foodIntakeKeys.list(profile.id) : ["food-intakes", "disabled"],
    queryFn: () => fetchFoodIntakeEntries(), // No date range = get all entries
    enabled: !!profile?.id && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get unique dates that have food intake data
  const datesWithData = useMemo(() => {
    if (!entries.length) return [];
    
    const dates = entries.map((entry: any) => {
      const date = new Date(entry.capturedDate);
      date.setHours(0, 0, 0, 0); // Normalize to start of day
      return date;
    });
    
    // Remove duplicates and sort by date (most recent first)
    const timeSet = new Set<number>(dates.map((d: Date) => d.getTime()));
    const uniqueDates = Array.from(timeSet, (time: number) => new Date(time))
      .sort((a, b) => b.getTime() - a.getTime());
    
    return uniqueDates;
  }, [entries]);

  // Get the most recent date with data
  const mostRecentDateWithData = datesWithData[0] || null;

  // Don't return error if user is not authenticated - this is expected
  const shouldShowError = error && !!profile?.id;

  return {
    entries,
    datesWithData,
    mostRecentDateWithData,
    isLoading: authLoading || queryLoading,
    error: shouldShowError ? error : null,
  };
}

// Main hook for working with food intake data (matches weight pattern)
export function useFoodIntake(dateRange?: {
  startDate: string;
  endDate: string;
}) {
  const { profile } = useAuth();

  // Throw error if no profile - this will be caught by error boundary
  if (!profile?.id) {
    throw new Error("Profile not available");
  }

  const {
    data: entries = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: foodIntakeKeys.filtered(profile.id, dateRange),
    queryFn: () => fetchFoodIntakeEntries(dateRange),
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const chartData = transformFoodIntakeDataForChart(entries);

  return {
    entries,
    chartData,
    isLoading,
    error,
  };
}
