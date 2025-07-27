"use client";

import { Card } from "@/components/ui/card";
import {
  Heart,
  TrendingDown,
  TrendingUp,
  Footprints,
  AlertCircle,
  Scale,
} from "lucide-react";
import { useWeight } from "@/hooks/use-weight";
import { useBloodPressure } from "@/hooks/use-blood-pressure";
import { useActivity } from "@/hooks/use-activity";
import { useMemo, Suspense } from "react";

// Optimized skeleton component for individual cards
function ProgressCardSkeleton({
  icon: Icon,
}: {
  icon: React.ComponentType<any>;
}) {
  return (
    <Card className="rounded-2xl gap-3 p-5 md:p-6 animate-pulse">
      <div className="flex items-center gap-1 mb-3">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
        <Icon className="size-4 text-gray-300" />
      </div>
      <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-16"></div>
    </Card>
  );
}

// Error card component for individual metrics
function ProgressCardError({
  title,
  icon: Icon,
}: {
  title: string;
  icon: React.ComponentType<any>;
}) {
  return (
    <Card className="rounded-2xl gap-3 p-5 md:p-6 border-red-200 bg-red-50">
      <div className="flex items-center gap-1 mb-3">
        <h3 className="text-xs font-medium text-red-600">{title}</h3>
        <Icon className="size-4 text-red-400" />
      </div>
      <div className="flex items-center gap-2">
        <AlertCircle className="size-4 text-red-500" />
        <p className="text-sm text-red-600">Error loading</p>
      </div>
    </Card>
  );
}

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

function ProgressOverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-2xl gap-3 p-5 md:p-6 animate-pulse">
          <div className="flex items-center gap-1">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="size-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </Card>
      ))}
    </div>
  );
}

function ProgressOverviewContent() {
  const { stats, entries: weightEntries } = useWeight();
  const { entries: bpEntries, getOverallStatus } = useBloodPressure();
  const { activities } = useActivity();

  // Calculate activity streak (must be called before any conditional returns)
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {/* Current Weight */}
      <Card className="rounded-2xl gap-3 p-5 md:p-6">
        <div className="flex items-center gap-1">
          <h3 className="text-xs font-medium text-muted-foreground">
            Current Weight
          </h3>
          <Scale className="size-4 text-blue-500" />
        </div>
        <p className="text-3xl font-bold">
          {stats.currentWeight || 0}{" "}
          <span className="text-2xl font-semibold">lbs</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Updated: {formatLastUpdated(stats.lastUpdated)}
        </p>
      </Card>

      {/* Weight Change */}
      <Card className="rounded-2xl gap-3 p-5 md:p-6">
        <div className="flex items-center gap-1">
          <h3 className="text-xs font-medium text-muted-foreground">
            Weight Change
          </h3>
          {isWeightLoss ? (
            <TrendingDown className="size-4 text-green-500" />
          ) : (
            <TrendingUp className="size-4 text-red-500" />
          )}
        </div>
        <p
          className={`text-3xl font-bold ${
            isWeightLoss ? "text-green-500" : "text-red-500"
          }`}
        >
          {weightChange > 0 ? "+" : ""}
          {weightChange.toFixed(1)}{" "}
          <span className="text-2xl font-semibold">lbs</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {stats.totalEntries > 1 ? "From previous entry" : "No previous data"}
        </p>
      </Card>

      {/* Latest BP */}
      <Card className="rounded-2xl gap-3 p-5 md:p-6">
        <div className="flex items-center gap-1">
          <h3 className="text-xs font-medium text-muted-foreground">
            Latest BP
          </h3>
          <Heart className="size-4 text-red-500 fill-red-500" />
        </div>
        <p className="text-3xl font-bold">
          {latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "--/--"}
        </p>
        <p className="text-xs text-muted-foreground">
          {latestBP
            ? bpStatus === "normal"
              ? "Normal range"
              : bpStatus === "high"
              ? "High"
              : "Low"
            : "No data"}
        </p>
      </Card>

      {/* Activity Streak */}
      <Card className="rounded-2xl gap-3 p-5 md:p-6">
        <div className="flex items-center gap-1">
          <h3 className="text-xs font-medium text-muted-foreground">
            Activity Streak
          </h3>
          <Footprints className="size-4 text-teal-500 fill-teal-500" />
        </div>
        <p className="text-3xl font-bold">
          {activityStreak} <span className="text-2xl font-semibold">days</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {activityStreak > 0 ? "Keep it up!" : "Start your streak!"}
        </p>
      </Card>
    </div>
  );
}

export function ProgressOverview() {
  return (
    <Suspense fallback={<ProgressOverviewSkeleton />}>
      <ProgressOverviewContent />
    </Suspense>
  );
}
