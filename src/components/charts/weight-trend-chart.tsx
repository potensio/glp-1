"use client";

import { useWeight } from "@/hooks/use-weight";
import { Scale, Printer } from "lucide-react";
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

interface WeightTrendChartProps {
  print?: boolean;
}

// Define a local type for the custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

// Chart display component
const WeightTrendDisplay = ({
  data,
  currentWeight,
  showPrint = false,
}: {
  data: { name: string; value: number }[];
  currentWeight: number;
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
            Weight: <span className="font-bold">{payload[0].value} lbs</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Scale className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Weight Trend</h3>
        </div>
        {showPrint && (
          <Button variant={"outline"} className="cursor-pointer">
            <Printer />
          </Button>
        )}
      </div>
      <div className="h-40 ">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No weight data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <defs>
                <linearGradient
                  id="weightBarGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
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
              <Bar
                dataKey="value"
                fill="url(#weightBarGradient)"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Current: <span className="font-semibold">{currentWeight} lbs</span>
        </span>
      </div>
    </Card>
  );
};

// Main weight trend chart component
export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  print = false,
}) => {
  const { chartData, currentWeight } = useWeight();

  return (
    <WeightTrendDisplay
      data={chartData}
      currentWeight={currentWeight}
      showPrint={print}
    />
  );
};

// Legacy component removed - use WeightTrendChart with useSuspense prop instead
