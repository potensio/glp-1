"use client";

import { Scale, Printer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import React from "react";

interface WeightTrendChartProps {
  data: { name: string; value: number }[];
  currentWeight: number;
  targetWeight: number;
}

export const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  data,
  currentWeight,
  targetWeight,
}) => {
  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between ">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Scale className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Weight Trend</h3>
        </div>
        <Button variant={"outline"} className="cursor-pointer">
          <Printer />
        </Button>
      </div>
      <div className="h-40 ">
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
            <Bar
              dataKey="value"
              fill="url(#weightBarGradient)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Current: <span className="font-semibold">{currentWeight} lbs</span>
        </span>
        <span className="text-gray-600">
          Target: <span className="font-semibold">{targetWeight} lbs</span>
        </span>
      </div>
    </Card>
  );
};
