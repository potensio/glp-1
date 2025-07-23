"use client";

import { WeightTrendChart } from "./weight-trend-chart";
import { useWeight } from "@/hooks/use-weight";
import { Card } from "@/components/ui/card";
import { Scale } from "lucide-react";

function WeightTrendSkeleton() {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Scale className="h-5 w-5 text-purple-600" />
          </div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-9 w-16 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-40 mb-4">
        <div className="w-full h-full bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex justify-between">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </Card>
  );
}

export function WeightTrendClient() {
  const { chartData, currentWeight, targetWeight, isLoading, error } = useWeight();

  if (isLoading) {
    return <WeightTrendSkeleton />;
  }

  if (error) {
    return (
      <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <p className="text-gray-500 mb-2">Failed to load weight data</p>
            <p className="text-sm text-gray-400">Please try refreshing the page</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <WeightTrendChart
      data={chartData}
      currentWeight={currentWeight}
      targetWeight={targetWeight}
    />
  );
}