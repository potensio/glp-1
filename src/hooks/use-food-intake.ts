import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useMemo } from "react";
import { toast } from "sonner";
import { FoodIntakeInput } from "@/lib/services/food-intake.service";
import type { CalorieEstimationResponse } from "@/lib/services/ai-calorie-estimation.service";

// Fetch food intake entries from API
async function fetchFoodIntakeEntries(params?: {
  startDate?: string;
  endDate?: string;
  dateCode?: string;
}) {
  let url = "/api/food-intakes";

  if (params) {
    const urlParams = new URLSearchParams();
    if (params.dateCode) {
      urlParams.append("dateCode", params.dateCode);
    } else if (params.startDate && params.endDate) {
      urlParams.append("startDate", params.startDate);
      urlParams.append("endDate", params.endDate);
    }
    if (urlParams.toString()) {
      url += `?${urlParams.toString()}`;
    }
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

  // Convert to array and sort by date
  const dailyData = Array.from(dailyCalories.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

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

// Food intake creation and deletion functions removed

// Food intake creation and deletion hooks removed

// Hook for getting food intake entries for a specific date
export function useFoodIntakeByDate(selectedDate: Date) {
  const { profile, isLoading: authLoading } = useAuth();

  // Generate dateCode in DDMMYYYY format as constraint to find existing food intake entries
  // Uses user's timezone from selectedDate to ensure timezone-independent queries
  // Memoize to prevent infinite re-renders
  const dateCode = useMemo(() => {
    const day = selectedDate.getDate().toString().padStart(2, "0");
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = selectedDate.getFullYear().toString();
    return `${day}${month}${year}`;
  }, [selectedDate]);

  const {
    data: entries = [],
    isLoading: queryLoading,
    error,
  } = useQuery({
    queryKey: profile?.id
      ? [...foodIntakeKeys.list(profile.id), "by-date-code", dateCode]
      : ["food-intakes", "disabled"],
    queryFn: () => fetchFoodIntakeEntries({ dateCode }),
    enabled: !!profile?.id && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    entries,
    isLoading: authLoading || queryLoading,
    error: authLoading ? null : error, // Don't show error while auth is loading
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
    queryKey: profile?.id
      ? foodIntakeKeys.list(profile.id)
      : ["food-intakes", "disabled"],
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
    const uniqueDates = Array.from(
      timeSet,
      (time: number) => new Date(time)
    ).sort((a, b) => b.getTime() - a.getTime());

    return uniqueDates;
  }, [entries]);

  // Get the most recent date with data
  const mostRecentDateWithData = datesWithData[0] || null;

  return {
    entries,
    datesWithData,
    mostRecentDateWithData,
    isLoading: authLoading || queryLoading,
    error: authLoading ? null : error, // Don't show error while auth is loading
  };
}

// Main hook for working with food intake data (matches weight pattern)
export function useFoodIntake(dateRange?: {
  startDate: string;
  endDate: string;
}) {
  const { profile, isLoading: authLoading } = useAuth();

  const {
    data: entries = [],
    isLoading: queryLoading,
    error,
  } = useQuery({
    queryKey: foodIntakeKeys.filtered(profile?.id || "", dateRange),
    queryFn: () =>
      fetchFoodIntakeEntries({
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
      }),
    enabled: !!profile?.id && !authLoading, // Only run when profile exists and auth is not loading
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const chartData = transformFoodIntakeDataForChart(entries);

  return {
    entries,
    chartData,
    isLoading: authLoading || queryLoading, // Include auth loading state
    error: authLoading ? null : error, // Don't show error while auth is loading
  };
}

// Create multiple food intake entries with clear-before-submit strategy
// Single entry creation
async function createFoodIntakeEntry(
  data: FoodIntakeInput & { capturedDate: string }
) {
  const response = await fetch("/api/food-intakes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create food intake entry");
  }

  return response.json();
}

// Hook for creating a single food intake entry
export function useCreateFoodIntakeEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createFoodIntakeEntry,
    onSuccess: () => {
      // Invalidate all food intake queries to refresh data
      queryClient.invalidateQueries({ queryKey: foodIntakeKeys.all });

      // Also invalidate specific patterns that might not be caught
      queryClient.invalidateQueries({
        predicate: (query) => {
          // Check if query key starts with 'food-intakes'
          return (
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === "food-intakes"
          );
        },
      });

      // Force invalidate all queries to ensure chart updates
      queryClient.invalidateQueries();

      toast.success("Food intake logged successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log food intake");
    },
  });
}

// Enhanced food entry input with nutrition data
interface EnhancedFoodEntryInput {
  mealType: string;
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  quantity: number;
  unit: string;
  capturedDate: string;
}

// API function for creating enhanced food entries
async function createEnhancedFoodEntry(data: EnhancedFoodEntryInput) {
  const response = await fetch("/api/food-intakes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create food entry");
  }

  return response.json();
}

// Enhanced hook for creating food entries with full nutrition data
export function useCreateFoodEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createEnhancedFoodEntry,
    onMutate: async (newEntry) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: foodIntakeKeys.all });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(foodIntakeKeys.all);

      // Optimistically update with new entry
      queryClient.setQueryData(foodIntakeKeys.all, (old: any[]) => {
        if (!old)
          return [
            { ...newEntry, id: `temp-${Date.now()}`, createdAt: new Date() },
          ];
        return [
          ...old,
          {
            ...newEntry,
            id: `temp-${Date.now()}`,
            createdAt: new Date(),
            isOptimistic: true,
          },
        ];
      });

      return { previousData };
    },
    onError: (err, newEntry, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(foodIntakeKeys.all, context.previousData);
      }
      toast.error("Failed to save food entry");
    },
    onSuccess: () => {
      toast.success("Food entry saved successfully!");
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: foodIntakeKeys.all });
    },
  });
}

// Helper function to create food entry from AI estimation
export function createFoodEntryFromEstimation(
  estimation: CalorieEstimationResponse,
  mealType: string,
  foodDescription: string,
  capturedDate: string
): EnhancedFoodEntryInput {
  const portion = estimation.estimatedPortion || {
    quantity: 1,
    unit: "serving",
  };

  return {
    mealType,
    food: foodDescription,
    calories: estimation.calories,
    protein: estimation.nutrition.protein,
    carbs: estimation.nutrition.carbs,
    fat: estimation.nutrition.fat,
    fiber: estimation.nutrition.fiber,
    quantity: portion.quantity,
    unit: portion.unit,
    capturedDate,
  };
}

// Export types
export type { EnhancedFoodEntryInput };
