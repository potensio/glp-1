import {
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  bloodPressureSchema,
  type BloodPressureInput,
  getSystolicStatus,
  getDiastolicStatus,
  getOverallStatus,
} from "@/lib/services/blood-pressure.service";

// Data interfaces
interface BloodPressureData {
  id: string;
  systolic: number;
  diastolic: number;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

interface ChartData {
  name: string;
  systolic: number;
  diastolic: number;
}

// Query keys for caching
const bloodPressureKeys = {
  all: ["bloodPressure"] as const,
  lists: () => [...bloodPressureKeys.all, "list"] as const,
  list: (profileId: string) =>
    [...bloodPressureKeys.lists(), profileId] as const,
  filtered: (profileId: string, dateRange?: { startDate: string; endDate: string }) => 
    [...bloodPressureKeys.list(profileId), "filtered", dateRange] as const,
};

// Fetch function for TanStack Query
async function fetchBloodPressureEntries(dateRange?: {
  startDate: string;
  endDate: string;
}): Promise<BloodPressureData[]> {
  let url = "/api/blood-pressures";
  
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
    throw new Error(
      errorData.error || "Failed to fetch blood pressure readings"
    );
  }

  return response.json();
}

// Transform data for chart
function transformBloodPressureDataForChart(
  readings: BloodPressureData[]
): ChartData[] {
  // Sort by capturedDate ascending to show chronological order
  const sortedReadings = readings.sort(
    (a, b) =>
      new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
  );

  // Take last 14 entries for the chart
  const recentReadings = sortedReadings.slice(-14);

  return recentReadings.map((reading) => {
    const date = new Date(reading.capturedDate);
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();

    return {
      name: `${month}/${day}`,
      systolic: reading.systolic,
      diastolic: reading.diastolic,
    };
  });
}

// Hook for creating blood pressure entries
export function useCreateBloodPressureEntry() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: BloodPressureInput) => {
      if (!profile?.id) {
        throw new Error("Profile not found");
      }

      // Validate input using Zod schema
      const validatedData = bloodPressureSchema.parse(data);

      // Make API request to create blood pressure reading
      const response = await fetch("/api/blood-pressures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systolic: validatedData.systolic,
          diastolic: validatedData.diastolic,
          capturedDate: new Date().toISOString(),
          profileId: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save blood pressure reading"
        );
      }

      return response.json();
    },
    onSuccess: (_, data) => {
      // Invalidate and refetch blood pressure data
      queryClient.invalidateQueries({ queryKey: bloodPressureKeys.lists() });

      // Get status for toast message
      const overallStatus = getOverallStatus(data.systolic, data.diastolic);
      const statusMessage =
        overallStatus === "normal"
          ? "Your blood pressure is in the normal range."
          : overallStatus === "high"
          ? "Your blood pressure is high. Consider consulting your doctor."
          : "Your blood pressure is low. Consider consulting your doctor.";

      // Success toast
      toast({
        title: "Blood pressure recorded!",
        description: `${data.systolic}/${data.diastolic} mmHg. ${statusMessage}`,
        variant: overallStatus === "normal" ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useBloodPressure(dateRange?: {
  startDate: string;
  endDate: string;
}) {
  const { profile } = useAuth();
  const { toast } = useToast();

  // Throw error if no profile - this will be caught by error boundary
  if (!profile?.id) {
    throw new Error("Profile not available");
  }

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: bloodPressureKeys.filtered(profile.id, dateRange),
    queryFn: () => fetchBloodPressureEntries(dateRange),
    enabled: !!profile?.id,
    staleTime: 5 * 60 * 1000,
  });

  const chartData = transformBloodPressureDataForChart(entries);

  const queryClient = useQueryClient();

  const createBloodPressureMutation = useMutation({
    mutationFn: async (data: BloodPressureInput) => {
      if (!profile?.id) {
        throw new Error("Profile not found");
      }

      // Validate input using Zod schema
      const validatedData = bloodPressureSchema.parse(data);

      // Make API request to create blood pressure reading
      const response = await fetch("/api/blood-pressures", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systolic: validatedData.systolic,
          diastolic: validatedData.diastolic,
          capturedDate: new Date().toISOString(),
          profileId: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to save blood pressure reading"
        );
      }

      return await response.json();
    },
    onSuccess: (result, data) => {
      // Get status for toast message
      const overallStatus = getOverallStatus(data.systolic, data.diastolic);
      const statusMessage =
        overallStatus === "normal"
          ? "Your blood pressure is in the normal range."
          : overallStatus === "high"
          ? "Your blood pressure is high. Consider consulting your doctor."
          : "Your blood pressure is low. Consider consulting your doctor.";

      // Success toast
      toast({
        title: "Blood pressure recorded!",
        description: `${data.systolic}/${data.diastolic} mmHg. ${statusMessage}`,
        variant: overallStatus === "normal" ? "default" : "destructive",
      });

      // Invalidate and refetch blood pressure data
      queryClient.invalidateQueries({ queryKey: ["blood-pressures"] });
    },
    onError: (error) => {
      // Error handling
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Helper functions for UI
  const getStatusColor = (status: "low" | "normal" | "high") => {
    switch (status) {
      case "low":
        return "text-blue-600";
      case "normal":
        return "text-green-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getBarColor = (status: "low" | "normal" | "high") => {
    switch (status) {
      case "low":
        return "bg-blue-500";
      case "normal":
        return "bg-green-500";
      case "high":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return {
    entries,
    chartData,
    createBloodPressure: createBloodPressureMutation.mutate,
    isCreating: createBloodPressureMutation.isPending,
    isLoading,
    error,
    // Helper functions
    getSystolicStatus,
    getDiastolicStatus,
    getOverallStatus,
    getStatusColor,
    getBarColor,
  };
}
