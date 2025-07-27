"use client";

import { Button } from "@/components/ui/button";
import { HealthCharts } from "@/components/dashboard/health-charts";
import { ProgressOverview } from "@/components/progress/progress-overview";
import { Printer } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";



export default function ProgressPage() {
  const { profile } = useAuth();

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex flex-col">
          <h1 className="text-background text-3xl leading-tight font-semibold mb-2">
            Progress Overview
          </h1>
          <p className="text-background text-lg mb-6">
            Track your health journey and see how far you've come
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
      <div className="space-y-6">
        {profile && <ProgressOverview />}
        {profile && <HealthCharts />}
      </div>
    </>
  );
}
