"use client";

import {
  Scale,
  Utensils,
  Pill,
  Heart,
  Syringe,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { WeightDialogContent } from "./dialogs/weight-dialog";
import { BloodPressureDialogContent } from "./dialogs/blood-pressure-dialog";
import { FoodIntakeDialogContent } from "./dialogs/food-intake-dialog";
import { Glp1DialogContent } from "./dialogs/glp1-dialog";
import { ActivityDialogContent } from "./dialogs/activity-dialog";
import { useState } from "react";

const quickLogItems = [
  { icon: Scale, label: "Weight", color: "bg-purple-500" },
  { icon: Utensils, label: "Food", color: "bg-green-500" },
  { icon: Syringe, label: "GLP-1", color: "bg-blue-500" },
  { icon: Heart, label: "Blood Pressure", color: "bg-red-500" },
  { icon: Pill, label: "Medication", color: "bg-pink-500" },
  { icon: Footprints, label: "Activity", color: "bg-teal-500" },
];

export const QuickActions = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  return (
    <Card className="bg-card rounded-2xl p-5 md:p-6 gap-4 md:gap-6 shadow-xl">
      <h3 className="text-md md:text-lg font-semibold text-gray-800">
        Quick Action
      </h3>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLogItems.map((item, index) => {
          if (item.label === "Weight") {
            return (
              <Dialog
                key={index}
                open={openDialog === item.label}
                onOpenChange={(open) => setOpenDialog(open ? item.label : null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-28 bg-background rounded-xl border border-gray-200 hover:bg-background transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <div className={`${item.color} p-3 rounded-full mb-2`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <WeightDialogContent onSave={() => setOpenDialog(null)} />
                </DialogContent>
              </Dialog>
            );
          }
          if (item.label === "Blood Pressure") {
            return (
              <Dialog
                key={index}
                open={openDialog === item.label}
                onOpenChange={(open) => setOpenDialog(open ? item.label : null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-28 bg-background rounded-xl border border-gray-200 hover:bg-background transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <div className={`${item.color} p-3 rounded-full mb-2`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-secondary truncate">
                      {item.label}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <BloodPressureDialogContent
                    onSave={() => setOpenDialog(null)}
                  />
                </DialogContent>
              </Dialog>
            );
          }
          if (item.label === "Food") {
            return (
              <Dialog
                key={index}
                open={openDialog === item.label}
                onOpenChange={(open) => setOpenDialog(open ? item.label : null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-28 bg-background rounded-xl border border-gray-200 hover:bg-background transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <div className={`${item.color} p-3 rounded-full mb-2`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <FoodIntakeDialogContent
                    todayCalories={1450}
                    onSave={() => setOpenDialog(null)}
                  />
                </DialogContent>
              </Dialog>
            );
          }
          if (item.label === "GLP-1") {
            return (
              <Dialog
                key={index}
                open={openDialog === item.label}
                onOpenChange={(open) => setOpenDialog(open ? item.label : null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-28 bg-background rounded-xl border border-gray-200 hover:bg-background transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <div className={`${item.color} p-3 rounded-full mb-2`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <Glp1DialogContent onSave={() => setOpenDialog(null)} />
                </DialogContent>
              </Dialog>
            );
          }
          if (item.label === "Activity") {
            return (
              <Dialog
                key={index}
                open={openDialog === item.label}
                onOpenChange={(open) => setOpenDialog(open ? item.label : null)}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-col items-center justify-center h-28 bg-background rounded-xl border border-gray-200 hover:bg-background transition-all duration-200 hover:shadow-md cursor-pointer"
                  >
                    <div className={`${item.color} p-3 rounded-full mb-2`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <ActivityDialogContent
                    stepsToday={6247}
                    minutesActive={45}
                    goalSteps={8000}
                    onSave={() => setOpenDialog(null)}
                  />
                </DialogContent>
              </Dialog>
            );
          }
          return (
            <Button
              key={index}
              variant="ghost"
              className="flex flex-col items-center justify-center h-28 bg-background rounded-xl border border-gray-200 hover:bg-background transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <div className={`${item.color} p-3 rounded-full mb-2`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};
