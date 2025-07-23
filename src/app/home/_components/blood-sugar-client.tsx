"use client";

import { useBloodSugar } from "@/hooks/use-blood-sugar";
import { BloodSugarChart } from "./blood-sugar-chart";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Droplet } from "lucide-react";

interface BloodSugarClientProps {
  showTitle?: boolean;
  title?: string;
}

// Skeleton component for blood sugar chart
const BloodSugarSkeleton = () => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <Droplet className="h-5 w-5 text-teal-600" />
          </div>
          <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-40 mt-4">
        <div className="flex items-end justify-between h-full">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center space-y-2 flex-1"
            >
              <div
                className="w-1 bg-gray-200 rounded animate-pulse"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              ></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
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

export const BloodSugarClient: React.FC<BloodSugarClientProps> = ({
  showTitle = false,
  title = "Blood Sugar",
}) => {
  const { chartData, isLoading, error, fetchBloodSugars } = useBloodSugar();

  useEffect(() => {
    fetchBloodSugars(true); // Show loading state on initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        <BloodSugarSkeleton />
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
            <p className="text-red-500">
              Error loading blood sugar data: {error}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const latestReading =
    chartData.length > 0 ? chartData[chartData.length - 1].sugar : 0;

  return (
    <div>
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      <BloodSugarChart data={chartData} latestReading={latestReading} />
    </div>
  );
};
