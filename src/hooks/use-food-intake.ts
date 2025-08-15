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
  return recentEntries.map((entry: any) => {
    const date = new Date(entry.capturedDate);
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();

    return {
      name: `${month}/${day}`,
      calories: entry.calories,
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

export function useFoodIntake(dateRange?: { startDate: string; endDate: string }) {
  const { toast } = useToast();
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

  const queryClient = useQueryClient();

  const createFoodIntakeMutation = useMutation({
    mutationFn: async (data: FoodIntakeInput) => {
      if (!profile?.id) {
        throw new Error("Profile not found");
      }

      const response = await fetch("/api/food-intakes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mealType: data.mealType,
          food: data.food,
          calories: data.calories,
          capturedDate: new Date().toISOString(),
          profileId: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log food intake");
      }

      return await response.json();
    },
    onSuccess: (result, data) => {
      toast({
        title: "Food logged successfully!",
        description: `${data.food} (${
          data.calories
        } cal) has been added to your ${data.mealType.toLowerCase()}.`,
      });

      // Invalidate and refetch food intake data
      queryClient.invalidateQueries({ queryKey: ["food-intakes"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to log food intake. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    entries,
    chartData,
    createFoodIntake: createFoodIntakeMutation.mutate,
    isCreating: createFoodIntakeMutation.isPending,
    isLoading,
    error,
  };
}
