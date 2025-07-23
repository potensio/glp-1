"use client";

import { useFoodIntake } from "@/hooks/use-food-intake";
import { CaloriesIntakeChart } from "./calories-intake-chart";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface CaloriesIntakeClientProps {
  showTitle?: boolean;
  title?: string;
}

// Skeleton component for calories intake chart
const CaloriesIntakeSkeleton = () => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Flame className="h-5 w-5 text-blue-600" />
          </div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-40 mt-4">
        <div className="flex items-end justify-between h-full">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 flex-1">
              <div 
                className="bg-gradient-to-t from-blue-200 to-blue-100 rounded animate-pulse w-full"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              ></div>
              <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-sm mt-4">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </Card>
  );
};

export const CaloriesIntakeClient: React.FC<CaloriesIntakeClientProps> = ({
  showTitle = false,
  title = "Calories Intake",
}) => {
  const { chartData, isLoading, error, fetchFoodIntakes } = useFoodIntake();

  useEffect(() => {
    fetchFoodIntakes(true); // Show loading state on initial fetch
  }, []);

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        <CaloriesIntakeSkeleton />
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
            <p className="text-red-500">Error loading calories intake data: {error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const latestIntake = chartData.length > 0 
    ? chartData[chartData.length - 1].calories 
    : 0;

  return (
    <div>
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      <CaloriesIntakeChart data={chartData} latestIntake={latestIntake} />
    </div>
  );
};