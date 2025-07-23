import { useState, useCallback } from "react";
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

export function useActivity() {
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const { toast } = useToast();

  const createActivity = useCallback(
    async (data: ActivityInput) => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: data.type,
            duration: data.duration,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to log activity");
        }

        const newActivity = await response.json();
        
        // Update local state
        setActivities(prev => [newActivity, ...prev]);
        
        toast({
          title: "Activity logged successfully!",
          description: `${data.type} for ${data.duration} minutes`,
        });

        return newActivity;
      } catch (error) {
        console.error("Error creating activity:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to log activity",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const fetchActivities = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate.toISOString());
        if (endDate) params.append("endDate", endDate.toISOString());

        const response = await fetch(`/api/activities?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const data = await response.json();
        setActivities(data);
        return data;
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Error",
          description: "Failed to fetch activities",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/activities/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete activity");
        }

        // Update local state
        setActivities(prev => prev.filter(activity => activity.id !== id));
        
        toast({
          title: "Activity deleted successfully!",
        });
      } catch (error) {
        console.error("Error deleting activity:", error);
        toast({
          title: "Error",
          description: "Failed to delete activity",
          variant: "destructive",
        });
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    activities,
    isLoading,
    createActivity,
    fetchActivities,
    deleteActivity,
  };
}