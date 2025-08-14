import { Card } from "@/components/ui/card";
import { LucideIcon, Scale, Heart, Droplet, Apple } from "lucide-react";

interface ChartSkeletonProps {
  icon: LucideIcon;
  title: string;
  iconBgColor?: string;
  iconColor?: string;
  showStats?: boolean;
  statsCount?: number;
}

export function ChartSkeleton({
  icon: Icon,
  title,
  iconBgColor = "bg-purple-100",
  iconColor = "text-purple-600",
  showStats = true,
  statsCount = 2,
}: ChartSkeletonProps) {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${iconBgColor} p-2 rounded-lg`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

      </div>

      {/* Chart Area */}
      <div className="h-32 mb-4">
        <div className="w-full h-full bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats */}
      {showStats && (
        <div className="flex justify-between">
          {Array.from({ length: statsCount }).map((_, index) => (
            <div
              key={index}
              className="h-4 w-24 bg-gray-200 rounded animate-pulse"
            />
          ))}
        </div>
      )}
    </Card>
  );
}

// Predefined skeleton variants for common chart types
export function WeightChartSkeleton() {
  return (
    <ChartSkeleton
      icon={Scale}
      title="Weight Trend"
      iconBgColor="bg-purple-100"
      iconColor="text-purple-600"
    />
  );
}

export function BloodPressureChartSkeleton() {
  return (
    <ChartSkeleton
      icon={Heart}
      title="Blood Pressure"
      iconBgColor="bg-red-100"
      iconColor="text-red-600"
      statsCount={1}
    />
  );
}

export function BloodSugarChartSkeleton() {
  return (
    <ChartSkeleton
      icon={Droplet}
      title="Blood Sugar"
      iconBgColor="bg-blue-100"
      iconColor="text-blue-600"
      statsCount={1}
    />
  );
}

export function CaloriesChartSkeleton() {
  return (
    <ChartSkeleton
      icon={Apple}
      title="Calories Intake"
      iconBgColor="bg-green-100"
      iconColor="text-green-600"
      statsCount={1}
    />
  );
}
