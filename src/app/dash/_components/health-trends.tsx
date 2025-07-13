"use client";

import { Scale, Heart, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";

const weightData = [
  { name: "Jan", value: 168 },
  { name: "Feb", value: 167 },
  { name: "Mar", value: 166 },
  { name: "Apr", value: 165 },
  { name: "May", value: 165 },
];

const bpData = [
  { name: "Week 1", systolic: 125, diastolic: 80 },
  { name: "Week 2", systolic: 122, diastolic: 78 },
  { name: "Week 3", systolic: 120, diastolic: 80 },
  { name: "Week 4", systolic: 118, diastolic: 82 },
];

export const HealthTrends = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Weight Trend */}
        <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
          <div className="flex items-center justify-between ">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Scale className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Weight Trend
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">-2.5 lbs this month</span>
            </div>
          </div>

          <div className="h-40 ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weightData}>
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
              Current: <span className="font-semibold">165 lbs</span>
            </span>
            <span className="text-gray-600">
              Target: <span className="font-semibold">160 lbs</span>
            </span>
          </div>
        </Card>

        {/* Blood Pressure */}
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
            <span className="text-sm font-medium text-green-600">
              Normal range
            </span>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bpData}>
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
              Latest: <span className="font-semibold">120/80 mmHg</span>
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
      </div>
    </>
  );
};
