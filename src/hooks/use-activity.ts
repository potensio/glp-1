import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ActivityInput } from "@/lib/services/activity.service";

interface Activity {
  id: string;
  type: string;
  duration: number;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

const fetchActivities = async (
  startDate?: Date,
  endDate?: Date
): Promise<Activity[]> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate.toISOString());
  if (endDate) params.append("endDate", endDate.toISOString());

  const response = await fetch(`/api/activities?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return response.json();
};

const createActivityEntry = async (data: ActivityInput): Promise<Activity> => {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: data.type,
      duration: data.duration,
      capturedDate: data.capturedDate || new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to log activity");
  }

  return response.json();
};

const deleteActivityEntry = async (id: string): Promise<void> => {
  const response = await fetch(`/api/activities/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete activity");
  }
};

export function useActivity(startDate?: Date, endDate?: Date) {
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ["activities", startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => fetchActivities(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { activities, isLoading, error };
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createActivityEntry,
    onSuccess: (newActivity, data) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({
        title: "Activity logged successfully!",
        description: `${data.type} for ${data.duration} minutes`,
      });
    },
    onError: (error) => {
      console.error("Error creating activity:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to log activity",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteActivityEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast({
        title: "Activity deleted successfully!",
      });
    },
    onError: (error) => {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    },
  });
}
