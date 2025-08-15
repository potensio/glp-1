import {
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { FoodIntakeInput } from "@/lib/services/food-intake.service";

// Fetch food intake entries from API
async function fetchFoodIntakeEntries(dateRange?: { startDate: string; endDate: string }) {
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

  // Take last 14 entries for the chart
  const recentEntries = sortedEntries.slice(-14);

  // Transform data for chart with actual dates
  return recentEntries.map((entry: any, index: number) => {
    const date = new Date(entry.capturedDate);
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    const fullDate = date.toLocaleDateString();
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Format meal type for display
    const mealTypeDisplay = entry.mealType
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return {
      id: entry.id,
      name: `${month}/${day}-${index}`, // Add index to ensure uniqueness
      calories: entry.calories,
      fullDate,
      time,
      mealType: mealTypeDisplay,
      food: entry.food,
    };
  });
}

// Query keys for consistent caching
const foodIntakeKeys = {
  all: ["food-intakes"] as const,
  lists: () => [...foodIntakeKeys.all, "list"] as const,
  list: (profileId: string) => [...foodIntakeKeys.lists(), profileId] as const,
  filtered: (profileId: string, dateRange?: { startDate: string; endDate: string }) => 
    [...foodIntakeKeys.list(profileId), "filtered", dateRange] as const,
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

// Main hook for working with food intake data (matches weight pattern)
export function useFoodIntake(dateRange?: { startDate: string; endDate: string }) {
  const { profile } = useAuth();

  // Throw error if no profile - this will be caught by error boundary
  if (!profile?.id) {
    throw new Error("Profile not available");
  }

  const { data: entries = [], isLoading, error } = useQuery({
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
