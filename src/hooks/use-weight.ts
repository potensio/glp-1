import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import {
  weightSchema,
  WeightInput,
  WeightService,
} from "@/lib/services/weight.service";

interface WeightData {
  id: string;
  weight: number;
  capturedDate: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

interface ChartData {
  name: string;
  value: number;
}

interface UseWeightReturn {
  // Weight management
  createWeight: (data: WeightInput) => Promise<any>;
  getWeights: () => Promise<WeightData[]>;
  isLoading: boolean;
  
  // Chart data
  chartData: ChartData[];
  currentWeight: number;
  targetWeight: number;
  error: string | null;
  refetch: () => Promise<void>;
}

function transformWeightDataForChart(weights: WeightData[]): ChartData[] {
  // Sort by capturedDate ascending to show chronological order
  const sortedWeights = weights.sort(
    (a, b) => new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
  );

  // Take last 6 entries for the chart
  const recentWeights = sortedWeights.slice(-6);

  return recentWeights.map((weight) => {
    const date = new Date(weight.capturedDate);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    return {
      name: `${monthName} ${day}`,
      value: weight.weight,
    };
  });
}

function calculateTargetWeight(weights: WeightData[]): number {
  if (weights.length === 0) return 160; // Default target
  
  const latestWeight = weights[0]?.weight || 160;
  // Simple target calculation: 10% reduction from latest weight
  return Math.round(latestWeight * 0.9);
}

export function useWeight(): UseWeightReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [weights, setWeights] = useState<WeightData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchWeights = useCallback(async (showLoading = false): Promise<WeightData[]> => {
    if (!profile) {
      setWeights([]);
      return [];
    }

    if (showLoading) {
      setIsLoading(true);
    }

    try {
      setError(null);
      
      const response = await fetch("/api/weights");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch weights");
      }

      const fetchedWeights = await response.json();
      setWeights(fetchedWeights);
      return fetchedWeights;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load weight data";
      setError(errorMessage);
      console.error("Error fetching weights:", err);
      
      toast({
        title: "Error",
        description: "Failed to load weight data. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [profile, toast]);

  const createWeight = async (data: WeightInput) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to save weight data.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Validate client-side data
      const validatedData = weightSchema.parse(data);

      const response = await fetch("/api/weights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weight: validatedData.weight,
          capturedDate: new Date().toISOString(), // Always use current date for this dialog
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save weight");
      }

      const result = await response.json();

      toast({
        title: "Weight saved!",
        description: `Your weight of ${validatedData.weight} lbs has been recorded.`,
      });
      
      // Refresh weight data after successful creation
      await fetchWeights();

      return result;
    } catch (error) {
      console.error("Error saving weight:", error);

      if (error instanceof Error && error.message.includes("validation")) {
        toast({
          title: "Validation Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save weight. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getWeights = async (): Promise<WeightData[]> => {
    if (!profile) {
      toast({
        title: "Error",
        description: "You must be logged in to view weight data.",
        variant: "destructive",
      });
      return [];
    }

    setIsLoading(true);
    try {
      return await fetchWeights();
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = useCallback(async () => {
    await fetchWeights(true); // Show loading state for manual refetch
  }, [fetchWeights]);

  // Initial data fetch
  useEffect(() => {
    fetchWeights(true); // Show loading state for initial fetch
  }, [fetchWeights]);

  // Prepare chart data
  const chartData = transformWeightDataForChart(weights);
  const currentWeight = weights.length > 0 ? weights[0].weight : 0;
  const targetWeight = calculateTargetWeight(weights);

  return {
    // Weight management
    createWeight,
    getWeights,
    isLoading,
    
    // Chart data
    chartData,
    currentWeight,
    targetWeight,
    error,
    refetch,
  };
}
