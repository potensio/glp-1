"use client";

import { useWeight } from "@/hooks/use-weight";
import { useDateFilter } from "@/contexts/date-filter-context";
import { Scale } from "lucide-react";
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

// Chart display component
const WeightTrendDisplay = ({
  data,
  currentWeight,
}: {
  data: {
    name: string;
    value: number;
    fullDate: string;
    time: string;
    capturedDate: string;
    id: string;
  }[];
  currentWeight: number;
}) => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Scale className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 chart-title">
            Weight Trend
          </h3>
        </div>
      </div>
      <div className="h-40 chart-container">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No weight data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} data-chart="true">
              <defs>
                <linearGradient
                  id="weightAreaGradient"
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
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickFormatter={(value) => {
                  // Extract just the date part (before the dash) for display
                  return value.split("-")[0] || "";
                }}
                interval={0}
              />
              <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {data.value} lbs
                        </p>
                        <p className="text-xs text-gray-600">{data.fullDate}</p>
                        <p className="text-xs text-gray-500">{data.time}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                fill="url(#weightAreaGradient)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </AreaChart>
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
export const WeightTrendChart: React.FC = () => {
  const { getDateRangeForAPI } = useDateFilter();
  const dateRange = getDateRangeForAPI();
  const { chartData, currentWeight, isLoading, error } = useWeight(dateRange);

  if (isLoading) {
    return (
      <Card className="rounded-2xl p-5 md:p-6">
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
          <div className="bg-purple-100 p-2 rounded-lg">
            <Scale className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Weight Trend</h3>
        </div>
        <div className="flex items-center justify-center h-40 text-destructive">
          <p>Failed to load weight data</p>
        </div>
      </Card>
    );
  }

  return <WeightTrendDisplay data={chartData} currentWeight={currentWeight} />;
};

// Legacy component removed - use WeightTrendChart with useSuspense prop instead
