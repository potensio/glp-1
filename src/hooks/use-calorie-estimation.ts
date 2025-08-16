import { useMutation } from "@tanstack/react-query";

interface EstimateCaloriesRequest {
  foodDescription: string;
}

interface EstimateCaloriesResponse {
  estimatedCalories: number;
}

async function estimateCalories(data: EstimateCaloriesRequest): Promise<EstimateCaloriesResponse> {
  console.log('Making API call to estimate calories with data:', data);
  
  const response = await fetch('/api/food-intakes/estimate-calories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log('API response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API error response:', error);
    throw new Error(error.error || 'Failed to estimate calories');
  }

  const result = await response.json();
  console.log('API success response:', result);
  return result;
}

export function useEstimateCalories() {
  return useMutation({
    mutationFn: estimateCalories,
    retry: 1,
    retryDelay: 1000,
  });
}