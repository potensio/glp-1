"use client";

import { useFoodIntake } from "@/hooks/use-food-intake";
import { Flame, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import React from "react";

interface CaloriesIntakeChartProps {
  print?: boolean;
}

// Define a local type for the custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

// Chart display component
const CaloriesIntakeDisplay = ({
  data,
  latestIntake,
  showPrint = false,
}: {
  data: { name: string; calories: number }[];
  latestIntake: number;
  showPrint?: boolean;
}) => {
  const CustomTooltip = (props: CustomTooltipProps) => {
    const active = props?.active;
    const payload = props?.payload;
    const label = props?.label;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 rounded shadow text-xs border border-gray-200">
          <div className="font-semibold">{label}</div>
          <div>
            Calories: <span className="font-bold">{payload[0].value} kcal</span>
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
          <div className="bg-blue-100 p-2 rounded-lg">
            <Flame className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Calories Intake
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
            No calories data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient
                  id="caloriesAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="calories"
                stroke="#3b82f6"
                fill="url(#caloriesAreaGradient)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Latest: <span className="font-semibold">{latestIntake} kcal</span>
        </span>
      </div>
    </Card>
  );
};

// Main component
export const CaloriesIntakeChart: React.FC<CaloriesIntakeChartProps> = ({
  print = false,
}) => {
  const { chartData } = useFoodIntake();

  const latestIntake =
    chartData.length > 0 ? chartData[chartData.length - 1].calories : 0;

  return (
    <CaloriesIntakeDisplay
      data={chartData}
      latestIntake={latestIntake}
      showPrint={print}
    />
  );
};
