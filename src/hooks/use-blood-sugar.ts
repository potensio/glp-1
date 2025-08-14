/**
 * Blood Sugar Management Hook
 *
 * This file helps you work with blood sugar data in your app.
 * It's designed to be simple and easy to use for beginners.
 *
 * What it does:
 * - Gets blood sugar data from your database
 * - Prepares data for charts and graphs
 * - Handles loading and errors automatically
 * - Lets you add new blood sugar entries
 */

// Tools for getting data from the server
import {
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
// Tool for showing success/error messages
import { useToast } from "@/hooks/use-toast";
// Tool to know who is logged in
import { useAuth } from "@/contexts/auth-context";
// Type definitions from blood sugar service
import { BloodSugarInput } from "@/lib/services/blood-sugar.service";

/**
 * What a blood sugar entry looks like in the database
 */
interface BloodSugarData {
  id: string;
  level: number;
  measurementType: "fasting" | "before_meal" | "after_meal" | "bedtime";
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * What blood sugar data looks like when ready for charts
 * Contains formatted date labels and blood sugar values
 */
interface ChartData {
  name: string; // Formatted date (e.g., "Jan 15")
  value: number; // Blood sugar level
}

/**
 * What the useBloodSugar hook gives you back
 * Provides all blood sugar-related data and statistics
 */
interface UseBloodSugarReturn {
  chartData: ChartData[];
  currentLevel: number;
  entries: BloodSugarData[];
  stats: {
    currentLevel: number;
    previousLevel: number;
    totalEntries: number;
    lastUpdated?: string;
  };
  isLoading: boolean;
  error: Error | null;
}

/**
 * Keys used for caching data (don't worry about this)
 * Provides hierarchical cache invalidation and organization
 */
const bloodSugarKeys = {
  all: ["blood-sugar"] as const,
  lists: () => [...bloodSugarKeys.all, "list"] as const,
  list: (profileId: string) => [...bloodSugarKeys.lists(), profileId] as const,
  filtered: (profileId: string, dateRange?: { startDate: string; endDate: string }) => 
    [...bloodSugarKeys.list(profileId), "filtered", dateRange] as const,
};

/**
 * Gets blood sugar data from the server
 * Used by TanStack Query for data fetching and caching
 * @returns Promise resolving to array of blood sugar entries
 */
async function fetchBloodSugarEntries(dateRange?: { startDate: string; endDate: string }): Promise<BloodSugarData[]> {
  let url = "/api/blood-sugars";
  
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
    throw new Error(errorData.error || "Failed to fetch blood sugar readings");
  }

  return response.json();
}

/**
 * Saves a new blood sugar entry to the server
 * Used by the mutation hook for adding new blood sugar records
 * @param data - Blood sugar input data containing level and measurement type
 * @returns Promise resolving to the created blood sugar entry
 */
async function createBloodSugarEntry(
  data: BloodSugarInput
): Promise<BloodSugarData> {
  const response = await fetch("/api/blood-sugars", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      level: data.level,
      measurementType: data.measurementType,
      capturedDate: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create blood sugar entry");
  }

  return response.json();
}

/**
 * Prepares blood sugar data for charts by formatting dates nicely
 * Sorts chronologically and formats dates for display
 * @param entries - Array of raw blood sugar entries from database
 * @returns Array of chart data with formatted dates and values
 */
function transformBloodSugarDataForChart(
  entries: BloodSugarData[]
): ChartData[] {
  // Sort by capturedDate ascending to show chronological order
  const sortedEntries = entries.sort(
    (a, b) =>
      new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
  );

  // Take last 14 entries for the chart
  const recentEntries = sortedEntries.slice(-14);

  return recentEntries.map((entry) => {
    const date = new Date(entry.capturedDate);
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();

    return {
      name: `${month}/${day}`,
      value: entry.level,
    };
  });
}

/**
 * Hook for adding new blood sugar entries
 * Handles API calls, cache invalidation, and user feedback
 * @returns Mutation object with mutate function and loading state
 */
export function useCreateBloodSugarEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createBloodSugarEntry,
    onSuccess: (data) => {
      // Invalidate and refetch blood sugar data
      queryClient.invalidateQueries({ queryKey: bloodSugarKeys.lists() });
      const measurementTypeDisplay = data.measurementType.replace("_", " ");
      toast({
        title: "Blood sugar logged!",
        description: `Your blood sugar of ${data.level} mg/dL has been recorded for ${measurementTypeDisplay}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description:
          error.message || "Failed to log blood sugar. Please try again.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Main hook for working with blood sugar data
 *
 * This hook gets your blood sugar data and prepares it for use.
 * It uses React Suspense which means:
 *
 * Good things:
 * - No loading states needed - components suspend until data loads
 * - Errors are handled by error boundaries
 * - Your code stays simple and clean
 * - Data is cached so it loads faster
 * - Instant navigation with streaming content
 */
export function useBloodSugar(dateRange?: { startDate: string; endDate: string }): UseBloodSugarReturn {
  const { profile } = useAuth();

  // Throw error if no profile - this will be caught by error boundary
  if (!profile?.id) {
    throw new Error("Profile not available");
  }

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: bloodSugarKeys.filtered(profile.id, dateRange),
    queryFn: () => fetchBloodSugarEntries(dateRange),
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });

  const chartData = transformBloodSugarDataForChart(entries);

  const stats = {
    currentLevel: entries[0]?.level || 0,
    previousLevel: entries[1]?.level || 0,
    totalEntries: entries.length,
    lastUpdated: entries[0]?.capturedDate,
  };

  return {
    entries,
    chartData,
    currentLevel: stats.currentLevel,
    stats,
    isLoading,
    error,
  };
}
