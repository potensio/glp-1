/**
 * Weight Management Hook
 *
 * This file helps you work with weight data in your app.
 * It's designed to be simple and easy to use for beginners.
 *
 * What it does:
 * - Gets weight data from your database
 * - Prepares data for charts and graphs
 * - Handles loading and errors automatically
 * - Lets you add new weight entries
 */

// Tools for getting data from the server
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
// Tool for showing success/error messages
import { useToast } from "@/hooks/use-toast";
// Tool to know who is logged in
import { useAuth } from "@/contexts/auth-context";
// Type definitions from weight service
import { WeightInput } from "@/lib/services/weight.service";

/**
 * What a weight entry looks like in the database
 */
interface WeightData {
  id: string;
  weight: number;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * What weight data looks like when ready for charts
 * Contains formatted date labels and weight values
 */
interface ChartData {
  name: string; // Formatted date (e.g., "Jan 15")
  value: number; // Weight value
}

/**
 * What the useWeight hook gives you back
 * Provides all weight-related data and statistics
 */
interface UseWeightReturn {
  // Chart data (no loading/error states in Suspense)
  chartData: ChartData[];
  currentWeight: number;
  entries: WeightData[];
  stats: {
    currentWeight: number;
    previousWeight: number;
    totalEntries: number;
    lastUpdated?: string;
  };
}

/**
 * Keys used for caching data (don't worry about this)
 * Provides hierarchical cache invalidation and organization
 */
const weightKeys = {
  all: ["weight"] as const,
  lists: () => [...weightKeys.all, "list"] as const,
  list: (profileId: string) => [...weightKeys.lists(), profileId] as const,
};

/**
 * Gets weight data from the server
 * Used by TanStack Query for data fetching and caching
 * @returns Promise resolving to array of weight entries
 */
async function fetchWeightEntries(): Promise<WeightData[]> {
  const response = await fetch("/api/weights");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch weights");
  }

  return response.json();
}

/**
 * Saves a new weight entry to the server
 * Used by the mutation hook for adding new weight records
 * @param data - Weight input data containing weight value
 * @returns Promise resolving to the created weight entry
 */
async function createWeightEntry(data: WeightInput): Promise<WeightData> {
  const response = await fetch("/api/weights", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      weight: data.weight,
      capturedDate: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create weight entry");
  }

  return response.json();
}

/**
 * Prepares weight data for charts by formatting dates nicely
 * Sorts chronologically and formats dates for display
 * @param weights - Array of raw weight entries from database
 * @returns Array of chart data with formatted dates and values
 */
function transformWeightDataForChart(weights: WeightData[]): ChartData[] {
  // Sort by capturedDate ascending to show chronological order
  const sortedWeights = weights.sort(
    (a, b) =>
      new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
  );

  // Take last 6 entries for the chart
  const recentWeights = sortedWeights.slice(-6);

  return recentWeights.map((weight) => {
    const date = new Date(weight.capturedDate);
    const monthName = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();

    return {
      name: `${monthName} ${day}`,
      value: weight.weight,
    };
  });
}

/**
 * Hook for adding new weight entries
 * Handles API calls, cache invalidation, and user feedback
 * @returns Mutation object with mutate function and loading state
 */
export function useCreateWeightEntry() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createWeightEntry,
    onSuccess: (data) => {
      // Invalidate and refetch weight data
      queryClient.invalidateQueries({ queryKey: weightKeys.lists() });
      toast({
        title: "Weight saved!",
        description: `Your weight of ${data.weight} lbs has been recorded.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to save weight. Please try again.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Main hook for working with weight data
 *
 * This hook gets your weight data and prepares it for use.
 * It uses something called "Suspense" which means:
 *
 * Good things:
 * - You don't need to worry about loading states
 * - Errors are handled automatically
 * - Your code stays simple and clean
 * - Data is cached so it loads faster
 * - Easy to use with less complicated code
 */
export function useWeight(): UseWeightReturn {
  const { profile } = useAuth();

  // Ensure we have a profile before running the query
  if (!profile?.id) {
    throw new Promise(() => {}); // Suspend until profile is available
  }

  const { data: entries = [] } = useSuspenseQuery({
    queryKey: weightKeys.list(profile.id),
    queryFn: fetchWeightEntries,
    staleTime: 5 * 60 * 1000,
  });

  const chartData = transformWeightDataForChart(entries);

  const stats = {
    currentWeight: entries[0]?.weight || 0,
    previousWeight: entries[1]?.weight || 0,
    totalEntries: entries.length,
    lastUpdated: entries[0]?.capturedDate,
  };

  return {
    entries,
    chartData,
    currentWeight: stats.currentWeight,
    stats,
  };
}
