import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { BloodSugarInput } from '@/lib/services/blood-sugar.service';

// Fetch blood sugar entries from API
async function fetchBloodSugarEntries() {
  const response = await fetch('/api/blood-sugars');
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch blood sugar readings');
  }
  
  return response.json();
}

// Transform blood sugar data for chart display
function transformBloodSugarDataForChart(entries: any[]) {
  // Sort by capturedDate ascending to show chronological order
  const sortedReadings = entries.sort(
    (a: any, b: any) => new Date(a.capturedDate).getTime() - new Date(b.capturedDate).getTime()
  );

  // Take last 6 entries for the chart
  const recentReadings = sortedReadings.slice(-6);
  
  // Transform data for chart with actual dates
  return recentReadings.map((reading: any) => {
    const date = new Date(reading.capturedDate);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    
    return {
      name: `${monthName} ${day}`,
      sugar: reading.level,
    };
  });
}

export function useBloodSugar() {
  const { toast } = useToast();
  const { profile } = useAuth();

  const { data: entries = [], isLoading, error } = useQuery({
    queryKey: ['blood-sugars', profile?.id || 'no-profile'],
    queryFn: fetchBloodSugarEntries,
    enabled: !!profile?.id, // Only run query when profile is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const chartData = transformBloodSugarDataForChart(entries);

  const queryClient = useQueryClient();

  const createBloodSugarMutation = useMutation({
    mutationFn: async (data: BloodSugarInput) => {
      if (!profile?.id) {
        throw new Error('Profile not found');
      }

      const response = await fetch('/api/blood-sugars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to log blood sugar');
      }

      return await response.json();
    },
    onSuccess: (result, data) => {
      toast({
        title: "Blood sugar logged successfully!",
        description: `${data.level} mg/dL recorded for ${data.measurementType.replace('_', ' ')}.`,
      });

      // Invalidate and refetch blood sugar data
      queryClient.invalidateQueries({ queryKey: ['blood-sugars'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log blood sugar. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    entries,
    chartData,
    createBloodSugar: createBloodSugarMutation.mutate,
    isCreating: createBloodSugarMutation.isPending,
    isLoading,
    error,
  };
}