"use client";

import { Suspense } from "react";
import { WeightTrendChart } from "../charts/weight-trend-chart";
import { BloodPressureChart } from "../charts/blood-pressure-chart";
import { CaloriesIntakeChart } from "../charts/calories-intake-chart";
import { BloodSugarChart } from "../charts/blood-sugar-chart";
import {
  WeightChartSkeleton,
  BloodPressureChartSkeleton,
  CaloriesChartSkeleton,
  BloodSugarChartSkeleton,
} from "@/components/ui/chart-skeleton";

interface HealthChartsProps {
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export function HealthCharts({ className = "" }: HealthChartsProps) {
  return (
    <div className={className}>
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
