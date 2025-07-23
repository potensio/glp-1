import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { foodIntakeSchema, type FoodIntakeInput } from '@/lib/services/food-intake.service';

export function useFoodIntake() {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<{ name: string; calories: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const createFoodIntake = async (data: FoodIntakeInput) => {
    if (!profile?.id) {
      throw new Error('Profile not found');
    }

    setIsLoading(true);
    
    try {
      // Validate input using Zod schema
      const validatedData = foodIntakeSchema.parse(data);

      // Make API request to create food intake
      const response = await fetch('/api/food-intakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealType: validatedData.mealType,
          food: validatedData.food,
          calories: validatedData.calories,
          capturedDate: new Date().toISOString(),
          profileId: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log food intake');
      }

      const result = await response.json();
      
      // Success toast
      toast({
        title: "Food logged successfully!",
        description: `${data.food} (${data.calories} cal) has been added to your ${data.mealType.toLowerCase()}.`,
      });

      return result;
    } catch (error) {
      // Error handling
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFoodIntakes = async () => {
    if (!profile?.id) {
      throw new Error('Profile not found');
    }

    try {
      const response = await fetch('/api/food-intakes');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch food intakes');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const fetchFoodIntakes = async (showLoading = false) => {
    if (!profile?.id) return;

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getFoodIntakes();
      
      // Group by date and sum calories for chart
      const dailyCalories = data.reduce((acc: any, intake: any) => {
        const date = new Date(intake.capturedDate).toDateString(); // Use consistent date format
        if (!acc[date]) {
          acc[date] = {
            calories: 0,
            date: new Date(intake.capturedDate)
          };
        }
        acc[date].calories += intake.calories;
        return acc;
      }, {});
      
      // Sort by date and take last 6 entries
      const sortedEntries = Object.values(dailyCalories)
        .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
        .slice(-6);
      
      // Transform to chart format with actual dates
      const transformedData = sortedEntries.map((entry: any) => {
        const monthName = entry.date.toLocaleDateString('en-US', { month: 'short' });
        const day = entry.date.getDate();
        
        return {
          name: `${monthName} ${day}`,
          calories: entry.calories,
        };
      });
      
      setChartData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch food intake data';
      setError(errorMessage);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const refetch = () => {
    fetchFoodIntakes(true);
  };

  return {
    createFoodIntake,
    getFoodIntakes,
    fetchFoodIntakes,
    refetch,
    isLoading,
    chartData,
    error,
  };
}
