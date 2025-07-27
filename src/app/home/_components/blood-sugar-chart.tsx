"use client";

import { Droplet, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useBloodSugar } from "@/hooks/use-blood-sugar";
import { useEffect } from "react";
import React from "react";

interface BloodSugarChartProps {
  showTitle?: boolean;
  title?: string;
}

interface BloodSugarDisplayProps {
  data: { name: string; sugar: number }[];
  latestReading: number;
}

// Define a local type for the custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

// Skeleton component for blood sugar chart
const BloodSugarSkeleton = () => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-100 p-2 rounded-lg">
            <Droplet className="h-5 w-5 text-teal-600" />
          </div>
          <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="h-40 mt-4">
        <div className="flex items-end justify-between h-full">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center space-y-2 flex-1"
            >
              <div
                className="w-1 bg-gray-200 rounded animate-pulse"
                style={{ height: `${Math.random() * 60 + 40}%` }}
              ></div>
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-sm mt-4">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </Card>
  );
};

// Main component that handles data fetching and state management
export const BloodSugarChart: React.FC<BloodSugarChartProps> = ({
  showTitle = false,
  title = "Blood Sugar",
}) => {
  const { chartData, isLoading, error, fetchBloodSugars } = useBloodSugar();

  useEffect(() => {
    fetchBloodSugars(true); // Show loading state on initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  if (isLoading) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        <BloodSugarSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {showTitle && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
        )}
        <BloodSugarError error={error} />
      </div>
    );
  }

  const latestReading =
    chartData.length > 0 ? chartData[chartData.length - 1].sugar : 0;

  return (
    <div>
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      <BloodSugarDisplay data={chartData} latestReading={latestReading} />
    </div>
  );
};

// Error component for blood sugar chart
const BloodSugarError: React.FC<{ error: string }> = ({ error }) => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-center h-40">
        <p className="text-red-500">
          Error loading blood sugar data: {error}
        </p>
      </div>
    </Card>
  );
};

// Display component for blood sugar chart
const BloodSugarDisplay: React.FC<BloodSugarDisplayProps> = ({
  data,
  latestReading,
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
            Blood Sugar:{" "}
            <span className="font-bold">{payload[0].value} mg/dL</span>
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
          <div className="bg-teal-100 p-2 rounded-lg">
            <Droplet className="h-5 w-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Blood Sugar</h3>
        </div>
        <Button variant={"outline"} className="cursor-pointer">
          <Printer />
        </Button>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="sugar"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={{ r: 4, fill: "#14b8a6" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Latest: <span className="font-semibold">{latestReading} mg/dL</span>
        </span>
      </div>
    </Card>
  );
};
