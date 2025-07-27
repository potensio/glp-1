"use client";

import { Button } from "@/components/ui/button";
import { HealthCharts } from "@/components/dashboard/health-charts";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { Card } from "@/components/ui/card";
import {
  Scale,
  Utensils,
  Pill,
  Smile,
  Printer,
  Heart,
  Footprints,
} from "lucide-react";

// Grouped by date for daily logs
const dailyEntries = [
  {
    date: "Jan 10, 2025",
    logs: [
      {
        icon: Scale,
        label: "Weight Entry",
        value: "165.2 lbs",
        time: "9:30 AM",
      },
      {
        icon: Heart,
        label: "Blood Pressure",
        value: "118/76 mmHg",
        time: "8:45 AM",
      },
    ],
  },
  {
    date: "Jan 9, 2025",
    logs: [
      {
        icon: Footprints,
        label: "Exercise",
        value: "Morning Walk - 30 min",
        time: "7:15 AM",
      },
      {
        icon: Pill,
        label: "Medication",
        value: "Metformin 500mg",
        time: "8:00 PM",
      },
      {
        icon: Utensils,
        label: "Food Intake",
        value: "Breakfast - 450 calories",
        time: "8:30 AM",
      },
    ],
  },
  {
    date: "Jan 8, 2025",
    logs: [
      {
        icon: Smile,
        label: "Mood",
        value: "Good - Feeling energetic",
        time: "6:00 PM",
      },
    ],
  },
];

// Color/gradient map for log types
const logTypeColors = {
  Weight: "bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600",
  BP: "bg-gradient-to-br from-red-100 to-red-50 text-red-600",
  Activity: "bg-gradient-to-br from-orange-100 to-orange-50 text-orange-600",
  Medication: "bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600",
  Food: "bg-gradient-to-br from-green-100 to-green-50 text-green-600",
  Mood: "bg-gradient-to-br from-yellow-100 to-yellow-50 text-yellow-600",
};

// Helper to get color by label
function getLogColor(label: string) {
  if (label.toLowerCase().includes("weight")) return logTypeColors.Weight;
  if (label.toLowerCase().includes("blood pressure")) return logTypeColors.BP;
  if (label.toLowerCase().includes("exercise")) return logTypeColors.Activity;
  if (label.toLowerCase().includes("medication"))
    return logTypeColors.Medication;
  if (label.toLowerCase().includes("food")) return logTypeColors.Food;
  if (label.toLowerCase().includes("mood")) return logTypeColors.Mood;
  return "bg-muted text-gray-600";
}

function RecentEntries() {
  return (
    <section className="">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Recent Entries
        </h3>
        <button className="text-xs text-blue-600 hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-6">
        {dailyEntries.map((day, i) => (
          <Card
            key={i}
            className="rounded-2xl shadow-xl transition-all duration-200 hover:shadow-2xl gap-2 cursor-pointer"
          >
            <div className="px-5 pb-2 flex items-center justify-between">
              <span className="font-semibold text-base">{day.date}</span>
              <span className="text-xs text-muted-foreground">
                {day.logs.length} log{day.logs.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y">
              {day.logs.map((entry, j) => (
                <div
                  key={j}
                  className="flex items-center gap-4 py-3 px-3 mx-2 border-0 hover:bg-gradient-to-br rounded-lg transition-all duration-200 "
                >
                  <div className={`p-2 rounded-lg ${getLogColor(entry.label)}`}>
                    <entry.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-sm">{entry.label}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.value}
                    </div>
                  </div>
                  <div className="text-xs text-secondary min-w-[60px] text-right">
                    {entry.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default function ProgressPage() {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
            Progress Overview
          </h1>
          <p className="text-background text-lg mb-6">
            Track your health journey and see how far you’ve come
          </p>
        </div>{" "}
        <Button
          size={"lg"}
          variant={"outline"}
          className="md:w-36 bg-transparent text-background hover:bg-background/10 hover:text-background"
        >
          Print
          <Printer />
        </Button>
      </div>
      <ProgressOverview />
      <HealthCharts />
      <RecentEntries />
    </>
  );
}
