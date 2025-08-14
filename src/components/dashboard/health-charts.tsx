"use client";

import { WeightTrendChart } from "../charts/weight-trend-chart";
import { BloodPressureChart } from "../charts/blood-pressure-chart";
import { CaloriesIntakeChart } from "../charts/calories-intake-chart";
import { BloodSugarChart } from "../charts/blood-sugar-chart";
import { Card } from "@/components/ui/card";

function HealthChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-2xl p-5 md:p-6 animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gray-200 p-2 rounded-lg w-9 h-9"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </Card>
      ))}
    </div>
  );
}

export function HealthCharts({
  className = "",
  showTitle = true,
  title = "Health Overview",
}: {
  className?: string;
  showTitle?: boolean;
  title?: string;
}) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full health-charts-grid">
        {/* Weight Trend Chart */}
        <WeightTrendChart />

        {/* Blood Pressure Chart */}
        <BloodPressureChart />

        {/* Calories Intake Chart */}
        <CaloriesIntakeChart />

        {/* Blood Sugar Chart */}
        <BloodSugarChart />
      </div>
    </div>
  );
}
