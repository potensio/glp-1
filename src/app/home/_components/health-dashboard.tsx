"use client";

import { Suspense } from "react";
import { WeightTrendChart } from "./weight-trend-chart";
import { BloodPressureChart } from "./blood-pressure-chart";
import { CaloriesIntakeChart } from "./calories-intake-chart";
import { BloodSugarChart } from "./blood-sugar-chart";
import {
  WeightChartSkeleton,
  BloodPressureChartSkeleton,
  CaloriesChartSkeleton,
  BloodSugarChartSkeleton,
} from "@/components/ui/chart-skeleton";

interface HealthDashboardProps {
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export function HealthDashboard({
  className = "",
  showTitle = false,
  title = "Health Trends",
}: HealthDashboardProps) {
  return (
    <div className={className}>
      {showTitle && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Weight Trend Chart - Using TanStack Query with Suspense */}
        <Suspense fallback={<WeightChartSkeleton />}>
          <WeightTrendChart />
        </Suspense>

        {/* Blood Pressure Chart */}
        <Suspense fallback={<BloodPressureChartSkeleton />}>
          <BloodPressureChart />
        </Suspense>

        {/* Calories Intake Chart */}
        <Suspense fallback={<CaloriesChartSkeleton />}>
          <CaloriesIntakeChart />
        </Suspense>

        {/* Blood Sugar Chart */}
        <Suspense fallback={<BloodSugarChartSkeleton />}>
          <BloodSugarChart />
        </Suspense>
      </div>
    </div>
  );
}
