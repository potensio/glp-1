import { WelcomeHero } from "./_components/welcome-hero";
import { QuickActions } from "./_components/quick-actions";
import { MedicalReminders } from "./_components/medical-reminders";
import { WeightTrendChart } from "./_components/weight-trend-chart";
import { BloodPressureChart } from "./_components/blood-pressure-chart";

const weightData = [
  { name: "Jan", value: 168 },
  { name: "Feb", value: 167 },
  { name: "Mar", value: 166 },
  { name: "Apr", value: 165 },
  { name: "May", value: 165 },
];

const bpData = [
  { name: "Week 1", systolic: 125, diastolic: 80 },
  { name: "Week 2", systolic: 122, diastolic: 78 },
  { name: "Week 3", systolic: 120, diastolic: 80 },
  { name: "Week 4", systolic: 118, diastolic: 82 },
];

export default function DashPage() {
  return (
    <>
      <WelcomeHero />
      <QuickActions />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <WeightTrendChart
          data={weightData}
          currentWeight={165}
          targetWeight={160}
        />
        <BloodPressureChart data={bpData} latestReading="120/80 mmHg" />
      </div>
      <MedicalReminders />
    </>
  );
}
