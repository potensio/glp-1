"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import GaugeChart from "react-gauge-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type HeightUnit = "ft-in" | "cm";
type WeightUnit = "lbs" | "kg";

interface BMIResult {
  value: number;
  category: string;
  categoryColor: string;
}

export function BMICalculator() {
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("ft-in");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lbs");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [cm, setCm] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState<BMIResult | null>(null);

  const calculateBMI = () => {
    let heightInMeters = 0;
    let weightInKg = 0;

    // Convert height to meters
    if (heightUnit === "ft-in") {
      const totalInches = (parseInt(feet) || 0) * 12 + (parseInt(inches) || 0);
      heightInMeters = totalInches * 0.0254;
    } else {
      heightInMeters = (parseInt(cm) || 0) / 100;
    }

    // Convert weight to kg
    if (weightUnit === "lbs") {
      weightInKg = (parseFloat(weight) || 0) * 0.453592;
    } else {
      weightInKg = parseFloat(weight) || 0;
    }

    if (heightInMeters > 0 && weightInKg > 0) {
      const bmiValue = weightInKg / (heightInMeters * heightInMeters);
      const result = getBMICategory(bmiValue);
      setBmi(result);
    }
  };

  const getBMICategory = (bmiValue: number): BMIResult => {
    if (bmiValue < 18.5) {
      return {
        value: bmiValue,
        category: "Underweight",
        categoryColor: "text-blue-600",
      };
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      return {
        value: bmiValue,
        category: "Normal Weight",
        categoryColor: "text-green-600",
      };
    } else if (bmiValue >= 25 && bmiValue < 30) {
      return {
        value: bmiValue,
        category: "Overweight",
        categoryColor: "text-yellow-600",
      };
    } else {
      return {
        value: bmiValue,
        category: "Obese",
        categoryColor: "text-red-600",
      };
    }
  };

  const getBMIGaugeValue = (bmiValue: number): number => {
    // Normalize BMI value to 0-1 scale for gauge
    // Using range 15-40 BMI for better visualization
    const minBMI = 15;
    const maxBMI = 40;
    const normalizedValue = Math.min(
      Math.max((bmiValue - minBMI) / (maxBMI - minBMI), 0),
      1
    );
    return normalizedValue;
  };

  const getBMIColors = () => {
    return [
      "#3B82F6", // Blue for underweight (0-0.175 = 15-22)
      "#10B981", // Green for normal (0.175-0.5 = 22-30)
      "#F59E0B", // Yellow for overweight (0.5-0.75 = 30-35)
      "#EF4444", // Red for obese (0.75-1 = 35-40)
    ];
  };

  const isFormValid = () => {
    if (heightUnit === "ft-in") {
      return feet && inches && weight;
    } else {
      return cm && weight;
    }
  };

  return (
    <Card className="rounded-2xl p-5 md:p-6 shadow-xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calculator className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 chart-title">
            BMI Calculator
          </h3>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Input form */}
        <div className="space-y-6 flex-1">
          {/* Height Section */}
          <div className="space-y-3">
            <Label className="text-secondary">Height</Label>
            <Select
              value={heightUnit}
              onValueChange={(value: HeightUnit) => setHeightUnit(value)}
            >
              <SelectTrigger className="w-full h-11 border-gray-200 focus:border-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ft-in">Feet & Inches</SelectItem>
                <SelectItem value="cm">Centimeters</SelectItem>
              </SelectContent>
            </Select>

            {heightUnit === "ft-in" ? (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="5"
                    value={feet}
                    onChange={(e) => setFeet(e.target.value)}
                    className="h-11 pr-10 border-gray-200 focus:border-gray-400"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                    ft
                  </span>
                </div>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    placeholder="8"
                    value={inches}
                    onChange={(e) => setInches(e.target.value)}
                    className="h-11 pr-10 border-gray-200 focus:border-gray-400"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                    in
                  </span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type="number"
                  placeholder="175"
                  value={cm}
                  onChange={(e) => setCm(e.target.value)}
                  className="h-11 pr-12 border-gray-200 focus:border-gray-400"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                  cm
                </span>
              </div>
            )}
          </div>

          {/* Weight Section */}
          <div className="space-y-3">
            <Label className="text-secondary">Weight</Label>
            <Select
              value={weightUnit}
              onValueChange={(value: WeightUnit) => setWeightUnit(value)}
            >
              <SelectTrigger className="w-full h-11 border-gray-200 focus:border-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lbs">Pounds</SelectItem>
                <SelectItem value="kg">Kilograms</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Input
                type="number"
                placeholder={weightUnit === "lbs" ? "168.5" : "76.4"}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-11 pr-14 border-gray-200 focus:border-gray-400"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                {weightUnit}
              </span>
            </div>
          </div>

          <Button
            onClick={calculateBMI}
            disabled={!isFormValid()}
            className="w-full h-12"
          >
            Calculate BMI
          </Button>
        </div>

        {/* Right side - BMI Gauge */}
        <div className="flex flex-col flex-1 items-center justify-center lg:w-3/5">
          {bmi ? (
            <div className="w-full max-w-md">
              {/* BMI Gauge Chart */}
              <div className="relative">
                <GaugeChart
                  id="bmi-gauge"
                  nrOfLevels={4}
                  colors={getBMIColors()}
                  arcWidth={0.25}
                  percent={getBMIGaugeValue(bmi.value)}
                  textColor="#374151"
                  needleColor="#d4d4d4"
                  needleBaseColor="#374151"
                  hideText={true}
                  animate={true}
                  animDelay={200}
                />
                {/* BMI Value Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <div className="text-5xl font-bold text-gray-900 mb-1">
                    {bmi.value.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* BMI Categories Legend */}
              <div className="">
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Underweight
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    &lt; 18.5
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Normal
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    18.5 - 24.9
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Overweight
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    25.0 - 29.9
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Obese
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    &ge; 30.0
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md">
              {/* Empty State Gauge */}
              <div className="relative">
                <GaugeChart
                  id="bmi-gauge-empty"
                  nrOfLevels={4}
                  colors={["#F3F4F6", "#F3F4F6", "#F3F4F6", "#F3F4F6"]}
                  arcWidth={0.25}
                  percent={0}
                  textColor="#9CA3AF"
                  needleColor="#D1D5DB"
                  needleBaseColor="#D1D5DB"
                  hideText={true}
                  animate={false}
                />
                {/* Empty State Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <div className="text-4xl font-light text-gray-400 mb-2">
                    --
                  </div>
                </div>
              </div>

              {/* Empty State Legend */}
              <div className="opacity-60">
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Underweight
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    &lt; 18.5
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Normal
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    18.5 - 24.9
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Overweight
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    25.0 - 29.9
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Obese
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600">
                    &ge; 30.0
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
