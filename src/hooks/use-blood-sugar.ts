import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { BloodSugarInput } from "@/lib/services/blood-sugar.service";

export function useBloodSugar() {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<{ name: string; sugar: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const createBloodSugarEntry = async (data: BloodSugarInput) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to log blood sugar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/blood-sugars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to log blood sugar");
      }

      const result = await response.json();

      toast({
        title: "Blood sugar logged successfully!",
        description: `${data.level} mg/dL recorded for ${data.measurementType.replace('_', ' ')}.`,
      });

      return result;
    } catch (error) {
      console.error("Error creating blood sugar entry:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log blood sugar. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getBloodSugars = async (limit = 10) => {
    if (!profile?.id) return [];

    setIsLoading(true);
    try {
      const response = await fetch(`/api/blood-sugars?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch blood sugars");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching blood sugars:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blood sugar history.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBloodSugars = async (showLoading = false) => {
    if (!profile?.id) return;

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getBloodSugars(7); // Get last 7 readings for chart
      
      // Sort by capturedDate ascending to show chronological order
      const sortedReadings = data.sort(
        (a: any, b: any) => new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
      );

      // Take last 6 entries for the chart
      const recentReadings = sortedReadings.slice(-6);
      
      // Transform data for chart with actual dates
      const transformedData = recentReadings.map((reading: any) => {
        const date = new Date(reading.capturedDate);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        
        return {
          name: `${monthName} ${day}`,
          sugar: reading.level,
        };
      });
      
      setChartData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blood sugar data';
      setError(errorMessage);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const refetch = () => {
    fetchBloodSugars(true);
  };

  const getBloodSugarStats = async (days = 30) => {
    if (!profile?.id) return null;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/blood-sugars/stats?days=${days}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch blood sugar stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching blood sugar stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch blood sugar statistics.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createBloodSugarEntry,
    getBloodSugars,
    getBloodSugarStats,
    fetchBloodSugars,
    refetch,
    isLoading,
    chartData,
    error,
  };
}