"use client";

import { useBloodSugar } from "@/hooks/use-blood-sugar";
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
import React from "react";

interface BloodSugarChartProps {
  showPrintButton?: boolean;
}

// Define a local type for the custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

// Chart display component
const BloodSugarDisplay = ({
  data,
  latestReading,
  showPrint = false,
}: {
  data: { name: string; value: number }[];
  latestReading: number;
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
        {showPrint && (
          <Button variant={"outline"} className="cursor-pointer">
            <Printer />
          </Button>
        )}
      </div>
      <div className="h-40">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No blood sugar data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                hide 
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#14b8a6" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Latest: <span className="font-semibold">{latestReading} mg/dL</span>
        </span>
      </div>
    </Card>
  );
};

// Main blood sugar chart component
export const BloodSugarChart: React.FC<BloodSugarChartProps> = ({
  showPrintButton = false,
}) => {
  const { chartData } = useBloodSugar();
  


  const latestReading =
    chartData.length > 0 ? chartData[chartData.length - 1].value : 0;

  return (
    <BloodSugarDisplay
      data={chartData}
      latestReading={latestReading}
      showPrint={showPrintButton}
    />
  );
};

// Legacy component removed - use BloodSugarChart with useSuspense prop instead
