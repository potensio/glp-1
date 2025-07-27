"use client";

import { WeightTrendChart } from "../charts/weight-trend-chart";
import { BloodPressureChart } from "../charts/blood-pressure-chart";
import { CaloriesIntakeChart } from "../charts/calories-intake-chart";
import { BloodSugarChart } from "../charts/blood-sugar-chart";

interface HealthChartsProps {
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export function HealthCharts({ className = "" }: HealthChartsProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
