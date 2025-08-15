import { useMutation } from "@tanstack/react-query";

interface EstimateCaloriesRequest {
  foodDescription: string;
}

interface EstimateCaloriesResponse {
  estimatedCalories: number;
}

async function estimateCalories(data: EstimateCaloriesRequest): Promise<EstimateCaloriesResponse> {
  const response = await fetch('/api/food-intakes/estimate-calories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to estimate calories');
  }

  return response.json();
}

export function useEstimateCalories() {
  return useMutation({
    mutationFn: estimateCalories,
    retry: 1,
    retryDelay: 1000,
  });
}