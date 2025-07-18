"use client";

import { Heart, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import React from "react";

interface BloodPressureChartProps {
  data: { name: string; systolic: number; diastolic: number }[];
  latestReading: string;
}

export const BloodPressureChart: React.FC<BloodPressureChartProps> = ({
  data,
  latestReading,
}) => {
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
        <Button variant={"outline"} className="cursor-pointer">
          <Printer />
        </Button>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs"
            />
            <YAxis hide />
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
