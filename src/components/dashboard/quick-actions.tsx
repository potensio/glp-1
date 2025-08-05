"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { WeightDialogContent } from "../../app/home/_components/dialogs/weight-dialog";
import { BloodPressureDialogContent } from "../../app/home/_components/dialogs/blood-pressure-dialog";
import { FoodIntakeDialogContent } from "../../app/home/_components/dialogs/food-intake-dialog";
import { Glp1DialogContent } from "../../app/home/_components/dialogs/glp1-dialog";
import { ActivityDialogContent } from "../../app/home/_components/dialogs/activity-dialog";
import { BloodSugarDialogContent } from "../../app/home/_components/dialogs/blood-sugar-dialog";
import { RegistrationPopup } from "@/components/registration-popup";
import { useAuth } from "@/contexts/auth-context";
import {
  Scale,
  Utensils,
  Droplets,
  Heart,
  Syringe,
  Footprints,
} from "lucide-react";

const quickLogItems = [
  { icon: Scale, label: "Weight", color: "bg-purple-500" },
  { icon: Utensils, label: "Food", color: "bg-green-500" },
  { icon: Syringe, label: "GLP-1", color: "bg-blue-500" },
  { icon: Heart, label: "Blood Pressure", color: "bg-red-500" },
  { icon: Droplets, label: "Blood Sugar", color: "bg-pink-500" },
  { icon: Footprints, label: "Activity", color: "bg-teal-500" },
];

export const QuickActions = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [registrationPopupOpen, setRegistrationPopupOpen] = useState(false);
  const { user, profile } = useAuth();

  // Check if profile is incomplete
  const isProfileIncomplete = user && profile && !profile.isComplete;

  // Handle quick action click - show registration popup if profile incomplete
  const handleQuickActionClick = (itemLabel: string) => {
    if (isProfileIncomplete) {
      setRegistrationPopupOpen(true);
    } else {
      setOpenDialog(itemLabel);
    }
  };

  // Render button content
  const renderButtonContent = (item: any) => (
    <>
      <div className={`${item.color} p-3 rounded-full mb-2`}>
        <item.icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700">
        {item.label}
      </span>
    </>
  );

  // Render button for incomplete profiles (plain button)
  const renderIncompleteProfileButton = (item: any, index: number) => (
    <Button
      key={index}
      variant="ghost"
      className="flex flex-col items-center justify-center h-28 bg-background rounded-xl border border-gray-200 hover:bg-background transition-all duration-200 hover:shadow-md cursor-pointer"
      onClick={() => handleQuickActionClick(item.label)}
    >
      {renderButtonContent(item)}
    </Button>
  );

  // Render dialog content based on item label
  const renderDialogContent = (item: any) => {
    switch (item.label) {
      case "Weight":
        return <WeightDialogContent onSave={() => setOpenDialog(null)} />;
      case "Blood Pressure":
        return <BloodPressureDialogContent onClose={() => setOpenDialog(null)} />;
      case "Food":
        return (
          <FoodIntakeDialogContent
            todayCalories={1450}
            onSave={() => setOpenDialog(null)}
            onClose={() => setOpenDialog(null)}
          />
        );
      case "GLP-1":
        return <Glp1DialogContent onSave={() => setOpenDialog(null)} />;
      case "Blood Sugar":
        return (
          <BloodSugarDialogContent
            onSave={() => setOpenDialog(null)}
            onClose={() => setOpenDialog(null)}
          />
        );
      case "Activity":
        return (
          <ActivityDialogContent
            stepsToday={6247}
            minutesActive={45}
            goalSteps={8000}
            onSave={() => setOpenDialog(null)}
            onClose={() => setOpenDialog(null)}
          />
        );
      default:
        return null;
    }
  };

  // Render button for complete profiles (with dialog)
  const renderCompleteProfileButton = (item: any, index: number) => (
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
          {renderButtonContent(item)}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {renderDialogContent(item)}
      </DialogContent>
    </Dialog>
  );
  return (
    <Card className="bg-card rounded-2xl p-5 md:p-6 gap-4 md:gap-6 shadow-xl">
      <h3 className="text-md md:text-lg font-semibold text-gray-800">
        Quick Action
      </h3>

      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
        {quickLogItems.map((item, index) => {
          // If profile is incomplete, render plain button that opens registration popup
          if (isProfileIncomplete) {
            return renderIncompleteProfileButton(item, index);
          }
          // If profile is complete, render button with dialog
          return renderCompleteProfileButton(item, index);
        })}
      </div>
      
      {/* Registration Popup for incomplete profiles */}
      <RegistrationPopup
        open={registrationPopupOpen}
        onOpenChange={setRegistrationPopupOpen}
        user={user}
        profile={profile}
      />
    </Card>
  );
};
