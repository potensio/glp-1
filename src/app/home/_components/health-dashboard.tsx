"use client";

import { Suspense } from "react";
import { WeightTrendClient } from "./weight-trend-client";
import { BloodPressureClient } from "./blood-pressure-client";
import { CaloriesIntakeClient } from "./calories-intake-client";
import { BloodSugarClient } from "./blood-sugar-client";





interface HealthDashboardProps {
  className?: string;
  showTitle?: boolean;
  title?: string;
}

export function HealthDashboard({ 
  className = "", 
  showTitle = false, 
  title = "Health Trends" 
}: HealthDashboardProps) {
  return (
    <div className={className}>
      {showTitle && (
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Weight Trend Chart */}
        <Suspense fallback={<div>Loading weight trends...</div>}>
          <WeightTrendClient />
        </Suspense>
        
        {/* Blood Pressure Chart */}
        <Suspense fallback={<div>Loading blood pressure...</div>}>
          <BloodPressureClient />
        </Suspense>
        
        {/* Calories Intake Chart */}
        <Suspense fallback={<div>Loading calories intake...</div>}>
          <CaloriesIntakeClient />
        </Suspense>
        
        {/* Blood Sugar Chart */}
        <Suspense fallback={<div>Loading blood sugar...</div>}>
          <BloodSugarClient />
        </Suspense>
      </div>
    </div>
  );
}