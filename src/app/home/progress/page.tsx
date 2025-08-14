"use client";

import { Button } from "@/components/ui/button";
import { HealthCharts } from "@/components/dashboard/health-charts";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { Scale, TrendingDown, TrendingUp, Heart, Footprints, Printer } from "lucide-react";
import { DateFilterProvider, useDateFilter } from "@/contexts/date-filter-context";
import { DateFilterPicker } from "@/components/progress/date-filter-picker";
import { useWeight } from "@/hooks/use-weight";
import { useBloodPressure } from "@/hooks/use-blood-pressure";
import { useActivity } from "@/hooks/use-activity";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/auth-context";

function useActivityStreak(activities: any[]) {
  return useMemo(() => {
    if (!activities.length) return 0;

    // Sort activities by date (most recent first)
    const sortedActivities = activities.sort(
      (a, b) =>
        new Date(b.capturedDate).getTime() - new Date(a.capturedDate).getTime()
    );

    // Get unique dates with activities
    const activityDates = new Set(
      sortedActivities.map((activity) =>
        new Date(activity.capturedDate).toDateString()
      )
    );

    // Calculate streak from today backwards
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      // Check last 30 days max
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      if (activityDates.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        // Don't break on first day (today) if no activity
        break;
      }
    }

    return streak;
  }, [activities]);
}

function ProgressPageContent() {
  const { getDateRangeForAPI } = useDateFilter();
  const dateRange = getDateRangeForAPI();
  
  const { stats, entries: weightEntries } = useWeight(dateRange);
  const { entries: bpEntries, getOverallStatus } = useBloodPressure(dateRange);
  const { activities } = useActivity(
    new Date(dateRange.startDate),
    new Date(dateRange.endDate)
  );

  // Calculate activity streak
  const activityStreak = useActivityStreak(activities || []);

  // Calculate weight change
  const weightChange = stats.currentWeight - stats.previousWeight;
  const isWeightLoss = weightChange < 0;

  // Get latest BP reading
  const latestBP = bpEntries[0];
  const bpStatus = latestBP
    ? getOverallStatus(latestBP.systolic, latestBP.diastolic)
    : "normal";

  // Format last updated date
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return "No data";
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const router = useRouter();

  const handlePrint = () => {
    const { startDate, endDate } = getDateRangeForAPI();
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    window.open(`/pdf-preview?${params.toString()}`, '_blank');
  };

  return (
    <>
      <div className="space-y-6">


        <div className="flex flex-col sm:flex-row justify-between">
          <div className="flex flex-col">
            <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
              Progress
            </h1>
            <p className="text-background text-lg mb-6">
              Track your health metrics and see your progress over time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile Print Button */}
            <Button
              onClick={handlePrint}
              className="md:hidden"
              variant="outline"
              size="sm"
            >
              <Printer className="h-4 w-4" />
            </Button>
            {/* Desktop Print Button */}
            <Button
              onClick={handlePrint}
              className="hidden md:flex"
              variant="outline"
              size="sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
            <DateFilterPicker />
          </div>
        </div>

        <ProgressOverview />
        <HealthCharts />
      </div>
    </>
  );
}

export default function ProgressPage() {
  const { profile } = useAuth();

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <DateFilterProvider>
      <ProgressPageContent />
    </DateFilterProvider>
  );
}
