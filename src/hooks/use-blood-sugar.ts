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
  useSuspenseQuery,
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
  id: string;
  name: string; // Formatted date (e.g., "Jan 15")
  value: number; // Blood sugar level
  fullDate: string;
  time: string;
  measurementType: string;
}

/**
 * What the useBloodSugar hook gives you back
 * Provides all blood sugar-related data and statistics
 */
interface UseBloodSugarReturn {
  entries: BloodSugarData[];
  chartData: ChartData[];
  latest: BloodSugarData | null;
  count: number;
  average: number;
  highest: number;
  lowest: number;
  currentLevel: number;
  stats: {
    average: number;
    highest: number;
    lowest: number;
    count: number;
    currentLevel: number;
    trend?: "up" | "down" | "stable";
    lastUpdated?: string;
  };
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

  return recentEntries.map((entry, index) => {
    const date = new Date(entry.capturedDate);
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    const fullDate = date.toLocaleDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format measurement type for display
    const measurementTypeDisplay = entry.measurementType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id: entry.id,
      name: `${month}/${day}-${index}`, // Add index to ensure uniqueness
      value: entry.level,
      fullDate,
      time,
      measurementType: measurementTypeDisplay,
    };
  });
}

/**
 * Hook for adding new blood sugar entries
 * Handles API calls, cache invalidation, and user feedback
 * @returns Mutation object with mutate function and loading state
 */
export function useCreateBloodSugarEntry(dateRange?: { startDate: string; endDate: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (data: BloodSugarInput) => {
      const response = await fetch("/api/blood-sugars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: data.level,
          measurementType: data.measurementType,
          capturedDate: data.capturedDate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log blood sugar");
      }

      return response.json();
    },
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: bloodSugarKeys.filtered(profile!.id, dateRange) });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData(bloodSugarKeys.filtered(profile!.id, dateRange));

      // Optimistically update to the new value
      queryClient.setQueryData(bloodSugarKeys.filtered(profile!.id, dateRange), (old: any[]) => [
        {
          ...newEntry,
          id: `temp-${Date.now()}`,
          profileId: profile!.id,
          capturedDate: newEntry.capturedDate || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...(old || []),
      ]);

      // Return a context object with the snapshotted value
      return { previousEntries };
    },
    onError: (err, newEntry, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(bloodSugarKeys.filtered(profile!.id, dateRange), context?.previousEntries);
      
      toast({
        title: "Error",
        description:
          err.message || "Failed to log blood sugar. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      const measurementTypeDisplay = data.measurementType.replace("_", " ");
      toast({
        title: "Blood sugar logged!",
        description: `Your blood sugar of ${data.level} mg/dL has been recorded for ${measurementTypeDisplay}.`,
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: bloodSugarKeys.all });
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

  const { data: entries = [] } = useSuspenseQuery({
    queryKey: bloodSugarKeys.filtered(profile.id, dateRange),
    queryFn: () => fetchBloodSugarEntries(dateRange),
    staleTime: 5 * 60 * 1000,
  });

  const chartData = transformBloodSugarDataForChart(entries);

  const average = entries.length > 0 
    ? Math.round(entries.reduce((sum, entry) => sum + entry.level, 0) / entries.length)
    : 0;
  const highest = entries.length > 0 
    ? Math.max(...entries.map(entry => entry.level))
    : 0;
  const lowest = entries.length > 0 
    ? Math.min(...entries.map(entry => entry.level))
    : 0;
  const currentLevel = entries.length > 0 ? entries[0].level : 0;
  const count = entries.length;

  const stats = {
    average,
    highest,
    lowest,
    count,
    currentLevel,
    trend: entries.length > 1 
      ? (currentLevel > entries[1].level ? "up" as const : 
         currentLevel < entries[1].level ? "down" as const : "stable" as const)
      : undefined,
    lastUpdated: entries.length > 0 ? entries[0].capturedDate : undefined,
  };

  return {
    entries,
    chartData,
    latest: entries[0] || null,
    count,
    average,
    highest,
    lowest,
    currentLevel,
    stats,
  };
}
