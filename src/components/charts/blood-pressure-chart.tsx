"use client";

import { useBloodPressure } from "@/hooks/use-blood-pressure";
import { Heart, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import React from "react";

interface BloodPressureChartProps {
  print?: boolean;
}

// Define a local type for the custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

// Chart display component
const BloodPressureDisplay = ({
  data,
  latestReading,
  showPrint = false,
}: {
  data: { name: string; systolic: number; diastolic: number }[];
  latestReading: string;
  showPrint?: boolean;
}) => {
  const CustomTooltip = (props: CustomTooltipProps) => {
    const active = props?.active;
    const payload = props?.payload;
    const label = props?.label;
    if (active && payload && payload.length === 2) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs border border-gray-200">
          <div className="font-semibold">{label}</div>
          <div>
            Systolic:{" "}
            <span className="font-bold text-red-500">{payload[0].value}</span>
          </div>
          <div>
            Diastolic:{" "}
            <span className="font-bold text-orange-500">
              {payload[1].value}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Blood Pressure
          </h3>
        </div>
        {showPrint && (
          <Button variant={"outline"} className="cursor-pointer">
            <Printer />
          </Button>
        )}
      </div>
      <div className="h-40">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No blood pressure data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="systolic"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                barSize={16}
                name="Systolic"
              />
              <Bar
                dataKey="diastolic"
                fill="#f97316"
                radius={[4, 4, 0, 0]}
                barSize={16}
                name="Diastolic"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Latest: <span className="font-semibold">{latestReading}</span>
        </span>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Systolic</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Diastolic</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Main blood pressure chart component using Suspense
export const BloodPressureChart: React.FC<BloodPressureChartProps> = ({
  print = false,
}) => {
  const { chartData } = useBloodPressure();

  // Calculate latest reading
  const latestReading =
    chartData.length > 0
      ? `${chartData[chartData.length - 1].systolic}/${
          chartData[chartData.length - 1].diastolic
        }`
      : "No data";

  return (
    <BloodPressureDisplay
      data={chartData}
      latestReading={latestReading}
      showPrint={print}
    />
  );
};
