"use client";

import { useBloodPressure } from "@/hooks/use-blood-pressure";
import { BloodPressureChart } from "./blood-pressure-chart";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface BloodPressureClientProps {
  showTitle?: boolean;
  title?: string;
}

// Skeleton component for blood pressure chart
const BloodPressureSkeleton = () => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-red-600" />
          </div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-40 mt-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1 flex-1">
              <div 
                className="bg-gray-200 rounded-t animate-pulse w-full"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              ></div>
              <div 
                className="bg-gray-300 rounded-t animate-pulse w-full"
                style={{ height: `${Math.random() * 40 + 20}%` }}
              ></div>
              <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-sm mt-4">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const BloodPressureClient: React.FC<BloodPressureClientProps> = ({
  showTitle = false,
  title = "Blood Pressure",
}) => {
  const { chartData, isLoading, error, fetchBloodPressures } = useBloodPressure();

  useEffect(() => {
    fetchBloodPressures(true); // Show loading state on initial fetch
  }, [fetchBloodPressures]);

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        <BloodPressureSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
          <div className="flex items-center justify-center h-40">
            <p className="text-red-500">Error loading blood pressure data: {error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const latestReading = chartData.length > 0 
    ? `${chartData[chartData.length - 1].systolic}/${chartData[chartData.length - 1].diastolic}` 
    : "No data";

  return (
    <div>
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      <BloodPressureChart data={chartData} latestReading={latestReading} />
    </div>
  );
};