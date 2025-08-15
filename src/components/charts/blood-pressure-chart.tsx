"use client";

import { useBloodPressure } from "@/hooks/use-blood-pressure";
import { useDateFilter } from "@/contexts/date-filter-context";
import { Heart } from "lucide-react";
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

// Chart display component
const BloodPressureDisplay = ({
  data,
  latestReading,
}: {
  data: { id: string; name: string; systolic: number; diastolic: number; fullDate: string; time: string }[];
  latestReading: string;
}) => {

  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-red-100 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 chart-title">
            Blood Pressure
          </h3>
        </div>
      </div>
      <div className="h-40 chart-container">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No blood pressure data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} data-chart="true">
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => value.split('-')[0]} // Display only the date part
              />
              <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    // Debug: Log the payload structure
                    console.log('Tooltip payload:', payload);
                    console.log('Tooltip label:', label);
                    
                    // For BarChart with multiple bars, we need to get the data from the payload
                    // The payload contains an array of bars being hovered
                    const data = payload[0].payload;
                    
                    // Get the actual values from the payload entries
                    const systolicEntry = payload.find(entry => entry.dataKey === 'systolic');
                    const diastolicEntry = payload.find(entry => entry.dataKey === 'diastolic');
                    
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Systolic: <span className="font-bold text-red-500">{systolicEntry?.value || data.systolic}</span> mmHg
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Diastolic: <span className="font-bold text-orange-500">{diastolicEntry?.value || data.diastolic}</span> mmHg
                        </p>
                        <p className="text-xs text-gray-600">{data.fullDate}</p>
                        <p className="text-xs text-gray-500">{data.time}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
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

// Main blood pressure chart component
export const BloodPressureChart: React.FC = () => {
  const { getDateRangeForAPI } = useDateFilter();
  const dateRange = getDateRangeForAPI();
  const { chartData, isLoading, error } = useBloodPressure(dateRange);

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
          <div className="bg-red-100 p-2 rounded-lg">
            <Heart className="h-5 w-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Blood Pressure
          </h3>
        </div>
        <div className="flex items-center justify-center h-40 text-destructive">
          <p>Failed to load blood pressure data</p>
        </div>
      </Card>
    );
  }

  // Calculate latest reading (now at the end of the array since we reversed it)
  const latestReading =
    chartData.length > 0
      ? `${chartData[chartData.length - 1].systolic}/${
          chartData[chartData.length - 1].diastolic
        }`
      : "No data";

  return (
    <BloodPressureDisplay data={chartData} latestReading={latestReading} />
  );
};
