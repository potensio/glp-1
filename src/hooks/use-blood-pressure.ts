/**
 * Blood Pressure Management Hook
 *
 * This file helps you work with blood pressure data in your app.
 * It's designed to be simple and easy to use for beginners.
 *
 * What it does:
 * - Gets blood pressure data from your database
 * - Prepares data for charts and graphs
 * - Handles loading and errors automatically
 * - Lets you add new blood pressure entries
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
// Type definitions and validation from blood pressure service
import { 
  type BloodPressureInput,
  bloodPressureSchema,
  getOverallStatus 
} from "@/lib/services/blood-pressure.service";

/**
 * What a blood pressure entry looks like in the database
 */
interface BloodPressureData {
  id: string;
  systolic: number;
  diastolic: number;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * What blood pressure data looks like when ready for charts
 * Contains formatted date labels and blood pressure values
 */
interface ChartData {
  id: string;
  name: string; // Formatted date (e.g., "Jan 15")
  systolic: number; // Systolic pressure value
  diastolic: number; // Diastolic pressure value
  fullDate: string; // Full date for tooltip (e.g., "Aug 8 2025")
  time: string; // Time for tooltip (e.g., "10:30 AM")
}

/**
 * What the useBloodPressure hook gives you back
 * Provides all blood pressure-related data and statistics
 */
interface UseBloodPressureReturn {
  chartData: ChartData[];
  entries: BloodPressureData[];
  stats: {
    currentSystolic: number;
    currentDiastolic: number;
    previousSystolic: number;
    previousDiastolic: number;
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
const bloodPressureKeys = {
  all: ["bloodPressure"] as const,
  lists: () => [...bloodPressureKeys.all, "list"] as const,
  list: (profileId: string) => [...bloodPressureKeys.lists(), profileId] as const,
  filtered: (profileId: string, dateRange?: { startDate: string; endDate: string }) => 
    [...bloodPressureKeys.list(profileId), "filtered", dateRange] as const,
};

/**
 * Gets blood pressure data from the server
 * Can filter by date range if provided
 */
async function fetchBloodPressureEntries(dateRange?: {
  startDate: string;
  endDate: string;
}): Promise<BloodPressureData[]> {
  const params = new URLSearchParams();
  
  if (dateRange?.startDate) {
    params.append("startDate", dateRange.startDate);
  }
  if (dateRange?.endDate) {
    params.append("endDate", dateRange.endDate);
  }

  const url = `/api/blood-pressures${
    params.toString() ? `?${params.toString()}` : ""
  }`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch blood pressure entries");
  }

  return response.json();
}

/**
 * Saves a new blood pressure entry to the server
 */
async function createBloodPressureEntry(
  data: BloodPressureInput
): Promise<BloodPressureData> {
  const response = await fetch("/api/blood-pressures", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || "Failed to create blood pressure entry"
    );
  }

  return response.json();
}

/**
 * Converts raw blood pressure data into chart-friendly format
 * Makes dates look nice and adds helpful labels
 * Reverses the order so latest entries appear on the right side of the chart
 */
function transformBloodPressureDataForChart(
  readings: BloodPressureData[]
): ChartData[] {
  return readings
    .slice()
    .reverse()
    .map((reading, index) => {
      const date = new Date(reading.capturedDate);
      
      return {
        id: reading.id,
        name: `${date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}-${index}`, // Add index to make each point unique
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        fullDate: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time: date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
      };
    });
}

/**
 * Hook for adding new blood pressure entries
 * Handles saving and updating the display automatically
 */
export function useCreateBloodPressureEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  if (!profile) {
    throw new Error("Profile is required to create blood pressure entries");
  }

  return useMutation({
    mutationFn: async (data: BloodPressureInput) => {
      // Validate the data
      const validatedData = bloodPressureSchema.parse(data);

      // Create the entry data with profile ID
      const entryData = {
        systolic: validatedData.systolic,
        diastolic: validatedData.diastolic,
        capturedDate: validatedData.capturedDate || new Date().toISOString(),
        profileId: profile.id,
      };

      return createBloodPressureEntry(entryData);
    },
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: bloodPressureKeys.all });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(bloodPressureKeys.all);

      // Optimistically update to the new value
      queryClient.setQueryData(
        bloodPressureKeys.all,
        (old: BloodPressureData[] = []) => [
          ...old,
          {
            id: `temp-${Date.now()}`,
            systolic: newEntry.systolic,
            diastolic: newEntry.diastolic,
            profileId: profile.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            capturedDate: new Date().toISOString(),
          },
        ]
      );

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: (result, data) => {
       // Get status for toast message
       const overallStatus = getOverallStatus(data.systolic, data.diastolic);
       
       let message = "Blood pressure reading saved!";
       if (overallStatus === "high") {
         message += " Your reading is high - consider consulting your doctor.";
       } else if (overallStatus === "low") {
         message += " Your reading is low - consider consulting your doctor.";
       }

       toast({
         title: "Success",
         description: message,
       });
     },
    onError: (error: Error, newEntry, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(bloodPressureKeys.all, context?.previousData);
      toast({
        title: "Error",
        description: error.message || "Failed to save blood pressure reading. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: bloodPressureKeys.all });
    },
  });
}

/**
 * Main hook for getting blood pressure data
 * Provides entries, chart data, and statistics
 */
export function useBloodPressure(dateRange?: {
  startDate: string;
  endDate: string;
}): UseBloodPressureReturn {
  const { profile } = useAuth();

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

  // Calculate statistics
  // Note: entries are in descending order (newest first), so index 0 is the latest
  const stats = {
    currentSystolic: entries[0]?.systolic || 0,
    currentDiastolic: entries[0]?.diastolic || 0,
    previousSystolic: entries[1]?.systolic || 0,
    previousDiastolic: entries[1]?.diastolic || 0,
    totalEntries: entries.length,
    lastUpdated: entries[0]?.capturedDate,
  };

  return {
    entries,
    chartData,
    stats,
    isLoading,
    error,
  };
}
