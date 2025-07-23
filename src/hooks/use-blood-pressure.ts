import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { 
  bloodPressureSchema, 
  type BloodPressureInput,
  getSystolicStatus,
  getDiastolicStatus,
  getOverallStatus
} from '@/lib/services/blood-pressure.service';

export function useBloodPressure() {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState<{ name: string; systolic: number; diastolic: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const createBloodPressure = async (data: BloodPressureInput) => {
    if (!profile?.id) {
      throw new Error('Profile not found');
    }

    setIsLoading(true);
    
    try {
      // Validate input using Zod schema
      const validatedData = bloodPressureSchema.parse(data);

      // Make API request to create blood pressure reading
      const response = await fetch('/api/blood-pressures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systolic: validatedData.systolic,
          diastolic: validatedData.diastolic,
          capturedDate: new Date().toISOString(),
          profileId: profile.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save blood pressure reading');
      }

      const result = await response.json();
      
      // Get status for toast message
      const overallStatus = getOverallStatus(data.systolic, data.diastolic);
      const statusMessage = overallStatus === 'normal' 
        ? 'Your blood pressure is in the normal range.' 
        : overallStatus === 'high'
        ? 'Your blood pressure is high. Consider consulting your doctor.'
        : 'Your blood pressure is low. Consider consulting your doctor.';
      
      // Success toast
      toast({
        title: "Blood pressure recorded!",
        description: `${data.systolic}/${data.diastolic} mmHg. ${statusMessage}`,
        variant: overallStatus === 'normal' ? 'default' : 'destructive',
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

  const getBloodPressures = async () => {
    if (!profile?.id) {
      throw new Error('Profile not found');
    }

    try {
      const response = await fetch('/api/blood-pressures');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch blood pressure readings');
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

  const fetchBloodPressures = async (showLoading = false) => {
    if (!profile?.id) return;

    if (showLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getBloodPressures();
      
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
          systolic: reading.systolic,
          diastolic: reading.diastolic,
        };
      });
      
      setChartData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blood pressure data';
      setError(errorMessage);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const refetch = () => {
    fetchBloodPressures(true);
  };

  // Helper functions for UI
  const getStatusColor = (status: 'low' | 'normal' | 'high') => {
    switch (status) {
      case 'low':
        return 'text-blue-600';
      case 'normal':
        return 'text-green-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBarColor = (status: 'low' | 'normal' | 'high') => {
    switch (status) {
      case 'low':
        return 'bg-blue-500';
      case 'normal':
        return 'bg-green-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return {
    createBloodPressure,
    getBloodPressures,
    fetchBloodPressures,
    refetch,
    isLoading,
    chartData,
    error,
    // Helper functions
    getSystolicStatus,
    getDiastolicStatus,
    getOverallStatus,
    getStatusColor,
    getBarColor,
  };
}