"use client";

import { useFoodIntake } from "@/hooks/use-food-intake";
import { useDateFilter } from "@/contexts/date-filter-context";
import { Flame } from "lucide-react";
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

// Define a local type for the custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: any }[];
  label?: string;
}

// Chart display component
const CaloriesIntakeDisplay = ({
  data,
  latestIntake,
}: {
  data: { id: string; name: string; calories: number; fullDate: string; time: string; mealType: string; food: string }[];
  latestIntake: number;
}) => {
  const CustomTooltip = (props: CustomTooltipProps) => {
    const active = props?.active;
    const payload = props?.payload;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg text-sm border border-gray-200">
          <div className="font-semibold text-gray-800 mb-2">
            Calories: <span className="font-bold text-blue-600">{payload[0].value}</span> kcal
          </div>
          <div className="text-gray-700 text-xs mb-1">
            Meal: {data.mealType}
          </div>
          <div className="text-gray-700 text-xs mb-1">
            Food: {data.food}
          </div>
          <div className="text-gray-600 text-xs">
            {data.fullDate} at {data.time}
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
          <h3 className="text-lg font-semibold text-gray-800 chart-title">
            Calories Intake
          </h3>
        </div>
      </div>
      <div className="h-40 chart-container">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No calories data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} data-chart="true">
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
                tickFormatter={(value) => value.split('-')[0]} // Display only the date part
              />
              <YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
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
export const CaloriesIntakeChart: React.FC = () => {
  const { getDateRangeForAPI } = useDateFilter();
  const dateRange = getDateRangeForAPI();
  const { chartData, isLoading, error } = useFoodIntake(dateRange);

  if (isLoading) {
    return (
      <Card className="rounded-2xl p-5 md:p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gray-200 p-2 rounded-lg w-9 h-9"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-40 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl p-5 md:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <Flame className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Calories Intake
          </h3>
        </div>
        <div className="flex items-center justify-center h-40 text-destructive">
          <p>Failed to load calories data</p>
        </div>
      </Card>
    );
  }

  const latestIntake =
    chartData.length > 0 ? chartData[chartData.length - 1].calories : 0;

  return <CaloriesIntakeDisplay data={chartData} latestIntake={latestIntake} />;
};
