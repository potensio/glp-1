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
  useQuery,
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
  fullDate: string; // Full date for tooltip (e.g., "Aug 8 2025")
  time: string; // Time for tooltip (e.g., "10:30 AM")
  capturedDate: string; // Original ISO date string
  id: string; // Database ID for unique identification
}

/**
 * What the useWeight hook gives you back
 * Provides all weight-related data and statistics
 */
interface UseWeightReturn {
  chartData: ChartData[];
  currentWeight: number;
  entries: WeightData[];
  stats: {
    currentWeight: number;
    previousWeight: number;
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
const weightKeys = {
  all: ["weight"] as const,
  lists: () => [...weightKeys.all, "list"] as const,
  list: (profileId: string) => [...weightKeys.lists(), profileId] as const,
  filtered: (profileId: string, dateRange?: { startDate: string; endDate: string }) => 
    [...weightKeys.list(profileId), "filtered", dateRange] as const,
};

/**
 * Gets weight data from the server
 * Used by TanStack Query for data fetching and caching
 * @param dateRange - Optional date range for filtering
 * @returns Promise resolving to array of weight entries
 */
async function fetchWeightEntries(dateRange?: {
  startDate: string;
  endDate: string;
}): Promise<WeightData[]> {
  let url = "/api/weights";
  
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
      capturedDate: data.capturedDate?.toISOString(), // Include capturedDate if provided
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
  // Sort by capturedDate ascending to get chronological order (oldest to newest)
  const sortedWeights = weights.sort(
    (a, b) =>
      new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
  );

  // Take last 14 entries (most recent) for the chart
  const recentWeights = sortedWeights.slice(-14);
  
  // Data is already in chronological order (oldest to newest)
  const chronologicalWeights = recentWeights;

  return chronologicalWeights.map((weight, index) => {
    // Parse the date - it comes as ISO string from database
    const date = new Date(weight.capturedDate);
    
    // Ensure consistent timezone handling
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    
    // Format full date for tooltip (e.g., "Aug 8 2025")
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const fullDate = `${monthNames[date.getMonth()]} ${day} ${date.getFullYear()}`;
    
    // Use actual time from capturedDate with seconds for precision
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    // Use the actual index as part of the name to ensure uniqueness
      return {
        name: `${month}/${day}-${index}`, // Add index to make each point unique
        value: weight.weight,
        fullDate,
        time,
        capturedDate: weight.capturedDate,
        id: weight.id,
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
  const { toast } = useToast();

  return useMutation({
    mutationFn: createWeightEntry,
    onSuccess: (data) => {
      // Invalidate all weight-related queries including filtered ones
      queryClient.invalidateQueries({ queryKey: weightKeys.all });
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
 * It uses React Suspense which means:
 *
 * Good things:
 * - No loading states needed - components suspend until data loads
 * - Errors are handled by error boundaries
 * - Your code stays simple and clean
 * - Data is cached so it loads faster
 * - Instant navigation with streaming content
 */
export function useWeight(dateRange?: {
  startDate: string;
  endDate: string;
}): UseWeightReturn {
  const { profile } = useAuth();

  // Throw error if no profile - this will be caught by error boundary
  if (!profile?.id) {
    throw new Error("Profile not available");
  }

  const { data: rawEntries = [], isLoading, error } = useQuery({
    queryKey: weightKeys.filtered(profile.id, dateRange),
    queryFn: () => fetchWeightEntries(dateRange),
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Sort entries by capturedDate descending (most recent first) for stats
  const entries = [...rawEntries].sort(
    (a, b) => new Date(b.capturedDate).getTime() - new Date(a.capturedDate).getTime()
  );

  // Pass raw entries to chart transformation (it will handle its own sorting)
  const chartData = transformWeightDataForChart(rawEntries);
  const currentWeight = entries[0]?.weight || 0;

  // Calculate stats
  const stats = {
    currentWeight,
    previousWeight: entries[1]?.weight || 0,
    totalEntries: entries.length,
    lastUpdated: entries[0]?.capturedDate,
  };

  return {
    chartData,
    currentWeight,
    entries,
    stats,
    isLoading,
    error,
  };
}
