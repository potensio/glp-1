import { useMutation } from "@tanstack/react-query";
import type {
  CalorieEstimationRequest,
  CalorieEstimationResponse,
} from "@/lib/services/ai-calorie-estimation.service";

// Enhanced nutrition estimation request
interface EstimateNutritionRequest {
  foodDescription: string;
  quantity?: number;
  unit?: string;
}

// API function for nutrition estimation
async function estimateNutrition(
  data: EstimateNutritionRequest
): Promise<CalorieEstimationResponse> {
  const response = await fetch("/api/food-intakes/estimate-calories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to estimate nutrition");
  }

  return response.json();
}

// Hook for comprehensive nutrition estimation
export function useEstimateNutrition() {
  return useMutation({
    mutationFn: estimateNutrition,
    retry: 1,
    retryDelay: 1000,
  });
}

// Legacy hook for backward compatibility
export function useEstimateCalories() {
  const estimateNutrition = useEstimateNutrition();

  return {
    ...estimateNutrition,
    mutate: (data: { foodDescription: string }) => {
      estimateNutrition.mutate(data);
    },
    mutateAsync: async (data: { foodDescription: string }) => {
      const result = await estimateNutrition.mutateAsync(data);
      return {
        estimatedCalories: result.calories,
        confidence: result.confidence,
        breakdown: `Protein: ${result.nutrition.protein}g, Carbs: ${result.nutrition.carbs}g, Fat: ${result.nutrition.fat}g, Fiber: ${result.nutrition.fiber}g`,
      };
    },
  };
}

// Export types
export type { EstimateNutritionRequest, CalorieEstimationResponse };

// New hook for AI-powered unit suggestions
export function useGetUnitSuggestions() {
  return useMutation({
    mutationFn: async (foodName: string) => {
      const response = await estimateNutrition({
        foodDescription: foodName,
        quantity: 1, // Default quantity for getting suggestions
        unit: "serving", // Default unit for getting suggestions
      });

      // Extract unique units from portionSuggestions
      const suggestedUnits =
        response.portionSuggestions
          ?.map((suggestion) => suggestion.unit)
          .filter((unit, index, array) => array.indexOf(unit) === index) || // Remove duplicates
        [];

      // Add fallback units if no suggestions or limited suggestions
      const fallbackUnits = ["serving", "cup", "gram", "ounce", "piece"];
      const allUnits = [...suggestedUnits];

      // Add fallbacks that aren't already included
      fallbackUnits.forEach((unit) => {
        if (!allUnits.includes(unit)) {
          allUnits.push(unit);
        }
      });

      return allUnits.slice(0, 8); // Limit to 8 units for UI
    },
    retry: 1,
    retryDelay: 1000,
  });
}
