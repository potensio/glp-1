"use client";

import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Utensils, Sparkles, Loader2, CalendarIcon } from "lucide-react";
import { useCreateFoodIntakeEntry } from "@/hooks/use-food-intake";
import { useEstimateCalories } from "@/hooks/use-calorie-estimation";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateWithOrdinal } from "@/lib/utils";

const mealTypes = [
  { label: "Breakfast" },
  { label: "Lunch" },
  { label: "Dinner" },
  { label: "Snack" },
];

export function FoodIntakeDialogContent({
  onSave,
  onClose,
}: {
  todayCalories?: number;
  onSave?: () => void;
  onClose?: () => void;
}) {
  const [mealType, setMealType] = useState(mealTypes[0].label);
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const createFoodIntakeMutation = useCreateFoodIntakeEntry();
  const estimateCaloriesMutation = useEstimateCalories();

  // Debug: Monitor calories state changes
  useEffect(() => {
    console.log("Calories state changed to:", calories);
  }, [calories]);

  const handleEstimateCalories = async () => {
    if (!food.trim()) {
      toast.error("Please enter a food description first");
      return;
    }

    console.log("Starting calorie estimation for:", food);

    estimateCaloriesMutation.mutate(
      { foodDescription: food },
      {
        onSuccess: (data) => {
          console.log("Calorie estimation response:", data);
          console.log("Setting calories to:", data.estimatedCalories.toString());
          const caloriesString = data.estimatedCalories.toString();
          console.log("Calories string:", caloriesString, "Type:", typeof caloriesString);
          console.log("Regex test:", /^\d*$/.test(caloriesString));
          console.log("Current calories state before setting:", calories);
          setCalories(caloriesString);
          console.log("setCalories called with:", caloriesString);
          toast.success(`Calories estimated: ${caloriesString}`);
        },
        onError: (error) => {
          console.error("Calorie estimation error:", error);
          toast.error(error.message || "Failed to estimate calories");
        },
      }
    );
  };

  const handleLog = () => {
    setErrors({});

    // Basic validation
    if (!mealType || !food || !calories) {
      setErrors({
        general: "Please fill in all fields.",
      });
      return;
    }

    const caloriesValue = parseInt(calories);
    if (isNaN(caloriesValue)) {
      setErrors({
        calories: "Please enter a valid number.",
      });
      return;
    }

    createFoodIntakeMutation.mutate(
      {
        mealType,
        food,
        calories: caloriesValue,
      },
      {
        onSuccess: () => {
          // Reset and close
          setFood("");
          setCalories("");
          setMealType(mealTypes[0].label);
          onSave?.();
          onClose?.();
        },
      }
    );
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3 mb-2 justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Utensils className="h-6 w-6 text-green-600" />
            </div>

            <DialogTitle className="text-lg font-semibold">
              Food Intake
            </DialogTitle>
          </div>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 justify-between font-normal text-xs px-3"
              >
                {formatDateWithOrdinal(selectedDate)}
                <CalendarIcon className="h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setDatePickerOpen(false);
                  }
                }}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        <DialogDescription>
          Log your food intake and track calories for better health monitoring.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Meal type label */}
        <div>
          <label
            className="block text-sm font-medium mb-2 text-secondary w-full"
            htmlFor="meal-type-toggle"
          >
            Select your meal type
          </label>
          {/* Meal time toggle group as 2x2 grid, full width */}
          <div id="meal-type-toggle" className="grid grid-cols-2 gap-2 w-full">
            {mealTypes.map((type) => (
              <button
                key={type.label}
                type="button"
                className={`px-4 py-2 rounded-lg border text-base font-semibold transition-colors flex items-center justify-center min-w-[90px] ${
                  mealType === type.label
                    ? "bg-primary/10 border-primary ring ring-primary text-foreground"
                    : "bg-background border-border text-secondary hover:border-primary"
                } cursor-pointer`}
                onClick={() => setMealType(type.label)}
                title={type.label}
                aria-label={type.label}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food input */}
        <div className="flex flex-col gap-2">
          <label
            className="block text-sm font-medium text-gray-600"
            htmlFor="food-input"
          >
            What did you eat?
          </label>
          <input
            id="food-input"
            type="text"
            placeholder="e.g. Grilled chicken salad, oatmeal, etc."
            value={food}
            onChange={(e) => setFood(e.target.value)}
            className={`w-full text-foreground text-center bg-transparent outline-none border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-2 text-lg font-medium appearance-none transition-colors ${
              errors.food ? "border-red-500" : "border-border"
            }`}
          />
          {errors.food && (
            <span className="text-sm text-red-500">{errors.food}</span>
          )}
        </div>

        {/* Calories input like weight dialog */}
        <div className="flex flex-col items-center gap-4">
          <label className="text-3xl font-bold flex items-baseline">
            <input
              id="calories-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="350"
              value={calories}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setCalories(e.target.value);
              }}
              className={`w-full h-12 text-foreground text-center bg-transparent outline-none border rounded-lg focus:ring-1 focus:ring-primary focus:border-primary p-0 m-0 text-3xl font-semibold appearance-none transition-colors ${
                errors.calories ? "border-red-500" : "border-border"
              }`}
              style={{ maxWidth: 120 }}
              aria-label="Calories"
            />
            <span className="text-base font-medium text-secondary ml-1">
              cal
            </span>
          </label>
          {errors.calories && (
            <span className="text-sm text-red-500 text-center">
              {errors.calories}
            </span>
          )}
          <button
            onClick={handleEstimateCalories}
            disabled={!food.trim() || estimateCaloriesMutation.isPending}
            className="text-sm text-primary font-semibold mx-auto flex items-center gap-1 hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {estimateCaloriesMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Estimating...
              </>
            ) : (
              <>
                Estimate calories with AI{" "}
                <Sparkles className="size-4 text-orange-400" />
              </>
            )}
          </button>
        </div>
      </div>

      <DialogFooter className="flex flex-row gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleLog}
          disabled={!food || !calories || createFoodIntakeMutation.isPending}
          className="flex-1"
        >
          {createFoodIntakeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging...
            </>
          ) : (
            "Log Food"
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
