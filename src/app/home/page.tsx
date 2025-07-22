import { WelcomeHero } from "./_components/welcome-hero";
import { QuickActions } from "./_components/quick-actions";
import { MedicationList } from "./_components/medical-list";
import { WeightTrendChart } from "./_components/weight-trend-chart";
import { BloodPressureChart } from "./_components/blood-pressure-chart";
import { CaloriesIntakeChart } from "./_components/calories-intake-chart";
import { BloodSugarChart } from "./_components/blood-sugar-chart";
import { addDays, format } from "date-fns";
import { stackServerApp } from "@/stack-server";

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

export default async function DashPage() {
  // Get the current user from Neon Auth
  const user = await stackServerApp.getUser();
  
  if (!user) {
    // This should be handled by middleware, but just in case
    throw new Error("User not authenticated");
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
