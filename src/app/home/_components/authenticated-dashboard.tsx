"use client";

import { WelcomeHero } from "./welcome-hero";
import { QuickActions } from "./quick-actions";
import { MedicationList } from "./medical-list";
import { WeightTrendChart } from "./weight-trend-chart";
import { BloodPressureChart } from "./blood-pressure-chart";
import { CaloriesIntakeChart } from "./calories-intake-chart";
import { BloodSugarChart } from "./blood-sugar-chart";
import { addDays, format } from "date-fns";
import { useUser } from "@stackframe/stack";

// Helper to generate 14 days of labels like 'Apr 1', 'Apr 2', ...
function generateDateLabels(startDate: Date, days: number) {
  return Array.from({ length: days }, (_, i) =>
    format(addDays(startDate, i), "MMM d")
  );
}

const today = new Date();
const labels = generateDateLabels(today, 14);

const weightData = labels.map((label, i) => ({
  name: label,
  value: 168 - i * 0.5 + Math.round(Math.random() * 2 - 1),
}));
const bpData = labels.map((label, i) => ({
  name: label,
  systolic: 120 + Math.round(Math.sin(i / 2) * 3 + Math.random() * 2),
  diastolic: 80 + Math.round(Math.cos(i / 2) * 2 + Math.random() * 2),
}));
const caloriesData = labels.map((label, i) => ({
  name: label,
  calories: 2000 + Math.round(Math.sin(i) * 100 + Math.random() * 150),
}));
const bloodSugarData = labels.map((label, i) => ({
  name: label,
  sugar: 95 + Math.round(Math.cos(i / 2) * 8 + Math.random() * 5),
}));

export function AuthenticatedDashboard() {
  // Get the current user from Neon Auth
  const user = useUser();
  
  if (!user) {
    // Show loading state while auth is being checked
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <>
      <WelcomeHero userName={user.displayName || user.primaryEmail || 'User'} />
      <QuickActions />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 w-full">
        <WeightTrendChart
          data={weightData}
          currentWeight={165}
          targetWeight={160}
        />
        <BloodPressureChart data={bpData} latestReading="120/80 mmHg" />
        <CaloriesIntakeChart data={caloriesData} latestIntake={2050} />
        <BloodSugarChart data={bloodSugarData} latestReading={100} />
      </div>
      <MedicationList />
    </>
  );
}